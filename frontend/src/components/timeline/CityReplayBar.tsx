import React, { useEffect, useState } from "react";

interface CityReplayBarProps {
  currentStep: number;
  totalSteps?: number;
  isPlaying: boolean;
  onStepChange: (step: number) => void;
  onTogglePlay: () => void;
}

export const CityReplayBar: React.FC<CityReplayBarProps> = ({
  currentStep,
  totalSteps = 12,
  isPlaying,
  onStepChange,
  onTogglePlay,
}) => {
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(2400 / speed);
    const timer = setInterval(() => {
      onStepChange((currentStep + 1) % totalSteps);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, speed, totalSteps, onStepChange]);

  // Requirement 6 temporal timeline: 12:00, 12:05, 12:10, 12:15 ... 01:00 PM
  const timeSteps = [
    { time: "12:00 PM", date: "24 Sep 2026", phase: "Baseline Flow", status: "Nominal" },
    { time: "12:05 PM", date: "24 Sep 2026", phase: "Precipitation Onset", status: "Low Risk" },
    { time: "12:10 PM", date: "24 Sep 2026", phase: "Surface Water Accumulation", status: "Moderate" },
    { time: "12:15 PM", date: "24 Sep 2026", phase: "Arterial Deceleration", status: "Moderate" },
    { time: "12:20 PM", date: "24 Sep 2026", phase: "Central Bottleneck", status: "High Risk" },
    { time: "12:25 PM", date: "24 Sep 2026", phase: "Feeder Bus Delay Surge", status: "High Risk" },
    { time: "12:30 PM", date: "24 Sep 2026", phase: "Incident on MI Road", status: "Critical" },
    { time: "12:35 PM", date: "24 Sep 2026", phase: "Peak Cascading Propagation", status: "Critical" },
    { time: "12:40 PM", date: "24 Sep 2026", phase: "Tactical Response Deployed", status: "High Risk" },
    { time: "12:45 PM", date: "24 Sep 2026", phase: "Drainage Pumps Operational", status: "Moderate" },
    { time: "12:50 PM", date: "24 Sep 2026", phase: "Corridor Flow Restored", status: "Low Risk" },
    { time: "01:00 PM", date: "24 Sep 2026", phase: "Operational Stabilization", status: "Nominal" },
  ];

  const currentInfo = timeSteps[currentStep] || timeSteps[0];

  return (
    <div className="city-replay-bar floating-panel">
      <div className="replay-controls-left">
        <button
          className={`replay-play-btn ${isPlaying ? "playing" : ""}`}
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause replay" : "Play replay"}
          title={isPlaying ? "Pause timeline replay" : "Start timeline replay"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        <button
          className="replay-step-btn"
          onClick={() => onStepChange((currentStep - 1 + totalSteps) % totalSteps)}
          aria-label="Step back 5m"
          title="Step back 5 minutes"
        >
          ⏮
        </button>

        <button
          className="replay-step-btn"
          onClick={() => onStepChange((currentStep + 1) % totalSteps)}
          aria-label="Step forward 5m"
          title="Step forward 5 minutes"
        >
          ⏭
        </button>

        <div className="replay-speed-toggle" title="Replay Speed">
          {([1, 2, 4] as const).map((s) => (
            <button
              key={s}
              className={`speed-btn ${speed === s ? "is-active" : ""}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="replay-timeline-center">
        <div className="timeline-info-row">
          <div className="timeline-stamp-box">
            <span className="replay-mode-tag">REPLAY MODE</span>
            <span className="replay-date-label">{currentInfo.date}</span>
            <span className="replay-time-highlight">{currentInfo.time}</span>
          </div>
          <span className="timeline-current-label">
            {currentInfo.phase} · <b className={`replay-risk-${currentInfo.status.toLowerCase().replace(" ", "-")}`}>{currentInfo.status}</b>
          </span>
        </div>

        <div className="timeline-slider-track">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStep}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="timeline-slider"
          />
          <div className="timeline-ticks">
            {timeSteps.slice(0, totalSteps).map((stepItem, i) => (
              <span
                key={i}
                className={`tick ${i === currentStep ? "active" : i < currentStep ? "passed" : ""}`}
                onClick={() => onStepChange(i)}
                title={`${stepItem.time} - ${stepItem.phase}`}
              />
            ))}
          </div>
        </div>

        <div className="timeline-marker-labels">
          <span>12:00</span>
          <span>12:15</span>
          <span>12:30</span>
          <span>12:45</span>
          <span>01:00</span>
        </div>
      </div>

      <div className="replay-status-right">
        <span className="live-vs-sim-badge replay-badge-warning" title="Historical replayed data. Not live telemetry.">
          DEMO / REPLAY DATA
        </span>
      </div>
    </div>
  );
};

