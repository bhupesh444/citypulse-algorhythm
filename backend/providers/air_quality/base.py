from abc import ABC, abstractmethod
from typing import Any
from ...core.models import AirQualitySnapshot


class AirQualityProvider(ABC):
    @abstractmethod
    async def get_current_air_quality(self, lat: float, lon: float) -> AirQualitySnapshot:
        """Fetch current air quality for coordinates."""
        pass

    @abstractmethod
    async def get_air_quality_forecast(self, lat: float, lon: float) -> dict[str, Any]:
        """Fetch air quality forecast."""
        pass
