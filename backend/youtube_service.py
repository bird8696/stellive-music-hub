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
    PLAYLIST_IDS,
)
from filter_service import classify_song_type, parse_duration
from models import Channel, Song, ViewHistory, Generation, SongType

logger = logging.getLogger("stellive.youtube")

# 채널 ID → 멤버 단축명 빠른 조회용 (하드코딩된 것만)
CHANNEL_ID_TO_MEMBER: dict[str, str] = {
    m["channel_id"]: m["member_name"]
    for m in CHANNEL_META
    if m["channel_id"]
}


def get_youtube_client():
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY 환경변수가 없습니다.")
    return build("youtube", "v3", developerKey=api_key)


# ── 채널 초기화 ───────────────────────────────────

async def init_channels(db: Session) -> None:
    youtube = get_youtube_client()

    for meta in CHANNEL_META:
        handle     = meta["handle"]
        channel_id = meta["channel_id"]

        existing = db.query(Channel).filter_by(handle=handle).first()
        if existing:
            # 채널 ID가 DB에 없으면 업데이트
            if existing.channel_id != channel_id and channel_id:
                existing.channel_id = channel_id
                db.commit()
            logger.info(f"스킵 (이미 존재): {handle}")
            continue

        if not channel_id:
            channel_id = await resolve_channel_id(youtube, handle)
            if not channel_id:
                logger.warning(f"채널 ID 조회 실패: {handle}")
                continue
            # 조회된 채널 ID를 전역 맵에도 추가
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

    # DB에 저장된 모든 채널 ID를 전역 맵에 추가
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


# ── 플레이리스트 기반 수집 ────────────────────────

async def fetch_all_videos(db: Session) -> None:
    """초기 실행 — 멤버 플레이리스트 먼저, 공식 플레이리스트 나중에"""
    youtube = get_youtube_client()

    # 멤버 개인 플레이리스트 먼저 수집
    member_playlists   = [p for p in PLAYLIST_IDS if p["member_name"] is not None]
    official_playlists = [p for p in PLAYLIST_IDS if p["member_name"] is None]

    logger.info("📥 멤버 개인 플레이리스트 수집 시작")
    for pl in member_playlists:
        count = await fetch_playlist_videos(youtube, db, pl)
        logger.info(f"  → {pl['member_name']} {count}개 저장")
        await asyncio.sleep(API_CALL_DELAY_SECONDS)

    logger.info("📥 공식 플레이리스트 수집 시작")
    for pl in official_playlists:
        count = await fetch_playlist_videos(youtube, db, pl)
        logger.info(f"  → 공식({pl['song_type']}) {count}개 저장")
        await asyncio.sleep(API_CALL_DELAY_SECONDS)


async def fetch_playlist_videos(youtube, db: Session, playlist_info: dict) -> int:
    """플레이리스트 ID로 영상 수집. 중복 제거."""
    playlist_id = playlist_info["playlist_id"]
    member_name = playlist_info["member_name"]
    forced_type = playlist_info["song_type"]

    saved      = 0
    page_token = None
    video_ids  = []

    # 1단계: playlistItems로 video_id 수집
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

    # 중복 제거
    existing_ids = {
        row[0] for row in db.query(Song.video_id)
        .filter(Song.video_id.in_(video_ids)).all()
    }
    new_ids = [vid for vid in video_ids if vid not in existing_ids]

    if not new_ids:
        return 0

    # 2단계: videos.list로 상세 정보 조회
    details = await get_video_details(youtube, new_ids)

    for video in details:
        vid_id   = video["id"]
        snippet  = video["snippet"]
        stats    = video.get("statistics", {})
        content  = video.get("contentDetails", {})
        title    = snippet.get("title", "")
        desc     = snippet.get("description", "")
        ch_id    = snippet.get("channelId", "")

        # member_name 결정: 플레이리스트 지정 → 채널 ID 맵 → DB 조회 순서
        if member_name:
            resolved_member = member_name
        else:
            resolved_member = CHANNEL_ID_TO_MEMBER.get(ch_id)
            if not resolved_member:
                channel = db.query(Channel).filter_by(channel_id=ch_id).first()
                resolved_member = channel.member_name if channel else None
            if not resolved_member:
                # 멤버 특정 불가 → 스킵
                logger.debug(f"멤버 특정 불가 스킵: {vid_id} (channel: {ch_id})")
                continue

        # song_type 결정
        if forced_type:
            song_type = SongType(forced_type)
        else:
            song_type = classify_song_type(title, desc)

        song = Song(
            video_id      = vid_id,
            title         = title,
            channel_id    = ch_id,
            channel_name  = snippet.get("channelTitle", resolved_member),
            member_name   = resolved_member,
            thumbnail_url = snippet.get("thumbnails", {}).get("high", {}).get("url"),
            published_at  = datetime.fromisoformat(
                snippet["publishedAt"].replace("Z", "+00:00")
            ),
            view_count    = int(stats.get("viewCount", 0)),
            like_count    = int(stats.get("likeCount", 0)),
            comment_count = int(stats.get("commentCount", 0)),
            duration      = parse_duration(content.get("duration", "PT0S")),
            category_id   = snippet.get("categoryId"),
            description   = desc,
            song_type     = song_type,
        )
        db.add(song)
        saved += 1

    db.commit()
    return saved


# ── 신규 영상 수집 ────────────────────────────────

async def fetch_new_videos(db: Session) -> None:
    youtube = get_youtube_client()

    member_playlists   = [p for p in PLAYLIST_IDS if p["member_name"] is not None]
    official_playlists = [p for p in PLAYLIST_IDS if p["member_name"] is None]

    for pl in member_playlists + official_playlists:
        count = await fetch_playlist_videos(youtube, db, pl)
        if count:
            logger.info(f"신규 {count}개 저장: {pl['member_name'] or '공식'}")
        await asyncio.sleep(API_CALL_DELAY_SECONDS)


# ── 영상 상세 조회 ────────────────────────────────

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


# ── 조회수 갱신 ───────────────────────────────────

async def update_view_counts(db: Session) -> None:
    youtube   = get_youtube_client()
    all_songs = db.query(Song).all()
    video_ids = [s.video_id for s in all_songs]

    if not video_ids:
        return

    details = await get_video_details(youtube, video_ids)
    now     = datetime.utcnow()

    for video in details:
        vid_id = video["id"]
        stats  = video.get("statistics", {})
        song   = db.query(Song).filter_by(video_id=vid_id).first()
        if not song:
            continue

        new_views          = int(stats.get("viewCount", 0))
        song.view_count    = new_views
        song.like_count    = int(stats.get("likeCount", 0))
        song.comment_count = int(stats.get("commentCount", 0))

        db.add(ViewHistory(
            video_id    = vid_id,
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