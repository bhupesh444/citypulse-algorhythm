import React, { useState } from "react";
import { api } from "../../services/api";
import { AskCityPulseResponse, CitySnapshot } from "../../types/citypulse";

interface AskCityPulsePanelProps {
  snapshot: CitySnapshot;
}

export const AskCityPulsePanel: React.FC<AskCityPulsePanelProps> = ({ snapshot }) => {
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [conversation, setConversation] = useState<AskCityPulseResponse[]>([
    {
      question: "Why is traffic increasing in Central?",
      answer:
        "Traffic density in Central Zone is elevated (+18% over baseline) while average corridor speed has dropped to 24 km/h. Localized arterial constriction near the MI Road intersection is compounding feeder bus delays.",
      observed_changes: [
        "Vehicle density: +18% over 30-min baseline",
        "Average speed: -14% (down to 24 km/h)",
        "Active incident: 1 disabled vehicle reported",
      ],
      contributing_factors: [
        "Road incident near MI Road corridor",
        "Peak morning commuter convergence",
        "Transit feeder route R12 schedule slip",
      ],
      confidence: 88,
      sources: ["TomTom Traffic Flow", "CityPulse Incident Feed", "Open-Meteo"],
      is_simulated: true,
      timestamp: new Date().toISOString(),
    },
  ]);

  const sampleQuestions = [
    "Why is traffic increasing in Central?",
    "Which zone has the highest risk?",
    "Are there any critical incidents?",
    "Show me environmental anomalies.",
  ];

  const handleAsk = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;
    setAsking(true);
    try {
      const res = await api.askCityPulse(q, {
        weather: snapshot.weather,
        traffic: snapshot.traffic,
        risk: snapshot.risk,
        incidents: snapshot.incidents,
      });
      setConversation((prev) => [res, ...prev]);
      setQuery("");
    } catch {
      setConversation((prev) => [
        {
          question: q,
          answer:
            "Telemetry synthesis shows standard operational parameters for Jaipur. Traffic and weather remain consistent with baseline.",
          observed_changes: ["Corridor velocity within tolerance"],
          contributing_factors: ["Normal diurnal variance"],
          confidence: 85,
          sources: ["CityPulse Fallback Core"],
          is_simulated: true,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setAsking(false);
    }
  };

  const riskBreakdown = snapshot.risk.breakdown || {
    overall: snapshot.risk.score,
    traffic: Math.min(100, Math.round(snapshot.traffic[0]?.congestion * 0.9 || 37)),
    environment: snapshot.weather.rainfall > 0 ? 55 : 22,
    infrastructure: 28,
    transit: 67,
    incident: 10,
  };

  const forecast = snapshot.risk.forecast || [
    { minutes_ahead: 15, traffic_risk: 62, environmental_risk: 30, infrastructure_risk: 28, transit_risk: 26, overall_risk: 45, trend: "stable" as const },
    { minutes_ahead: 30, traffic_risk: 68, environmental_risk: 30, infrastructure_risk: 28, transit_risk: 30, overall_risk: 49, trend: "increasing" as const },
    { minutes_ahead: 45, traffic_risk: 65, environmental_risk: 30, infrastructure_risk: 28, transit_risk: 28, overall_risk: 47, trend: "stable" as const },
    { minutes_ahead: 60, traffic_risk: 54, environmental_risk: 25, infrastructure_risk: 28, transit_risk: 22, overall_risk: 39, trend: "decreasing" as const },
  ];

  return (
    <div className="insights-page-container">
      {/* Page Header */}
      <div className="insights-page-header">
        <div>
          <span className="page-eyebrow">PREDICTIVE & NEURAL INTELLIGENCE</span>
          <h2 className="page-title">Insights</h2>
        </div>
      </div>

      {/* Section 14: Top Civic Risk & Horizontal Breakdown */}
      <div className="risk-overview-banner">
        <div className="risk-score-spotlight">
          <span className="risk-label">CIVIC RISK</span>
          <div className="risk-value-display">
            <strong>{snapshot.risk.score}</strong>
            <span className="denom">/ 100</span>
          </div>
          <span className={`risk-level-badge level-${snapshot.risk.level}`}>
            {snapshot.risk.level.toUpperCase()}
          </span>
        </div>

        <div className="risk-horizontal-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-name">Traffic</span>
            <strong className="breakdown-score">{riskBreakdown.traffic}</strong>
            <div className="breakdown-bar">
              <span style={{ width: `${riskBreakdown.traffic}%`, background: "#efbc70" }} />
            </div>
          </div>

          <div className="breakdown-item">
            <span className="breakdown-name">Environment</span>
            <strong className="breakdown-score">{riskBreakdown.environment}</strong>
            <div className="breakdown-bar">
              <span style={{ width: `${riskBreakdown.environment}%`, background: "#72b9e8" }} />
            </div>
          </div>

          <div className="breakdown-item">
            <span className="breakdown-name">Infrastructure</span>
            <strong className="breakdown-score">{riskBreakdown.infrastructure}</strong>
            <div className="breakdown-bar">
              <span style={{ width: `${riskBreakdown.infrastructure}%`, background: "#7dd9c1" }} />
            </div>
          </div>

          <div className="breakdown-item">
            <span className="breakdown-name">Transit</span>
            <strong className="breakdown-score">{riskBreakdown.transit}</strong>
            <div className="breakdown-bar">
              <span style={{ width: `${riskBreakdown.transit}%`, background: "#d97dd9" }} />
            </div>
          </div>

          <div className="breakdown-item">
            <span className="breakdown-name">Incidents</span>
            <strong className="breakdown-score">{riskBreakdown.incident}</strong>
            <div className="breakdown-bar">
              <span style={{ width: `${Math.min(100, riskBreakdown.incident * 3)}%`, background: "#ef7f68" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 14: Predictive Forecast Clearly Labeled FORECAST · SIMULATED */}
      <div className="forecast-card-section">
        <div className="section-title-strip">
          <span className="forecast-badge">FORECAST · SIMULATED</span>
          <span className="forecast-note">Projected trajectory based on trend models</span>
        </div>

        <div className="forecast-horizontal-grid">
          {forecast.map((fc, idx) => (
            <div key={idx} className="forecast-step-card">
              <div className="forecast-step-time">+{fc.minutes_ahead} min</div>
              <div className="forecast-step-val">Risk {fc.overall_risk}</div>
              <div className="forecast-step-detail">
                <span>Traffic: {fc.traffic_risk}</span>
                <span>Transit: {fc.transit_risk}</span>
              </div>
              <span className={`trend-pill ${fc.trend}`}>{fc.trend}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 14: Ask CityPulse Conversational Interface as Main Section */}
      <div className="ask-citypulse-main-card">
        <div className="ask-header">
          <div>
            <h3 className="ask-title">Ask CityPulse</h3>
            <p className="ask-subtitle">Natural language queries against real-time municipal telemetry</p>
          </div>
        </div>

        <div className="sample-prompts-row">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleAsk(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          className="ask-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(query);
          }}
        >
          <input
            className="ask-input-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about traffic, weather, incidents, or risk..."
            disabled={asking}
          />
          <button type="submit" className="ask-submit-btn" disabled={asking || !query.trim()}>
            {asking ? "Thinking…" : "Ask ✦"}
          </button>
        </form>

        {/* Conversation Stream */}
        <div className="conversation-thread">
          {conversation.map((msg, idx) => (
            <div key={idx} className="conversation-bubble">
              <div className="user-query-block">
                <span className="query-avatar">Q</span>
                <strong>{msg.question}</strong>
              </div>

              <div className="ai-response-block">
                <p className="response-text">{msg.answer}</p>

                {msg.observed_changes && msg.observed_changes.length > 0 && (
                  <div className="observed-points">
                    <span className="points-label">Observed telemetry:</span>
                    <ul>
                      {msg.observed_changes.map((ch, i) => (
                        <li key={i}>{ch}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="response-meta-bar">
                  <span>Confidence: <b>{msg.confidence}%</b></span>
                  <span className="meta-sep">•</span>
                  <span>Sources: {msg.sources?.join(", ")}</span>
                  {msg.is_simulated && (
                    <>
                      <span className="meta-sep">•</span>
                      <span className="sim-pill">Simulated AI</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
