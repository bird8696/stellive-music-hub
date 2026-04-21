# youtube_service.py

import os
import asyncio
import logging
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.orm import Session

from constants import (
    CHANNEL_META, API_CALL_DELAY_SECONDS,
    VIEW_HISTORY_RETENTION_DAYS,
    PLAYLIST_IDS, MIN_DURATION_SECONDS, MAX_DURATION_SECONDS,
)
from filter_service import classify_song_type, parse_duration
from models import Channel, Song, ViewHistory, Generation, SongType

logger = logging.getLogger("stellive.youtube")

CHANNEL_ID_TO_MEMBER: dict[str, str] = {
    m["channel_id"]: m["member_name"]
    for m in CHANNEL_META
    if m["channel_id"]
}

FULL_NAME_TO_MEMBER: dict[str, str] = {
    "아야츠노 유니": "유니",
    "Ayatsuno Yuni": "유니",
    "사키하네 후야": "후야",
    "Sakihane Huya": "후야",
    "시라유키 히나": "히나",
    "Shirayuki Hina": "히나",
    "네네코 마시로": "마시로",
    "Neneko Mashiro": "마시로",
    "아카네 리제":   "리제",
    "Akane Lize":    "리제",
    "아라하시 타비": "타비",
    "Arahashi Tabi": "타비",
    "텐코 시부키":   "시부키",
    "Tenko Shibuki": "시부키",
    "아오쿠모 린":   "린",
    "Aokumo Rin":    "린",
    "하나코 나나":   "나나",
    "Hanako Nana":   "나나",
    "유즈하 리코":   "리코",
    "Yuzuha Riko":   "리코",
}


def get_youtube_client():
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY 환경변수가 없습니다.")
    return build("youtube", "v3", developerKey=api_key)


def extract_collab_members(title: str, description: str) -> list[str]:
    text  = title + " " + description
    found = set()
    for full_name, short_name in FULL_NAME_TO_MEMBER.items():
        if full_name in text:
            found.add(short_name)
    return list(found)


async def init_channels(db: Session) -> None:
    youtube = get_youtube_client()

    for meta in CHANNEL_META:
        handle     = meta["handle"]
        channel_id = meta["channel_id"]

        existing = db.query(Channel).filter_by(handle=handle).first()
        if existing:
            logger.info(f"스킵 (이미 존재): {handle}")
            continue

        if not channel_id:
            channel_id = await resolve_channel_id(youtube, handle)
            if not channel_id:
                logger.warning(f"채널 ID 조회 실패: {handle}")
                continue
            CHANNEL_ID_TO_MEMBER[channel_id] = meta["member_name"]
            await asyncio.sleep(API_CALL_DELAY_SECONDS)

        channel = Channel(
            channel_id       = channel_id,
            handle           = handle,
            member_name      = meta["member_name"],
            member_name_full = meta["member_name_full"],
            generation       = Generation(meta["generation"]),
            is_active        = True,
        )
        db.add(channel)
        logger.info(f"채널 등록: {meta['member_name']} ({channel_id})")

    db.commit()

    all_channels = db.query(Channel).all()
    for ch in all_channels:
        CHANNEL_ID_TO_MEMBER[ch.channel_id] = ch.member_name

    logger.info("✅ 채널 초기화 완료")


async def resolve_channel_id(youtube, handle: str) -> str | None:
    try:
        res = youtube.search().list(
            part="snippet",
            q=handle,
            type="channel",
            maxResults=1,
        ).execute()
        items = res.get("items", [])
        if not items:
            return None
        return items[0]["snippet"]["channelId"]
    except HttpError as e:
        logger.error(f"resolve_channel_id 실패 ({handle}): {e}")
        return None


async def fetch_all_videos(db: Session) -> None:
    youtube = get_youtube_client()

    official_playlists = [p for p in PLAYLIST_IDS if p["member_name"] is None]
    member_playlists   = [p for p in PLAYLIST_IDS if p["member_name"] is not None]

    logger.info("📥 공식 플레이리스트 수집 시작")
    for pl in official_playlists:
        count = await fetch_playlist_videos(youtube, db, pl)
        logger.info(f"  → 공식({pl['song_type']}) {count}개 저장")
        await asyncio.sleep(API_CALL_DELAY_SECONDS)

    logger.info("📥 멤버 플레이리스트 수집 시작")
    for pl in member_playlists:
        count = await fetch_playlist_videos(youtube, db, pl)
        logger.info(f"  → {pl['member_name']}({pl['song_type'] or '자동'}) {count}개 저장")
        await asyncio.sleep(API_CALL_DELAY_SECONDS)


async def fetch_playlist_videos(youtube, db: Session, playlist_info: dict) -> int:
    playlist_id = playlist_info["playlist_id"]
    member_name = playlist_info["member_name"]
    forced_type = playlist_info["song_type"]

    saved      = 0
    page_token = None
    video_ids  = []

    while True:
        try:
            params = dict(
                part="contentDetails",
                playlistId=playlist_id,
                maxResults=50,
            )
            if page_token:
                params["pageToken"] = page_token

            res        = youtube.playlistItems().list(**params).execute()
            items      = res.get("items", [])
            video_ids += [
                i["contentDetails"]["videoId"]
                for i in items
                if i["contentDetails"].get("videoId")
            ]
            page_token = res.get("nextPageToken")
            await asyncio.sleep(API_CALL_DELAY_SECONDS)

            if not page_token:
                break

        except HttpError as e:
            logger.error(f"playlistItems 실패 ({playlist_id}): {e}")
            break

    if not video_ids:
        return 0

    details = await get_video_details(youtube, video_ids)

    for video in details:
        vid_id   = video["id"]
        snippet  = video["snippet"]
        stats    = video.get("statistics", {})
        content  = video.get("contentDetails", {})
        title    = snippet.get("title", "")
        desc     = snippet.get("description", "")
        ch_id    = snippet.get("channelId", "")

        # duration 체크 (1분 미만, 15분 이상 제외)
        duration_sec = parse_duration(content.get("duration", "PT0S"))
        if duration_sec < MIN_DURATION_SECONDS or duration_sec > MAX_DURATION_SECONDS:
            continue

        # song_type 결정
        if forced_type:
            song_type = SongType(forced_type)
        else:
            song_type = classify_song_type(title)

        if member_name is not None:
            resolved_member = member_name
            is_collab       = False
            members_to_save = [resolved_member]
        else:
            resolved_member = CHANNEL_ID_TO_MEMBER.get(ch_id)
            if not resolved_member:
                channel = db.query(Channel).filter_by(channel_id=ch_id).first()
                resolved_member = channel.member_name if channel else None
            if not resolved_member:
                logger.debug(f"멤버 특정 불가 스킵: {vid_id}")
                continue

            collab_members = extract_collab_members(title, desc)
            if len(collab_members) > 1:
                is_collab       = True
                members_to_save = collab_members
            else:
                is_collab       = False
                members_to_save = [resolved_member]

        for m_name in members_to_save:
            existing = db.query(Song).filter_by(
                video_id=vid_id, member_name=m_name
            ).first()
            if existing:
                continue

            ch = db.query(Channel).filter_by(channel_id=ch_id).first()
            if not ch:
                ch = db.query(Channel).filter_by(member_name=m_name).first()
            if not ch:
                continue

            song = Song(
                video_id      = vid_id,
                title         = title,
                channel_id    = ch.channel_id,
                channel_name  = snippet.get("channelTitle", m_name),
                member_name   = m_name,
                thumbnail_url = snippet.get("thumbnails", {}).get("high", {}).get("url"),
                published_at  = datetime.fromisoformat(
                    snippet["publishedAt"].replace("Z", "+00:00")
                ),
                view_count    = int(stats.get("viewCount", 0)),
                like_count    = int(stats.get("likeCount", 0)),
                comment_count = int(stats.get("commentCount", 0)),
                duration      = duration_sec,
                category_id   = snippet.get("categoryId"),
                description   = desc,
                song_type     = song_type,
                is_collab     = is_collab,
            )
            db.add(song)
            saved += 1

    db.commit()
    return saved


async def fetch_new_videos(db: Session) -> None:
    youtube = get_youtube_client()

    official_playlists = [p for p in PLAYLIST_IDS if p["member_name"] is None]
    member_playlists   = [p for p in PLAYLIST_IDS if p["member_name"] is not None]

    for pl in official_playlists + member_playlists:
        count = await fetch_playlist_videos(youtube, db, pl)
        if count:
            logger.info(f"신규 {count}개 저장: {pl['member_name'] or '공식'}")
        await asyncio.sleep(API_CALL_DELAY_SECONDS)


async def get_video_details(youtube, video_ids: list[str]) -> list[dict]:
    results = []
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i:i + 50]
        try:
            res = youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(chunk),
            ).execute()
            results += res.get("items", [])
            await asyncio.sleep(API_CALL_DELAY_SECONDS)
        except HttpError as e:
            logger.error(f"videos.list 실패: {e}")
    return results


async def update_view_counts(db: Session) -> None:
    youtube     = get_youtube_client()
    all_songs   = db.query(Song).all()
    unique_vids = list({s.video_id for s in all_songs})

    if not unique_vids:
        return

    details = await get_video_details(youtube, unique_vids)
    now     = datetime.utcnow()

    for video in details:
        vid_id    = video["id"]
        stats     = video.get("statistics", {})
        new_views = int(stats.get("viewCount", 0))

        songs = db.query(Song).filter_by(video_id=vid_id).all()
        for song in songs:
            song.view_count    = new_views
            song.like_count    = int(stats.get("likeCount", 0))
            song.comment_count = int(stats.get("commentCount", 0))

            db.add(ViewHistory(
                song_id     = song.id,
                recorded_at = now,
                view_count  = new_views,
            ))

    db.commit()
    await cleanup_old_history(db)
    logger.info(f"✅ 조회수 갱신 완료 ({len(details)}개)")


async def cleanup_old_history(db: Session) -> None:
    cutoff  = datetime.utcnow() - timedelta(days=VIEW_HISTORY_RETENTION_DAYS)
    deleted = (
        db.query(ViewHistory)
        .filter(ViewHistory.recorded_at < cutoff)
        .delete()
    )
    db.commit()
    if deleted:
        logger.info(f"ViewHistory {deleted}개 삭제 (90일 초과)")