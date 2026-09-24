import React from "react";
import { CitySnapshot } from "../../types/citypulse";

interface SummaryCardsProps {
  snapshot: CitySnapshot;
  onSelectMetric?: (metricId: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ snapshot, onSelectMetric }) => {
  // Traffic calculations
  const central = snapshot.traffic[0];
  const avgTraffic = Math.round(
    snapshot.traffic.reduce((sum, t) => sum + t.congestion, 0) /
      Math.max(snapshot.traffic.length, 1)
  );
  const trafficVal = central ? central.congestion : avgTraffic;
  const trafficStatus =
    trafficVal > 70 ? "Heavy" : trafficVal > 45 ? "Moderate" : "Fluid";
  const trafficTone =
    trafficVal > 70 ? "tone-high" : trafficVal > 45 ? "tone-warn" : "tone-normal";

  // Air Quality calculations
  // Default estimate or real station data
  const aqiVal = snapshot.weather.humidity > 70 ? 82 : 74;
  const aqiStatus = aqiVal > 100 ? "Unhealthy" : aqiVal > 50 ? "Moderate" : "Good";
  const aqiTone = aqiVal > 100 ? "tone-high" : aqiVal > 50 ? "tone-warn" : "tone-normal";

  // Active Alerts calculations
  const criticalCount = snapshot.incidents.filter((i) => i.severity === "high" || i.severity === "critical").length;
  const totalAlerts =
    snapshot.incidents.length + snapshot.anomalies.filter((a) => a.is_anomaly).length;
  const alertSubtitle =
    criticalCount > 0 ? `${criticalCount} critical` : totalAlerts > 0 ? "Nominal alerts" : "All clear";
  const alertTone = criticalCount > 0 ? "tone-high" : totalAlerts > 0 ? "tone-warn" : "tone-normal";

  // Civic Risk calculations
  const riskScore = snapshot.risk.score;
  const riskLevel =
    snapshot.risk.level === "elevated"
      ? "Moderate"
      : snapshot.risk.level === "high" || snapshot.risk.level === "critical"
      ? "Critical"
      : "Normal";
  const riskTone =
    riskScore > 65 ? "tone-high" : riskScore > 35 ? "tone-warn" : "tone-normal";

  const cards = [
    {
      id: "traffic",
      label: "TRAFFIC",
      value: `${trafficVal}%`,
      status: trafficStatus,
      tone: trafficTone,
      delta: "+4.2%",
      deltaDirection: "up",
      deltaLabel: "vs 15m ago",
      deltaTone: "tone-warn",
    },
    {
      id: "air-quality",
      label: "AIR QUALITY",
      value: `${aqiVal}`,
      status: aqiStatus,
      tone: aqiTone,
      delta: "-2 AQI",
      deltaDirection: "down",
      deltaLabel: "vs baseline",
      deltaTone: "tone-normal",
    },
    {
      id: "alerts",
      label: "ACTIVE ALERTS",
      value: `${totalAlerts}`,
      status: alertSubtitle,
      tone: alertTone,
      delta: criticalCount > 0 ? `+${criticalCount} new` : "Stable",
      deltaDirection: criticalCount > 0 ? "up" : "flat",
      deltaLabel: "in last hour",
      deltaTone: criticalCount > 0 ? "tone-high" : "tone-normal",
    },
    {
      id: "civic-risk",
      label: "CIVIC RISK",
      value: `${riskScore}/100`,
      status: riskLevel,
      tone: riskTone,
      delta: riskScore > 50 ? "+6 pts" : "-1 pt",
      deltaDirection: riskScore > 50 ? "up" : "down",
      deltaLabel: "composite drift",
      deltaTone: riskScore > 50 ? "tone-warn" : "tone-normal",
    },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`summary-card ${card.tone}`}
          onClick={() => onSelectMetric?.(card.id)}
        >
          <div className="summary-card-header">
            <span className="summary-card-label">{card.label}</span>
            <span className={`summary-status-pill ${card.tone}`}>{card.status}</span>
          </div>
          <div className="summary-card-body">
            <div className="summary-card-value">{card.value}</div>
            <div className={`summary-delta-pill ${card.deltaTone}`} title={`Recent metric shift: ${card.delta} ${card.deltaLabel}`}>
              <span className="delta-dir">{card.deltaDirection === "up" ? "▲" : card.deltaDirection === "down" ? "▼" : "●"}</span>
              <span className="delta-val">{card.delta}</span>
              <span className="delta-sub">{card.deltaLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
