import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { DataSourceHealth } from "../../types/citypulse";

export const DataSourcesView: React.FC = () => {
  const [sources, setSources] = useState<DataSourceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSourcesStatus()
      .then((res) => setSources(res))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (provider: string) => {
    setExpandedId((prev) => (prev === provider ? null : provider));
  };

  return (
    <div className="datasources-page-container">
      <div className="datasources-header">
        <div>
          <span className="page-eyebrow">INFRASTRUCTURE & FEED HEALTH</span>
          <h2 className="page-title">Data Sources</h2>
        </div>
        <span className="clean-status-tag">● Telemetry Stream Active</span>
      </div>

      <div className="datasources-table-container">
        {loading ? (
          <div className="view-loading">Querying API feeds status...</div>
        ) : (
          <table className="clean-data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Status</th>
                <th>Freshness</th>
                <th>Latency</th>
                <th>Environment</th>
                <th className="th-action"></th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s, idx) => {
                const isConn = s.status === "CONNECTED";
                const isDemo = s.status === "DEMO";
                const isExpanded = expandedId === s.provider;

                return (
                  <React.Fragment key={idx}>
                    <tr
                      className={`source-row ${isExpanded ? "is-expanded" : ""}`}
                      onClick={() => toggleExpand(s.provider)}
                    >
                      <td>
                        <strong>{s.provider}</strong>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            isConn ? "connected" : isDemo ? "demo" : "fallback"
                          }`}
                        >
                          <i>●</i> {s.status}
                        </span>
                      </td>
                      <td>{s.data_freshness}</td>
                      <td className="latency-cell">{s.latency_ms} ms</td>
                      <td>{s.environment}</td>
                      <td className="td-action" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="table-detail-btn"
                          onClick={() => toggleExpand(s.provider)}
                        >
                          {isExpanded ? "Hide Details ▴" : "View Details ▾"}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Technical Details Row */}
                    {isExpanded && (
                      <tr className="expandable-detail-row">
                        <td colSpan={6}>
                          <div className="expanded-details-content">
                            <div className="detail-field">
                              <span className="field-label">Purpose</span>
                              <span className="field-val">{s.purpose}</span>
                            </div>
                            <div className="detail-field">
                              <span className="field-label">API Type</span>
                              <span className="field-val">{s.api_type}</span>
                            </div>
                            <div className="detail-field">
                              <span className="field-label">Attribution</span>
                              <span className="field-val">{s.attribution}</span>
                            </div>
                            <div className="detail-field">
                              <span className="field-label">Feed Classification</span>
                              <span className="field-val">
                                {s.is_live ? "Production Live Stream" : "Synthesized / Simulated Feed"}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
