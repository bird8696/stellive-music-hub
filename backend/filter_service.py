# filter_service.py

import re
from models import SongType
from constants import (
    INCLUDE_TITLE_KEYWORDS, EXCLUDE_TITLE_KEYWORDS,
    INCLUDE_HASHTAGS, MUSIC_CATEGORY_ID,
    MIN_DURATION_SECONDS, COVER_KEYWORDS, ORIGINAL_KEYWORDS,
)


def is_music_video(video: dict) -> bool:
    """YouTube API 영상 데이터 → 음악 영상 여부 판단"""
    snippet      = video.get("snippet", {})
    content      = video.get("contentDetails", {})
    title        = snippet.get("title", "")
    description  = snippet.get("description", "")
    duration_iso = content.get("duration", "PT0S")

    # 1. 최소 길이 체크
    if parse_duration(duration_iso) < MIN_DURATION_SECONDS:
        return False

    # 2. 제목 제외 키워드
    for kw in EXCLUDE_TITLE_KEYWORDS:
        if kw in title:
            return False

    # 3. Shorts이면서 음악 키워드 없으면 제외
    if is_shorts(video):
        has_music_kw = any(kw in title for kw in INCLUDE_TITLE_KEYWORDS)
        if not has_music_kw:
            return False

    # 4. 제목에 포함 키워드
    for kw in INCLUDE_TITLE_KEYWORDS:
        if kw in title:
            return True

    # 5. 설명에 해시태그
    hashtags = extract_hashtags(description)
    for tag in INCLUDE_HASHTAGS:
        if tag in hashtags:
            return True

    return False


def classify_song_type(title: str, description: str = "") -> SongType:
    """제목/설명 → 커버 / 오리지널 / 미분류"""
    text = title + " " + description

    for kw in COVER_KEYWORDS:
        if kw in text:
            return SongType.cover

    for kw in ORIGINAL_KEYWORDS:
        if kw in text:
            return SongType.original

    return SongType.unknown


def parse_duration(iso_duration: str) -> int:
    """ISO 8601 duration → 초 단위 정수. 예) PT3M45S → 225"""
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
    """Shorts 영상 여부 판단 (60초 이하 + #Shorts 태그)"""
    content     = video.get("contentDetails", {})
    snippet     = video.get("snippet", {})
    title       = snippet.get("title", "")
    description = snippet.get("description", "")
    duration_sec = parse_duration(content.get("duration", "PT0S"))

    has_shorts_tag = (
        "#shorts" in title.lower()
        or "#shorts" in description.lower()
    )
    return duration_sec <= 60 and has_shorts_tag


def extract_hashtags(description: str) -> list[str]:
    """설명란 해시태그 추출 → 소문자 통일"""
    return [tag.lower() for tag in re.findall(r"#\w+", description)]