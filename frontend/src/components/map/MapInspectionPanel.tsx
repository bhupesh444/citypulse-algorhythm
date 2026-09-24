import React, { useEffect, useState } from "react";
import { CitySnapshot, SelectedArea } from "../../types/citypulse";

interface MapInspectionPanelProps {
  selectedArea: SelectedArea;
  snapshot: CitySnapshot;
  onClose: () => void;
  onInspectDetails?: () => void;
  onInvestigate?: () => void;
}

export const MapInspectionPanel: React.FC<MapInspectionPanelProps> = ({
  selectedArea,
  snapshot,
  onClose,
  onInspectDetails,
  onInvestigate,
}) => {
  const [showWhyRisk, setShowWhyRisk] = useState(false);

  // ESC key listener to close inspection mode (Requirement 6.C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isOutsideMonitoring =
    selectedArea.isNearby ||
    selectedArea.zone.toLowerCase().includes("outside") ||
    selectedArea.zone.toLowerCase().includes("device");

  const zoneName = isOutsideMonitoring ? "Outside Monitored Area" : selectedArea.zone;
  const zoneTraffic = !isOutsideMonitoring
    ? snapshot.traffic.find((t) => t.zone.toLowerCase() === selectedArea.zone.toLowerCase()) ?? snapshot.traffic[0]
    : undefined;

  const zoneTransit = !isOutsideMonitoring
    ? snapshot.transit.find((t) => t.zone.toLowerCase() === selectedArea.zone.toLowerCase()) ?? snapshot.transit[0]
    : undefined;

  const zoneIncidents = !isOutsideMonitoring
    ? snapshot.incidents.filter((i) => i.zone.toLowerCase() === selectedArea.zone.toLowerCase())
    : [];

  const traffic = isOutsideMonitoring ? null : (selectedArea.traffic ?? zoneTraffic?.congestion ?? null);
  const avgSpeed = isOutsideMonitoring ? null : (zoneTraffic ? `${Math.round(zoneTraffic.average_speed)} km/h` : null);
  const transitDelay = isOutsideMonitoring ? null : Math.round(selectedArea.transitDelay ?? zoneTransit?.delay_minutes ?? 0);
  const incidentsCount = isOutsideMonitoring ? 0 : (selectedArea.incidents ?? zoneIncidents.length);
  const aqi = isOutsideMonitoring ? null : (selectedArea.aqi ?? (snapshot.weather.humidity > 60 ? 82 : 74));
  const riskScore = isOutsideMonitoring ? null : (selectedArea.riskScore ?? snapshot.risk?.score ?? 34);

  const statusLabel: string = isOutsideMonitoring
    ? "OUTSIDE MONITORED AREA"
    : selectedArea.status ||
      ((traffic ?? 0) > 70 ? "CRITICAL" : (traffic ?? 0) > 45 ? "MODERATE" : "NORMAL");

  const statusTone = isOutsideMonitoring
    ? "tone-neutral"
    : statusLabel === "CRITICAL"
    ? "tone-high"
    : statusLabel === "WARNING" || statusLabel === "MODERATE"
    ? "tone-warn"
    : "tone-normal";

  const latStr = `${Math.abs(selectedArea.latitude).toFixed(4)}°${selectedArea.latitude >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(selectedArea.longitude).toFixed(4)}°${selectedArea.longitude >= 0 ? "E" : "W"}`;

  return (
    <div
      className="map-inspection-panel"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Location Inspection Panel"
    >
      {/* Header (Fixed at top of panel) */}
      <div className="inspection-header">
        <div className="inspection-title-block">
          <span className="inspection-eyebrow">
            {isOutsideMonitoring ? "OUTSIDE MONITORED AREA" : "CIVIC OPERATIONS SECTOR"}
          </span>
          <h2 className="inspection-zone-name">
            {selectedArea.location || `${zoneName} Sector`}
          </h2>
          <p className="inspection-location-text">
            {isOutsideMonitoring ? "Geographic point outside municipal sensor coverage" : `${zoneName} Operational Sector · Jaipur`}
          </p>
        </div>

        <button
          type="button"
          className="inspection-close-btn"
          onClick={onClose}
          aria-label="Close inspection mode"
          title="Close inspection (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Content (Scrollable internally, never pushing header out of map) */}
      <div className="inspection-content">
        {/* Status Badge */}
        <div className="inspection-status-bar">
          <span className={`inspection-status-pill ${statusTone}`}>
            ● {statusLabel}
          </span>
        </div>

        {/* Metrics List */}
        <div className="inspection-metrics-list">
          <div className="inspection-metric-row">
            <span className="metric-label">Coordinates</span>
            <span className="metric-val font-mono">{latStr}, {lngStr}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Weather</span>
            <span className="metric-val">{snapshot.weather.temperature}°C · {snapshot.weather.weather_condition}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Civic Zone</span>
            <span className="metric-val">{zoneName}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Traffic Congestion</span>
            <span className="metric-val">{traffic !== null ? `${traffic}%` : "Data unavailable"}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Average Speed</span>
            <span className="metric-val">{avgSpeed !== null ? avgSpeed : "Data unavailable"}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Transit Delay</span>
            <span className="metric-val">{transitDelay !== null ? `+${transitDelay} min` : "Data unavailable"}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Active Incidents</span>
            <span className={`metric-val ${incidentsCount > 0 ? "text-danger" : ""}`}>
              {isOutsideMonitoring ? "Data unavailable" : `${incidentsCount} active`}
            </span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Air Quality</span>
            <span className="metric-val">{aqi !== null ? `${aqi} AQI` : "Data unavailable"}</span>
          </div>

          <div className="inspection-metric-row">
            <span className="metric-label">Civic Risk</span>
            <span className="metric-val risk-val">{riskScore !== null ? `${riskScore} / 100` : "Data unavailable"}</span>
          </div>
        </div>

        {/* Relevant Alert Callout if Incidents Exist */}
        {incidentsCount > 0 && zoneIncidents[0] && (
          <div className="inspection-alert-callout">
            <span className="alert-callout-icon">⚠</span>
            <div className="alert-callout-text">
              <strong>{zoneIncidents[0].type.replaceAll("_", " ").toUpperCase()}</strong>
              <p>{zoneIncidents[0].description}</p>
            </div>
          </div>
        )}

        {/* Why This Risk? / Cause & Effect Quick Accordion */}
        {!isOutsideMonitoring && (
          <div className="inspection-why-risk-container">
            <button
              type="button"
              className="why-risk-toggle-btn"
              onClick={() => setShowWhyRisk(!showWhyRisk)}
              aria-expanded={showWhyRisk}
              title="Inspect deterministic signal chain driving risk score"
            >
              <span>✦ Why this risk? (Cause & Effect)</span>
              <span className="toggle-chevron">{showWhyRisk ? "▴" : "▾"}</span>
            </button>

            {showWhyRisk && (
              <div className="why-risk-drawer" role="region" aria-label="Risk Cause and Effect Breakdown">
                <div className="signal-mini-chain">
                  <div className="mini-chain-node">
                    <span className="node-lbl">Weather</span>
                    <strong>{snapshot.weather.weather_condition}</strong>
                  </div>
                  <span className="mini-arrow">→</span>
                  <div className="mini-chain-node">
                    <span className="node-lbl">Arterial</span>
                    <strong>{traffic !== null ? `${traffic}%` : "Nominal"}</strong>
                  </div>
                  <span className="mini-arrow">→</span>
                  <div className="mini-chain-node">
                    <span className="node-lbl">Transit</span>
                    <strong>+{transitDelay}m delay</strong>
                  </div>
                  <span className="mini-arrow">→</span>
                  <div className="mini-chain-node">
                    <span className="node-lbl">Risk</span>
                    <strong className={riskScore !== null && riskScore > 60 ? "text-warn" : ""}>
                      {riskScore !== null ? `${riskScore}/100` : "Nominal"}
                    </strong>
                  </div>
                </div>
                <p className="why-risk-text">
                  {(traffic ?? 0) > 70
                    ? `Elevated congestion in ${zoneName} slows arterial throughput, cascading into feeder bus delays.`
                    : `${zoneName} is operating within nominal baseline parameters with clear corridor dispatching.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="inspection-actions">
          {!isOutsideMonitoring && onInvestigate && (
            <button type="button" className="inspection-primary-btn" onClick={onInvestigate}>
              ✦ Deep Dive Investigation →
            </button>
          )}
          {onInspectDetails && (
            <button type="button" className="inspection-secondary-btn" onClick={onInspectDetails}>
              Inspect Zone Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
