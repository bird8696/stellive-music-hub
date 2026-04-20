# schemas.py

from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from models import SongType, Generation


# ── Channel ──────────────────────────────────────

class ChannelResponse(BaseModel):
    channel_id:       str
    handle:           str
    member_name:      str
    member_name_full: str
    generation:       Generation
    is_active:        bool
    created_at:       datetime
    updated_at:       datetime

    class Config:
        from_attributes = True


# ── Song ─────────────────────────────────────────

class SongResponse(BaseModel):
    video_id:      str
    title:         str
    channel_id:    str
    channel_name:  str
    member_name:   str
    thumbnail_url: Optional[str] = None
    published_at:  datetime
    view_count:    int
    like_count:    int
    comment_count: int
    duration:      int
    category_id:   Optional[str] = None
    song_type:     SongType
    is_short:      bool
    created_at:    datetime
    updated_at:    datetime

    class Config:
        from_attributes = True


class SongListResponse(BaseModel):
    items:    list[SongResponse]
    total:    int
    page:     int
    limit:    int
    has_next: bool


# ── Ranking ──────────────────────────────────────

class RankingItem(BaseModel):
    rank:        int
    prev_rank:   Optional[int] = None
    rank_change: Optional[int] = None
    is_new:      bool = False
    daily_views: int  = 0

    video_id:      str
    title:         str
    member_name:   str
    thumbnail_url: Optional[str] = None
    published_at:  datetime
    view_count:    int
    like_count:    int
    song_type:     SongType

    class Config:
        from_attributes = True


class RankingResponse(BaseModel):
    period:    str
    song_type: str
    member:    Optional[str] = None
    items:     list[RankingItem]
    updated_at: datetime


# ── ViewHistory ───────────────────────────────────

class ViewHistoryPoint(BaseModel):
    recorded_at: datetime
    view_count:  int

    class Config:
        from_attributes = True


class SongDetailResponse(SongResponse):
    view_history:  list[ViewHistoryPoint] = []
    related_songs: list[SongResponse]    = []


# ── Member ────────────────────────────────────────

class MemberStats(BaseModel):
    member_name:      str
    member_name_full: str
    generation:       str
    handle:           str
    channel_id:       str
    total_songs:      int
    total_views:      int
    cover_count:      int
    original_count:   int
    top3_songs:       list[SongResponse] = []


class MemberListResponse(BaseModel):
    members: list[MemberStats]


# ── Stats ─────────────────────────────────────────

class GlobalStats(BaseModel):
    total_songs:    int
    total_views:    int
    cover_count:    int
    original_count: int
    today_uploads:  int
    last_updated:   datetime


# ── Admin ─────────────────────────────────────────

class RefreshResponse(BaseModel):
    status:       str
    message:      str
    triggered_at: datetime