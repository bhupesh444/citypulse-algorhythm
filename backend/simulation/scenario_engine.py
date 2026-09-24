from datetime import datetime, timedelta, timezone

try:
    from ..core.models import (
        Anomaly, CitySnapshot, Correlation, Incident, RiskCategoryBreakdown,
        RiskForecastPoint, RiskSnapshot, Severity, TrafficSnapshot, TransitSnapshot,
        WeatherSnapshot, DataMode,
    )
except ImportError:
    from core.models import (
        Anomaly, CitySnapshot, Correlation, Incident, RiskCategoryBreakdown,
        RiskForecastPoint, RiskSnapshot, Severity, TrafficSnapshot, TransitSnapshot,
        WeatherSnapshot, DataMode,
    )

ZONES = ("Central", "North", "South", "East", "West")


def build_snapshot(step: int = 0) -> CitySnapshot:
    """Build a coherent repeating story for a laptop-friendly demo."""
    now = datetime.now(timezone.utc).replace(microsecond=0)
    phase = step % 12
    rain = phase >= 3
    heavy_rain = phase >= 6
    accident = phase in (8, 9, 10)
    congestion = 42 + (34 if rain else 0) + (10 if heavy_rain else 0) + (8 if accident else 0)
    speed = round(max(12, 42 - congestion * 0.25), 1)
    rainfall = 18 if rain else 0
    if heavy_rain:
        rainfall = 42

    weather = WeatherSnapshot(
        temperature=27.4 if rain else 31.2,
        humidity=84 if rain else 52,
        rainfall=rainfall,
        wind_speed=18 if heavy_rain else 9,
        weather_condition="Heavy rain" if heavy_rain else ("Rain" if rain else "Clear"),
        timestamp=now,
    )
    traffic = [
        TrafficSnapshot(
            zone=zone,
            average_speed=round(speed + (index * 2.5), 1),
            congestion=min(100, round(congestion - index * 4)),
            vehicle_count=980 + index * 115 + (220 if rain else 0),
            incident_count=(2 if accident and index == 0 else 0),
            timestamp=now,
        )
        for index, zone in enumerate(ZONES)
    ]
    transit = [
        TransitSnapshot(
            route_id=f"R{12 + index}",
            route_name=f"{zone} connector",
            zone=zone,
            delay_minutes=round(max(0, (congestion - index * 5) / 6), 1),
            vehicles_affected=6 if rain and index < 2 else (2 if rain else 0),
            passenger_load=min(100, 61 + index * 4 + (18 if rain else 0)),
            status="DELAYED" if rain and index < 3 else "ON TIME",
            timestamp=now,
        )
        for index, zone in enumerate(ZONES)
    ]
    incidents = []
    if accident:
        incidents.append(Incident(
            id=f"INC-{step:04d}", type="traffic_accident", severity=Severity.HIGH,
            zone="Central", latitude=26.9124, longitude=75.7873,
            description="Multi-vehicle collision slowing the central corridor.", timestamp=now,
            status="OPEN",
        ))
    if heavy_rain:
        incidents.append(Incident(
            id=f"INC-W-{step:04d}", type="waterlogging", severity=Severity.MEDIUM,
            zone="Central", latitude=26.915, longitude=75.792,
            description="Surface water reported near the central underpass.", timestamp=now - timedelta(minutes=4),
            status="INVESTIGATING",
        ))

    anomaly = Anomaly(
        metric="traffic_congestion", zone="Central", current_value=traffic[0].congestion,
        baseline=42, anomaly_score=min(1, max(0, (traffic[0].congestion - 42) / 58)),
        is_anomaly=traffic[0].congestion > 75,
        severity=Severity.HIGH if traffic[0].congestion > 75 else Severity.LOW,
    )
    correlations = []
    if rain and traffic[0].congestion > 65:
        correlations.append(Correlation(
            zone="Central", metrics=["rainfall", "traffic_congestion", "transit_delay"],
            coefficient=0.82,
            explanation="Rainfall coincides with elevated congestion and transit delays in Central. This is a correlation, not proof of causation.",
        ))

    risk_score = min(100, round(traffic[0].congestion * 0.55 + (20 if heavy_rain else 0) + (18 if accident else 0) + (8 if incidents else 0)))
    level = "critical" if risk_score > 80 else "high" if risk_score > 60 else "moderate" if risk_score > 40 else "elevated" if risk_score > 20 else "normal"

    # Category risk breakdown
    traffic_risk = min(100, int(traffic[0].congestion * 0.9))
    env_risk = 65 if heavy_rain else (40 if rain else 22)
    infra_risk = 55 if heavy_rain else 28
    transit_risk = min(100, int(transit[0].delay_minutes * 7.5 + 15))
    inc_risk = 60 if accident else (25 if incidents else 10)

    breakdown = RiskCategoryBreakdown(
        overall=risk_score,
        traffic=traffic_risk,
        environment=env_risk,
        infrastructure=infra_risk,
        transit=transit_risk,
        incident=inc_risk,
    )

    why_score = [
        f"Central arterial congestion is tracking at {traffic[0].congestion}%, reducing corridor flow.",
        f"Atmospheric condition '{weather.weather_condition}' with {weather.rainfall} mm rainfall.",
        f"Transit route delay averaging {transit[0].delay_minutes} min across active feeder services.",
        f"{len(incidents)} open civic incidents contributing localized friction.",
    ]

    trend = "increasing" if (heavy_rain or accident) else ("decreasing" if phase > 10 else "stable")
    forecast = [
        RiskForecastPoint(minutes_ahead=15, traffic_risk=min(100, traffic_risk + 4), environmental_risk=env_risk, infrastructure_risk=infra_risk, transit_risk=transit_risk + 2, overall_risk=min(100, risk_score + 3), trend=trend),
        RiskForecastPoint(minutes_ahead=30, traffic_risk=min(100, traffic_risk + 7), environmental_risk=env_risk, infrastructure_risk=infra_risk, transit_risk=transit_risk + 5, overall_risk=min(100, risk_score + 6), trend=trend),
        RiskForecastPoint(minutes_ahead=45, traffic_risk=min(100, traffic_risk + 5), environmental_risk=env_risk, infrastructure_risk=infra_risk, transit_risk=transit_risk + 3, overall_risk=min(100, risk_score + 4), trend=trend),
        RiskForecastPoint(minutes_ahead=60, traffic_risk=max(15, traffic_risk - 4), environmental_risk=max(15, env_risk - 5), infrastructure_risk=infra_risk, transit_risk=max(15, transit_risk - 4), overall_risk=max(15, risk_score - 3), trend=trend),
    ]

    insight = _insight(traffic[0], weather, transit[0], incidents, correlations)
    return CitySnapshot(
        timestamp=now,
        weather=weather,
        traffic=traffic,
        transit=transit,
        incidents=incidents,
        anomalies=[anomaly],
        correlations=correlations,
        risk=RiskSnapshot(
            score=risk_score,
            level=level,
            methodology="55% traffic, 20% weather, 17% incidents, 8% transit disruption.",
            breakdown=breakdown,
            forecast=forecast,
            why_score=why_score,
        ),
        insight=insight,
        data_mode=DataMode.DEMO if phase > 0 else DataMode.MIXED,
    )


def _insight(traffic: TrafficSnapshot, weather: WeatherSnapshot, transit: TransitSnapshot, incidents: list[Incident], correlations: list[Correlation]) -> str:
    if not traffic.congestion > 60:
        return "City conditions are stable. Central traffic is within its recent operating range, with transit routes running close to schedule."
    sentence = f"Central congestion is {traffic.congestion:.0f}%, with average speed at {traffic.average_speed:.0f} km/h."
    conditions = f"{weather.weather_condition} is present and the lead transit route is delayed by {transit.delay_minutes:.0f} minutes."
    ending = " CityPulse detected a possible relationship between these conditions, but the data does not establish causation." if correlations else ""
    incident_note = f" {len(incidents)} active incident(s) are contributing context." if incidents else ""
    return sentence + " " + conditions + incident_note + ending
