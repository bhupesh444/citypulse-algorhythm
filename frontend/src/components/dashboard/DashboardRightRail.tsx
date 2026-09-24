import React, { useState, useEffect } from "react";
import { CitySnapshot, SelectedArea } from "../../types/citypulse";
import { CivicDNA } from "../analytics/CivicDNA";
import { InvestigationPanel } from "../investigation/InvestigationPanel";

interface DashboardRightRailProps {
  snapshot: CitySnapshot;
  selectedArea: SelectedArea | null;
  isInspecting?: boolean;
  activeTabOverride?: "overview" | "investigate" | "ai" | "alerts";
  onInspectZone: (zoneName: string) => void;
  onOpenAlerts: () => void;
  onOpenAIConsole: () => void;
  onSelectAlert: (alertId: string) => void;
  onActivateLayer?: (layer: string) => void;
  onFocusMap?: (lat: number, lng: number) => void;
}

export const DashboardRightRail: React.FC<DashboardRightRailProps> = ({
  snapshot,
  selectedArea,
  isInspecting = false,
  activeTabOverride,
  onInspectZone,
  onOpenAlerts,
  onOpenAIConsole,
  onSelectAlert,
  onActivateLayer,
  onFocusMap,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "investigate" | "ai" | "alerts">(
    activeTabOverride || "overview"
  );

  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride]);

  const central = snapshot.traffic[0];
  const currentZone = selectedArea?.zone || central?.zone || "Central";
  const zoneTraffic =
    snapshot.traffic.find((t) => t.zone.toLowerCase() === currentZone.toLowerCase()) ?? central;
  const zoneTransit =
    snapshot.transit.find((t) => t.zone.toLowerCase() === currentZone.toLowerCase()) ?? snapshot.transit[0];
  const zoneIncidents = snapshot.incidents.filter(
    (i) => i.zone.toLowerCase() === currentZone.toLowerCase()
  );

  const activeAlertsCount =
    snapshot.anomalies.filter((a) => a.is_anomaly).length + snapshot.incidents.length;

  const avgSpeed = zoneTraffic ? `${Math.round(zoneTraffic.average_speed)} km/h` : "23 km/h";
  const congestionVal = selectedArea?.traffic ?? zoneTraffic?.congestion ?? 76;
  const transitDelayVal = Math.round(selectedArea?.transitDelay ?? zoneTransit?.delay_minutes ?? 14);
  const incidentCount = selectedArea?.incidents ?? zoneIncidents.length;

  return (
    <aside className={`dashboard-right-rail ${isInspecting ? "is-quiet" : ""}`} aria-label="Command rail">
      {/* Rail Navigation Tabs */}
      <div className="rail-tab-header">
        <button
          className={`rail-tab-btn ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`rail-tab-btn ${activeTab === "investigate" ? "is-active" : ""}`}
          onClick={() => setActiveTab("investigate")}
        >
          Investigate
        </button>
        <button
          className={`rail-tab-btn ${activeTab === "ai" ? "is-active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          AI Summary
        </button>
        <button
          className={`rail-tab-btn ${activeTab === "alerts" ? "is-active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          Alerts ({activeAlertsCount})
        </button>
      </div>

      {/* Unified Single-Scroll Content Container */}
      <div className="rail-tab-body">
        {activeTab === "investigate" && (
          <div className="rail-tab-pane">
            <InvestigationPanel
              snapshot={snapshot}
              selectedArea={selectedArea}
              onActivateLayer={onActivateLayer}
              onFocusMap={onFocusMap}
            />
          </div>
        )}

        {activeTab === "overview" && (
          <div className="rail-tab-pane">
            {/* Zone Overview Card */}
            <div className="rail-card">
              <div className="rail-card-header">
                <div>
                  <span className="rail-eyebrow">SELECTED CIVIC ZONE</span>
                  <h3 className="rail-card-title">{currentZone.toUpperCase()}</h3>
                </div>
                <span
                  className={`rail-status-pill ${
                    congestionVal > 70 ? "tone-high" : congestionVal > 45 ? "tone-warn" : "tone-normal"
                  }`}
                >
                  {congestionVal > 70 ? "CRITICAL" : congestionVal > 45 ? "MODERATE" : "NOMINAL"}
                </span>
              </div>

              <div className="rail-metrics-grid">
                <div className="rail-metric-item">
                  <span className="metric-val">{congestionVal}%</span>
                  <span className="metric-label">Traffic flow</span>
                </div>
                <div className="rail-metric-item">
                  <span className="metric-val">{avgSpeed}</span>
                  <span className="metric-label">Avg speed</span>
                </div>
                <div className="rail-metric-item">
                  <span className="metric-val">+{transitDelayVal} min</span>
                  <span className="metric-label">Transit delay</span>
                </div>
                <div className="rail-metric-item">
                  <span className={`metric-val ${incidentCount > 0 ? "text-danger" : ""}`}>
                    {incidentCount}
                  </span>
                  <span className="metric-label">Incidents</span>
                </div>
              </div>

              <button
                className="rail-button primary"
                onClick={() => {
                  setActiveTab("investigate");
                  onInspectZone(currentZone);
                }}
              >
                ✦ Investigate Zone Dynamics →
              </button>
            </div>

            {/* Civic DNA Visualization Card */}
            <div className="rail-card dna-rail-card">
              <CivicDNA
                snapshot={snapshot}
                onDimensionClick={(_dimId, layer) => {
                  if (onActivateLayer) onActivateLayer(layer);
                }}
              />
            </div>

            {/* Quick Active Signals Preview */}
            <div className="rail-card">
              <div className="rail-card-header">
                <div>
                  <span className="rail-eyebrow">ACTIVE SIGNALS</span>
                  <h3 className="rail-card-title">{activeAlertsCount} Unresolved</h3>
                </div>
                <button className="rail-link-btn" onClick={onOpenAlerts}>
                  View All →
                </button>
              </div>

              <div className="rail-signal-list">
                {snapshot.incidents.slice(0, 2).map((inc) => (
                  <div
                    key={inc.id}
                    className="rail-signal-row"
                    onClick={() => onSelectAlert(inc.id)}
                  >
                    <span className={`signal-dot ${inc.severity}`} />
                    <div className="signal-info">
                      <strong>{inc.description}</strong>
                      <small>{inc.zone} · {inc.severity.toUpperCase()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="rail-tab-pane">
            {/* Structured Scannable AI Block as specified in Section 12 */}
            <div className="rail-card ai-summary-card">
              <div className="rail-card-header">
                <div>
                  <span className="rail-eyebrow">AI CIVIC INTELLIGENCE</span>
                  <h3 className="rail-card-title">CURRENT SITUATION</h3>
                </div>
                <span className="ai-tag">NEURAL</span>
              </div>

              <p className="ai-situation-lead">
                Traffic is {congestionVal > 70 ? "high" : "nominal"} in {currentZone}.
              </p>

              <div className="ai-telemetry-scannable">
                <div className="ai-telemetry-item">
                  <strong>{congestionVal}%</strong>
                  <span>Traffic congestion</span>
                </div>
                <div className="ai-telemetry-item">
                  <strong>{avgSpeed}</strong>
                  <span>Average speed</span>
                </div>
                <div className="ai-telemetry-item">
                  <strong>{transitDelayVal} min</strong>
                  <span>Transit delay</span>
                </div>
                <div className="ai-telemetry-item">
                  <strong className={incidentCount > 0 ? "text-danger" : ""}>
                    {incidentCount}
                  </strong>
                  <span>Active incident</span>
                </div>
              </div>

              {/* Signal Relationship Chain (Visual Causality Flow) */}
              <div className="ai-signal-chain-box">
                <span className="ai-observation-label">RELATIONSHIP CHAIN (CAUSE & EFFECT)</span>
                <div className="ai-flow-steps">
                  <div className="ai-flow-step">
                    <span className="step-badge weather">☁ Weather</span>
                    <strong className="step-val">{snapshot.weather.temperature}°C · {snapshot.weather.weather_condition}</strong>
                  </div>
                  <span className="flow-arrow">→</span>
                  <div className="ai-flow-step">
                    <span className="step-badge road">🛣 Arterial Flow</span>
                    <strong className="step-val">{congestionVal}% Congestion</strong>
                  </div>
                  <span className="flow-arrow">→</span>
                  <div className="ai-flow-step">
                    <span className="step-badge transit">🚌 Transit</span>
                    <strong className="step-val">+{transitDelayVal}m Deviation</strong>
                  </div>
                  <span className="flow-arrow">→</span>
                  <div className="ai-flow-step">
                    <span className="step-badge risk">⚠ Civic Risk</span>
                    <strong className="step-val">{snapshot.risk.score}/100</strong>
                  </div>
                </div>
              </div>

              <div className="ai-observation-box">
                <span className="ai-observation-label">KEY TAKEAWAY</span>
                <p className="ai-observation-text">
                  {snapshot.weather.rainfall > 0
                    ? "Surface runoff slowing arterial corridors near main intersections."
                    : `${currentZone} sector arterial throughput remains within nominal baseline tolerances.`}
                </p>
              </div>

              <div className="ai-metadata-footer">
                <div className="ai-meta-row">
                  <span className="meta-key">CONFIDENCE</span>
                  <span className="meta-val highlight">Moderate (88%)</span>
                </div>
                <div className="ai-meta-row">
                  <span className="meta-key">SOURCE</span>
                  <span className="meta-val">Open-Meteo + Traffic Feed</span>
                </div>
              </div>

              <p className="ai-disclaimer">
                Observed telemetry correlation does not establish causality. Verify with field sensors.
              </p>

              <button className="rail-button primary" onClick={onOpenAIConsole}>
                Open AI Command Console ✦
              </button>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="rail-tab-pane">
            <div className="rail-card">
              <div className="rail-card-header">
                <div>
                  <span className="rail-eyebrow">DISPATCH INCIDENTS</span>
                  <h3 className="rail-card-title">Active Signals ({activeAlertsCount})</h3>
                </div>
                <button className="rail-link-btn" onClick={onOpenAlerts}>
                  All Alerts →
                </button>
              </div>

              <div className="rail-alerts-list">
                {snapshot.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="rail-alert-item"
                    onClick={() => onSelectAlert(inc.id)}
                  >
                    <div className="alert-item-top">
                      <span className={`severity-tag ${inc.severity}`}>
                        {inc.severity.toUpperCase()}
                      </span>
                      <span className="alert-time">Active</span>
                    </div>
                    <strong className="alert-item-title">{inc.description}</strong>
                    <div className="alert-item-sub">
                      <span>{inc.zone} Sector</span>
                      <span>Status: {inc.status}</span>
                    </div>
                  </div>
                ))}

                {snapshot.anomalies
                  .filter((a) => a.is_anomaly)
                  .map((anom, idx) => (
                    <div key={idx} className="rail-alert-item warning">
                      <div className="alert-item-top">
                        <span className="severity-tag medium">ANOMALY</span>
                        <span className="alert-time">Detected</span>
                      </div>
                      <strong className="alert-item-title">
                        {anom.metric.replaceAll("_", " ").toUpperCase()} anomaly in {anom.zone}
                      </strong>
                      <div className="alert-item-sub">
                        <span>Current: {anom.current_value}</span>
                        <span>Baseline: {anom.baseline}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <button className="rail-button secondary" onClick={onOpenAlerts}>
                Open Alert Center ({activeAlertsCount}) →
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
