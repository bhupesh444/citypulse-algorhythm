import time
from datetime import datetime, timezone
from typing import Any
import httpx

from ...core.models import SourceStatus, WeatherSnapshot
from .base import WeatherProvider

# Weather code mapping according to WMO standard
WMO_WEATHER_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


class OpenMeteoWeatherProvider(WeatherProvider):
    def __init__(self):
        self._cache: dict[str, tuple[float, Any]] = {}
        self._cache_ttl = 300  # 5 minutes cache

    async def get_current_weather(self, lat: float, lon: float) -> WeatherSnapshot:
        cache_key = f"current_{lat:.4f}_{lon:.4f}"
        now_ts = time.time()

        if cache_key in self._cache:
            cached_time, cached_val = self._cache[cache_key]
            if now_ts - cached_time < self._cache_ttl:
                return cached_val

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m",
            "timezone": "auto",
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    curr = data.get("current", {})
                    wcode = curr.get("weather_code", 0)
                    condition = WMO_WEATHER_MAP.get(wcode, "Clear")
                    now_dt = datetime.now(timezone.utc)

                    snapshot = WeatherSnapshot(
                        temperature=curr.get("temperature_2m", 31.0),
                        humidity=curr.get("relative_humidity_2m", 50.0),
                        rainfall=curr.get("rain", curr.get("precipitation", 0.0)),
                        wind_speed=curr.get("wind_speed_10m", 10.0),
                        weather_condition=condition,
                        timestamp=now_dt,
                        apparent_temperature=curr.get("apparent_temperature"),
                        wind_direction=curr.get("wind_direction_10m"),
                        cloud_cover=curr.get("cloud_cover"),
                        weather_code=wcode,
                        source_status=SourceStatus.LIVE,
                        source_name="Open-Meteo",
                    )
                    self._cache[cache_key] = (now_ts, snapshot)
                    return snapshot
        except Exception:
            pass

        # Return structured fallback if network fails
        fallback_dt = datetime.now(timezone.utc)
        return WeatherSnapshot(
            temperature=31.2,
            humidity=52.0,
            rainfall=0.0,
            wind_speed=9.0,
            weather_condition="Clear (Cached)",
            timestamp=fallback_dt,
            apparent_temperature=32.1,
            wind_direction=80.0,
            cloud_cover=15.0,
            weather_code=0,
            source_status=SourceStatus.DEGRADED,
            source_name="Open-Meteo Fallback",
        )

    async def get_forecast(self, lat: float, lon: float, days: int = 3) -> dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
            "timezone": "auto",
            "forecast_days": days,
        }
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return {"error": "Forecast temporarily unavailable", "source": "Open-Meteo"}

    async def get_history(self, lat: float, lon: float, past_days: int = 2) -> dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
            "past_days": past_days,
            "forecast_days": 1,
            "timezone": "auto",
        }
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return {"error": "Historical weather temporarily unavailable", "source": "Open-Meteo"}
