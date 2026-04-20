# routers/members.py

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from database import get_db
from models import Channel, Song, SongType
from schemas import MemberListResponse, MemberStats, SongResponse, GlobalStats

router = APIRouter(tags=["members"])


def build_member_stats(db: Session, channel: Channel) -> MemberStats:
    """Channel 객체 → MemberStats 생성"""
    songs = db.query(Song).filter_by(channel_id=channel.channel_id).all()

    total_songs    = len(songs)
    total_views    = sum(s.view_count for s in songs)
    cover_count    = sum(1 for s in songs if s.song_type == SongType.cover)
    original_count = sum(1 for s in songs if s.song_type == SongType.original)

    top3 = (
        db.query(Song)
        .filter_by(channel_id=channel.channel_id)
        .order_by(desc(Song.view_count))
        .limit(3)
        .all()
    )

    return MemberStats(
        member_name      = channel.member_name,
        member_name_full = channel.member_name_full,
        generation       = channel.generation.value,
        handle           = channel.handle,
        channel_id       = channel.channel_id,
        total_songs      = total_songs,
        total_views      = total_views,
        cover_count      = cover_count,
        original_count   = original_count,
        top3_songs       = top3,
    )


@router.get("/members", response_model=MemberListResponse)
async def get_members(db: Session = Depends(get_db)):
    channels = (
        db.query(Channel)
        .filter_by(is_active=True)
        .filter(Channel.generation != "official")
        .all()
    )

    members = [build_member_stats(db, ch) for ch in channels]

    # 기수 순서 정렬
    gen_order = {"1기 EVERYS": 0, "2기 UNIVERSE": 1, "3기 cliché": 2}
    members.sort(key=lambda m: gen_order.get(m.generation, 99))

    return MemberListResponse(members=members)


@router.get("/members/{member_name}", response_model=MemberStats)
async def get_member(
    member_name: str,
    db: Session = Depends(get_db),
):
    channel = (
        db.query(Channel)
        .filter_by(member_name=member_name, is_active=True)
        .first()
    )
    if not channel:
        raise HTTPException(status_code=404, detail="멤버를 찾을 수 없습니다.")

    return build_member_stats(db, channel)


@router.get("/stats", response_model=GlobalStats)
async def get_global_stats(db: Session = Depends(get_db)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total_songs    = db.query(func.count(Song.video_id)).scalar() or 0
    total_views    = db.query(func.sum(Song.view_count)).scalar() or 0
    cover_count    = db.query(func.count(Song.video_id)).filter_by(song_type=SongType.cover).scalar() or 0
    original_count = db.query(func.count(Song.video_id)).filter_by(song_type=SongType.original).scalar() or 0
    today_uploads  = db.query(func.count(Song.video_id)).filter(Song.published_at >= today_start).scalar() or 0

    last_song = db.query(Song).order_by(desc(Song.updated_at)).first()
    last_updated = last_song.updated_at if last_song else datetime.utcnow()

    return GlobalStats(
        total_songs    = total_songs,
        total_views    = total_views,
        cover_count    = cover_count,
        original_count = original_count,
        today_uploads  = today_uploads,
        last_updated   = last_updated,
    )