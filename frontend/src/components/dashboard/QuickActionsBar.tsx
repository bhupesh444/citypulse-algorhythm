import React, { useState, useRef, useEffect } from "react";

interface QuickActionsBarProps {
  onCreateAlert: () => void;
  onInspectZone: () => void;
  onViewIncidents: () => void;
  onRunAIAnalysis: () => void;
  onReplayCity: () => void;
  onToggleLayers: () => void;
  onScanCity?: () => void;
  onInvestigate?: () => void;
  onRunDemo?: () => void;
  onStartTour?: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onCreateAlert,
  onInspectZone,
  onViewIncidents,
  onRunAIAnalysis,
  onReplayCity,
  onToggleLayers,
  onScanCity,
  onInvestigate,
  onRunDemo,
  onStartTour,
}) => {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showMore]);

  return (
    <div className="quick-actions-bar">
      <span className="eyebrow quick-actions-label">QUICK ACTIONS:</span>

      {/* Primary Key Actions (Clean & Uncluttered for Hackathon) */}
      {onRunDemo && (
        <button
          type="button"
          className="quick-action-btn demo-action-highlight"
          onClick={onRunDemo}
          title="Start Automated 8-Scene Platform Demonstration"
        >
          <span>▶</span> Run Demo
        </button>
      )}

      {onScanCity && (
        <button
          type="button"
          className="quick-action-btn scan-action-highlight"
          onClick={onScanCity}
          title="Perform Tactical Radar Scan of Monitored Sectors"
        >
          <span>📡</span> Scan City
        </button>
      )}

      {onInvestigate && (
        <button
          type="button"
          className="quick-action-btn investigate-action-highlight"
          onClick={onInvestigate}
          title="Open Cause & Effect Impact Propagation"
        >
          <span>🔍</span> Investigate
        </button>
      )}

      <button
        type="button"
        className="quick-action-btn primary-action"
        onClick={onCreateAlert}
        title="Create new civic operational alert"
      >
        <span>+</span> Create Alert
      </button>

      {/* Secondary Actions Collapsed into 'More' Dropdown */}
      <div className="quick-actions-more-wrapper" ref={moreRef}>
        <button
          type="button"
          className={`quick-action-btn more-actions-btn ${showMore ? "is-active" : ""}`}
          onClick={() => setShowMore((prev) => !prev)}
          title="More secondary operational tools"
          aria-expanded={showMore}
        >
          <span>⋯</span> More Tools {showMore ? "▴" : "▾"}
        </button>

        {showMore && (
          <div className="quick-actions-dropdown-menu" role="menu">
            {onStartTour && (
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowMore(false);
                  onStartTour();
                }}
              >
                <span>✦</span> Guided Tour
              </button>
            )}
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setShowMore(false);
                onInspectZone();
              }}
            >
              <span>◈</span> Inspect Zone Details
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setShowMore(false);
                onViewIncidents();
              }}
            >
              <span>⚠</span> View Incident Log
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setShowMore(false);
                onRunAIAnalysis();
              }}
            >
              <span>✦</span> Run AI Neural Analysis
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setShowMore(false);
                onReplayCity();
              }}
            >
              <span>◷</span> City Replay Timeline
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setShowMore(false);
                onToggleLayers();
              }}
            >
              <span>⇋</span> Toggle Map Layers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
