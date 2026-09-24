from fastapi import APIRouter, HTTPException
from ..core.models import CityZoneData, SourceStatus

router = APIRouter(prefix="/api/zones", tags=["Zones"])

ZONES_DATA: list[CityZoneData] = [
    CityZoneData(
        id="central",
        name="Central Zone",
        risk_score=58,
        traffic_congestion=64,
        average_speed=24.5,
        active_incidents=2,
        aqi=88,
        weather_summary="Clear · 31°C",
        transit_delay_min=6.5,
        infrastructure_status="NOMINAL",
        latitude=26.9124,
        longitude=75.7873,
        status="WARNING",
        source_status=SourceStatus.SIMULATED,
    ),
    CityZoneData(
        id="north",
        name="North Zone (Amber / Vidyadhar)",
        risk_score=34,
        traffic_congestion=38,
        average_speed=46.0,
        active_incidents=1,
        aqi=94,
        weather_summary="Partly Cloudy · 30°C",
        transit_delay_min=2.0,
        infrastructure_status="NOMINAL",
        latitude=26.9855,
        longitude=75.8513,
        status="NORMAL",
        source_status=SourceStatus.SIMULATED,
    ),
    CityZoneData(
        id="south",
        name="South Zone (Airport / Sanganer)",
        risk_score=28,
        traffic_congestion=31,
        average_speed=52.0,
        active_incidents=1,
        aqi=76,
        weather_summary="Clear · 32°C",
        transit_delay_min=3.0,
        infrastructure_status="NOMINAL",
        latitude=26.8280,
        longitude=75.8050,
        status="NORMAL",
        source_status=SourceStatus.SIMULATED,
    ),
    CityZoneData(
        id="east",
        name="East Zone (Jagatpura / Malviya)",
        risk_score=31,
        traffic_congestion=36,
        average_speed=44.0,
        active_incidents=0,
        aqi=82,
        weather_summary="Clear · 31°C",
        transit_delay_min=1.5,
        infrastructure_status="MAINTENANCE",
        latitude=26.8350,
        longitude=75.8550,
        status="NORMAL",
        source_status=SourceStatus.SIMULATED,
    ),
    CityZoneData(
        id="west",
        name="West Zone (Vaishali / Sirsi)",
        risk_score=24,
        traffic_congestion=26,
        average_speed=49.0,
        active_incidents=0,
        aqi=72,
        weather_summary="Clear · 31°C",
        transit_delay_min=1.0,
        infrastructure_status="NOMINAL",
        latitude=26.9070,
        longitude=75.7420,
        status="NORMAL",
        source_status=SourceStatus.SIMULATED,
    ),
    CityZoneData(
        id="amity",
        name="Amity University Rajasthan Campus",
        risk_score=15,
        traffic_congestion=18,
        average_speed=58.0,
        active_incidents=0,
        aqi=62,
        weather_summary="Clear · 31°C",
        transit_delay_min=0.5,
        infrastructure_status="OPTIMAL",
        latitude=27.1769338,
        longitude=75.9596886,
        status="NORMAL",
        source_status=SourceStatus.SIMULATED,
    ),
]


@router.get("")
async def list_zones():
    return ZONES_DATA


@router.get("/{zone_id}")
async def get_zone(zone_id: str):
    for z in ZONES_DATA:
        if z.id.lower() == zone_id.lower() or z.name.lower().startswith(zone_id.lower()):
            return z
    raise HTTPException(status_code=404, detail="Zone not found")
