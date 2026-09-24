import React from "react";
import { AlertDetail } from "../../types/citypulse";

interface AlertDetailsModalProps {
  alert: AlertDetail | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onInvestigate: (id: string) => void;
  onResolve: (id: string) => void;
  onViewOnMap: (alert: AlertDetail) => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onInvestigate,
  onResolve,
  onViewOnMap,
}) => {
  if (!alert) return null;

  const severityTone =
    alert.severity === "critical"
      ? "tone-critical"
      : alert.severity === "high"
      ? "tone-high"
      : alert.severity === "medium"
      ? "tone-medium"
      : "tone-low";

  return (
    <div className="alert-modal-backdrop" onClick={onClose}>
      <div className="alert-modal-card floating-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className={`modal-badge ${severityTone}`}>{alert.severity.toUpperCase()}</span>
            <h3>{alert.title}</h3>
            <small>{alert.location} · {new Date(alert.timestamp).toLocaleTimeString()}</small>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Signal Impact Comparison */}
          <div className="modal-section-grid">
            <div className="signal-box">
              <span className="eyebrow">CURRENT MEASUREMENT</span>
              <strong>{alert.current_measurement}</strong>
            </div>
            <div className="signal-box">
              <span className="eyebrow">PREVIOUS BASELINE</span>
              <strong>{alert.previous_measurement}</strong>
            </div>
            <div className="signal-box">
              <span className="eyebrow">TELEMETRY DELTA</span>
              <strong className="delta-highlight">{alert.change}</strong>
            </div>
          </div>

          {/* AI Analysis & Causes */}
          <div className="modal-ai-box">
            <div className="ai-box-header">
              <span className="eyebrow">✦ AI CIVIC INTELLIGENCE ASSESSMENT</span>
              <span className="confidence-chip">{Math.round(alert.confidence * 100)}% CONFIDENCE</span>
            </div>
            <p>{alert.ai_analysis}</p>
          </div>

          <div className="modal-details-columns">
            <div className="modal-col">
              <span className="eyebrow">POSSIBLE CONTRIBUTING CAUSES</span>
              <ul className="causes-list">
                {alert.possible_causes.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </div>
            <div className="modal-col">
              <span className="eyebrow">RECOMMENDED OPERATIONAL ACTION</span>
              <div className="action-box">
                <p>{alert.recommended_action}</p>
              </div>
            </div>
          </div>

          <div className="modal-meta-row">
            <span>Source: <b>{alert.source}</b></span>
            <span>Area: <b>{alert.affected_area}</b></span>
            <span>Mode: <b>{alert.source_status.toUpperCase()}</b></span>
            <span>Status: <b className="status-label">{alert.status}</b></span>
          </div>
        </div>

        <div className="modal-actions-bar">
          <button className="action-btn map-btn" onClick={() => onViewOnMap(alert)}>
            View on Map ↗
          </button>
          <div className="status-actions">
            <button
              className="action-btn ack-btn"
              onClick={() => onAcknowledge(alert.id)}
              disabled={alert.status === "INVESTIGATING" || alert.status === "RESOLVED"}
            >
              Acknowledge
            </button>
            <button
              className="action-btn inv-btn"
              onClick={() => onInvestigate(alert.id)}
              disabled={alert.status === "RESOLVED"}
            >
              Investigate
            </button>
            <button
              className="action-btn resolve-btn"
              onClick={() => onResolve(alert.id)}
              disabled={alert.status === "RESOLVED"}
            >
              Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
