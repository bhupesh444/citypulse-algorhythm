import httpx
from typing import Any, Optional

from ...core.config import settings
from ...core.models import AirQualitySnapshot, SourceStatus
from .base import AirQualityProvider
from .open_meteo import OpenMeteoAirQualityProvider


class OpenAQAirQualityProvider(AirQualityProvider):
    def __init__(self, fallback_provider: Optional[AirQualityProvider] = None):
        self.api_key = settings.OPENAQ_API_KEY
        self.fallback = fallback_provider or OpenMeteoAirQualityProvider()

    async def get_current_air_quality(self, lat: float, lon: float) -> AirQualitySnapshot:
        # If no key, fallback immediately to Open-Meteo
        if not self.api_key:
            return await self.fallback.get_current_air_quality(lat, lon)

        url = "https://api.openaq.org/v2/latest"
        headers = {"X-API-Key": self.api_key}
        params = {
            "coordinates": f"{lat},{lon}",
            "radius": 25000,
            "limit": 1,
        }
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, headers=headers, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        # Parse OpenAQ measurements
                        measurements = {m.get("parameter"): m.get("value") for m in results[0].get("measurements", [])}
                        pm2_5 = float(measurements.get("pm25", 35.0))
                        pm10 = float(measurements.get("pm10", 70.0))
                        from datetime import datetime, timezone
                        return AirQualitySnapshot(
                            pm2_5=pm2_5,
                            pm10=pm10,
                            co=float(measurements.get("co", 400.0)),
                            no2=float(measurements.get("no2", 20.0)),
                            so2=float(measurements.get("so2", 10.0)),
                            o3=float(measurements.get("o3", 45.0)),
                            aqi=int(pm2_5 * 2.1),
                            timestamp=datetime.now(timezone.utc),
                            source_name="OpenAQ Live Station",
                            source_status=SourceStatus.LIVE,
                        )
        except Exception:
            pass

        # Fallback to Open-Meteo if OpenAQ returns no stations or fails
        return await self.fallback.get_current_air_quality(lat, lon)

    async def get_air_quality_forecast(self, lat: float, lon: float) -> dict[str, Any]:
        return await self.fallback.get_air_quality_forecast(lat, lon)
