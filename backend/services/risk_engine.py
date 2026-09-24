from ..core.models import (
    AirQualitySnapshot, Incident, RiskCategoryBreakdown, RiskForecastPoint,
    RiskSnapshot, Severity, TrafficSnapshot, WeatherSnapshot,
)


class RiskEngine:
    def compute_risk(
        self,
        traffic_list: list[TrafficSnapshot],
        weather: WeatherSnapshot,
        air_quality: AirQualitySnapshot,
        incidents: list[Incident],
        avg_transit_delay: float = 2.5,
    ) -> RiskSnapshot:
        # 1. Traffic Risk (0 - 100)
        max_congestion = max((t.congestion for t in traffic_list), default=40.0)
        traffic_incidents = sum(1 for inc in incidents if "traffic" in inc.type.lower() or "accident" in inc.type.lower())
        traffic_risk = min(100, int(max_congestion * 0.70 + traffic_incidents * 12))

        # 2. Environmental Risk (0 - 100)
        aqi_component = min(100, int((air_quality.aqi / 200.0) * 60))
        rain_component = 25 if weather.rainfall > 20 else (12 if weather.rainfall > 0 else 0)
        temp_component = 10 if weather.temperature > 40 or weather.temperature < 5 else 0
        environmental_risk = min(100, aqi_component + rain_component + temp_component)

        # 3. Infrastructure Risk (0 - 100)
        infra_incidents = sum(1 for inc in incidents if inc.type in ("water", "electricity", "infrastructure"))
        infra_risk = min(100, 20 + infra_incidents * 25)

        # 4. Transit Risk (0 - 100)
        transit_risk = min(100, int(min(60.0, avg_transit_delay * 8.0) + (15 if rain_component > 10 else 0)))

        # 5. Incident Risk (0 - 100)
        active_inc = [i for i in incidents if i.status != "RESOLVED"]
        critical_count = sum(1 for i in active_inc if i.severity == Severity.CRITICAL)
        high_count = sum(1 for i in active_inc if i.severity == Severity.HIGH)
        incident_risk = min(100, len(active_inc) * 10 + high_count * 20 + critical_count * 40)

        # 6. Overall Civic Risk (Weighted combination)
        # Weights: 35% Traffic, 20% Environmental, 15% Infrastructure, 15% Transit, 15% Incidents
        overall_score = int(
            traffic_risk * 0.35 +
            environmental_risk * 0.20 +
            infra_risk * 0.15 +
            transit_risk * 0.15 +
            incident_risk * 0.15
        )
        overall_score = max(5, min(100, overall_score))

        level = (
            "critical" if overall_score > 75 else
            "high" if overall_score > 55 else
            "moderate" if overall_score > 35 else
            "elevated" if overall_score > 20 else
            "normal"
        )

        breakdown = RiskCategoryBreakdown(
            overall=overall_score,
            traffic=traffic_risk,
            environment=environmental_risk,
            infrastructure=infra_risk,
            transit=transit_risk,
            incident=incident_risk,
        )

        # Why this score explanations
        why_score = [
            f"Traffic risk ({traffic_risk}/100) driven by peak zone congestion ({max_congestion:.0f}%) and {traffic_incidents} active corridor disruptions.",
            f"Environmental risk ({environmental_risk}/100) reflects AQI of {air_quality.aqi} and precipitation rate ({weather.rainfall} mm).",
            f"Transit risk ({transit_risk}/100) accounts for system-wide average schedule deviation of {avg_transit_delay:.1f} mins.",
            f"Active incident load ({incident_risk}/100) tracks {len(active_inc)} open civic signals.",
        ]

        # 60-Minute Predictive Forecast
        trend_direction = "increasing" if (weather.rainfall > 10 or traffic_risk > 65) else ("decreasing" if overall_score > 70 else "stable")
        forecast_points = []
        for step_idx, mins in enumerate([15, 30, 45, 60]):
            delta = (step_idx + 1) * (3 if trend_direction == "increasing" else (-2 if trend_direction == "decreasing" else 1))
            f_traffic = min(100, max(10, traffic_risk + delta))
            f_env = min(100, max(10, environmental_risk + (2 if weather.rainfall > 0 else 0)))
            f_infra = infra_risk
            f_transit = min(100, max(10, transit_risk + delta))
            f_overall = min(100, max(10, int(f_traffic * 0.35 + f_env * 0.20 + f_infra * 0.15 + f_transit * 0.15 + incident_risk * 0.15)))

            forecast_points.append(RiskForecastPoint(
                minutes_ahead=mins,
                traffic_risk=f_traffic,
                environmental_risk=f_env,
                infrastructure_risk=f_infra,
                transit_risk=f_transit,
                overall_risk=f_overall,
                trend=trend_direction,
            ))

        return RiskSnapshot(
            score=overall_score,
            level=level,
            methodology="Calibrated composite: 35% Traffic, 20% Environmental, 15% Infrastructure, 15% Transit, 15% Active Incidents.",
            breakdown=breakdown,
            forecast=forecast_points,
            why_score=why_score,
        )


risk_engine = RiskEngine()
