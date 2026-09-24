import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { AlertDetail } from "../../types/citypulse";

interface AlertsViewProps {
  onSelectAlert: (alert: AlertDetail) => void;
  onViewOnMap: (alert: AlertDetail) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onSelectAlert, onViewOnMap }) => {
  const [alerts, setAlerts] = useState<AlertDetail[]>([]);
  const [tab, setTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAlerts()
      .then((res) => setAlerts(res))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (tab === "ACTIVE" && a.status === "RESOLVED") return false;
    if (tab === "HISTORY" && a.status !== "RESOLVED") return false;
    if (severityFilter !== "ALL" && a.severity.toUpperCase() !== severityFilter) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => a.status !== "RESOLVED").length;
  const historyCount = alerts.filter((a) => a.status === "RESOLVED").length;

  return (
    <div className="alerts-page-container">
      {/* Header and Compact Filters */}
      <div className="alerts-page-header">
        <div>
          <span className="page-eyebrow">CIVIC SIGNALS & DISPATCH</span>
          <h2 className="page-title">Alerts</h2>
        </div>

        <div className="alerts-toolbar">
          <div className="alerts-tab-toggle">
            <button
              className={`alerts-tab-pill ${tab === "ACTIVE" ? "is-active" : ""}`}
              onClick={() => setTab("ACTIVE")}
            >
              Active ({activeCount})
            </button>
            <button
              className={`alerts-tab-pill ${tab === "HISTORY" ? "is-active" : ""}`}
              onClick={() => setTab("HISTORY")}
            >
              History ({historyCount})
            </button>
          </div>

          <div className="compact-filter-group">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                className={`filter-pill ${severityFilter === sev ? "is-active" : ""}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev === "ALL" ? "All" : sev.charAt(0) + sev.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Cards List */}
      {loading ? (
        <div className="view-loading">Querying active alerts stream...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="view-empty-state">
          <span className="empty-icon">✓</span>
          <p>No alerts matching current filters in this operational window.</p>
        </div>
      ) : (
        <div className="alerts-cards-list">
          {filteredAlerts.map((alt) => {
            const isCrit = alt.severity === "critical";
            const isHigh = alt.severity === "high";
            const tone = isCrit ? "crit" : isHigh ? "high" : "med";

            return (
              <div
                key={alt.id}
                className={`clean-alert-card tone-${tone}`}
                onClick={() => onSelectAlert(alt)}
              >
                <div className="alert-card-top-row">
                  <span className={`severity-badge ${tone}`}>
                    {alt.severity.toUpperCase()}
                  </span>
                  <span className="alert-location-text">{alt.location || `${alt.zone} Sector`}</span>
                  <span className="alert-status-text">
                    {alt.status} · {new Date(alt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <h3 className="alert-card-title">{alt.title}</h3>

                <div className="alert-card-footer">
                  <div className="alert-telemetry-meta">
                    <span>Impact: <b>{alt.change}</b></span>
                    <span className="meta-sep">•</span>
                    <span>Confidence: <b>{Math.round(alt.confidence * 100)}%</b></span>
                  </div>

                  <div className="alert-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="clean-btn outline-btn"
                      onClick={() => onViewOnMap(alt)}
                    >
                      View Map ↗
                    </button>
                    <button
                      className="clean-btn secondary-btn"
                      onClick={() => onSelectAlert(alt)}
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
