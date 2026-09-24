import React, { useState } from "react";
import { CitySnapshot, SelectedArea } from "../../types/citypulse";

interface ImpactChainProps {
  snapshot: CitySnapshot;
  selectedArea?: SelectedArea | null;
  onSelectStage?: (stageId: string, layerToActivate?: string) => void;
}

export interface ImpactStage {
  id: string;
  name: string;
  category: string;
  status: "nominal" | "warning" | "critical";
  measurement: string;
  detail: string;
  source: string;
  observedTime: string;
  layer: string;
}

export const ImpactChain: React.FC<ImpactChainProps> = ({
  snapshot,
  selectedArea,
  onSelectStage,
}) => {
  const [activeStageId, setActiveStageId] = useState<string>("weather");

  const weather = snapshot.weather;
  const central = snapshot.traffic[0];
  const currentZone = selectedArea?.zone || central?.zone || "Central";
  const zTraffic =
    snapshot.traffic.find((t) => t.zone.toLowerCase() === currentZone.toLowerCase()) ?? central;
  const zTransit =
    snapshot.transit.find((t) => t.zone.toLowerCase() === currentZone.toLowerCase()) ??
    snapshot.transit[0];
  const risk = snapshot.risk;

  // Build real data-grounded stages
  const isPrecip = (weather.rainfall ?? 0) > 0 || weather.weather_condition.toLowerCase().includes("rain");
  const rainText = isPrecip ? `${weather.rainfall} mm/h Precip` : `${weather.weather_condition} (${weather.temperature}°C)`;

  const waterRiskLevel = isPrecip ? "warning" : "nominal";
  const waterRiskText = isPrecip ? "Surface Water Accumulation on Arterials" : "Nominal Drainage & Runoff Margin";

  const trafficCongestion = selectedArea?.traffic ?? zTraffic?.congestion ?? 68;
  const trafficStatus = trafficCongestion > 75 ? "critical" : trafficCongestion > 50 ? "warning" : "nominal";
  const trafficText = `${trafficCongestion}% Congestion (${Math.round(zTraffic?.average_speed ?? 36)} km/h)`;

  const transitDelay = Math.round(selectedArea?.transitDelay ?? zTransit?.delay_minutes ?? 8);
  const transitStatus = transitDelay > 10 ? "critical" : transitDelay > 4 ? "warning" : "nominal";
  const transitText = `+${transitDelay} min feeder schedule deviation`;

  const riskScore = selectedArea?.riskScore ?? risk?.score ?? 48;
  const riskStatus = riskScore >= 75 ? "critical" : riskScore >= 50 ? "warning" : "nominal";
  const riskText = `Civic Risk Index ${riskScore} / 100 (${risk.level.toUpperCase()})`;

  const stages: ImpactStage[] = [
    {
      id: "weather",
      name: isPrecip ? "PRECIPITATION EVENT" : "ATMOSPHERIC CONDITIONS",
      category: "METEOROLOGICAL TRIGGER",
      status: isPrecip ? "warning" : "nominal",
      measurement: rainText,
      detail: `Relative humidity at ${weather.humidity}%, wind ${weather.wind_speed} km/h under ${weather.weather_condition} sky.`,
      source: weather.source_name || "Open-Meteo Atmospheric Telemetry",
      observedTime: new Date(weather.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      layer: "weather",
    },
    {
      id: "water_risk",
      name: "SURFACE DRAINAGE",
      category: "HYDROLOGICAL MARGIN",
      status: waterRiskLevel,
      measurement: waterRiskText,
      detail: isPrecip
        ? "Localized arterial drainage constrictions detected near primary transit intersections."
        : "Culverts and storm drains operating within designed baseline flow margins.",
      source: "Municipal Drainage Sensors (Simulated)",
      observedTime: "Just now",
      layer: "environment",
    },
    {
      id: "traffic",
      name: "ARTERIAL FLOW",
      category: "MOBILITY IMPEDANCE",
      status: trafficStatus,
      measurement: trafficText,
      detail: `Corridor speeds restricted across ${currentZone} sector with ${zTraffic?.vehicle_count ?? 920} active detected vehicles.`,
      source: zTraffic?.source_name || "TomTom Traffic / Telemetry",
      observedTime: new Date(zTraffic?.timestamp ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      layer: "traffic",
    },
    {
      id: "transit",
      name: "TRANSIT DISPATCH",
      category: "PUBLIC CORRIDOR ADHERENCE",
      status: transitStatus,
      measurement: transitText,
      detail: `Feeder routes experiencing headway dilation with ${zTransit?.vehicles_affected ?? 2} vehicles impacted.`,
      source: zTransit?.source_name || "GTFS-Realtime Connector",
      observedTime: new Date(zTransit?.timestamp ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      layer: "transit",
    },
    {
      id: "risk",
      name: "CIVIC RISK INDEX",
      category: "COMPOSITE SYSTEM STATE",
      status: riskStatus,
      measurement: riskText,
      detail: "Multi-factor civic risk aggregation weighted across mobility, environmental, and infrastructure telemetry.",
      source: "CityPulse Correlation Engine",
      observedTime: "Continuous Calibrated",
      layer: "zones",
    },
  ];

  const handleStageClick = (stage: ImpactStage) => {
    setActiveStageId(stage.id);
    if (onSelectStage) {
      onSelectStage(stage.id, stage.layer);
    }
  };

  const selectedStage = stages.find((s) => s.id === activeStageId) || stages[0];

  return (
    <div className="impact-chain-container" aria-label="City Impact Propagation Chain">
      <div className="impact-chain-header">
        <span className="chain-eyebrow">PROPAGATION DYNAMICS</span>
        <h4 className="chain-title">Weather → City Impact Chain</h4>
        <span className="chain-disclaimer">
          * Observed correlation & potential contributing factors (non-causal inference)
        </span>
      </div>

      {/* Visual Chain Nodes */}
      <div className="impact-chain-track" role="list">
        {stages.map((stage, idx) => {
          const isSelected = stage.id === activeStageId;
          return (
            <React.Fragment key={stage.id}>
              <div
                className={`impact-node status-${stage.status} ${isSelected ? "is-selected" : ""}`}
                role="listitem"
                tabIndex={0}
                onClick={() => handleStageClick(stage)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStageClick(stage);
                  }
                }}
                title={`Click to inspect ${stage.name} and focus ${stage.layer} map layer`}
              >
                <div className="node-indicator">
                  <span className="node-dot" />
                  <span className="node-order">{idx + 1}</span>
                </div>
                <div className="node-text">
                  <span className="node-category">{stage.category}</span>
                  <strong className="node-name">{stage.name}</strong>
                  <span className="node-measurement">{stage.measurement}</span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="impact-connector" aria-hidden="true">
                  <div className="connector-line" />
                  <span className="connector-arrow">↓</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      {selectedStage && (
        <div className="impact-stage-detail-card" role="region" aria-label="Stage Telemetry Details">
          <div className="stage-detail-header">
            <span className="detail-tag">{selectedStage.category}</span>
            <span className={`status-pill pill-${selectedStage.status}`}>
              ● {selectedStage.status.toUpperCase()}
            </span>
          </div>
          <h5 className="detail-headline">{selectedStage.name}</h5>
          <p className="detail-desc">{selectedStage.detail}</p>
          <div className="detail-provenance">
            <span>Source: <b>{selectedStage.source}</b></span>
            <span>Observed: <b>{selectedStage.observedTime}</b></span>
            <span>Mode: <b>{snapshot.data_mode || "DEMO DATA"}</b></span>
          </div>
        </div>
      )}
    </div>
  );
};
