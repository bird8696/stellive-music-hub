# constants.py

# ── 멤버 색상 시스템 ──────────────────────────────

MEMBER_TEXT_COLORS: dict[str, str] = {
    "유니":   "#1a0a4a",
    "후야":   "#f0e6ff",
    "히나":   "#2d0000",
    "마시로": "#ffffff",
    "리제":   "#ffbbbb",
    "타비":   "#0a2040",
    "시부키": "#1a0040",
    "린":     "#ffffff",
    "나나":   "#3d0015",
    "리코":   "#002a1a",
}

MEMBER_BADGE_COLORS: dict[str, tuple[str, str]] = {
    "유니":   ("rgba(26,10,74,0.2)",     "#1a0a4a"),
    "후야":   ("rgba(255,255,255,0.15)", "#f0e6ff"),
    "히나":   ("rgba(45,0,0,0.2)",       "#2d0000"),
    "마시로": ("rgba(255,255,255,0.15)", "#ffffff"),
    "리제":   ("rgba(255,187,187,0.15)", "#ffbbbb"),
    "타비":   ("rgba(10,32,64,0.2)",     "#0a2040"),
    "시부키": ("rgba(26,0,64,0.2)",      "#1a0040"),
    "린":     ("rgba(255,255,255,0.15)", "#ffffff"),
    "나나":   ("rgba(61,0,21,0.2)",      "#3d0015"),
    "리코":   ("rgba(0,42,26,0.2)",      "#002a1a"),
}

MEMBER_BTN_COLORS: dict[str, tuple[str, str]] = {
    "유니":   ("#1a0a4a", "#d4c8ff"),
    "후야":   ("#2d1a4a", "#e8d5ff"),
    "히나":   ("#2d0000", "#ffd0c8"),
    "마시로": ("#111314", "#cccccc"),
    "리제":   ("#1a0000", "#ff9999"),
    "타비":   ("#0a2040", "#c8eaff"),
    "시부키": ("#1a0040", "#e8d0ff"),
    "린":     ("#041030", "#b0d0ff"),
    "나나":   ("#3d0015", "#ffd0dd"),
    "리코":   ("#002a1a", "#a0e8c8"),
}

# ── 채널 메타 ────────────────────────────────────

CHANNEL_META: list[dict] = [
    {
        "handle": "@StelLive_official",
        "member_name": "공식",
        "member_name_full": "스텔라이브 공식",
        "generation": "official",
        "channel_id": "UC2b4WRE5BZ6SIUWBeJU8rwg",
    },
    # 1기 EVERYS
    {"handle": "@ayatsunoyuni",  "member_name": "유니",   "member_name_full": "아야츠노 유니", "generation": "1기 EVERYS",   "channel_id": None},
    {"handle": "@sakihanehuya",  "member_name": "후야",   "member_name_full": "사키하네 후야", "generation": "1기 EVERYS",   "channel_id": None},
    # 2기 UNIVERSE
    {"handle": "@shirayukihina", "member_name": "히나",   "member_name_full": "시라유키 히나", "generation": "2기 UNIVERSE", "channel_id": None},
    {"handle": "@neneko_mashiro","member_name": "마시로", "member_name_full": "네네코 마시로", "generation": "2기 UNIVERSE", "channel_id": None},
    {"handle": "@akanelize",     "member_name": "리제",   "member_name_full": "아카네 리제",  "generation": "2기 UNIVERSE", "channel_id": "UC7-m6jQLinZQWIbwm9W-1iw"},
    {"handle": "@arahashitabi",  "member_name": "타비",   "member_name_full": "아라하시 타비", "generation": "2기 UNIVERSE", "channel_id": None},
    # 3기 cliché (핸들 실제 채널에서 확인 필요)
    {"handle": "@tenkoshibuki",  "member_name": "시부키", "member_name_full": "텐코 시부키",  "generation": "3기 cliché",   "channel_id": None},
    {"handle": "@aokumorin",     "member_name": "린",     "member_name_full": "아오쿠모 린",  "generation": "3기 cliché",   "channel_id": None},
    {"handle": "@hanakonana",    "member_name": "나나",   "member_name_full": "하나코 나나",  "generation": "3기 cliché",   "channel_id": None},
    {"handle": "@yuzuhariko",    "member_name": "리코",   "member_name_full": "유즈하 리코",  "generation": "3기 cliché",   "channel_id": None},
]

HANDLE_TO_MEMBER: dict[str, str] = {ch["handle"]: ch["member_name"] for ch in CHANNEL_META}
MEMBER_NAMES: list[str] = [ch["member_name"] for ch in CHANNEL_META if ch["generation"] != "official"]

# ── 필터링 상수 ──────────────────────────────────

INCLUDE_TITLE_KEYWORDS = ["커버", "Cover", "cover", "오리지널", "Original", "MV", "M/V", "노래", "음악", "OST", "Song", "【歌ってみた】", "(Cover)"]
EXCLUDE_TITLE_KEYWORDS = ["방송", "게임", "먹방", "잡담", "공지", "알림"]
INCLUDE_HASHTAGS       = ["#cover", "#커버", "#뮤직비디오", "#오리지널"]
COVER_KEYWORDS         = ["커버", "Cover", "cover", "【歌ってみた】", "(Cover)"]
ORIGINAL_KEYWORDS      = ["오리지널", "Original", "original", "MV", "M/V", "오리지널곡"]
MUSIC_CATEGORY_ID      = "10"
MIN_DURATION_SECONDS   = 30

# ── 스케줄러 ─────────────────────────────────────

REFRESH_INTERVAL_HOURS       = 6
VIEW_UPDATE_INTERVAL_HOURS   = 1
MAX_VIDEOS_PER_CHANNEL       = 500
VIEW_HISTORY_RETENTION_DAYS  = 90
API_CALL_DELAY_SECONDS       = 0.1


# ── 플레이리스트 ID ──────────────────────────────

PLAYLIST_IDS: list[dict] = [
    # 스텔라이브 공식
    {"playlist_id": "PLLjd981H8qSMGC4Nir0hD2Gj9n9PDUoHX", "member_name": None, "song_type": "original"},
    {"playlist_id": "PLLjd981H8qSN9PQ8-X6wINqBF1GjGxusy", "member_name": None, "song_type": "cover"},
    # 멤버 개인
    {"playlist_id": "PL3HtH_xx9h_7ZGoZ9zMUQ-MPumwe21_cc", "member_name": "유니",   "song_type": None},
    {"playlist_id": "PL3rF5rqFNO48ZMgPuZ6XbQ1J9IT3TQtcs", "member_name": "후야",   "song_type": None},
    {"playlist_id": "PLbIDsfX2JRA0oawGN209gpd_nz9IMvUlb",  "member_name": "타비",   "song_type": None},
    {"playlist_id": "PL-DHk0WpiRNSM5oI19ImJ8sSV65mnGseX",  "member_name": "리제",   "song_type": None},
    {"playlist_id": "PLWwhuXFHGLvhgZZb5_rmQEMI1B0ysKJxG",  "member_name": "마시로", "song_type": None},
    {"playlist_id": "PLzdLDJsHzz2NiuwjyW6QgSck4PrwlSyOc",  "member_name": "히나",   "song_type": "cover"},
    {"playlist_id": "PLzdLDJsHzz2OzXsHwt35PHjDq7r93xM1L",  "member_name": "히나",   "song_type": "original"},
    {"playlist_id": "PLJWmDIpvwe7Cri29xtAyQXLC1RLwOChpA",  "member_name": "나나",   "song_type": None},
    {"playlist_id": "PLKVNBOcsLJlVii-8YwoZTD3o4gh5CnIND",  "member_name": "시부키", "song_type": None},
    {"playlist_id": "PLSDRWR15h-o4uWNeoLv0upOUUGj12f-yU",  "member_name": "린",     "song_type": None},
    {"playlist_id": "PL_D2YrKeYY2UvRIw_SW3lQXzBDO7aBeii",  "member_name": "리코",   "song_type": None},
]