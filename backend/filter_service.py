# filter_service.py

import re
from models import SongType
from constants import (
    INCLUDE_TITLE_KEYWORDS, EXCLUDE_TITLE_KEYWORDS,
    INCLUDE_HASHTAGS,
    MIN_DURATION_SECONDS,
)


def is_music_video(video: dict) -> bool:
    snippet      = video.get("snippet", {})
    content      = video.get("contentDetails", {})
    title        = snippet.get("title", "")
    description  = snippet.get("description", "")
    duration_iso = content.get("duration", "PT0S")

    if parse_duration(duration_iso) < MIN_DURATION_SECONDS:
        return False

    for kw in EXCLUDE_TITLE_KEYWORDS:
        if kw in title:
            return False

    if is_shorts(video):
        has_music_kw = any(kw in title for kw in INCLUDE_TITLE_KEYWORDS)
        if not has_music_kw:
            return False

    for kw in INCLUDE_TITLE_KEYWORDS:
        if kw in title:
            return True

    hashtags = extract_hashtags(description)
    for tag in INCLUDE_HASHTAGS:
        if tag in hashtags:
            return True

    return False


def classify_song_type(title: str, description: str = "") -> SongType:
    """
    제목만 체크해서 커버/오리지널 분류.
    커버 키워드가 제목에 있으면 커버, 없으면 오리지널.
    """
    cover_keywords = [
        "커버", "Cover", "cover", "COVER",
        "【歌ってみた】", "(Cover)", "[Cover]",
        "歌ってみた", "うたってみた",
    ]
    for kw in cover_keywords:
        if kw in title:
            return SongType.cover

    return SongType.original


def parse_duration(iso_duration: str) -> int:
    pattern = re.compile(
        r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", re.IGNORECASE
    )
    match = pattern.match(iso_duration)
    if not match:
        return 0
    hours   = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


def is_shorts(video: dict) -> bool:
    content      = video.get("contentDetails", {})
    snippet      = video.get("snippet", {})
    title        = snippet.get("title", "")
    description  = snippet.get("description", "")
    duration_sec = parse_duration(content.get("duration", "PT0S"))

    has_shorts_tag = (
        "#shorts" in title.lower()
        or "#shorts" in description.lower()
    )
    return duration_sec <= 60 and has_shorts_tag


def extract_hashtags(description: str) -> list[str]:
    return [tag.lower() for tag in re.findall(r"#\w+", description)]