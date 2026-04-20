# main.py

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("stellive")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🌟 StelLive Music Hub 시작")

    # 1. DB 테이블 생성
    from database import init_db
    init_db()
    logger.info("✅ DB 초기화 완료")

    # 2. 채널 ID 초기화
    from database import SessionLocal
    from youtube_service import init_channels, fetch_all_videos
    db = SessionLocal()
    try:
        await init_channels(db)

        # 영상 데이터가 없으면 전체 수집 실행
        from models import Song
        if db.query(Song).count() == 0:
            logger.info("📥 초기 전체 영상 수집 시작")
            await fetch_all_videos(db)
    finally:
        db.close()

    # 3. 스케줄러 시작
    from scheduler import start_scheduler
    start_scheduler()

    yield

    # 종료
    from scheduler import stop_scheduler
    stop_scheduler()
    logger.info("👋 StelLive Music Hub 종료")


app = FastAPI(
    title="StelLive Music Hub API",
    description="스텔라이브 커버/오리지널 곡 수집 및 랭킹 서비스",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3000"),
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
from routers import songs, ranking, members, admin
app.include_router(songs.router,   prefix="/api")
app.include_router(ranking.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(admin.router,   prefix="/api")


@app.get("/")
async def root():
    return {"message": "🌟 StelLive Music Hub API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)