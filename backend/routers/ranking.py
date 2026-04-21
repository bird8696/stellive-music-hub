# routers/ranking.py

from datetime import datetime, timedelta
from typing import Optional, Literal
from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from database import get_db
from models import Song, ViewHistory, SongType
from schemas import RankingResponse, RankingItem

router = APIRouter(tags=["ranking"])


def get_period_range(period: str) -> datetime | None:
    now = datetime.utcnow()
    if period == "daily":   return now - timedelta(hours=24)
    if period == "weekly":  return now - timedelta(days=7)
    if period == "monthly": return now - timedelta(days=30)
    return None


def calc_period_views(db: Session, since: datetime | None) -> dict[int, int]:
    """song_id → 조회수 증가량"""
    if since is None:
        return {}
    rows = (
        db.query(
            ViewHistory.song_id,
            (func.max(ViewHistory.view_count) - func.min(ViewHistory.view_count)).label("gain"),
        )
        .filter(ViewHistory.recorded_at >= since)
        .group_by(ViewHistory.song_id)
        .all()
    )
    return {row.song_id: max(row.gain, 0) for row in rows}


def calc_prev_ranks(db: Session, period: str) -> dict[int, int]:
    """이전 기간 song_id → 순위"""
    now = datetime.utcnow()
    if period == "daily":
        prev_since = now - timedelta(hours=48)
        prev_until = now - timedelta(hours=24)
    elif period == "weekly":
        prev_since = now - timedelta(days=14)
        prev_until = now - timedelta(days=7)
    elif period == "monthly":
        prev_since = now - timedelta(days=60)
        prev_until = now - timedelta(days=30)
    else:
        return {}

    rows = (
        db.query(
            ViewHistory.song_id,
            (func.max(ViewHistory.view_count) - func.min(ViewHistory.view_count)).label("gain"),
        )
        .filter(
            ViewHistory.recorded_at >= prev_since,
            ViewHistory.recorded_at < prev_until,
        )
        .group_by(ViewHistory.song_id)
        .order_by(desc("gain"))
        .all()
    )
    return {row.song_id: idx + 1 for idx, row in enumerate(rows)}


@router.get("/ranking", response_model=RankingResponse)
async def get_ranking(
    period: Literal["daily", "weekly", "monthly", "alltime"] = "alltime",
    type:   Literal["cover", "original", "all"] = "all",
    member: Optional[str] = None,
    db:     Session = Depends(get_db),
):
    since        = get_period_range(period)
    period_views = calc_period_views(db, since)
    prev_ranks   = calc_prev_ranks(db, period)

    query = db.query(Song)
    if type != "all":
        query = query.filter(Song.song_type == SongType(type))
    if member:
        query = query.filter(Song.member_name == member)

    songs = query.all()

    if period == "alltime":
        songs.sort(key=lambda s: s.view_count, reverse=True)
    else:
        songs.sort(key=lambda s: period_views.get(s.id, 0), reverse=True)

    songs = songs[:100]

    items = []
    for idx, song in enumerate(songs):
        rank        = idx + 1
        daily_views = period_views.get(song.id, 0)
        prev_rank   = prev_ranks.get(song.id)
        rank_change = (prev_rank - rank) if prev_rank else None
        is_new      = prev_rank is None and period != "alltime"

        items.append(RankingItem(
            rank          = rank,
            prev_rank     = prev_rank,
            rank_change   = rank_change,
            is_new        = is_new,
            daily_views   = daily_views,
            id            = song.id,
            video_id      = song.video_id,
            title         = song.title,
            member_name   = song.member_name,
            thumbnail_url = song.thumbnail_url,
            published_at  = song.published_at,
            view_count    = song.view_count,
            like_count    = song.like_count,
            song_type     = song.song_type,
            is_collab     = song.is_collab,
        ))

    return RankingResponse(
        period     = period,
        song_type  = type,
        member     = member,
        items      = items,
        updated_at = datetime.utcnow(),
    )