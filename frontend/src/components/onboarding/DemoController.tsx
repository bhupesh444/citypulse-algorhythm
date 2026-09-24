import React, { useState, useEffect, useRef } from "react";
import { DEMO_SCENES, DemoScene } from "./demoScenesData";
import { MapLayersState } from "../map/MapLayerControl";
import { SelectedArea } from "../../types/citypulse";

interface DemoControllerProps {
  isActive: boolean;
  onExit: () => void;
  onNavigate: (section: string) => void;
  onSetFocusLocation: (loc: [number, number] | undefined) => void;
  onUpdateLayers: (layers: Partial<MapLayersState>) => void;
  onSetSelectedArea: (area: SelectedArea | null) => void;
  onSetRightRailTab: (tab: "overview" | "investigate" | "ai" | "alerts") => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  isActive,
  onExit,
  onNavigate,
  onSetFocusLocation,
  onUpdateLayers,
  onSetSelectedArea,
  onSetRightRailTab,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sceneElapsed, setSceneElapsed] = useState(0);

  const totalDuration = useRef(DEMO_SCENES.reduce((acc, s) => acc + s.durationSeconds, 0)).current;
  const currentScene = DEMO_SCENES[currentSceneIndex];

  // Execute Scene actions whenever currentScene changes
  useEffect(() => {
    if (!isActive || !currentScene) return;

    // 1. Navigate to target section
    onNavigate(currentScene.section);

    // 2. Set Map camera focus if defined
    if (currentScene.mapFocus) {
      onSetFocusLocation(currentScene.mapFocus);
    } else {
      onSetFocusLocation(undefined);
    }

    // 3. Configure Layers for this scene
    if (currentScene.layersToEnable && currentScene.layersToEnable.length > 0) {
      const nextLayers: Partial<MapLayersState> = {
        traffic: currentScene.layersToEnable.includes("traffic"),
        incidents: currentScene.layersToEnable.includes("incidents"),
        weather: currentScene.layersToEnable.includes("weather"),
        airQuality: currentScene.layersToEnable.includes("airQuality"),
        zones: currentScene.layersToEnable.includes("zones"),
        transit: currentScene.layersToEnable.includes("transit"),
      };
      onUpdateLayers(nextLayers);
    } else {
      onUpdateLayers({
        traffic: false,
        incidents: false,
        weather: false,
        airQuality: false,
        zones: false,
        transit: false,
      });
    }

    // 4. Sample Area Inspection
    if (currentScene.selectSampleArea) {
      onSetSelectedArea({
        latitude: 26.9184,
        longitude: 75.7925,
        zone: "Central",
        location: "MI Road Arterial Intersection · Jaipur",
        traffic: 65,
        transitDelay: 4,
        incidents: 1,
        status: "CRITICAL",
        aqi: 74,
        riskScore: 42,
      });
    } else {
      onSetSelectedArea(null);
    }

    // 5. Right Rail Tab
    if (currentScene.rightRailTab) {
      onSetRightRailTab(currentScene.rightRailTab);
    }

    // Reset scene countdown timer
    setSceneElapsed(0);
  }, [currentSceneIndex, isActive]);

  // Master Timer: Auto-advance scenes when isPlaying
  useEffect(() => {
    if (!isActive || !isPlaying) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setSceneElapsed((prev) => {
        if (prev + 1 >= currentScene.durationSeconds) {
          // Advance to next scene or conclude
          if (currentSceneIndex < DEMO_SCENES.length - 1) {
            setCurrentSceneIndex((idx) => idx + 1);
          } else {
            setIsPlaying(false);
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPlaying, currentSceneIndex, currentScene.durationSeconds]);

  // Keyboard navigation for demo (Space = Play/Pause, ArrowRight = Next, ArrowLeft = Prev, Esc = Exit)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentSceneIndex, isPlaying]);

  if (!isActive || !currentScene) return null;

  const handleNext = () => {
    if (currentSceneIndex < DEMO_SCENES.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentSceneIndex(0);
    setElapsedSeconds(0);
    setSceneElapsed(0);
    setIsPlaying(true);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalDuration) * 100));

  return (
    <>
      {/* Floating Demo Control Bar (Pinned top-center) */}
      <div className="demo-control-bar" role="region" aria-label="Demo Mode Controller">
        <div className="demo-bar-left">
          <span className="demo-live-dot">●</span>
          <span className="demo-tag">DEMO MODE</span>
          <span className="demo-sep">|</span>
          <span className="demo-scene-badge font-mono">
            SCENE {currentScene.sceneNumber.toString().padStart(2, "0")}/{DEMO_SCENES.length.toString().padStart(2, "0")}
          </span>
          <span className="demo-scene-title">{currentScene.title}</span>
          <span className={`demo-type-pill ${currentScene.badge.toLowerCase()}`}>
            {currentScene.badge}
          </span>
        </div>

        <div className="demo-bar-center">
          <button
            type="button"
            className="demo-ctrl-btn"
            onClick={handlePrev}
            disabled={currentSceneIndex === 0}
            title="Previous Scene (←)"
          >
            ⏮
          </button>

          <button
            type="button"
            className={`demo-ctrl-btn demo-play-btn ${isPlaying ? "is-pause" : "is-play"}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Demo (Space)" : "Play Demo (Space)"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            type="button"
            className="demo-ctrl-btn"
            onClick={handleNext}
            disabled={currentSceneIndex === DEMO_SCENES.length - 1}
            title="Next Scene (→)"
          >
            ⏭
          </button>

          <button
            type="button"
            className="demo-ctrl-btn"
            onClick={handleRestart}
            title="Restart Demo"
          >
            ↺
          </button>
        </div>

        <div className="demo-bar-right">
          <span className="demo-timer font-mono">
            {formatTime(elapsedSeconds)} / {formatTime(totalDuration)}
          </span>

          <button
            type="button"
            className={`demo-notes-toggle ${showPresenterNotes ? "is-active" : ""}`}
            onClick={() => setShowPresenterNotes(!showPresenterNotes)}
            title="Toggle Presenter Notes"
          >
            📋 Presenter Mode
          </button>

          <button
            type="button"
            className="demo-exit-btn"
            onClick={onExit}
            title="Exit Demo Mode (Esc)"
          >
            ✕ Exit Demo
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="demo-progress-track">
          <div className="demo-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Presenter Mode Panel (Bottom-right floating card) */}
      {showPresenterNotes && (
        <div className="presenter-panel" role="complementary" aria-label="Presenter Notes">
          <div className="presenter-panel-header">
            <div>
              <span className="presenter-eyebrow">PRESENTER MODE · SCENE {currentScene.sceneNumber}</span>
              <h4 className="presenter-title">{currentScene.title}</h4>
            </div>

            <button
              type="button"
              className="presenter-close-btn"
              onClick={() => setShowPresenterNotes(false)}
              aria-label="Hide presenter notes"
            >
              ✕
            </button>
          </div>

          <div className="presenter-body">
            <div className="presenter-section">
              <span className="presenter-label">WHAT TO EXPLAIN:</span>
              <p className="presenter-text">{currentScene.presenterScript}</p>
            </div>

            <div className="presenter-section action-section">
              <span className="presenter-label">SYSTEM ACTION:</span>
              <p className="presenter-action-text font-mono">✦ {currentScene.presenterAction}</p>
            </div>

            <div className="presenter-footer">
              <span className="scene-timer-label">Scene Advance:</span>
              <div className="scene-timer-track">
                <div
                  className="scene-timer-fill"
                  style={{
                    width: `${Math.round((sceneElapsed / currentScene.durationSeconds) * 100)}%`,
                  }}
                />
              </div>
              <span className="scene-timer-text font-mono">
                {currentScene.durationSeconds - sceneElapsed}s
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
