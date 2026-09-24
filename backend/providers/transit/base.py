from abc import ABC, abstractmethod
from typing import Any
from ...core.models import TransitRoute, TransitVehicle


class TransitProvider(ABC):
    @abstractmethod
    async def get_routes(self, zone: str = "") -> list[TransitRoute]:
        """Fetch transit routes and operational health."""
        pass

    @abstractmethod
    async def get_active_vehicles(self) -> list[TransitVehicle]:
        """Fetch positions and states of active public transit vehicles."""
        pass

    @abstractmethod
    async def get_alerts(self) -> list[dict[str, Any]]:
        """Fetch active service disruption alerts."""
        pass

    @abstractmethod
    async def get_delays_summary(self) -> dict[str, Any]:
        """Fetch average delays by zone."""
        pass
