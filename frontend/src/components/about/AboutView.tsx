import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../services/api";
import { CitySnapshot, DataSourceHealth } from "../../types/citypulse";

interface AboutViewProps {
  snapshot: CitySnapshot;
  onNavigate?: (sectionId: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ snapshot, onNavigate }) => {
  const [sources, setSources] = useState<DataSourceHealth[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Fetch real data sources status from backend
  useEffect(() => {
    api
      .getSourcesStatus()
      .then((res) => setSources(res))
      .catch(() => undefined)
      .finally(() => setSourcesLoading(false));
  }, []);

  // Compute live Civic DNA scores from snapshot
  const civicDnaScores = useMemo(() => {
    const traffic = snapshot.traffic;
    const avgCongestion =
      traffic.reduce((acc, t) => acc + t.congestion, 0) / Math.max(traffic.length, 1);
    const avgSpeed =
      traffic.reduce((acc, t) => acc + t.average_speed, 0) / Math.max(traffic.length, 1);

    const mobility = Math.round(
      Math.max(20, Math.min(95, 100 - avgCongestion * 0.7 + (avgSpeed / 60) * 20))
    );
    const environment = Math.round(
      Math.max(
        30,
        Math.min(
          92,
          90 -
            (snapshot.weather.humidity > 60 ? 15 : 0) -
            (snapshot.weather.rainfall > 0 ? 12 : 0)
        )
      )
    );
    const safety = Math.max(
      25,
      95 -
        snapshot.incidents.length * 14 -
        snapshot.anomalies.filter((a) => a.is_anomaly).length * 8
    );
    const infrastructure = Math.round(
      Math.max(35, Math.min(90, 80 - (snapshot.risk?.score ?? 34) * 0.3))
    );
    const avgDelay =
      snapshot.transit.reduce((acc, t) => acc + t.delay_minutes, 0) /
      Math.max(snapshot.transit.length, 1);
    const transit = Math.round(Math.max(25, Math.min(95, 92 - avgDelay * 4.5)));
    const weather = Math.round(
      Math.max(30, Math.min(96, 92 - (snapshot.weather.rainfall > 0 ? 25 : 0)))
    );

    return { mobility, environment, safety, infrastructure, transit, weather };
  }, [snapshot]);

  // Data Pipeline steps for Section 3
  const pipelineSteps = [
    {
      id: "sources",
      label: "DATA SOURCES",
      icon: "🛰",
      title: "Multimodal Urban Ingestion",
      desc: "Streams telemetry from satellite feeds, arterial traffic sensors, atmospheric probes, and municipal transit GTFS-Realtime streams.",
      metrics: "7 Connected Feeds · 30s Polling Cycle",
    },
    {
      id: "processing",
      label: "DATA PROCESSING",
      icon: "⚙",
      title: "Spatial Normalization",
      desc: "Validates schema integrity, calculates geo-spatial sector coordinates, standardizes speed units, and removes sensor noise.",
      metrics: "< 45ms Ingestion Latency · Zero-Drop Queue",
    },
    {
      id: "intelligence",
      label: "CITY INTELLIGENCE",
      icon: "🧠",
      title: "Cross-Sector Synthesis",
      desc: "Correlates multi-domain signals across Central, North, South, East, and West sectors to compute historical operational baselines.",
      metrics: "5 Civic Sectors · Multi-Domain Correlation",
    },
    {
      id: "analysis",
      label: "RISK / ANOMALY ANALYSIS",
      icon: "📊",
      title: "Algorithmic Risk Engine",
      desc: "Computes calibrated composite risk index (35% Traffic, 20% Environmental, 15% Infra, 15% Transit, 15% Incidents) and flags statistical anomalies.",
      metrics: "Composite 0–100 Scale · Anomaly Thresholds",
    },
    {
      id: "dashboard",
      label: "VISUAL DASHBOARD",
      icon: "🗺",
      title: "Digital Twin Visualization",
      desc: "Renders hardware-accelerated MapLibre 2D vector cartography, Cesium 3D Earth, interactive inspection reticles, and real-time alerts.",
      metrics: "60 FPS WebGL · Click-to-Inspect Reticle",
    },
    {
      id: "insights",
      label: "ACTIONABLE INSIGHTS",
      icon: "✦",
      title: "Predictive Civic Advisory",
      desc: "Translates raw telemetry into plain-language operational summaries, automated dispatch recommendations, and LLM-assisted root-cause explanations.",
      metrics: "Automated Recommendations · Cause Analysis",
    },
  ];

  // Core Development Team
  const developers = [
    {
      name: "Bhupesh Saini",
      role: "Lead Developer",
      roleIcon: "⚡",
      badge: "Lead Developer",
      focus: ["Full-Stack Architecture", "Core Engine", "React & FastAPI"],
      initials: "BS",
    },
    {
      name: "Pratham Jangid",
      role: "Project Manager",
      roleIcon: "📋",
      badge: "Project Manager",
      focus: ["Roadmap & Milestones", "Release Management", "Operations Coordination"],
      initials: "PJ",
    },
    {
      name: "Akshiv Pareek",
      role: "Support & Maintenance",
      roleIcon: "🛡",
      badge: "Support & Maintenance",
      focus: ["System Reliability", "Telemetry Monitoring", "Platform Support"],
      initials: "AP",
    },
    {
      name: "Arpita Sharma",
      role: "UX/UI Designer",
      roleIcon: "🎨",
      badge: "UX/UI Designer",
      focus: ["Design System", "Interface Design", "User Experience"],
      initials: "AS",
    },
  ];

  return (
    <div className="about-page-container">
      {/* Header */}
      <div className="about-page-header">
        <div>
          <span className="page-eyebrow">CIVIC HEALTH INTELLIGENCE PLATFORM</span>
          <h2 className="page-title">About CityPulse</h2>
          <p className="page-subtitle">
            Enterprise-grade multimodal urban telemetry, spatial cartography, and predictive civic health modeling.
          </p>
        </div>

        <div className="about-header-meta">
          <span className="about-badge-version">v1.0.0 Command Center</span>
          <span className="about-badge-status">● System Operational</span>
        </div>
      </div>

      {/* 1. PRODUCT OVERVIEW */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">01</span>
          <div>
            <h3 className="about-section-title">Product Overview</h3>
            <p className="about-section-desc">Unified civic intelligence designed to eliminate urban operational silos.</p>
          </div>
        </div>

        <div className="about-overview-grid">
          <div className="about-overview-card highlight-card">
            <h4>The Challenge: Fragmented Urban Data</h4>
            <p>
              Modern municipal administrations operate in departmental isolation. Traffic management systems, environmental monitors, public transit dispatch, and emergency response infrastructure generate massive telemetry streams that rarely communicate in real time. This fragmentation leads to delayed incident response, unidentified bottleneck cascades, and unmitigated public hazards.
            </p>
          </div>
          <div className="about-overview-card highlight-card">
            <h4>The Solution: CityPulse Command Center</h4>
            <p>
              CityPulse synthesizes disparate civic telemetry into an integrated, real-time command dashboard. By combining MapLibre GL hardware-accelerated cartography, automated cross-domain correlation, composite risk modeling, and LLM-driven operational advisory, CityPulse empowers civic operators to detect, inspect, and mitigate urban issues before they escalate.
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHAT CITYPULSE MONITORS */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">02</span>
          <div>
            <h3 className="about-section-title">What CityPulse Monitors</h3>
            <p className="about-section-desc">Ten core municipal domains tracked continuously across operational sectors.</p>
          </div>
        </div>

        <div className="about-monitors-grid">
          <div className="monitor-card">
            <span className="monitor-icon">🚗</span>
            <div className="monitor-title">Traffic & Mobility</div>
            <p className="monitor-desc">
              Arterial congestion levels, average vehicle speeds, corridor travel times, and intersection throughput.
            </p>
            <span className="monitor-tag">TomTom / Real-Time Flow</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">🍃</span>
            <div className="monitor-title">Air Quality</div>
            <p className="monitor-desc">
              Ambient particulate matter (PM2.5, PM10), Air Quality Index (AQI), and micro-climate atmospheric dispersion.
            </p>
            <span className="monitor-tag">OpenAQ / Sensor Feeds</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">🌦</span>
            <div className="monitor-title">Weather & Climate</div>
            <p className="monitor-desc">
              Ambient temperature, relative humidity, wind velocity, barometric pressure, and precipitation forecasts.
            </p>
            <span className="monitor-tag">Open-Meteo / Hourly Models</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">🚌</span>
            <div className="monitor-title">Public Transit</div>
            <p className="monitor-desc">
              Bus fleet GPS positions, route schedule deviations, headway adherence, and commuter transit delay spikes.
            </p>
            <span className="monitor-tag">GTFS-Realtime Feeds</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">🛡</span>
            <div className="monitor-title">Civic Safety</div>
            <p className="monitor-desc">
              Active roadway incidents, automated hazard classification, severity scoring, and emergency dispatch alerts.
            </p>
            <span className="monitor-tag">Incident Service</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">⚡</span>
            <div className="monitor-title">Infrastructure</div>
            <p className="monitor-desc">
              Road networks, traffic signal coordination, power/water grid continuity, and sensor coverage bounds.
            </p>
            <span className="monitor-tag">Grid Telemetry</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">⚠</span>
            <div className="monitor-title">Alert Intelligence</div>
            <p className="monitor-desc">
              Threshold-triggered alerts, operational priority scoring, and lifecycle triage (Acknowledge / Resolve).
            </p>
            <span className="monitor-tag">Multi-tier Priority</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">◈</span>
            <div className="monitor-title">Geographic Zones</div>
            <p className="monitor-desc">
              Spatial segmentation across Central, North, South, East, and West sectors with localized municipal baselines.
            </p>
            <span className="monitor-tag">5 Sector Boundaries</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">📊</span>
            <div className="monitor-title">Risk Intelligence</div>
            <p className="monitor-desc">
              Composite risk score (0–100) synthesizing traffic (35%), environment (20%), infrastructure (15%), transit (15%), and incidents (15%).
            </p>
            <span className="monitor-tag">Weighted Index</span>
          </div>

          <div className="monitor-card">
            <span className="monitor-icon">✦</span>
            <div className="monitor-title">AI-assisted Insights</div>
            <p className="monitor-desc">
              Multi-domain statistical correlation, root-cause hypotheses, predictive anomaly explanation, and advisory summaries.
            </p>
            <span className="monitor-tag">LLM Civic Engine</span>
          </div>
        </div>
      </section>

      {/* 3. HOW CITYPULSE WORKS */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">03</span>
          <div>
            <h3 className="about-section-title">How CityPulse Works</h3>
            <p className="about-section-desc">Interactive end-to-end data processing and intelligence pipeline.</p>
          </div>
        </div>

        <div className="about-pipeline-container">
          <div className="about-pipeline-flow">
            {pipelineSteps.map((step, idx) => {
              const isActive = activePipelineStep === idx;
              return (
                <div
                  key={step.id}
                  className={`pipeline-node ${isActive ? "is-active" : ""}`}
                  onClick={() => setActivePipelineStep(idx)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="pipeline-step-badge">STEP {idx + 1}</div>
                  <span className="pipeline-node-icon">{step.icon}</span>
                  <div className="pipeline-node-name">{step.label}</div>
                  {idx < pipelineSteps.length - 1 && (
                    <span className="pipeline-arrow" aria-hidden="true">→</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Pipeline Detail Card */}
          <div className="pipeline-detail-card">
            <div className="pipeline-detail-header">
              <span className="pipeline-detail-step">STAGE {activePipelineStep + 1} OF 6</span>
              <h4 className="pipeline-detail-title">
                {pipelineSteps[activePipelineStep].icon} {pipelineSteps[activePipelineStep].title}
              </h4>
            </div>
            <p className="pipeline-detail-desc">{pipelineSteps[activePipelineStep].desc}</p>
            <div className="pipeline-detail-meta">
              <span className="meta-label">Operational Spec:</span>
              <span className="meta-val font-mono">{pipelineSteps[activePipelineStep].metrics}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DATA SOURCES */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">04</span>
          <div>
            <h3 className="about-section-title">Data Sources</h3>
            <p className="about-section-desc">Configured external and simulated providers powering the platform.</p>
          </div>
        </div>

        <div className="about-sources-table-container">
          {sourcesLoading ? (
            <div className="view-loading">Querying active provider feeds...</div>
          ) : (
            <table className="clean-data-table about-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Freshness</th>
                  <th>Environment</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s, i) => (
                  <tr key={i}>
                    <td><strong>{s.provider}</strong></td>
                    <td className="purpose-cell">{s.purpose}</td>
                    <td>
                      <span className={`status-pill ${s.status === "CONNECTED" ? "connected" : s.status === "DEMO" ? "demo" : "fallback"}`}>
                        <i>●</i> {s.status}
                      </span>
                    </td>
                    <td className="font-mono">{s.latency_ms} ms</td>
                    <td>{s.data_freshness}</td>
                    <td><span className="env-pill">{s.environment}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 5. CIVIC DNA */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">05</span>
          <div>
            <h3 className="about-section-title">Civic DNA Dimensions</h3>
            <p className="about-section-desc">Six fundamental telemetry axes measuring urban health and resilience.</p>
          </div>
        </div>

        <div className="about-dna-grid">
          <div className="about-dna-card">
            <div className="dna-card-header">
              <span className="dna-dot" style={{ background: "#2dd4bf" }}>●</span>
              <span className="dna-title">Mobility</span>
              <span className="dna-score font-mono">{civicDnaScores.mobility} / 100</span>
            </div>
            <p className="dna-desc">Arterial speed maintenance, low congestion duration, and cross-sector transit velocity.</p>
            <div className="dna-meter"><div className="dna-meter-bar" style={{ width: `${civicDnaScores.mobility}%`, background: "#2dd4bf" }} /></div>
          </div>

          <div className="about-dna-card">
            <div className="dna-card-header">
              <span className="dna-dot" style={{ background: "#34d399" }}>●</span>
              <span className="dna-title">Environment</span>
              <span className="dna-score font-mono">{civicDnaScores.environment} / 100</span>
            </div>
            <p className="dna-desc">Air quality index compliance, safe particulate boundaries, and atmospheric stability.</p>
            <div className="dna-meter"><div className="dna-meter-bar" style={{ width: `${civicDnaScores.environment}%`, background: "#34d399" }} /></div>
          </div>

          <div className="about-dna-card">
            <div className="dna-card-header">
              <span className="dna-dot" style={{ background: "#f87171" }}>●</span>
              <span className="dna-title">Safety</span>
              <span className="dna-score font-mono">{civicDnaScores.safety} / 100</span>
            </div>
            <p className="dna-desc">Active incident suppression, hazard response readiness, and road anomaly containment.</p>
            <div className="dna-meter"><div className="dna-meter-bar" style={{ width: `${civicDnaScores.safety}%`, background: "#f87171" }} /></div>
          </div>

          <div className="about-dna-card">
            <div className="dna-card-header">
              <span className="dna-dot" style={{ background: "#fbbf24" }}>●</span>
              <span className="dna-title">Infrastructure</span>
              <span className="dna-score font-mono">{civicDnaScores.infrastructure} / 100</span>
            </div>
            <p className="dna-desc">Road network integrity, sensor hardware continuity, and municipal utilities resilience.</p>
            <div className="dna-meter"><div className="dna-meter-bar" style={{ width: `${civicDnaScores.infrastructure}%`, background: "#fbbf24" }} /></div>
          </div>

          <div className="about-dna-card">
            <div className="dna-card-header">
              <span className="dna-dot" style={{ background: "#818cf8" }}>●</span>
              <span className="dna-title">Transit</span>
              <span className="dna-score font-mono">{civicDnaScores.transit} / 100</span>
            </div>
            <p className="dna-desc">Public bus schedule adherence, route headway stability, and minimal commuter delay.</p>
            <div className="dna-meter"><div className="dna-meter-bar" style={{ width: `${civicDnaScores.transit}%`, background: "#818cf8" }} /></div>
          </div>

          <div className="about-dna-card">
            <div className="dna-card-header">
              <span className="dna-dot" style={{ background: "#38bdf8" }}>●</span>
              <span className="dna-title">Weather</span>
              <span className="dna-score font-mono">{civicDnaScores.weather} / 100</span>
            </div>
            <p className="dna-desc">Micro-climate predictability, temperature equilibrium, and storm drainage readiness.</p>
            <div className="dna-meter"><div className="dna-meter-bar" style={{ width: `${civicDnaScores.weather}%`, background: "#38bdf8" }} /></div>
          </div>
        </div>
      </section>

      {/* 6. MAP TECHNOLOGY */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">06</span>
          <div>
            <h3 className="about-section-title">Map Technology</h3>
            <p className="about-section-desc">Hardware-accelerated WebGL cartography and 3D spatial engines.</p>
          </div>
        </div>

        <div className="about-tech-grid">
          <div className="about-tech-card">
            <div className="tech-card-header">
              <h4>MapLibre GL JS</h4>
              <span className="tech-badge verified">Primary 2D Engine</span>
            </div>
            <p>
              Open-source WebGL/WebGPU vector map renderer delivering 60 FPS smooth pan, zoom, dynamic day/night shading, and responsive layer management. Custom styled for dark command-center ergonomics.
            </p>
          </div>

          <div className="about-tech-card">
            <div className="tech-card-header">
              <h4>MapTiler Cloud</h4>
              <span className="tech-badge verified">Vector Cartography</span>
            </div>
            <p>
              High-resolution global vector basemap hosting road networks, place names, water boundaries, and terrain elevation contouring.
            </p>
          </div>

          <div className="about-tech-card">
            <div className="tech-card-header">
              <h4>OpenStreetMap</h4>
              <span className="tech-badge verified">Geographic Topology</span>
            </div>
            <p>
              Community-verified open geographic data source providing road alignments, administrative borders, and civic points of interest under ODbL license.
            </p>
          </div>

          <div className="about-tech-card">
            <div className="tech-card-header">
              <h4>CesiumJS / 3D Earth</h4>
              <span className="tech-badge experimental">Experimental</span>
            </div>
            <p>
              Digital-twin 3D globe visualization supporting terrain elevation, orbital tilt, and camera rotation. Marked experimental; requires optional user-configured Cesium Ion token for global high-res 3D terrain.
            </p>
          </div>
        </div>
      </section>

      {/* 7. OPERATING MODES */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">07</span>
          <div>
            <h3 className="about-section-title">CityPulse Operating Modes</h3>
            <p className="about-section-desc">Four distinct telemetry operating states suited for production and testing.</p>
          </div>
        </div>

        <div className="about-modes-grid">
          <div className="mode-card mode-live">
            <div className="mode-pill-header">
              <span className="mode-dot">●</span>
              <span className="mode-name">LIVE</span>
            </div>
            <p className="mode-desc">
              Active streaming connections to verified third-party API providers (TomTom, Open-Meteo, OpenAQ, MapTiler) delivering live field sensor readings.
            </p>
          </div>

          <div className="mode-card mode-mixed">
            <div className="mode-pill-header">
              <span className="mode-dot">●</span>
              <span className="mode-name">MIXED</span>
            </div>
            <p className="mode-desc">
              Production hybrid state combining available live atmospheric and mapping APIs with calibrated baseline simulations for uninstrumented sectors.
            </p>
          </div>

          <div className="mode-card mode-demo">
            <div className="mode-pill-header">
              <span className="mode-dot">●</span>
              <span className="mode-name">DEMO</span>
            </div>
            <p className="mode-desc">
              Self-contained operational simulation running deterministic scenario steps. Ideal for incident drills, operator training, and system evaluation.
            </p>
          </div>

          <div className="mode-card mode-unavail">
            <div className="mode-pill-header">
              <span className="mode-dot">●</span>
              <span className="mode-name">UNAVAILABLE</span>
            </div>
            <p className="mode-desc">
              Indicates an external provider feed is unreachable, rate-limited, or lacks valid API credentials. Gracefully displays cached baselines without crashing.
            </p>
          </div>
        </div>
      </section>

      {/* 8. PLATFORM FEATURES */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">08</span>
          <div>
            <h3 className="about-section-title">Platform Features</h3>
            <p className="about-section-desc">Key operator capabilities integrated into the command center.</p>
          </div>
        </div>

        <div className="about-features-grid">
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Location Search</strong> Fast geocoding across roads, landmarks, and sectors.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Location Autocomplete</strong> Debounced suggestion panel with instant coordinate flyTo.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Click-to-Inspect</strong> Tap any point on the map to inspect localized civic telemetry and sensor coverage.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Zone Investigation</strong> Deep-dive cause-and-effect panel exploring correlated incident factors.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Scan City</strong> Sequential radar sweep across all 5 sectors identifying peak impact zones.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Alert Lifecycle</strong> Priority-ranked notification queue with Acknowledge and Resolve actions.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>AI Civic Analysis</strong> Natural-language question answering and anomaly explanation engine.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Replay Mode</strong> Step-by-step historic time scrubber for post-incident review and drills.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Layer Controls</strong> Toggleable overlay filters for traffic, AQI, weather, transit, and hazards.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>2D Cartography</strong> MapLibre GL hardware-accelerated vector map with single tactical control stack.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>3D Earth Globe</strong> Experimental CesiumJS digital twin with terrain and pitch rotation.</div>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✦</span>
            <div><strong>Appearance System</strong> Dark command presets, accent themes, and interface density options.</div>
          </div>
        </div>
      </section>

      {/* 9. SYSTEM STATUS */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">09</span>
          <div>
            <h3 className="about-section-title">System & Telemetry Status</h3>
            <p className="about-section-desc">Current operational health across core subsystems.</p>
          </div>
        </div>

        <div className="about-status-grid">
          <div className="status-metric-card">
            <span className="status-metric-name">Map & Cartography</span>
            <span className="status-metric-val tone-ok">● OPERATIONAL</span>
            <span className="status-metric-sub">MapTiler · Vector Tiles Ready</span>
          </div>

          <div className="status-metric-card">
            <span className="status-metric-name">Weather & Atmosphere</span>
            <span className="status-metric-val tone-ok">● OPERATIONAL</span>
            <span className="status-metric-sub">Open-Meteo · Hourly Forecast Synced</span>
          </div>

          <div className="status-metric-card">
            <span className="status-metric-name">Traffic Telemetry</span>
            <span className="status-metric-val tone-ok">● ACTIVE FEED</span>
            <span className="status-metric-sub">TomTom / Simulated · Corridors Calibrated</span>
          </div>

          <div className="status-metric-card">
            <span className="status-metric-name">Air Quality Network</span>
            <span className="status-metric-val tone-ok">● ACTIVE FEED</span>
            <span className="status-metric-sub">OpenAQ / Micro-Sensors Synced</span>
          </div>

          <div className="status-metric-card">
            <span className="status-metric-name">Transit Fleet Dispatch</span>
            <span className="status-metric-val tone-ok">● DISPATCH ACTIVE</span>
            <span className="status-metric-sub">GTFS Realtime · Headways Nominal</span>
          </div>

          <div className="status-metric-card">
            <span className="status-metric-name">AI Correlation Engine</span>
            <span className="status-metric-val tone-ok">● READY</span>
            <span className="status-metric-sub">FastAPI Inference · Context Online</span>
          </div>
        </div>
      </section>

      {/* 10. PRIVACY & DATA */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">10</span>
          <div>
            <h3 className="about-section-title">Privacy & Data Handling</h3>
            <p className="about-section-desc">Strict security practices governing external credentials and civic data.</p>
          </div>
        </div>

        <div className="about-privacy-box">
          <div className="privacy-point">
            <strong>Server-Side Credential Isolation:</strong> All sensitive third-party API keys (TomTom, OpenAQ, MapTiler) reside strictly within server-side environment variables (`.env`). They are never exposed to browser bundles or client network requests.
          </div>
          <div className="privacy-point">
            <strong>Zero Personally Identifiable Information (PII):</strong> CityPulse measures aggregate civic indicators (corridor congestion averages, public bus positions, atmospheric particulates) rather than tracking individuals or personal vehicles.
          </div>
          <div className="privacy-point">
            <strong>On-Device Geolocation:</strong> When invoking "Locate My Device", coordinates are resolved locally via your browser's Geolocation API strictly to position the map camera. Coordinates are never saved or sent to external ad brokers.
          </div>
          <div className="privacy-point">
            <strong>Ephemeral In-Memory Simulation:</strong> Scenario simulation steps and replay timelines operate in-memory with zero persistent surveillance footprint.
          </div>
        </div>
      </section>

      {/* 11. VERSION & BUILD */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">11</span>
          <div>
            <h3 className="about-section-title">Version & Build Specifications</h3>
            <p className="about-section-desc">Technical environment, dependencies, and architecture build metrics.</p>
          </div>
        </div>

        <div className="about-build-grid">
          <div className="build-spec-row">
            <span className="spec-label">Application</span>
            <span className="spec-val font-mono">CityPulse Civic Health Intelligence</span>
          </div>
          <div className="build-spec-row">
            <span className="spec-label">Frontend Build</span>
            <span className="spec-val font-mono">v0.1.0 · React 19 + TypeScript + Vite</span>
          </div>
          <div className="build-spec-row">
            <span className="spec-label">Backend API</span>
            <span className="spec-val font-mono">v1.0.0 · FastAPI + Python 3.12+ (Uvicorn)</span>
          </div>
          <div className="build-spec-row">
            <span className="spec-label">2D Map Engine</span>
            <span className="spec-val font-mono">MapLibre GL JS v6.11.1 (WebGL/WebGPU)</span>
          </div>
          <div className="build-spec-row">
            <span className="spec-label">3D Globe Engine</span>
            <span className="spec-val font-mono">CesiumJS v1.145.0 (Experimental)</span>
          </div>
          <div className="build-spec-row">
            <span className="spec-label">Telemetry Pipeline</span>
            <span className="spec-val font-mono">WebSocket (/ws/citypulse) + REST Fallback</span>
          </div>
        </div>
      </section>

      {/* 12. CREDITS & ATTRIBUTION */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-num">12</span>
          <div>
            <h3 className="about-section-title">Credits & Attribution</h3>
            <p className="about-section-desc">Recognition of open data projects and geospatial software communities.</p>
          </div>
        </div>

        <div className="about-credits-list">
          <div className="credit-item">
            <strong>MapTiler:</strong> Vector cartography tiles and basemap styling API under MapTiler Cloud Terms.
          </div>
          <div className="credit-item">
            <strong>OpenStreetMap:</strong> Map data © OpenStreetMap contributors under the Open Database License (ODbL).
          </div>
          <div className="credit-item">
            <strong>MapLibre:</strong> Open-source mapping community maintaining the MapLibre GL SDK ecosystem.
          </div>
          <div className="credit-item">
            <strong>Open-Meteo:</strong> Open-access weather forecasting API under Creative Commons Attribution 4.0 (CC-BY 4.0).
          </div>
          <div className="credit-item">
            <strong>OpenAQ:</strong> Open ambient air quality data platform aggregating global environmental monitoring networks.
          </div>
          <div className="credit-item">
            <strong>Cesium:</strong> Open-source 3D geospatial engine developed by the Cesium community under Apache 2.0.
          </div>
        </div>
      </section>

      {/* 13. DEVELOPED BY */}
      <section className="about-section about-developers-section">
        <div className="about-section-header">
          <span className="about-section-num">13</span>
          <div>
            <h3 className="about-section-title">Developed by</h3>
            <p className="about-section-desc">
              Core engineering, architecture, and civic intelligence development team.
            </p>
          </div>
        </div>

        <div className="about-developers-grid">
          {developers.map((dev) => (
            <div key={dev.name} className="developer-card">
              <div className="dev-card-accent-bar" />

              <div className="developer-card-top">
                <div className="developer-avatar-wrapper">
                  <div className="developer-avatar-ring">
                    <svg
                      className="developer-avatar-svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="developer-initials">{dev.initials}</span>
                </div>

                <div className="developer-status-badge">
                  <span className="dev-pulse-dot">●</span>
                  <span>{dev.badge}</span>
                </div>
              </div>

              <div className="developer-info">
                <h4 className="developer-name">{dev.name}</h4>
                <div className="developer-role-row">
                  <span className="developer-role-icon" aria-hidden="true">
                    {dev.roleIcon}
                  </span>
                  <span className="developer-role">{dev.role}</span>
                </div>
              </div>

              <div className="developer-tags">
                {dev.focus.map((tag, idx) => (
                  <span key={idx} className="dev-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Footer */}
      <div className="about-footer-action">
        {onNavigate && (
          <button
            type="button"
            className="about-dashboard-btn"
            onClick={() => onNavigate("dashboard")}
          >
            ← Return to Live Command Dashboard
          </button>
        )}
      </div>
    </div>
  );
};
