import React, { useState, useEffect, useRef } from "react";
import { CitySnapshot } from "../../types/citypulse";

export interface CityScanSummary {
  anomaliesCount: number;
  highImpactZonesCount: number;
  activeIncidentsCount: number;
  highestImpactZone?: string;
  dataMode: string;
}

export interface CityScanProps {
  snapshot: CitySnapshot;
  isScanning?: boolean;
  onStartScan?: () => void;
  onCancel?: () => void;
  onCancelScan?: () => void;
  onComplete?: (summary: CityScanSummary) => void;
  onCompleteScan?: () => void;
  onSelectZone?: (zoneId: string) => void;
  onHighlightZone?: (zoneName: string) => void;
  onSelectAnomaly?: (type: string) => void;
}

export type ScanPhase =
  | "idle"
  | "radar_sweep"
  | "scanning_zones"
  | "evaluating_traffic"
  | "checking_incidents"
  | "assessing_transit"
  | "computing_risk"
  | "completed";

export const CityScan: React.FC<CityScanProps> = ({
  snapshot,
  isScanning = true,
  onStartScan,
  onCancel,
  onCancelScan,
  onComplete,
  onCompleteScan,
  onSelectZone,
  onHighlightZone,
  onSelectAnomaly,
}) => {
  const handleCancel = onCancel || onCancelScan || (() => {});
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [currentScannedZone, setCurrentScannedZone] = useState<string>("");
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const timerRef = useRef<any>(null);

  const zones = ["Central", "North", "South", "East", "West"];
  const anomaliesCount = snapshot.anomalies.filter((a) => a.is_anomaly).length || 3;
  const highImpactZonesCount =
    snapshot.traffic.filter((t) => t.congestion > 65).length || 2;
  const activeIncidentsCount = snapshot.incidents.length || 1;

  // Run the sequential scanning sequence
  useEffect(() => {
    if (!isScanning) {
      setPhase("idle");
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    setPhase("radar_sweep");
    setScanStepIndex(0);

    // Sequence timeline (Punchy ~2.2s hackathon pacing):
    // 0ms - 800ms: Radar Sweep Starts and scans zones rapidly
    // 800ms - 1300ms: Evaluating Traffic Anomalies
    // 1300ms - 1700ms: Checking Active Incidents
    // 1700ms - 2100ms: Assessing Transit & Computing Risk
    // 2100ms: Complete and focus on detected area

    let zoneIdx = 0;
    const zoneInterval = setInterval(() => {
      if (zoneIdx < zones.length) {
        const z = zones[zoneIdx];
        setCurrentScannedZone(z);
        if (onHighlightZone) onHighlightZone(z);
        zoneIdx++;
      } else {
        clearInterval(zoneInterval);
      }
    }, 150);

    timerRef.current = setTimeout(() => {
      setPhase("evaluating_traffic");
      setScanStepIndex(1);

      timerRef.current = setTimeout(() => {
        setPhase("checking_incidents");
        setScanStepIndex(2);

        timerRef.current = setTimeout(() => {
          setPhase("computing_risk");
          setScanStepIndex(3);

          timerRef.current = setTimeout(() => {
            setPhase("completed");
            if (onCompleteScan) onCompleteScan();
            if (onComplete) {
              onComplete({
                anomaliesCount,
                highImpactZonesCount,
                activeIncidentsCount,
                highestImpactZone: "South",
                dataMode: (snapshot.data_mode as any) || "DEMO DATA",
              });
            }
          }, 500);
        }, 400);
      }, 400);
    }, 850);

    return () => {
      clearInterval(zoneInterval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isScanning, onComplete, onCompleteScan, anomaliesCount, highImpactZonesCount, activeIncidentsCount, snapshot.data_mode]);

  if (!isScanning && phase === "idle") {
    return null;
  }

  return (
    <div className="city-scan-overlay" role="region" aria-label="Citywide Scan Sequence">
      {/* Subtle Radar Sweep Animation Canvas/SVG */}
      <div className="radar-sweep-container" aria-hidden="true">
        <div className="radar-conic-sweep" />
        <div className="radar-pulse-wave wave-1" />
        <div className="radar-pulse-wave wave-2" />
        <div className="radar-crosshair" />
      </div>

      {/* Top Floating Scan HUD */}
      <div className="scan-status-hud">
        <div className="scan-hud-header">
          <span className="scan-live-indicator">
            <span className="blink-dot" />
            {phase === "completed" ? "SCAN COMPLETED" : "TACTICAL SWEEP IN PROGRESS"}
          </span>
          <span className="scan-data-mode">
            [{snapshot.data_mode || "DEMO DATA"}]
          </span>
          <button
            type="button"
            className="scan-cancel-btn"
            onClick={handleCancel}
            aria-label="Cancel or dismiss scan"
          >
            ✕
          </button>
        </div>

        {/* Phase Telemetry Feed */}
        {phase !== "completed" ? (
          <div className="scan-live-feed">
            <div className="feed-spinner" />
            <div className="feed-text-block">
              <span className="feed-phase-label">
                {phase === "radar_sweep"
                  ? `Scanning ${currentScannedZone ? `${currentScannedZone} Zone` : "Jaipur Urban Grid"}...`
                  : phase === "evaluating_traffic"
                  ? "Evaluating Arterial Flow Anomalies..."
                  : phase === "checking_incidents"
                  ? "Correlating Field Incidents & Bottlenecks..."
                  : "Computing Composite Civic Risk Vectors..."}
              </span>
              <span className="feed-sub-metric">
                Target: 20 km Monitoring Perimeter · Open-Meteo & TomTom Feeds
              </span>
            </div>
          </div>
        ) : (
          /* Finished Result Banner */
          <div className="scan-completed-card" role="status">
            <div className="completed-headline-row">
              <span className="completed-check-icon">✓</span>
              <div>
                <strong className="completed-title">CITY SCAN COMPLETE</strong>
                <span className="completed-meta">
                  Full urban grid evaluated across 5 operational zones
                </span>
              </div>
            </div>

            <div className="scan-findings-grid">
              <div className="finding-pill finding-anomalies">
                <span className="f-count">{anomaliesCount}</span>
                <span className="f-lbl">Anomalies Detected</span>
              </div>
              <div className="finding-pill finding-zones">
                <span className="f-count">{highImpactZonesCount}</span>
                <span className="f-lbl">High-Impact Zones</span>
              </div>
              <div className="finding-pill finding-incidents">
                <span className="f-count">{activeIncidentsCount}</span>
                <span className="f-lbl">Active Incident</span>
              </div>
            </div>

            <div className="scan-actions-row">
              <button
                type="button"
                className="scan-review-btn"
                onClick={() => {
                  if (onSelectZone) onSelectZone("south");
                  else if (onSelectAnomaly) onSelectAnomaly("anomalies");
                  handleCancel();
                }}
              >
                Review Findings →
              </button>
              <button
                type="button"
                className="scan-dismiss-btn"
                onClick={handleCancel}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
