import React, { useState } from "react";
import {
  useAppearance,
  ThemeMode,
  AccentPreset,
  InterfaceDensity,
  TextSizeOption,
  MapThemeOption,
  MapLabelsOption,
} from "../../context/AppearanceContext";

export const SettingsView: React.FC = () => {
  const {
    theme,
    accent,
    density,
    textSize,
    reduceMotion,
    glass,
    mapTheme,
    mapLabels,
    highContrast,
    showSidebar,
    showMapControls,
    focusIndicators,
    resolvedTheme,
    isFullscreen,
    setTheme,
    setAccent,
    setDensity,
    setTextSize,
    setReduceMotion,
    setGlass,
    setMapTheme,
    setMapLabels,
    setHighContrast,
    setShowSidebar,
    setShowMapControls,
    setFocusIndicators,
    toggleFullscreen,
    resetAppearance,
  } = useAppearance();

  // Existing Operational settings
  const [radius, setRadius] = useState<number>(20);
  const [refreshInterval, setRefreshInterval] = useState<number>(2500);
  const [criticalNotify, setCriticalNotify] = useState<boolean>(true);
  const [anomalyNotify, setAnomalyNotify] = useState<boolean>(true);
  const [aiConfidence, setAiConfidence] = useState<number>(85);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string>("");

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(""), 2800);
  };

  const accentPresets: Array<{ id: AccentPreset; name: string; hex: string }> = [
    { id: "teal", name: "CityPulse Teal", hex: "#2dd4bf" },
    { id: "blue", name: "Deep Blue", hex: "#3b82f6" },
    { id: "purple", name: "Electric Purple", hex: "#a855f7" },
    { id: "amber", name: "Solar Amber", hex: "#f59e0b" },
    { id: "red", name: "Command Red", hex: "#ef4444" },
  ];

  return (
    <div className="settings-page-container">
      {/* Header */}
      <div className="settings-header">
        <div>
          <span className="page-eyebrow">COMMAND SYSTEM CONFIGURATION</span>
          <h2 className="page-title">Station Settings</h2>
          <p className="page-subtitle">
            Configure appearance, cartography, intelligence synthesis, and telemetry parameters.
          </p>
        </div>

        <div className="settings-header-actions">
          {feedbackToast && (
            <span className="settings-saved-badge">✓ {feedbackToast}</span>
          )}
          <button
            className="clean-btn outline-btn fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen Mode"
          >
            {isFullscreen ? "Exit Fullscreen" : "⛶ Enter Fullscreen"}
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="appearance-preview-card">
        <div className="preview-header">
          <span className="preview-label">LIVE APPEARANCE PREVIEW</span>
          <span className="preview-tag">
            {resolvedTheme.toUpperCase()} · {accent.toUpperCase()} · {density.toUpperCase()}
          </span>
        </div>
        <div className="preview-stage">
          <div className="preview-mini-nav">
            <div className="preview-nav-item is-active">
              <span className="nav-dot"></span>
              <span>Dashboard</span>
            </div>
            <div className="preview-nav-item">
              <span>Alerts</span>
            </div>
          </div>
          <div className="preview-mini-card">
            <div className="preview-card-header">
              <strong>JAIPUR CIVIC CORE</strong>
              <span className="preview-status-pill">● OPERATIONAL</span>
            </div>
            <p className="preview-card-text">
              Telemetry pipeline receiving nominal readings across 5 zones.
            </p>
            <div className="preview-card-footer">
              <span className="preview-speed">48 km/h</span>
              <button className="preview-action-btn">Action Button</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Settings Grid */}
      <div className="settings-grid-layout">
        {/* COLUMN 1 */}
        <div className="settings-column">
          {/* Section 1: Appearance */}
          <div className="clean-settings-card">
            <div className="card-title-group">
              <span className="settings-group-label">1. APPEARANCE</span>
              <p className="card-desc">Customize how CityPulse looks and behaves across all stations.</p>
            </div>

            {/* Theme Selector */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Theme</span>
                <span className="setting-desc">Switch between command-center dark, light, or OS system mode</span>
              </div>
              <div className="segmented-control" role="group" aria-label="Theme selector">
                {(["dark", "light", "system"] as ThemeMode[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`segmented-btn ${theme === t ? "is-active" : ""}`}
                    onClick={() => {
                      setTheme(t);
                      triggerToast(`Theme set to ${t}`);
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Preset */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Accent Color</span>
                <span className="setting-desc">Primary highlight for buttons, focus rings, badges, and reticles</span>
              </div>
              <div className="accent-picker-row" role="radiogroup" aria-label="Accent color presets">
                {accentPresets.map((p) => {
                  const isSelected = accent === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`accent-color-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        setAccent(p.id);
                        triggerToast(`Accent set to ${p.name}`);
                      }}
                      title={p.name}
                    >
                      <span className="accent-swatch" style={{ backgroundColor: p.hex }} />
                      <span className="accent-name-label">
                        {isSelected ? `✓ ${p.id}` : p.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interface Density */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Interface Density</span>
                <span className="setting-desc">Adjust spacing, card padding, and row heights</span>
              </div>
              <div className="segmented-control" role="group" aria-label="Interface density selector">
                {(["compact", "comfortable", "spacious"] as InterfaceDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`segmented-btn ${density === d ? "is-active" : ""}`}
                    onClick={() => {
                      setDensity(d);
                      triggerToast(`Density set to ${d}`);
                    }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Text Size</span>
                <span className="setting-desc">Scale typography gradually for optimal operational readability</span>
              </div>
              <div className="segmented-control" role="group" aria-label="Text size selector">
                {(["small", "default", "large"] as TextSizeOption[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`segmented-btn ${textSize === s ? "is-active" : ""}`}
                    onClick={() => {
                      setTextSize(s);
                      triggerToast(`Text size set to ${s}`);
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Interface Effects (Glass / Transparency) */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Glass / Transparency</span>
                <span className="setting-desc">Subtle translucent panels and slight backdrop blur</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={glass}
                  onChange={(e) => {
                    setGlass(e.target.checked);
                    triggerToast(`Glass effect ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  aria-label="Toggle Glass and Transparency"
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Desktop Sidebar Display */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Show Full Sidebar</span>
                <span className="setting-desc">Show expanded labels on desktop (collapses to icon rail when disabled)</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showSidebar}
                  onChange={(e) => {
                    setShowSidebar(e.target.checked);
                    triggerToast(`Sidebar ${e.target.checked ? "expanded" : "collapsed"}`);
                  }}
                  aria-label="Toggle full sidebar"
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Section 2: Map Cartography */}
          <div className="clean-settings-card">
            <div className="card-title-group">
              <span className="settings-group-label">2. MAP & CARTOGRAPHY</span>
              <p className="card-desc">Configure basemap styling, label noise level, and tactical controls.</p>
            </div>

            {/* Map Theme */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Map Appearance</span>
                <span className="setting-desc">Vector cartography basemap rendering style</span>
              </div>
              <select
                value={mapTheme}
                onChange={(e) => {
                  setMapTheme(e.target.value as MapThemeOption);
                  triggerToast(`Map style set to ${e.target.value}`);
                }}
                className="clean-select"
                aria-label="Map Appearance Style"
              >
                <option value="auto">Auto (Match Interface Theme)</option>
                <option value="dark">Always Dark Basemap</option>
                <option value="light">Always Light Basemap</option>
              </select>
            </div>

            {/* Map Labels */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Map Labels</span>
                <span className="setting-desc">Control cartographic detail and visual noise</span>
              </div>
              <select
                value={mapLabels}
                onChange={(e) => {
                  setMapLabels(e.target.value as MapLabelsOption);
                  triggerToast(`Map labels set to ${e.target.value}`);
                }}
                className="clean-select"
                aria-label="Map Label Density"
              >
                <option value="standard">Standard Geographic Detail</option>
                <option value="reduced">Reduced Clutter (Operational Focus)</option>
              </select>
            </div>

            {/* Map Controls */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Show Map Controls</span>
                <span className="setting-desc">Display zoom, locate, tilt, and tactical controls over the map</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showMapControls}
                  onChange={(e) => {
                    setShowMapControls(e.target.checked);
                    triggerToast(`Map controls ${e.target.checked ? "visible" : "hidden"}`);
                  }}
                  aria-label="Toggle map controls"
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Monitoring Radius */}
            <div className="setting-row">
              <div>
                <span className="setting-name">Surveillance Radius</span>
                <span className="setting-desc">Operational monitoring perimeter from Amity HQ</span>
              </div>
              <select
                value={radius}
                onChange={(e) => {
                  setRadius(Number(e.target.value));
                  triggerToast(`Radius set to ${e.target.value} km`);
                }}
                className="clean-select"
                aria-label="Monitoring Radius"
              >
                <option value={10}>10 km Radius</option>
                <option value={20}>20 km Radius (Default)</option>
                <option value={50}>50 km Metropolitan Region</option>
              </select>
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div className="settings-column">
          {/* Section 3: Monitoring & Telemetry */}
          <div className="clean-settings-card">
            <div className="card-title-group">
              <span className="settings-group-label">3. MONITORING & TELEMETRY</span>
              <p className="card-desc">Configure operational data ingestion rate and live pipeline cadence.</p>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">Telemetry Polling Rate</span>
                <span className="setting-desc">Real-time sensor aggregation frequency</span>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => {
                  setRefreshInterval(Number(e.target.value));
                  triggerToast(`Polling rate set to ${Number(e.target.value) / 1000}s`);
                }}
                className="clean-select"
                aria-label="Telemetry Polling Rate"
              >
                <option value={1000}>1.0 second (High Frequency)</option>
                <option value={2500}>2.5 seconds (Standard)</option>
                <option value={5000}>5.0 seconds (Bandwidth Saver)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Alerts & Notifications */}
          <div className="clean-settings-card">
            <div className="card-title-group">
              <span className="settings-group-label">4. ALERTS & DISPATCH</span>
              <p className="card-desc">Manage incident alert thresholds and audio broadcast banners.</p>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">Critical Incident Audio & Banner</span>
                <span className="setting-desc">Immediate alerts for high-severity civic events</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={criticalNotify}
                  onChange={(e) => {
                    setCriticalNotify(e.target.checked);
                    triggerToast(`Critical alerts ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  aria-label="Toggle Critical Incident Alerts"
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">Anomaly Detection Banners</span>
                <span className="setting-desc">Highlight telemetry deviations above 2σ operational baseline</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={anomalyNotify}
                  onChange={(e) => {
                    setAnomalyNotify(e.target.checked);
                    triggerToast(`Anomaly alerts ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  aria-label="Toggle Anomaly Alerts"
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Section 5: AI & Intelligence */}
          <div className="clean-settings-card">
            <div className="card-title-group">
              <span className="settings-group-label">5. CIVIC AI INTELLIGENCE</span>
              <p className="card-desc">Configure root-cause heuristics and neural synthesis parameters.</p>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">Confidence Threshold</span>
                <span className="setting-desc">Minimum statistical certainty required before surfacing insights</span>
              </div>
              <select
                value={aiConfidence}
                onChange={(e) => {
                  setAiConfidence(Number(e.target.value));
                  triggerToast(`Confidence threshold set to ${e.target.value}%`);
                }}
                className="clean-select"
                aria-label="AI Confidence Threshold"
              >
                <option value={75}>75% (Broad Coverage)</option>
                <option value={80}>80% (Balanced)</option>
                <option value={85}>85% (High Precision — Recommended)</option>
                <option value={90}>90% (Strict Validation)</option>
              </select>
            </div>
          </div>

          {/* Section 6: Accessibility */}
          <div className="clean-settings-card">
            <div className="card-title-group">
              <span className="settings-group-label">6. ACCESSIBILITY</span>
              <p className="card-desc">Interface accommodations for assistive needs and contrast.</p>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">High Contrast</span>
                <span className="setting-desc">Sharper border contrast and elevated text legibility</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => {
                    setHighContrast(e.target.checked);
                    triggerToast(`High contrast ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  aria-label="Toggle High Contrast"
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">Reduce Motion</span>
                <span className="setting-desc">Eliminate decorative pulses, smooth panel slides, and map transitions</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(e) => {
                    setReduceMotion(e.target.checked);
                    triggerToast(`Reduce motion ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  aria-label="Toggle Reduce Motion"
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <span className="setting-name">Visible Focus Indicators</span>
                <span className="setting-desc">High-visibility focus outlines for keyboard navigation</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={focusIndicators}
                  onChange={(e) => {
                    setFocusIndicators(e.target.checked);
                    triggerToast(`Focus rings ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  aria-label="Toggle Visible Focus Indicators"
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Appearance & Advanced Settings */}
      <div className="settings-footer-card">
        <div className="reset-appearance-block">
          <div>
            <span className="setting-name">Reset Appearance Settings</span>
            <span className="setting-desc">
              Restore default command-center dark theme, teal accent, comfortable density, and standard cartography.
            </span>
          </div>

          {!showResetConfirm ? (
            <button
              className="clean-btn outline-btn reset-btn"
              onClick={() => setShowResetConfirm(true)}
              aria-label="Reset appearance preferences"
            >
              Reset Appearance
            </button>
          ) : (
            <div className="reset-confirm-box" role="alert">
              <span className="confirm-text">Reset all appearance preferences to defaults?</span>
              <div className="confirm-actions">
                <button
                  className="clean-btn outline-btn"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="clean-btn reset-confirm-btn"
                  onClick={() => {
                    resetAppearance();
                    setShowResetConfirm(false);
                    triggerToast("Appearance restored to CityPulse defaults");
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Diagnostics Collapsible */}
      <div className="advanced-settings-section">
        <button
          className="advanced-toggle-btn"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          aria-expanded={advancedOpen}
        >
          <span>Advanced System Diagnostics & Session Storage</span>
          <span>{advancedOpen ? "▴" : "▾"}</span>
        </button>

        {advancedOpen && (
          <div className="advanced-settings-content">
            <div className="advanced-item">
              <span className="adv-label">WebSocket Telemetry URL</span>
              <code>ws://localhost:8000/ws/citypulse</code>
            </div>
            <div className="advanced-item">
              <span className="adv-label">MapLibre Engine Version</span>
              <code>v5.1.0 (MapTiler Dataviz Vector Tiles)</code>
            </div>
            <div className="advanced-item">
              <span className="adv-label">Local Cache Session</span>
              <button
                className="clean-btn outline-btn"
                onClick={() => {
                  localStorage.clear();
                  triggerToast("Local session cache cleared");
                }}
              >
                Clear Local Storage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
