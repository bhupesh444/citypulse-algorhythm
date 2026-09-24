import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

type TimeRange = "1H" | "6H" | "24H" | "7D" | "30D";

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<string>("traffic_congestion");

  useEffect(() => {
    setLoading(true);
    api
      .getAnalytics(timeRange)
      .then((res) => setData(res))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [timeRange]);

  const metrics = [
    { key: "traffic_congestion", label: "Traffic", fullLabel: "Traffic Congestion", unit: "%", color: "#efbc70" },
    { key: "average_speed", label: "Speed", fullLabel: "Average Speed", unit: "km/h", color: "#7dd9c1" },
    { key: "aqi", label: "AQI", fullLabel: "Air Quality Index", unit: "AQI", color: "#ef7f68" },
    { key: "pm2_5", label: "PM2.5", fullLabel: "PM2.5 Particulate", unit: "µg/m³", color: "#f2cf95" },
    { key: "temperature", label: "Temperature", fullLabel: "Ambient Temperature", unit: "°C", color: "#72b9e8" },
    { key: "transit_delay", label: "Transit", fullLabel: "Transit Delay", unit: "min", color: "#d97dd9" },
    { key: "risk_score", label: "Risk", fullLabel: "Civic Risk Score", unit: "/100", color: "#ef7f68" },
  ];

  const currentMetricObj = metrics.find((m) => m.key === activeMetric) || metrics[0];
  const currentMetricData = data ? data[activeMetric] : null;

  // Maximum 6 summary cards at top
  const topMetricCards = metrics.slice(0, 6);

  return (
    <div className="analytics-page-container">
      {/* Header and Time Range Selector */}
      <div className="analytics-header">
        <div>
          <span className="page-eyebrow">HISTORICAL & LONGITUDINAL CIVIC TELEMETRY</span>
          <h2 className="page-title">Analytics</h2>
        </div>

        <div className="time-range-bar">
          {(["1H", "6H", "24H", "7D", "30D"] as TimeRange[]).map((tr) => (
            <button
              key={tr}
              className={`range-pill ${timeRange === tr ? "is-active" : ""}`}
              onClick={() => setTimeRange(tr)}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* 5-6 Key Metric Cards Maximum */}
      <div className="analytics-metric-grid">
        {topMetricCards.map((m) => {
          const item = data ? data[m.key] : null;
          const summary = item?.summary;
          const isSelected = activeMetric === m.key;
          const isPos = summary?.change_pct > 0;

          return (
            <div
              key={m.key}
              className={`analytics-summary-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => setActiveMetric(m.key)}
            >
              <div className="card-top">
                <span className="card-label">{m.label.toUpperCase()}</span>
                <span className="unit-label">{m.unit}</span>
              </div>
              <strong className="card-value" style={{ color: m.color }}>
                {loading ? "…" : `${summary?.current ?? 0}`}
              </strong>
              <div className="card-bottom">
                <span className={`delta-tag ${isPos ? "up" : "down"}`}>
                  {isPos ? "+" : ""}{summary?.change_pct ?? 0}%
                </span>
                <small>vs prior {timeRange}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metric Switcher & One Prominent Chart */}
      <div className="analytics-chart-panel">
        <div className="chart-panel-heading">
          <div>
            <span className="chart-panel-eyebrow">SELECT TELEMETRY METRIC</span>
            <div className="metric-pills-row">
              {metrics.map((m) => (
                <button
                  key={m.key}
                  className={`metric-select-pill ${activeMetric === m.key ? "is-active" : ""}`}
                  onClick={() => setActiveMetric(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-current-stat">
            <span className="current-stat-label">CURRENT {currentMetricObj.label.toUpperCase()}</span>
            <strong className="current-stat-val" style={{ color: currentMetricObj.color }}>
              {currentMetricData?.summary?.current ?? "0"} {currentMetricObj.unit}
            </strong>
          </div>
        </div>

        <div className="svg-chart-wrapper">
          {loading || !currentMetricData ? (
            <div className="chart-loading">Streaming timeseries telemetry...</div>
          ) : (
            <SvgTimeSeriesChart
              timestamps={data?.timestamps || []}
              values={currentMetricData?.series || []}
              color={currentMetricObj.color}
              unit={currentMetricObj.unit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface SvgTimeSeriesChartProps {
  timestamps: string[];
  values: number[];
  color: string;
  unit: string;
}

const SvgTimeSeriesChart: React.FC<SvgTimeSeriesChartProps> = ({
  timestamps,
  values,
  color,
  unit,
}) => {
  if (!values.length) return null;

  const width = 850;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal === minVal ? 1 : maxVal - minVal;

  const points = values.map((val, i) => {
    const x = padding.left + (i / Math.max(values.length - 1, 1)) * (width - padding.left - padding.right);
    const y = height - padding.bottom - ((val - minVal) / valRange) * (height - padding.top - padding.bottom);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="timeseries-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
        const y = padding.top + pct * (height - padding.top - padding.bottom);
        const val = Math.round(maxVal - pct * valRange);
        return (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#1b2a32"
              strokeDasharray="3 3"
            />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#648589" fontSize="10">
              {val}
            </text>
          </g>
        );
      })}

      {/* Area Fill & Main Line */}
      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Value Data Points */}
      {points.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r="3"
          fill={color}
          stroke="#0b171c"
          strokeWidth="1.5"
        />
      ))}

      {/* Time Labels */}
      {timestamps.length > 0 &&
        [0, Math.floor(timestamps.length / 2), timestamps.length - 1].map((idx) => {
          const t = timestamps[idx];
          if (!t) return null;
          const x = padding.left + (idx / (timestamps.length - 1)) * (width - padding.left - padding.right);
          const timeStr = new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return (
            <text
              key={idx}
              x={x}
              y={height - 12}
              textAnchor={idx === 0 ? "start" : idx === timestamps.length - 1 ? "end" : "middle"}
              fill="#648589"
              fontSize="10"
            >
              {timeStr}
            </text>
          );
        })}
    </svg>
  );
};
