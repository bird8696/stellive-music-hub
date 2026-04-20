# scheduler.py

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from constants import REFRESH_INTERVAL_HOURS, VIEW_UPDATE_INTERVAL_HOURS

logger    = logging.getLogger("stellive.scheduler")
scheduler = AsyncIOScheduler()


async def job_fetch_new_videos():
    """신규 영상 수집 잡"""
    from database import SessionLocal
    from youtube_service import fetch_new_videos

    logger.info("📥 신규 영상 수집 시작")
    db = SessionLocal()
    try:
        await fetch_new_videos(db)
    except Exception as e:
        logger.error(f"신규 영상 수집 실패: {e}")
    finally:
        db.close()


async def job_update_view_counts():
    """조회수 갱신 잡"""
    from database import SessionLocal
    from youtube_service import update_view_counts

    logger.info("🔄 조회수 갱신 시작")
    db = SessionLocal()
    try:
        await update_view_counts(db)
    except Exception as e:
        logger.error(f"조회수 갱신 실패: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(
        job_fetch_new_videos,
        trigger=IntervalTrigger(hours=REFRESH_INTERVAL_HOURS),
        id="fetch_new_videos",
        replace_existing=True,
    )
    scheduler.add_job(
        job_update_view_counts,
        trigger=IntervalTrigger(hours=VIEW_UPDATE_INTERVAL_HOURS),
        id="update_view_counts",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        f"✅ 스케줄러 시작 — "
        f"영상수집 {REFRESH_INTERVAL_HOURS}h / "
        f"조회수갱신 {VIEW_UPDATE_INTERVAL_HOURS}h"
    )


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("👋 스케줄러 종료")