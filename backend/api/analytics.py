from fastapi import APIRouter, Query
from ..services.analytics_service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("")
async def get_analytics(time_range: str = Query(default="24H")):
    return analytics_service.get_analytics(time_range)
