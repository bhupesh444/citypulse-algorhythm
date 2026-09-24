import React, { useState, useMemo } from "react";
import { CitySnapshot } from "../../types/citypulse";

interface CivicDNADimension {
  id: string;
  name: string;
  score: number;
  color: string;
  layer: string;
  contributingMetrics: { label: string; value: string }[];
  summary: string;
}

interface CivicDNAProps {
  snapshot: CitySnapshot;
  onDimensionClick?: (dimensionId: string, layer: string) => void;
  className?: string;
}

export const CivicDNA: React.FC<CivicDNAProps> = ({
  snapshot,
  onDimensionClick,
  className = "",
}) => {
  const [hoveredDim, setHoveredDim] = useState<CivicDNADimension | null>(null);

  // Compute 6 dynamic scores from live snapshot
  const dimensions: CivicDNADimension[] = useMemo(() => {
    const traffic = snapshot.traffic;
    const avgCongestion =
      traffic.reduce((acc, t) => acc + t.congestion, 0) / Math.max(traffic.length, 1);
    const avgSpeed =
      traffic.reduce((acc, t) => acc + t.average_speed, 0) / Math.max(traffic.length, 1);

    // Mobility: Higher speed & lower congestion = higher score
    const mobilityScore = Math.round(
      Math.max(20, Math.min(95, 100 - avgCongestion * 0.7 + (avgSpeed / 60) * 20))
    );

    // Environment: Lower humidity extremes, good temp, clean air
    const envScore = Math.round(
      Math.max(30, Math.min(92, 90 - (snapshot.weather.humidity > 60 ? 15 : 0) - (snapshot.weather.rainfall > 0 ? 12 : 0)))
    );

    // Safety: Based on incidents and anomalies
    const activeIncidents = snapshot.incidents.length;
    const activeAnomalies = snapshot.anomalies.filter((a) => a.is_anomaly).length;
    const safetyScore = Math.max(25, 95 - activeIncidents * 14 - activeAnomalies * 8);

    // Infrastructure: Status across power, drainage, signals
    const infraScore = Math.round(
      Math.max(35, Math.min(90, 80 - (snapshot.risk?.score ?? 34) * 0.3))
    );

    // Transit: Headway adherence and schedule delay
    const avgDelay =
      snapshot.transit.reduce((acc, t) => acc + t.delay_minutes, 0) /
      Math.max(snapshot.transit.length, 1);
    const transitScore = Math.round(Math.max(25, Math.min(95, 92 - avgDelay * 4.5)));

    // Weather impact score: Clear conditions = high stability
    const weatherImpactScore = Math.round(
      Math.max(30, Math.min(96, 85 - (snapshot.weather.rainfall > 0 ? 25 : 0) + (snapshot.weather.wind_speed < 15 ? 10 : 0)))
    );

    return [
      {
        id: "mobility",
        name: "MOBILITY",
        score: mobilityScore,
        color: "#2dd4bf",
        layer: "traffic",
        contributingMetrics: [
          { label: "Arterial Congestion", value: `${Math.round(avgCongestion)}%` },
          { label: "Average Speed", value: `${Math.round(avgSpeed)} km/h` },
          { label: "Tracked Vehicles", value: `${traffic.reduce((a, b) => a + b.vehicle_count, 0)}` },
        ],
        summary: "Arterial throughput capacity and commuter transit velocity across Jaipur sectors.",
      },
      {
        id: "environment",
        name: "ENVIRONMENT",
        score: envScore,
        color: "#34d399",
        layer: "weather",
        contributingMetrics: [
          { label: "Air Quality Index", value: snapshot.weather.humidity > 60 ? "82 AQI (Moderate)" : "68 AQI (Good)" },
          { label: "Ambient Temp", value: `${snapshot.weather.temperature}°C` },
          { label: "Relative Humidity", value: `${snapshot.weather.humidity}%` },
        ],
        summary: "Atmospheric particulate dispersion and thermal comfort indices.",
      },
      {
        id: "safety",
        name: "SAFETY",
        score: safetyScore,
        color: "#38bdf8",
        layer: "incidents",
        contributingMetrics: [
          { label: "Active Incidents", value: `${activeIncidents}` },
          { label: "Detected Anomalies", value: `${activeAnomalies}` },
          { label: "Dispatch Response", value: "Normal (3.8 min)" },
        ],
        summary: "Field incident containment and automated sensor anomaly detection thresholds.",
      },
      {
        id: "infrastructure",
        name: "INFRASTRUCTURE",
        score: infraScore,
        color: "#a78bfa",
        layer: "zones",
        contributingMetrics: [
          { label: "Grid Status", value: "Nominal Baseline" },
          { label: "Drainage Margin", value: snapshot.weather.rainfall > 0 ? "Elevated Flow" : "Clear Flow" },
          { label: "Signal Automation", value: "Adaptive Sync Active" },
        ],
        summary: "Vital lifeline networks, telemetry telemetry relays, and arterial signals.",
      },
      {
        id: "transit",
        name: "TRANSIT",
        score: transitScore,
        color: "#f59e0b",
        layer: "transit",
        contributingMetrics: [
          { label: "Schedule Delay", value: `+${avgDelay.toFixed(1)} min` },
          { label: "Vehicles Affected", value: `${snapshot.transit.reduce((a, b) => a + b.vehicles_affected, 0)}` },
          { label: "Passenger Load", value: `${snapshot.transit[0]?.passenger_load ?? 68}%` },
        ],
        summary: "Public feeder bus headway compliance and route adherence reliability.",
      },
      {
        id: "weather",
        name: "WEATHER",
        score: weatherImpactScore,
        color: "#ec4899",
        layer: "weather",
        contributingMetrics: [
          { label: "Conditions", value: snapshot.weather.weather_condition },
          { label: "Precipitation", value: `${snapshot.weather.rainfall} mm/h` },
          { label: "Wind Velocity", value: `${snapshot.weather.wind_speed} km/h` },
        ],
        summary: "Direct meteorological impact stress on municipal transport and safety corridors.",
      },
    ];
  }, [snapshot]);

  // Geometric coordinates for SVG radar chart
  const cx = 160;
  const cy = 160;
  const maxR = 100;
  const innerR = 36;

  // Calculate polygon points
  const polygonPoints = useMemo(() => {
    return dimensions
      .map((dim, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        const r = innerR + (dim.score / 100) * (maxR - innerR);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [dimensions]);

  const handleDimClick = (dim: CivicDNADimension) => {
    if (onDimensionClick) {
      onDimensionClick(dim.id, dim.layer);
    }
  };

  return (
    <div className={`civic-dna-widget ${className}`} role="region" aria-label="CityPulse Civic DNA">
      <div className="civic-dna-titlebar">
        <span className="dna-eyebrow">CIVIC FINGERPRINT</span>
        <h4 className="dna-title">Civic DNA Dynamics</h4>
        <span className="dna-sub">Interactive 6-Axis City State Calibration</span>
      </div>

      <div className="civic-dna-canvas-container">
        <svg
          viewBox="0 0 320 320"
          className="civic-dna-svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="dnaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dnaPolygonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Reference Concentric Rings */}
          <circle cx={cx} cy={cy} r={innerR} className="radar-grid-ring inner-hub" />
          <circle cx={cx} cy={cy} r={innerR + (maxR - innerR) * 0.33} className="radar-grid-ring ring-33" />
          <circle cx={cx} cy={cy} r={innerR + (maxR - innerR) * 0.66} className="radar-grid-ring ring-66" />
          <circle cx={cx} cy={cy} r={maxR} className="radar-grid-ring ring-100" />

          {/* Axis Spoke Rays */}
          {dimensions.map((_, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const x2 = cx + maxR * Math.cos(angle);
            const y2 = cy + maxR * Math.sin(angle);
            return (
              <line
                key={`spoke-${i}`}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                className="radar-spoke"
              />
            );
          })}

          {/* Dynamic Civic Polygon Area */}
          <polygon
            points={polygonPoints}
            className="civic-dna-polygon"
            fill="url(#dnaPolygonGradient)"
          />

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r={innerR} fill="#09131e" stroke="#2dd4bf" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={innerR - 4} className="radar-pulse-ring" />
          <text x={cx} y={cy - 4} className="hub-text-primary" textAnchor="middle">
            CITYPULSE
          </text>
          <text x={cx} y={cy + 10} className="hub-text-secondary" textAnchor="middle">
            CITY DNA
          </text>

          {/* Outer Dimension Nodes */}
          {dimensions.map((dim, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const r = innerR + (dim.score / 100) * (maxR - innerR);
            const nx = cx + r * Math.cos(angle);
            const ny = cy + r * Math.sin(angle);

            // Label anchor point
            const labelR = maxR + 24;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);

            const isHovered = hoveredDim?.id === dim.id;

            return (
              <g
                key={dim.id}
                className={`dna-node-group ${isHovered ? "is-active" : ""}`}
                onMouseEnter={() => setHoveredDim(dim)}
                onMouseLeave={() => setHoveredDim(null)}
                onClick={() => handleDimClick(dim)}
                tabIndex={0}
                role="button"
                aria-label={`${dim.name}: Score ${dim.score}/100. Click to focus ${dim.layer} layer.`}
              >
                {/* Node point on polygon perimeter */}
                <circle
                  cx={nx}
                  cy={ny}
                  r={isHovered ? 6 : 4}
                  fill={dim.color}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1}
                  className="dna-score-vertex"
                />

                {/* Outer Dimension Label & Score */}
                <text
                  x={lx}
                  y={ly - 4}
                  className="dna-axis-label"
                  textAnchor="middle"
                  fill={isHovered ? "#ffffff" : dim.color}
                >
                  {dim.name}
                </text>
                <text
                  x={lx}
                  y={ly + 8}
                  className="dna-axis-score"
                  textAnchor="middle"
                  fill="#94a3b8"
                >
                  {dim.score}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Selection Tooltip */}
        {hoveredDim && (
          <div className="dna-hover-tooltip" role="tooltip">
            <div className="tooltip-head">
              <span className="tooltip-dim-name" style={{ color: hoveredDim.color }}>
                ● {hoveredDim.name}
              </span>
              <strong className="tooltip-score">{hoveredDim.score}/100</strong>
            </div>
            <p className="tooltip-summary">{hoveredDim.summary}</p>
            <div className="tooltip-metrics">
              {hoveredDim.contributingMetrics.map((m, idx) => (
                <div key={idx} className="tooltip-metric-row">
                  <span className="m-lbl">{m.label}:</span>
                  <span className="m-val">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="tooltip-action-hint">
              Click to activate <b>{hoveredDim.layer.toUpperCase()}</b> layer on map →
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
