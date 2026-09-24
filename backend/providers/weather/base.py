from abc import ABC, abstractmethod
from typing import Any
from ...core.models import WeatherSnapshot


class WeatherProvider(ABC):
    @abstractmethod
    async def get_current_weather(self, lat: float, lon: float) -> WeatherSnapshot:
        """Fetch current weather for given coordinates."""
        pass

    @abstractmethod
    async def get_forecast(self, lat: float, lon: float, days: int = 3) -> dict[str, Any]:
        """Fetch multi-day weather forecast."""
        pass

    @abstractmethod
    async def get_history(self, lat: float, lon: float, past_days: int = 2) -> dict[str, Any]:
        """Fetch past weather history."""
        pass
