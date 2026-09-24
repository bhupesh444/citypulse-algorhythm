import time
from datetime import datetime, timezone
from typing import Any
import httpx

from ...core.models import AirQualitySnapshot, SourceStatus
from .base import AirQualityProvider


class OpenMeteoAirQualityProvider(AirQualityProvider):
    def __init__(self):
        self._cache: dict[str, tuple[float, Any]] = {}
        self._cache_ttl = 600  # 10 minutes cache

    async def get_current_air_quality(self, lat: float, lon: float) -> AirQualitySnapshot:
        cache_key = f"aq_{lat:.4f}_{lon:.4f}"
        now_ts = time.time()

        if cache_key in self._cache:
            cached_time, cached_val = self._cache[cache_key]
            if now_ts - cached_time < self._cache_ttl:
                return cached_val

        url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi",
            "timezone": "auto",
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    curr = data.get("current", {})
                    now_dt = datetime.now(timezone.utc)

                    aq_snapshot = AirQualitySnapshot(
                        pm2_5=round(curr.get("pm2_5", 35.4), 1),
                        pm10=round(curr.get("pm10", 72.1), 1),
                        co=round(curr.get("carbon_monoxide", 450.0), 1),
                        no2=round(curr.get("nitrogen_dioxide", 22.5), 1),
                        so2=round(curr.get("sulphur_dioxide", 9.8), 1),
                        o3=round(curr.get("ozone", 48.2), 1),
                        aqi=int(curr.get("us_aqi", curr.get("european_aqi", 85))),
                        timestamp=now_dt,
                        source_name="Open-Meteo Air Quality",
                        source_status=SourceStatus.LIVE,
                    )
                    self._cache[cache_key] = (now_ts, aq_snapshot)
                    return aq_snapshot
        except Exception:
            pass

        now_dt = datetime.now(timezone.utc)
        return AirQualitySnapshot(
            pm2_5=42.0,
            pm10=88.0,
            co=480.0,
            no2=25.0,
            so2=11.0,
            o3=45.0,
            aqi=92,
            timestamp=now_dt,
            source_name="Open-Meteo Air Quality (Fallback)",
            source_status=SourceStatus.DEGRADED,
        )

    async def get_air_quality_forecast(self, lat: float, lon: float) -> dict[str, Any]:
        url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi",
            "forecast_days": 2,
            "timezone": "auto",
        }
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return {"error": "Air quality forecast unavailable", "source": "Open-Meteo"}
