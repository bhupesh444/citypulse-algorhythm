from datetime import datetime, timezone
from typing import Any
from ...core.models import SourceStatus, TransitRoute, TransitVehicle
from .base import TransitProvider


class GTFSTransitProvider(TransitProvider):
    def __init__(self, feed_url: str = ""):
        self.feed_url = feed_url
        # If feed_url is provided, it can be polled; otherwise cleanly reported as Demo Transit

    async def get_routes(self, zone: str = "") -> list[TransitRoute]:
        # Realistic representative civic transit routes (Jaipur Metro / Bus network)
        routes = [
            TransitRoute(
                route_id="M1-PINK",
                route_name="Mansarovar - Badi Chaupar (Metro Phase 1)",
                route_type="Subway / Metro",
                zone="Central",
                active_vehicles=8,
                delay_minutes=1.5,
                status="ON TIME",
                source_status=SourceStatus.SIMULATED,
            ),
            TransitRoute(
                route_id="R12-CENTRAL",
                route_name="Central Station Connector Express",
                route_type="Bus Rapid Transit",
                zone="Central",
                active_vehicles=12,
                delay_minutes=4.0,
                status="MINOR DELAY",
                source_status=SourceStatus.SIMULATED,
            ),
            TransitRoute(
                route_id="R15-NORTH",
                route_name="Amber Fort - Vidyadhar Nagar Shuttle",
                route_type="City Bus",
                zone="North",
                active_vehicles=6,
                delay_minutes=2.0,
                status="ON TIME",
                source_status=SourceStatus.SIMULATED,
            ),
            TransitRoute(
                route_id="R22-SOUTH",
                route_name="Sanganer Airport Link",
                route_type="Express Shuttle",
                zone="South",
                active_vehicles=9,
                delay_minutes=3.2,
                status="ON TIME",
                source_status=SourceStatus.SIMULATED,
            ),
            TransitRoute(
                route_id="R08-WEST",
                route_name="Vaishali Nagar Suburban Loop",
                route_type="Feeder Bus",
                zone="West",
                active_vehicles=5,
                delay_minutes=0.5,
                status="ON TIME",
                source_status=SourceStatus.SIMULATED,
            ),
            TransitRoute(
                route_id="R31-EAST",
                route_name="Jagatpura Knowledge Corridor",
                route_type="Bus",
                zone="East",
                active_vehicles=7,
                delay_minutes=1.8,
                status="ON TIME",
                source_status=SourceStatus.SIMULATED,
            ),
        ]
        if zone:
            return [r for r in routes if r.zone.lower() == zone.lower()]
        return routes

    async def get_active_vehicles(self) -> list[TransitVehicle]:
        now_dt = datetime.now(timezone.utc)
        return [
            TransitVehicle(
                vehicle_id="METRO-101",
                route_id="M1-PINK",
                latitude=26.9180,
                longitude=75.7950,
                speed_kmh=42.0,
                status="IN TRANSIT",
                congestion_level="NORMAL",
                timestamp=now_dt,
            ),
            TransitVehicle(
                vehicle_id="BUS-402",
                route_id="R12-CENTRAL",
                latitude=26.9140,
                longitude=75.7910,
                speed_kmh=24.5,
                status="SLOW TRAFFIC",
                congestion_level="MEDIUM",
                timestamp=now_dt,
            ),
            TransitVehicle(
                vehicle_id="BUS-815",
                route_id="R15-NORTH",
                latitude=26.9530,
                longitude=75.8200,
                speed_kmh=38.0,
                status="ON SCHEDULE",
                congestion_level="LOW",
                timestamp=now_dt,
            ),
            TransitVehicle(
                vehicle_id="BUS-221",
                route_id="R22-SOUTH",
                latitude=26.8350,
                longitude=75.8050,
                speed_kmh=45.0,
                status="ON SCHEDULE",
                congestion_level="LOW",
                timestamp=now_dt,
            ),
        ]

    async def get_alerts(self) -> list[dict[str, Any]]:
        return [
            {
                "id": "TR-ALERT-1",
                "route_id": "R12-CENTRAL",
                "severity": "WARNING",
                "header_text": "Moderate traffic slow down along MI Road",
                "description_text": "Central Connector buses may experience 4-8 minute delays due to corridor congestion.",
                "is_simulated": True,
            }
        ]

    async def get_delays_summary(self) -> dict[str, Any]:
        return {
            "system_average_delay_minutes": 2.4,
            "on_time_performance_pct": 91.5,
            "active_vehicles": 47,
            "source_status": "simulated",
            "source_label": "Demo Transit Feed (GTFS Compliant)",
        }
