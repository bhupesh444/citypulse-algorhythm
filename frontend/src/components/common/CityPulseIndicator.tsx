import React from "react";
import { CitySnapshot } from "../../types/citypulse";

interface CityPulseIndicatorProps {
  snapshot?: CitySnapshot;
  riskLevel?: string;
  riskScore?: number;
  className?: string;
}

export const CityPulseIndicator: React.FC<CityPulseIndicatorProps> = ({
  snapshot,
  riskLevel,
  riskScore: customScore,
  className = "",
}) => {
  const riskScore = customScore ?? snapshot?.risk?.score ?? 34;
  const isCritical =
    riskLevel === "critical" ||
    riskScore >= 75 ||
    Boolean(snapshot?.incidents.some((i) => i.severity === "high" || i.severity === "critical"));
  const isElevated = (riskLevel === "elevated" || riskLevel === "high" || riskScore >= 50) && !isCritical;

  const stateClass = isCritical ? "pulse-critical" : isElevated ? "pulse-elevated" : "pulse-normal";
  const stateLabel = isCritical ? "CRITICAL RISK" : isElevated ? "ELEVATED RISK" : "NOMINAL RHYTHM";

  return (
    <div
      className={`citypulse-brand-indicator ${stateClass} ${className}`}
      title={`CityPulse Rhythm: ${stateLabel} (Composite Risk ${riskScore}/100)`}
      aria-label={`CityPulse Rhythm: ${stateLabel}`}
    >
      <div className="pulse-track" aria-hidden="true">
        <span className="pulse-node node-1" />
        <span className="pulse-segment seg-1" />
        <span className="pulse-node node-2" />
        <span className="pulse-segment seg-2" />
        <span className="pulse-node node-3" />
        <span className="pulse-segment seg-3" />
        <span className="pulse-node node-4" />
      </div>
      <span className="pulse-state-tag">{stateLabel}</span>
    </div>
  );
};
