import React from "react";
import { CitySnapshot, SelectedArea } from "../../types/citypulse";
import { SolarConditions } from "../../utils/solarCalculator";

interface LocationDetailPanelProps {
  selectedArea: SelectedArea;
  snapshot: CitySnapshot;
  solarConditions?: SolarConditions;
  connected?: boolean;
  mapMode?: "map" | "3d";
  onClose: () => void;
  onCenter?: () => void;
  onSwitchMap?: () => void;
}

export const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  selectedArea,
  snapshot,
  solarConditions,
  connected = true,
  mapMode = "map",
  onClose,
  onCenter,
  onSwitchMap,
}) => {
  // Find zone specific traffic
  const zoneTraffic =
    snapshot.traffic.find(
      (t) => t.zone.toLowerCase() === selectedArea.zone.toLowerCase()
    ) ?? snapshot.traffic[0];

  const zoneTransit =
    snapshot.transit.find(
      (t) => t.zone.toLowerCase() === selectedArea.zone.toLowerCase()
    ) ?? snapshot.transit[0];

  const zoneIncidents = snapshot.incidents.filter(
    (i) => i.zone.toLowerCase() === selectedArea.zone.toLowerCase()
  );

  const isSimulated = snapshot.data_mode === "DEMO" || !connected;
  const statusClass = selectedArea.status.toLowerCase();

  return (
    <div className={`civic-location-panel floating-panel status-${statusClass}`}>
      <div className="location-panel-header">
        <div className="header-eyebrow-row">
          <span className="eyebrow">
            {selectedArea.isNearby ? "NEARBY CIVIC INSPECTION" : "SELECTED CIVIC SECTOR"}
          </span>
          {solarConditions && (
            <span className="solar-pill" title={`Solar Elevation: ${solarConditions.solarElevation}°`}>
              {solarConditions.icon} {solarConditions.phaseLabel} ({solarConditions.localSolarTime})
            </span>
          )}
        </div>
        <button
          className="location-panel-close"
          onClick={onClose}
          aria-label="Close location detail panel"
        >
          ✕
        </button>
      </div>

      <div className="location-title-block">
        <h3>{selectedArea.location || `${selectedArea.zone} Sector`}</h3>
        <div className="location-coords-badge">
          <span>{selectedArea.latitude.toFixed(5)}° N</span>
          <span className="sep">/</span>
          <span>{selectedArea.longitude.toFixed(5)}° E</span>
          <span className={`status-badge status-${statusClass}`}>
            ● {selectedArea.status}
          </span>
        </div>
      </div>

      <div className="location-telemetry-grid">
        <div className="telemetry-box">
          <span className="box-label">TRAFFIC MOBILITY</span>
          <strong className="box-val highlight">
            {selectedArea.traffic ?? zoneTraffic?.congestion ?? 0}%
          </strong>
          <small className="box-sub">
            {selectedArea.traffic > 70
              ? "Heavy Congestion"
              : selectedArea.traffic > 45
              ? "Moderate Flow"
              : "Fluid Speed"}
          </small>
        </div>

        <div className="telemetry-box">
          <span className="box-label">WEATHER</span>
          <strong className="box-val">
            {snapshot.weather.temperature}°C
          </strong>
          <small className="box-sub">
            {snapshot.weather.weather_condition} · Wind {snapshot.weather.wind_speed} km/h
          </small>
        </div>

        <div className="telemetry-box">
          <span className="box-label">AIR QUALITY</span>
          <strong className="box-val">
            AQI {selectedArea.aqi ?? 74}
          </strong>
          <small className="box-sub">
            {(selectedArea.aqi ?? 74) > 100
              ? "Unhealthy for Sensitive"
              : "Moderate Dispersion"}
          </small>
        </div>

        <div className="telemetry-box">
          <span className="box-label">PUBLIC TRANSIT</span>
          <strong className="box-val">
            {Math.round(selectedArea.transitDelay ?? zoneTransit?.delay_minutes ?? 0)} min
          </strong>
          <small className="box-sub">
            {zoneTransit?.status ?? "ON SCHEDULE"}
          </small>
        </div>

        <div className="telemetry-box">
          <span className="box-label">ACTIVE INCIDENTS</span>
          <strong className={`box-val ${selectedArea.incidents > 0 ? "has-alerts" : ""}`}>
            {selectedArea.incidents ?? zoneIncidents.length}
          </strong>
          <small className="box-sub">
            {selectedArea.incidents > 0 ? "Active Dispatch" : "Sector Clear"}
          </small>
        </div>

        <div className="telemetry-box">
          <span className="box-label">CIVIC RISK SCORE</span>
          <strong className="box-val highlight-amber">
            {selectedArea.riskScore ?? snapshot.risk.score} / 100
          </strong>
          <small className="box-sub">
            Composite Score ({snapshot.risk.level.toUpperCase()})
          </small>
        </div>
      </div>

      <div className="location-panel-footer">
        <div className="feed-status-indicator">
          <i className={connected ? "is-live" : "is-degraded"} />
          <span>{isSimulated ? "SIMULATED / DEMO" : "LIVE TELEMETRY STREAM"}</span>
        </div>

        <div className="location-panel-actions">
          {onCenter && (
            <button className="panel-btn primary" onClick={onCenter}>
              CENTER CAMERA
            </button>
          )}
          {onSwitchMap && (
            <button className="panel-btn secondary" onClick={onSwitchMap}>
              {mapMode === "map" ? "VIEW IN 3D" : "VIEW IN 2D"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
