import React, { useEffect } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onClose: () => void;
  onStartDemo?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onClose,
  onStartDemo,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSkip = () => {
    try {
      localStorage.setItem("citypulse_tour_skipped", "true");
    } catch {
      // Ignore localStorage exceptions
    }
    onClose();
  };

  const handleStart = () => {
    onStartTour();
  };

  return (
    <div className="onboarding-modal-backdrop" onClick={handleSkip}>
      <div
        className="onboarding-modal-card welcome-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        {/* Glow Header Accent */}
        <div className="onboarding-card-accent" />

        {/* Brand Header */}
        <div className="onboarding-header">
          <div className="onboarding-badge-icon">
            <span className="pulse-dot">●</span>
            <span className="platform-tag">CIVIC INTELLIGENCE</span>
          </div>
          <button
            type="button"
            className="onboarding-close-btn"
            onClick={handleSkip}
            aria-label="Skip tour for now"
            title="Skip for now (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Welcome Content */}
        <div className="onboarding-content">
          <h2 id="welcome-title" className="onboarding-title">
            Welcome to CityPulse
          </h2>
          <span className="onboarding-subtitle">Civic Health Intelligence Platform</span>

          <p className="onboarding-desc">
            Take a 60-second guided tour to understand the command center.
          </p>

          {/* Quick Highlight Pills */}
          <div className="onboarding-features-list">
            <div className="onboarding-feature-pill">
              <span className="pill-icon">▣</span>
              <span>Dashboard Telemetry</span>
            </div>
            <div className="onboarding-feature-pill">
              <span className="pill-icon">🗺</span>
              <span>Interactive Map</span>
            </div>
            <div className="onboarding-feature-pill">
              <span className="pill-icon">🔍</span>
              <span>Location Search</span>
            </div>
            <div className="onboarding-feature-pill">
              <span className="pill-icon">✦</span>
              <span>Civic Intelligence</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="onboarding-actions">
          <div className="onboarding-primary-buttons">
            <button
              type="button"
              className="onboarding-btn btn-primary"
              onClick={handleStart}
              autoFocus
            >
              <span>✦</span> Start Tour
            </button>
            <button
              type="button"
              className="onboarding-btn btn-secondary"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
