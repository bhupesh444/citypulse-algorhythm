import React, { useState, useEffect, useRef, useCallback } from "react";
import { TourStep, TOUR_STEPS_COUNT } from "./tourStepsData";

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onSelectSampleArea: (enable: boolean) => void;
  onToggleLayers: (open: boolean) => void;
  onSetRightRailTab: (tab: "overview" | "investigate" | "ai" | "alerts") => void;
  onStartDemo?: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectSampleArea,
  onToggleLayers,
  onSetRightRailTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      id: "step-1-welcome",
      stepNumber: 1,
      totalSteps: TOUR_STEPS_COUNT,
      title: "Welcome to CityPulse",
      badge: "STEP 1 OF 7",
      targetSelector: ".app-shell, .command-stage, .topbar",
      position: "center",
      description:
        "CityPulse is a civic intelligence dashboard for understanding city conditions in real time.",
      bullets: [
        "Unifies municipal sensors, transit GPS, and environmental telemetry into one interface",
        "Tracks live arterial flow, air quality changes, and municipal risk continuously",
        "Empowers operators to detect civic anomalies and coordinate proactive field responses",
      ],
      actionLabel: "Next: City Overview →",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(false);
        onSetRightRailTab("overview");
      },
    },
    {
      id: "step-2-overview",
      stepNumber: 2,
      totalSteps: TOUR_STEPS_COUNT,
      title: "City Overview",
      badge: "STEP 2 OF 7",
      targetSelector: ".summary-cards-stage, .summary-cards-grid",
      position: "bottom",
      description:
        "Top-level health indicator cards summarize the current operational pulse of the city.",
      bullets: [
        "Traffic: Arterial congestion percentage and volume across major avenues",
        "Air Quality: Real-time AQI values and particulate safety classifications",
        "Active Alerts: Unresolved incident warnings requiring rapid triage",
        "Civic Risk: Composite 0–100 risk score calculated from weighted city indicators",
      ],
      actionLabel: "Next: Interactive Map →",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(false);
        onSetRightRailTab("overview");
      },
    },
    {
      id: "step-3-map",
      stepNumber: 3,
      totalSteps: TOUR_STEPS_COUNT,
      title: "Interactive Map",
      badge: "STEP 3 OF 7",
      targetSelector: ".command-map",
      position: "center",
      description:
        "Use the map to explore locations and civic zones. Click any location or zone on the map to inspect detailed civic information.",
      bullets: [
        "Pan & Zoom: Drag to pan across Jaipur; scroll or use the + / − controls",
        "Click-to-Inspect: Select any road or civic zone to view localized speed, transit, and incident stats",
        "Day/Night Shading: Real solar angle calculates atmospheric lighting dynamically",
      ],
      actionLabel: "Next: Search →",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(false);
      },
    },
    {
      id: "step-4-search",
      stepNumber: 4,
      totalSteps: TOUR_STEPS_COUNT,
      title: "Search",
      badge: "STEP 4 OF 7",
      targetSelector: ".location-search-wrapper",
      position: "bottom",
      description:
        "Search for cities, places, roads, and areas. Suggestions appear as you type.",
      bullets: [
        "Type 2+ characters to trigger instant debounced autocomplete suggestions",
        "Select any suggestion to smoothly fly the map camera to the target coordinates",
        "Powered by real OpenStreetMap and MapTiler geocoding services",
      ],
      actionLabel: "Next: Civic Intelligence →",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(false);
      },
    },
    {
      id: "step-5-intelligence",
      stepNumber: 5,
      totalSteps: TOUR_STEPS_COUNT,
      title: "Civic Intelligence",
      badge: "STEP 5 OF 7",
      targetSelector: ".dashboard-right-rail, .rail-tab-header",
      position: "left",
      description:
        "Inspect zone details, risk indicators, incidents, mobility patterns, and other civic signals.",
      bullets: [
        "Zone Dynamics: Deep dive into Central, North, South, East, and West sectors",
        "Civic DNA: 6-dimensional health index (Mobility, Environment, Safety, Infrastructure, Transit, Weather)",
        "AI Insights: Automated anomaly correlation and plain-language operational summaries",
      ],
      actionLabel: "Next: Layers & Map Controls →",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(false);
        onSetRightRailTab("investigate");
      },
    },
    {
      id: "step-6-layers",
      stepNumber: 6,
      totalSteps: TOUR_STEPS_COUNT,
      title: "Layers & Map Controls",
      badge: "STEP 6 OF 7",
      targetSelector: ".map-view-controls, .layers-popover-trigger",
      position: "bottom",
      description:
        "Manage map layers, switch between 2D and 3D Earth modes, and control map display options.",
      bullets: [
        "Layers: Toggle traffic flow, incidents, civic zones, weather, AQI, transit, and risk heatmap",
        "2D / 3D Switcher: Seamlessly transition between 2D vector cartography and 3D globe visualization",
        "Scan City: Run a sequential radar scan across all civic sectors to identify peak operational impact",
      ],
      actionLabel: "Next: Explore CityPulse →",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(true); // Open layers popover
      },
    },
    {
      id: "step-7-explore",
      stepNumber: 7,
      totalSteps: TOUR_STEPS_COUNT,
      title: "Explore CityPulse",
      badge: "STEP 7 OF 7",
      targetSelector: ".sidebar-nav, .sidebar",
      position: "right",
      description:
        "Explore dedicated modules to monitor, triage, analyze, and replay city conditions.",
      bullets: [
        "Alerts: Priority-ranked operational incidents with Acknowledge and Resolve actions",
        "Insights: Natural-language AI queries and cause-and-effect explanations",
        "Zones & Analytics: Comprehensive longitudinal metrics across sectors",
        "Replay: Historic time scrubber for scenario drills and post-incident analysis",
        "Data Sources & Settings: Telemetry verification and command-center personalization",
      ],
      actionLabel: "Complete Tour ✦",
      onBeforeStep: () => {
        onNavigate("dashboard");
        onSelectSampleArea(false);
        onToggleLayers(false);
      },
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFinalStep = currentStepIndex === steps.length - 1;

  // Mark completion in localStorage helper
  const markTourCompleted = useCallback(() => {
    try {
      localStorage.setItem("citypulse_tour_completed", "true");
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const markTourSkipped = useCallback(() => {
    try {
      localStorage.setItem("citypulse_tour_skipped", "true");
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSkipTour = () => {
    markTourSkipped();
    onClose();
  };

  const handleStartExploring = () => {
    markTourCompleted();
    onClose();
  };

  const handleReplayTour = () => {
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleStartExploring();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Update target element bounding rect
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const selectors = currentStep.targetSelector.split(",").map((s) => s.trim());
    let el: HTMLElement | null = null;
    for (const sel of selectors) {
      const found = document.querySelector<HTMLElement>(sel);
      if (found && found.offsetParent !== null) {
        el = found;
        break;
      }
    }

    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  // Execute step setup on step change
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep?.onBeforeStep) {
      currentStep.onBeforeStep();
    }
    const timer = setTimeout(updateTargetRect, 150);
    return () => clearTimeout(timer);
  }, [currentStepIndex, isOpen, updateTargetRect]);

  // Listen to window resize and scroll
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isOpen, updateTargetRect]);

  // Keyboard navigation listener (Esc, ArrowRight, ArrowLeft)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkipTour();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen || !currentStep) return null;

  // Calculate card position coordinates safely with strict viewport clamping
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const margin = 16;
    const cardWidth = Math.min(380, window.innerWidth - 32);
    const cardHeight = isFinalStep ? 340 : 290;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case "bottom":
        top = targetRect.bottom + margin;
        left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, targetRect.left));
        if (top + cardHeight > window.innerHeight) {
          top = Math.max(margin, targetRect.top - cardHeight - margin);
        }
        break;

      case "top":
        top = Math.max(margin, targetRect.top - cardHeight - margin);
        left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, targetRect.left));
        if (top < margin) {
          top = targetRect.bottom + margin;
        }
        break;

      case "right":
        top = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, targetRect.top));
        left = targetRect.right + margin;
        if (left + cardWidth > window.innerWidth) {
          left = Math.max(margin, targetRect.left - cardWidth - margin);
        }
        break;

      case "left":
        top = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, targetRect.top));
        left = Math.max(margin, targetRect.left - cardWidth - margin);
        if (left < margin) {
          left = targetRect.right + margin;
        }
        break;

      case "center":
      default:
        top = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, targetRect.top + 40));
        left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, targetRect.left + 40));
        break;
    }

    // Final safety boundary clamping
    top = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, top));
    left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, left));

    return {
      position: "fixed",
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${cardWidth}px`,
      zIndex: 10002,
    };
  };

  return (
    <div className="guided-tour-overlay" role="dialog" aria-modal="true" aria-label="CityPulse Guided Tour">
      {/* Target Element Spotlight Cutout / Ring */}
      {targetRect && (
        <div
          className="tour-spotlight-box"
          style={{
            top: `${Math.round(targetRect.top - 4)}px`,
            left: `${Math.round(targetRect.left - 4)}px`,
            width: `${Math.round(targetRect.width + 8)}px`,
            height: `${Math.round(targetRect.height + 8)}px`,
          }}
        />
      )}

      {/* Floating Tour Step Card */}
      <div className="tour-card" style={getCardStyle()}>
        {/* Header */}
        <div className="tour-card-header">
          <div className="tour-step-info">
            <span className="tour-step-badge">{currentStep.badge}</span>
            <span className="tour-step-counter">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <button
            type="button"
            className="tour-close-btn"
            onClick={handleSkipTour}
            aria-label="Skip tour"
            title="Skip tour (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="tour-progress-track">
          <div
            className="tour-progress-fill"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="tour-card-body">
          <h3 className="tour-card-title">{currentStep.title}</h3>
          <p className="tour-card-desc">{currentStep.description}</p>

          {currentStep.bullets && currentStep.bullets.length > 0 && (
            <ul className="tour-bullets-list">
              {currentStep.bullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          )}

          {/* Final Step Confirmation Banner */}
          {isFinalStep && (
            <div className="tour-ready-banner">
              <span className="ready-sparkle">✦</span>
              <div className="ready-text">
                <strong>You're ready to explore CityPulse.</strong>
                <span>Monitor real-time civic signals, investigate zones, and track municipal risk.</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="tour-card-footer">
          <button
            type="button"
            className="tour-btn tour-btn-skip"
            onClick={handleSkipTour}
          >
            Skip Tour
          </button>

          <div className="tour-nav-buttons">
            <button
              type="button"
              className="tour-btn tour-btn-prev"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
            >
              ← Back
            </button>

            {isFinalStep ? (
              <>
                <button
                  type="button"
                  className="tour-btn tour-btn-restart"
                  onClick={handleReplayTour}
                  title="Replay tour from Step 1"
                >
                  Replay Tour
                </button>
                <button
                  type="button"
                  className="tour-btn tour-btn-next btn-finish"
                  onClick={handleStartExploring}
                  autoFocus
                >
                  Start Exploring ✦
                </button>
              </>
            ) : (
              <button
                type="button"
                className="tour-btn tour-btn-next"
                onClick={handleNext}
                autoFocus
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
