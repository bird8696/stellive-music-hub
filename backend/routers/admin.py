# routers/admin.py

import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from database import get_db, SessionLocal
from schemas import RefreshResponse

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_admin_key(x_admin_key: str = Header(...)):
    if x_admin_key != os.getenv("ADMIN_API_KEY"):
        raise HTTPException(status_code=403, detail="유효하지 않은 관리자 키")


@router.post("/refresh", response_model=RefreshResponse)
async def manual_refresh(
    db: Session = Depends(get_db),
    _=Depends(verify_admin_key),
):
    """신규 영상 수집 수동 트리거"""
    from youtube_service import fetch_new_videos
    try:
        await fetch_new_videos(db)
        return RefreshResponse(
            status       = "ok",
            message      = "신규 영상 수집 완료",
            triggered_at = datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/update-views", response_model=RefreshResponse)
async def manual_update_views(
    db: Session = Depends(get_db),
    _=Depends(verify_admin_key),
):
    """조회수 갱신 수동 트리거"""
    from youtube_service import update_view_counts
    try:
        await update_view_counts(db)
        return RefreshResponse(
            status       = "ok",
            message      = "조회수 갱신 완료",
            triggered_at = datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/init-channels", response_model=RefreshResponse)
async def manual_init_channels(
    db: Session = Depends(get_db),
    _=Depends(verify_admin_key),
):
    """채널 핸들 → ID 재조회 강제 실행"""
    from youtube_service import init_channels
    try:
        await init_channels(db)
        return RefreshResponse(
            status       = "ok",
            message      = "채널 초기화 완료",
            triggered_at = datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))