# routers/songs.py

from datetime import datetime, timedelta
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from database import get_db
from models import Song, ViewHistory, SongType
from schemas import SongListResponse, SongResponse, SongDetailResponse, ViewHistoryPoint

router = APIRouter(tags=["songs"])


@router.get("/songs/test")
async def test():
    return {"status": "ok"}


@router.get("/songs", response_model=SongListResponse)
async def get_songs(
    type:   Literal["cover", "original", "all"] = "all",
    member: Optional[str] = None,
    sort:   Literal["views", "daily_views", "likes", "latest"] = "views",
    page:   int = Query(1, ge=1),
    limit:  int = Query(20, ge=1, le=100),
    db:     Session = Depends(get_db),
):
    query = db.query(Song)

    if type != "all":
        query = query.filter(Song.song_type == SongType(type))

    if member:
        query = query.filter(Song.member_name == member)

    if sort == "views":
        query = query.order_by(desc(Song.view_count))
    elif sort == "daily_views":
        since = datetime.utcnow() - timedelta(hours=24)
        subq = (
            db.query(
                ViewHistory.song_id,
                (func.max(ViewHistory.view_count) - func.min(ViewHistory.view_count))
                .label("daily_gain"),
            )
            .filter(ViewHistory.recorded_at >= since)
            .group_by(ViewHistory.song_id)
            .subquery()
        )
        query = (
            query.outerjoin(subq, Song.id == subq.c.song_id)
            .order_by(desc(subq.c.daily_gain))
        )
    elif sort == "likes":
        query = query.order_by(desc(Song.like_count))
    elif sort == "latest":
        query = query.order_by(desc(Song.published_at))

    # 멤버 필터 없을 때 video_id 중복 제거
    if not member:
        all_items = query.all()
        seen      = set()
        deduped   = []
        for song in all_items:
            if song.video_id not in seen:
                seen.add(song.video_id)
                deduped.append(song)
        total    = len(deduped)
        offset   = (page - 1) * limit
        items    = deduped[offset:offset + limit]
        has_next = (offset + limit) < total
    else:
        total    = query.count()
        offset   = (page - 1) * limit
        items    = query.offset(offset).limit(limit).all()
        has_next = (offset + limit) < total

    return SongListResponse(
        items    = items,
        total    = total,
        page     = page,
        limit    = limit,
        has_next = has_next,
    )


@router.get("/songs/{video_id}", response_model=SongDetailResponse)
async def get_song_detail(
    video_id: str,
    member:   Optional[str] = None,
    db:       Session = Depends(get_db),
):
    query = db.query(Song).filter_by(video_id=video_id)
    if member:
        query = query.filter_by(member_name=member)
    song = query.first()

    if not song:
        raise HTTPException(status_code=404, detail="영상을 찾을 수 없습니다.")

    since   = datetime.utcnow() - timedelta(days=30)
    history = (
        db.query(ViewHistory)
        .filter(
            ViewHistory.song_id == song.id,
            ViewHistory.recorded_at >= since,
        )
        .order_by(ViewHistory.recorded_at)
        .all()
    )

    related = (
        db.query(Song)
        .filter(
            Song.member_name == song.member_name,
            Song.video_id != video_id,
        )
        .order_by(desc(Song.view_count))
        .limit(6)
        .all()
    )

    return SongDetailResponse(
        **SongResponse.model_validate(song).model_dump(),
        view_history  = history,
        related_songs = related,
    )


@router.get("/songs/{video_id}/history")
async def get_song_history(
    video_id: str,
    period:   Literal["7d", "30d"] = "7d",
    member:   Optional[str] = None,
    db:       Session = Depends(get_db),
):
    query = db.query(Song).filter_by(video_id=video_id)
    if member:
        query = query.filter_by(member_name=member)
    song = query.first()

    if not song:
        raise HTTPException(status_code=404, detail="영상을 찾을 수 없습니다.")

    days  = 7 if period == "7d" else 30
    since = datetime.utcnow() - timedelta(days=days)

    history = (
        db.query(ViewHistory)
        .filter(
            ViewHistory.song_id == song.id,
            ViewHistory.recorded_at >= since,
        )
        .order_by(ViewHistory.recorded_at)
        .all()
    )

    return [
        ViewHistoryPoint(recorded_at=h.recorded_at, view_count=h.view_count)
        for h in history
    ]


@router.get("/search")
async def search_songs(
    q:      str = Query(..., min_length=1),
    member: Optional[str] = None,
    db:     Session = Depends(get_db),
):
    query = db.query(Song).filter(Song.title.ilike(f"%{q}%"))

    if member:
        query = query.filter(Song.member_name == member)

    all_results = query.order_by(desc(Song.view_count)).all()
    seen        = set()
    results     = []
    for song in all_results:
        if song.video_id not in seen:
            seen.add(song.video_id)
            results.append(song)

    return results[:50]