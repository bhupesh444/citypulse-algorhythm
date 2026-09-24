from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"


class IncidentType(str, Enum):
    TRAFFIC = "traffic"
    ROAD_ACCIDENT = "road_accident"
    WATER = "water"
    ELECTRICITY = "electricity"
    FIRE = "fire"
    INFRASTRUCTURE = "infrastructure"
    PUBLIC_SAFETY = "public_safety"
    WEATHER = "weather"
    ENVIRONMENTAL = "environmental"
    TRANSIT = "transit"
    OTHER = "other"


class SourceStatus(str, Enum):
    LIVE = "live"
    SIMULATED = "simulated"
    PUBLIC = "public"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"


class DataMode(str, Enum):
    LIVE = "LIVE"
    DEMO = "DEMO"
    MIXED = "MIXED"


# -------------------------------------------------------------
# Existing Base Models (Preserved for full backwards-compatibility)
# -------------------------------------------------------------

class NormalizedObservation(BaseModel):
    source: str
    timestamp: datetime
    latitude: float
    longitude: float
    zone: str
    metric: str
    value: float
    unit: str
    severity: Severity = Severity.LOW


class WeatherSnapshot(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    weather_condition: str
    timestamp: datetime
    apparent_temperature: Optional[float] = None
    wind_direction: Optional[float] = None
    cloud_cover: Optional[float] = None
    visibility: Optional[float] = None
    weather_code: Optional[int] = None
    source_status: SourceStatus = SourceStatus.SIMULATED
    source_name: str = "Open-Meteo"


class TrafficSnapshot(BaseModel):
    zone: str
    average_speed: float
    congestion: float = Field(ge=0, le=100)
    vehicle_count: int = Field(ge=0)
    incident_count: int = Field(ge=0)
    timestamp: datetime
    source_status: SourceStatus = SourceStatus.SIMULATED
    source_name: str = "TomTom Traffic / Simulated"


class TransitSnapshot(BaseModel):
    route_id: str
    route_name: str
    zone: str
    delay_minutes: float = Field(ge=0)
    vehicles_affected: int = Field(ge=0)
    passenger_load: float = Field(ge=0, le=100)
    status: str
    timestamp: datetime
    source_status: SourceStatus = SourceStatus.SIMULATED
    source_name: str = "GTFS / Demo Transit"


class Incident(BaseModel):
    id: str
    type: str
    severity: Severity
    zone: str
    latitude: float
    longitude: float
    description: str
    timestamp: datetime
    status: str = "OPEN"
    title: Optional[str] = None
    source: str = "CityPulse Incident Feed"
    confidence: float = 0.90
    affected_area: Optional[str] = None
    source_status: SourceStatus = SourceStatus.SIMULATED


class Anomaly(BaseModel):
    metric: str
    zone: str
    current_value: float
    baseline: float
    anomaly_score: float = Field(ge=0, le=1)
    is_anomaly: bool
    severity: Severity


class Correlation(BaseModel):
    zone: str
    metrics: list[str]
    coefficient: float = Field(ge=-1, le=1)
    explanation: str


class RiskCategoryBreakdown(BaseModel):
    overall: int = Field(ge=0, le=100)
    traffic: int = Field(ge=0, le=100)
    environment: int = Field(ge=0, le=100)
    infrastructure: int = Field(ge=0, le=100)
    transit: int = Field(ge=0, le=100)
    incident: int = Field(ge=0, le=100)


class RiskForecastPoint(BaseModel):
    minutes_ahead: int
    traffic_risk: int
    environmental_risk: int
    infrastructure_risk: int
    transit_risk: int
    overall_risk: int
    trend: str = "stable"  # "increasing", "stable", "decreasing"


class RiskSnapshot(BaseModel):
    score: int = Field(ge=0, le=100)
    level: str
    methodology: str
    breakdown: Optional[RiskCategoryBreakdown] = None
    forecast: Optional[list[RiskForecastPoint]] = None
    why_score: Optional[list[str]] = None


class CitySnapshot(BaseModel):
    timestamp: datetime
    weather: WeatherSnapshot
    traffic: list[TrafficSnapshot]
    transit: list[TransitSnapshot]
    incidents: list[Incident]
    anomalies: list[Anomaly]
    correlations: list[Correlation]
    risk: RiskSnapshot
    insight: str
    data_mode: DataMode = DataMode.MIXED


# -------------------------------------------------------------
# New Dedicated Domain Models
# -------------------------------------------------------------

class AirQualitySnapshot(BaseModel):
    pm2_5: float
    pm10: float
    co: float
    no2: float
    so2: float
    o3: float
    aqi: int
    humidity: Optional[float] = None
    temperature: Optional[float] = None
    timestamp: datetime
    source_name: str = "Open-Meteo Air Quality"
    source_status: SourceStatus = SourceStatus.LIVE


class TrafficFlowData(BaseModel):
    zone: str
    current_speed: float
    free_flow_speed: float
    travel_time_sec: int
    confidence: float
    congestion_ratio: float
    timestamp: datetime
    source_name: str
    source_status: SourceStatus


class TrafficIncidentData(BaseModel):
    id: str
    incident_type: str
    severity: Severity
    delay_sec: int
    road_name: str
    location: dict[str, float]  # {"latitude": ..., "longitude": ...}
    timestamp: datetime
    affected_geometry: Optional[list[list[float]]] = None
    description: str
    source_name: str
    source_status: SourceStatus


class TransitRoute(BaseModel):
    route_id: str
    route_name: str
    route_type: str
    zone: str
    active_vehicles: int
    delay_minutes: float
    status: str
    source_status: SourceStatus


class TransitVehicle(BaseModel):
    vehicle_id: str
    route_id: str
    latitude: float
    longitude: float
    speed_kmh: float
    status: str
    congestion_level: str
    timestamp: datetime


class AlertDetail(BaseModel):
    id: str
    title: str
    severity: Severity
    location: str
    zone: str
    timestamp: datetime
    source: str
    current_measurement: str
    previous_measurement: str
    change: str
    possible_causes: list[str]
    affected_area: str
    ai_analysis: str
    confidence: float
    recommended_action: str
    status: str = "ACTIVE"
    acknowledged: bool = False
    source_status: SourceStatus = SourceStatus.SIMULATED


class CityZoneData(BaseModel):
    id: str
    name: str
    risk_score: int
    traffic_congestion: int
    average_speed: float
    active_incidents: int
    aqi: int
    weather_summary: str
    transit_delay_min: float
    infrastructure_status: str
    latitude: float
    longitude: float
    status: str
    source_status: SourceStatus = SourceStatus.SIMULATED


class DataSourceHealth(BaseModel):
    provider: str
    purpose: str
    status: str  # "CONNECTED", "DEGRADED", "DEMO", "UNAVAILABLE"
    last_sync: str
    latency_ms: int
    data_freshness: str
    api_type: str
    environment: str
    attribution: str
    is_live: bool


class AskCityPulseRequest(BaseModel):
    question: str
    zone: Optional[str] = None
    context: Optional[dict[str, Any]] = None


class AskCityPulseResponse(BaseModel):
    question: str
    answer: str
    observed_changes: list[str]
    contributing_factors: list[str]
    confidence: int
    sources: list[str]
    is_simulated: bool
    timestamp: datetime
