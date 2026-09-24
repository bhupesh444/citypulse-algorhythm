import React, { useEffect } from "react";
import { SelectedArea, CitySnapshot } from "../../types/citypulse";
import { SolarConditions } from "../../utils/solarCalculator";

interface ZoneDetailDrawerProps {
  isOpen: boolean;
  selectedArea: SelectedArea | null;
  snapshot: CitySnapshot;
  solarConditions?: SolarConditions;
  onClose: () => void;
  onViewAlerts?: () => void;
  onAnalyzeWithAI?: () => void;
  onCenterMap?: () => void;
}

export const ZoneDetailDrawer: React.FC<ZoneDetailDrawerProps> = ({
  isOpen,
  selectedArea,
  snapshot,
  solarConditions,
  onClose,
  onViewAlerts,
  onAnalyzeWithAI,
  onCenterMap,
}) => {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedArea) return null;

  const zoneName = selectedArea.zone;
  const zoneTraffic =
    snapshot.traffic.find(
      (t) => t.zone.toLowerCase() === zoneName.toLowerCase()
    ) ?? snapshot.traffic[0];

  const zoneTransit =
    snapshot.transit.find(
      (t) => t.zone.toLowerCase() === zoneName.toLowerCase()
    ) ?? snapshot.transit[0];

  const zoneIncidents = snapshot.incidents.filter(
    (i) => i.zone.toLowerCase() === zoneName.toLowerCase()
  );

  const riskScore = selectedArea.riskScore ?? snapshot.risk.score;
  const trafficCongestion = selectedArea.traffic ?? zoneTraffic?.congestion ?? 0;
  const avgSpeed = zoneTraffic ? `${Math.round(zoneTraffic.average_speed)} km/h` : "24 km/h";
  const aqi = selectedArea.aqi ?? (snapshot.weather.humidity > 60 ? 82 : 74);
  const transitDelay = Math.round(selectedArea.transitDelay ?? zoneTransit?.delay_minutes ?? 0);
  const activeIncidents = selectedArea.incidents ?? zoneIncidents.length;
  const infrastructureStatus = "Nominal";

  return (
    <>
      <div className="zone-drawer-backdrop" onClick={onClose} />
      <aside className="zone-detail-drawer" aria-label="Zone details drawer">
        <div className="zone-drawer-header">
          <div>
            <span className="zone-drawer-eyebrow">CIVIC SECTOR INTELLIGENCE</span>
            <h2>{zoneName.toUpperCase()} ZONE</h2>
            <p className="zone-drawer-subtitle">
              {selectedArea.location || `${zoneName} Operational Perimeter`}
            </p>
          </div>
          <button
            className="zone-drawer-close-btn"
            onClick={onClose}
            aria-label="Close detail drawer"
          >
            ✕
          </button>
        </div>

        <div className="zone-drawer-content">
          {solarConditions && (
            <div className="solar-banner">
              <span>{solarConditions.icon}</span>
              <div>
                <b>{solarConditions.phaseLabel}</b> · {solarConditions.localSolarTime}
                <small>Solar elevation: {solarConditions.solarElevation}°</small>
              </div>
            </div>
          )}

          <div className="drawer-metric-card risk-highlight">
            <span className="drawer-metric-label">Risk</span>
            <div className="drawer-metric-val">
              {riskScore} <span className="drawer-metric-denom">/ 100</span>
            </div>
            <span className="drawer-metric-sub">
              {riskScore > 65 ? "High Risk" : riskScore > 35 ? "Moderate Risk" : "Low Risk"}
            </span>
          </div>

          <div className="drawer-metrics-list">
            <div className="drawer-metric-row">
              <span className="row-label">Traffic</span>
              <span className="row-value">{trafficCongestion}%</span>
            </div>

            <div className="drawer-metric-row">
              <span className="row-label">Average Speed</span>
              <span className="row-value">{avgSpeed}</span>
            </div>

            <div className="drawer-metric-row">
              <span className="row-label">Air Quality</span>
              <span className="row-value">{aqi} AQI</span>
            </div>

            <div className="drawer-metric-row">
              <span className="row-label">Transit Delay</span>
              <span className="row-value">{transitDelay} min</span>
            </div>

            <div className="drawer-metric-row">
              <span className="row-label">Active Incidents</span>
              <span className={`row-value ${activeIncidents > 0 ? "has-alert" : ""}`}>
                {activeIncidents}
              </span>
            </div>

            <div className="drawer-metric-row">
              <span className="row-label">Infrastructure</span>
              <span className="row-value text-nominal">{infrastructureStatus}</span>
            </div>

            <div className="drawer-metric-row">
              <span className="row-label">Coordinates</span>
              <span className="row-value text-mono">
                {selectedArea.latitude.toFixed(4)}° N, {selectedArea.longitude.toFixed(4)}° E
              </span>
            </div>
          </div>

          <div className="zone-drawer-actions">
            {onViewAlerts && (
              <button className="zone-action-btn secondary" onClick={onViewAlerts}>
                View Alerts ({activeIncidents})
              </button>
            )}
            {onAnalyzeWithAI && (
              <button className="zone-action-btn primary" onClick={onAnalyzeWithAI}>
                Analyze with AI ✦
              </button>
            )}
            {onCenterMap && (
              <button className="zone-action-btn tertiary" onClick={onCenterMap}>
                Center on Map
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
