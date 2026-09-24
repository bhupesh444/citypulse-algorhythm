import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { CityZoneData } from "../../types/citypulse";

interface ZonesViewProps {
  onSelectZone: (zone: CityZoneData) => void;
}

type SortField = "risk" | "traffic" | "aqi" | "incidents";

export const ZonesView: React.FC<ZonesViewProps> = ({ onSelectZone }) => {
  const [zones, setZones] = useState<CityZoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>("risk");

  useEffect(() => {
    api
      .getZones()
      .then((res) => setZones(res))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const sortedZones = [...zones].sort((a, b) => {
    if (sortBy === "risk") return b.risk_score - a.risk_score;
    if (sortBy === "traffic") return b.traffic_congestion - a.traffic_congestion;
    if (sortBy === "aqi") return b.aqi - a.aqi;
    if (sortBy === "incidents") return b.active_incidents - a.active_incidents;
    return 0;
  });

  return (
    <div className="zones-page-container">
      {/* Header and Sorting Toolbar */}
      <div className="zones-header">
        <div>
          <span className="page-eyebrow">DISTRICT & SECTOR SURVEILLANCE</span>
          <h2 className="page-title">Zones</h2>
        </div>

        <div className="zones-sort-bar">
          <span className="sort-label">Sort by:</span>
          {(["risk", "traffic", "aqi", "incidents"] as SortField[]).map((field) => (
            <button
              key={field}
              className={`sort-pill ${sortBy === field ? "is-active" : ""}`}
              onClick={() => setSortBy(field)}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="view-loading">Loading sector telemetry...</div>
      ) : (
        <div className="clean-zones-grid">
          {sortedZones.map((zone) => {
            const isCritical = zone.status === "CRITICAL" || zone.risk_score > 70;
            const isWarning = zone.status === "WARNING" || zone.risk_score > 40;
            const tone = isCritical ? "crit" : isWarning ? "warn" : "norm";

            return (
              <div
                key={zone.id}
                className={`clean-zone-card tone-${tone}`}
                onClick={() => onSelectZone(zone)}
              >
                <div className="zone-card-header">
                  <div>
                    <span className="zone-code">{zone.id.toUpperCase()} SECTOR</span>
                    <h3 className="zone-name">{zone.name.toUpperCase()}</h3>
                  </div>

                  {/* Dominant Risk Number */}
                  <div className={`dominant-risk-badge ${tone}`}>
                    <span className="risk-title">Risk</span>
                    <div className="risk-score-large">
                      {zone.risk_score}
                      <small>/100</small>
                    </div>
                  </div>
                </div>

                {/* Clean Metrics List (Fewer box borders) */}
                <div className="zone-metrics-rows">
                  <div className="zone-metric-row">
                    <span className="metric-name">Traffic</span>
                    <span className="metric-val">{zone.traffic_congestion}%</span>
                  </div>

                  <div className="zone-metric-row">
                    <span className="metric-name">Speed</span>
                    <span className="metric-val">{zone.average_speed} km/h</span>
                  </div>

                  <div className="zone-metric-row">
                    <span className="metric-name">AQI</span>
                    <span className="metric-val">{zone.aqi}</span>
                  </div>

                  <div className="zone-metric-row">
                    <span className="metric-name">Transit</span>
                    <span className="metric-val">+{zone.transit_delay_min} min</span>
                  </div>

                  <div className="zone-metric-row">
                    <span className="metric-name">Incidents</span>
                    <span className={`metric-val ${zone.active_incidents > 0 ? "has-danger" : ""}`}>
                      {zone.active_incidents}
                    </span>
                  </div>
                </div>

                <div className="zone-card-bottom" onClick={(e) => e.stopPropagation()}>
                  <button className="zone-inspect-action" onClick={() => onSelectZone(zone)}>
                    Inspect →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
