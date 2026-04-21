# models.py

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, BigInteger, DateTime,
    ForeignKey, Enum, Boolean, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
import enum

from database import Base


class SongType(str, enum.Enum):
    cover    = "cover"
    original = "original"
    unknown  = "unknown"


class Generation(str, enum.Enum):
    official = "official"
    gen1     = "1기 EVERYS"
    gen2     = "2기 UNIVERSE"
    gen3     = "3기 cliché"


class Channel(Base):
    __tablename__ = "channels"

    channel_id       = Column(String(50),  primary_key=True, index=True)
    handle           = Column(String(100), unique=True, nullable=False)
    member_name      = Column(String(20),  nullable=False)
    member_name_full = Column(String(50),  nullable=False)
    generation       = Column(Enum(Generation), nullable=False)
    is_active        = Column(Boolean, default=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    songs = relationship("Song", back_populates="channel", cascade="all, delete-orphan")


class Song(Base):
    __tablename__ = "songs"
    __table_args__ = (
        UniqueConstraint("video_id", "member_name", name="uq_video_member"),
    )

    id            = Column(Integer, primary_key=True, autoincrement=True)
    video_id      = Column(String(20), nullable=False, index=True)
    title         = Column(String(300), nullable=False)
    channel_id    = Column(String(50), ForeignKey("channels.channel_id"), nullable=False)
    channel_name  = Column(String(100), nullable=False)
    member_name   = Column(String(20), nullable=False, index=True)
    thumbnail_url = Column(String(500))
    published_at  = Column(DateTime, nullable=False, index=True)
    view_count    = Column(BigInteger, default=0, index=True)
    like_count    = Column(BigInteger, default=0)
    comment_count = Column(BigInteger, default=0)
    duration      = Column(Integer, default=0)
    category_id   = Column(String(10))
    description   = Column(Text)
    song_type     = Column(Enum(SongType), default=SongType.unknown, index=True)
    is_short      = Column(Boolean, default=False)
    is_collab     = Column(Boolean, default=False)  # 단체곡 여부
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    channel      = relationship("Channel", back_populates="songs")
    view_history = relationship("ViewHistory", back_populates="song", cascade="all, delete-orphan")


class ViewHistory(Base):
    __tablename__ = "view_history"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    song_id     = Column(Integer, ForeignKey("songs.id"), nullable=False, index=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    view_count  = Column(BigInteger, nullable=False)

    song = relationship("Song", back_populates="view_history")