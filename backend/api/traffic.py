from fastapi import APIRouter, Query
from ..core.config import settings
from ..providers.traffic.tomtom import TomTomTrafficProvider

router = APIRouter(prefix="/api/traffic", tags=["Traffic"])
traffic_provider = TomTomTrafficProvider()


@router.get("/flow")
async def get_traffic_flow(
    lat: float = Query(default=settings.DEFAULT_LATITUDE),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE),
    zone: str = Query(default="Central"),
):
    return await traffic_provider.get_traffic_flow(lat, lon, zone)


@router.get("/incidents")
async def get_traffic_incidents(
    min_lat: float = Query(default=26.70),
    min_lon: float = Query(default=75.60),
    max_lat: float = Query(default=27.25),
    max_lon: float = Query(default=76.10),
):
    return await traffic_provider.get_traffic_incidents(min_lat, min_lon, max_lat, max_lon)
