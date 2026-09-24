import time
from datetime import datetime, timezone
import httpx

from ...core.config import settings
from ...core.models import Severity, SourceStatus, TrafficFlowData, TrafficIncidentData
from .base import TrafficProvider


class TomTomTrafficProvider(TrafficProvider):
    def __init__(self):
        self.api_key = settings.TOMTOM_API_KEY
        self._cache: dict[str, tuple[float, TrafficFlowData]] = {}
        self._cache_ttl = 60  # 1 minute short cache for traffic

    async def get_traffic_flow(self, lat: float, lon: float, zone_name: str = "Central") -> TrafficFlowData:
        now_dt = datetime.now(timezone.utc)
        cache_key = f"flow_{lat:.4f}_{lon:.4f}"
        now_ts = time.time()

        if cache_key in self._cache:
            c_time, c_val = self._cache[cache_key]
            if now_ts - c_time < self._cache_ttl:
                return c_val

        if self.api_key:
            url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json"
            params = {
                "point": f"{lat},{lon}",
                "unit": "kmph",
                "key": self.api_key,
            }
            try:
                async with httpx.AsyncClient(timeout=3.5) as client:
                    resp = await client.get(url, params=params)
                    if resp.status_code == 200:
                        seg = resp.json().get("flowSegmentData", {})
                        curr_speed = float(seg.get("currentSpeed", 38))
                        free_speed = float(seg.get("freeFlowSpeed", 50))
                        congestion = max(0.0, min(100.0, (1.0 - (curr_speed / max(free_speed, 1.0))) * 100))
                        flow = TrafficFlowData(
                            zone=zone_name,
                            current_speed=round(curr_speed, 1),
                            free_flow_speed=round(free_speed, 1),
                            travel_time_sec=int(seg.get("currentTravelTime", 120)),
                            confidence=float(seg.get("confidence", 0.95)),
                            congestion_ratio=round(congestion, 1),
                            timestamp=now_dt,
                            source_name="TomTom Traffic Flow",
                            source_status=SourceStatus.LIVE,
                        )
                        self._cache[cache_key] = (now_ts, flow)
                        return flow
            except Exception:
                pass

        # Resilient Simulated / Fallback flow
        simulated_flow = TrafficFlowData(
            zone=zone_name,
            current_speed=34.5,
            free_flow_speed=50.0,
            travel_time_sec=145,
            confidence=0.92,
            congestion_ratio=38.5,
            timestamp=now_dt,
            source_name="TomTom Simulation Model",
            source_status=SourceStatus.SIMULATED,
        )
        return simulated_flow

    async def get_traffic_incidents(self, min_lat: float, min_lon: float, max_lat: float, max_lon: float) -> list[TrafficIncidentData]:
        now_dt = datetime.now(timezone.utc)
        if self.api_key:
            url = "https://api.tomtom.com/traffic/services/5/incidentDetails"
            params = {
                "bbox": f"{min_lon},{min_lat},{max_lon},{max_lat}",
                "fields": "{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},from,to}}}",
                "language": "en-GB",
                "key": self.api_key,
            }
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(url, params=params)
                    if resp.status_code == 200:
                        incidents_out = []
                        data = resp.json().get("incidents", [])
                        for idx, item in enumerate(data[:15]):
                            props = item.get("properties", {})
                            geom = item.get("geometry", {})
                            coords = geom.get("coordinates", [[75.7873, 26.9124]])
                            first_pt = coords[0] if isinstance(coords[0], list) else coords
                            delay = props.get("magnitudeOfDelay", 120)
                            desc = props.get("events", [{}])[0].get("description", "Traffic flow obstruction")
                            incidents_out.append(TrafficIncidentData(
                                id=f"TT-{idx:03d}",
                                incident_type="traffic_congestion" if delay < 300 else "road_obstruction",
                                severity=Severity.HIGH if delay > 600 else Severity.MEDIUM,
                                delay_sec=delay,
                                road_name=props.get("from", "Primary Arterial"),
                                location={"latitude": first_pt[1], "longitude": first_pt[0]},
                                timestamp=now_dt,
                                description=desc,
                                source_name="TomTom Real-Time Incidents",
                                source_status=SourceStatus.LIVE,
                            ))
                        if incidents_out:
                            return incidents_out
            except Exception:
                pass

        # Return realistic calibrated incidents
        return [
            TrafficIncidentData(
                id="INC-SIM-01",
                incident_type="road_accident",
                severity=Severity.HIGH,
                delay_sec=420,
                road_name="MI Road / Central Junction",
                location={"latitude": 26.9184, "longitude": 75.7925},
                timestamp=now_dt,
                description="Minor multi-vehicle incident slowing central inbound lane.",
                source_name="CityPulse Incident Simulation",
                source_status=SourceStatus.SIMULATED,
            ),
            TrafficIncidentData(
                id="INC-SIM-02",
                incident_type="road_work",
                severity=Severity.LOW,
                delay_sec=180,
                road_name="Tonk Road Corridor",
                location={"latitude": 26.8920, "longitude": 75.8010},
                timestamp=now_dt,
                description="Utility maintenance work occupying right shoulder.",
                source_name="CityPulse Incident Simulation",
                source_status=SourceStatus.SIMULATED,
            ),
        ]
