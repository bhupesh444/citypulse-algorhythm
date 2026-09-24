import React from "react";
import { SelectedArea, CitySnapshot } from "../../types/citypulse";

interface CompactZonePopupProps {
  selectedArea: SelectedArea;
  snapshot: CitySnapshot;
  onInspect: () => void;
  onClose: () => void;
}

export const CompactZonePopup: React.FC<CompactZonePopupProps> = ({
  selectedArea,
  snapshot,
  onInspect,
  onClose,
}) => {
  const zoneTraffic =
    snapshot.traffic.find(
      (t) => t.zone.toLowerCase() === selectedArea.zone.toLowerCase()
    ) ?? snapshot.traffic[0];

  const zoneTransit =
    snapshot.transit.find(
      (t) => t.zone.toLowerCase() === selectedArea.zone.toLowerCase()
    ) ?? snapshot.transit[0];

  const traffic = selectedArea.traffic ?? zoneTraffic?.congestion ?? 0;
  const transitDelay = Math.round(selectedArea.transitDelay ?? zoneTransit?.delay_minutes ?? 0);
  const risk = selectedArea.riskScore ?? snapshot.risk.score;

  return (
    <div className="compact-zone-popover" onClick={(e) => e.stopPropagation()}>
      <div className="popover-header">
        <span className="popover-title">{selectedArea.zone.toUpperCase()}</span>
        <button className="popover-close-btn" onClick={onClose} aria-label="Close popover">
          ×
        </button>
      </div>

      <div className="popover-metrics">
        <div className="popover-metric-row">
          <span className="label">Risk</span>
          <span className="value risk-val">{risk}</span>
        </div>
        <div className="popover-metric-row">
          <span className="label">Traffic</span>
          <span className="value">{traffic}%</span>
        </div>
        <div className="popover-metric-row">
          <span className="label">Transit</span>
          <span className="value">+{transitDelay} min</span>
        </div>
      </div>

      <button className="popover-inspect-btn" onClick={onInspect}>
        Inspect Zone →
      </button>
    </div>
  );
};
