from abc import ABC, abstractmethod
from ...core.models import TrafficFlowData, TrafficIncidentData


class TrafficProvider(ABC):
    @abstractmethod
    async def get_traffic_flow(self, lat: float, lon: float, zone_name: str = "Central") -> TrafficFlowData:
        """Fetch traffic flow data for point or zone."""
        pass

    @abstractmethod
    async def get_traffic_incidents(self, min_lat: float, min_lon: float, max_lat: float, max_lon: float) -> list[TrafficIncidentData]:
        """Fetch real-time traffic incidents inside bounding box."""
        pass
