from fastapi import APIRouter, Query
from ..core.config import settings
from ..providers.weather.open_meteo import OpenMeteoWeatherProvider

router = APIRouter(prefix="/api/weather", tags=["Weather"])
weather_provider = OpenMeteoWeatherProvider()


@router.get("/current")
async def get_current_weather(
    lat: float = Query(default=settings.DEFAULT_LATITUDE),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE),
):
    return await weather_provider.get_current_weather(lat, lon)


@router.get("/forecast")
async def get_weather_forecast(
    lat: float = Query(default=settings.DEFAULT_LATITUDE),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE),
    days: int = Query(default=3, ge=1, le=7),
):
    return await weather_provider.get_forecast(lat, lon, days)


@router.get("/history")
async def get_weather_history(
    lat: float = Query(default=settings.DEFAULT_LATITUDE),
    lon: float = Query(default=settings.DEFAULT_LONGITUDE),
    past_days: int = Query(default=2, ge=1, le=7),
):
    return await weather_provider.get_history(lat, lon, past_days)
