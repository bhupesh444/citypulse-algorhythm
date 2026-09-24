from fastapi import APIRouter, Query
from ..core.config import settings
from ..providers.air_quality.openaq import OpenAQAirQualityProvider

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality"])
aq_provider = OpenAQAirQualityProvider()


@router.get("/current")
async def get_current_air_quality(
    lat: float = Query(default=settings.DEFAULT_LATITUDE),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE),
):
    return await aq_provider.get_current_air_quality(lat, lon)


@router.get("/forecast")
async def get_air_quality_forecast(
    lat: float = Query(default=settings.DEFAULT_LATITUDE),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE),
):
    return await aq_provider.get_air_quality_forecast(lat, lon)
