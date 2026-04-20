# routers/ranking.py

from datetime import datetime, timedelta
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from database import get_db
from models import Song, ViewHistory, SongType
from schemas import RankingResponse, RankingItem

router = APIRouter(tags=["ranking"])


def get_period_range(period: str) -> tuple[datetime | None, datetime | None]:
    now = datetime.utcnow()
    if period == "daily":
        return now - timedelta(hours=24), now
    elif period == "weekly":
        return now - timedelta(days=7), now
    elif period == "monthly":
        return now - timedelta(days=30), now
    return None, None


def calc_period_views(db: Session, since: datetime | None) -> dict[str, int]:
    if since is None:
        return {}
    rows = (
        db.query(
            ViewHistory.video_id,
            (func.max(ViewHistory.view_count) - func.min(ViewHistory.view_count))
            .label("gain"),
        )
        .filter(ViewHistory.recorded_at >= since)
        .group_by(ViewHistory.video_id)
        .all()
    )
    return {row.video_id: max(row.gain, 0) for row in rows}


def calc_prev_period_ranks(
    db: Session, period: str, song_type: str, member: str | None
) -> dict[str, int]:
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
            ViewHistory.video_id,
            (func.max(ViewHistory.view_count) - func.min(ViewHistory.view_count))
            .label("gain"),
        )
        .filter(
            ViewHistory.recorded_at >= prev_since,
            ViewHistory.recorded_at < prev_until,
        )
        .group_by(ViewHistory.video_id)
        .order_by(desc("gain"))
        .all()
    )
    return {row.video_id: idx + 1 for idx, row in enumerate(rows)}


@router.get("/ranking", response_model=RankingResponse)
async def get_ranking(
    period: Literal["daily", "weekly", "monthly", "alltime"] = "daily",
    type:   Literal["cover", "original", "all"] = "all",
    member: Optional[str] = None,
    db:     Session = Depends(get_db),
):
    since, _     = get_period_range(period)
    period_views = calc_period_views(db, since)
    prev_ranks   = calc_prev_period_ranks(db, period, type, member)

    query = db.query(Song)
    if type != "all":
        query = query.filter(Song.song_type == SongType(type))
    if member:
        query = query.filter(Song.member_name == member)

    songs = query.all()

    if period == "alltime":
        songs.sort(key=lambda s: s.view_count, reverse=True)
    else:
        songs.sort(key=lambda s: period_views.get(s.video_id, 0), reverse=True)

    songs = songs[:100]

    items = []
    for idx, song in enumerate(songs):
        rank        = idx + 1
        daily_views = period_views.get(song.video_id, 0)
        prev_rank   = prev_ranks.get(song.video_id)
        rank_change = (prev_rank - rank) if prev_rank else None
        is_new      = prev_rank is None and period != "alltime"

        items.append(RankingItem(
            rank          = rank,
            prev_rank     = prev_rank,
            rank_change   = rank_change,
            is_new        = is_new,
            daily_views   = daily_views,
            video_id      = song.video_id,
            title         = song.title,
            member_name   = song.member_name,
            thumbnail_url = song.thumbnail_url,
            published_at  = song.published_at,
            view_count    = song.view_count,
            like_count    = song.like_count,
            song_type     = song.song_type,
        ))

    return RankingResponse(
        period     = period,
        song_type  = type,
        member     = member,
        items      = items,
        updated_at = datetime.utcnow(),
    )