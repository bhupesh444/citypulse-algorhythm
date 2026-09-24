import React, { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import {
  AlertDetail,
  CitySnapshot,
  CityZoneData,
  SelectedArea,
} from "./types/citypulse";
import { CityMapLibre, JAIPUR_CIVIC_ZONES } from "./components/map/CityMapLibre";
import { EarthGlobe } from "./components/map/EarthGlobe";
import { LocationSearch } from "./components/search/LocationSearch";
import { LocationSuggestion } from "./services/GeocodingProvider";
import {
  defaultLayersState,
  MapLayerControl,
  MapLayersState,
} from "./components/map/MapLayerControl";
import { ZoneDetailDrawer } from "./components/map/ZoneDetailDrawer";
import { CityReplayBar } from "./components/timeline/CityReplayBar";
import {
  NotificationDrawer,
  NotificationItem,
} from "./components/notifications/NotificationDrawer";
import { QuickActionsBar } from "./components/dashboard/QuickActionsBar";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { DashboardRightRail } from "./components/dashboard/DashboardRightRail";
import { AlertDetailsModal } from "./components/alerts/AlertDetailsModal";
import { AlertsView } from "./components/alerts/AlertsView";
import { AskCityPulsePanel } from "./components/insights/AskCityPulsePanel";
import { ZonesView } from "./components/zones/ZonesView";
import { AnalyticsView } from "./components/analytics/AnalyticsView";
import { DataSourcesView } from "./components/datasources/DataSourcesView";
import { SettingsView } from "./components/settings/SettingsView";
import { AboutView } from "./components/about/AboutView";
import { computeSolarConditions } from "./utils/solarCalculator";
import { useAppearance } from "./context/AppearanceContext";
import { CityPulseIndicator } from "./components/common/CityPulseIndicator";
import { CityPulseLogo } from "./components/common/CityPulseLogo";
import { WelcomeModal } from "./components/onboarding/WelcomeModal";
import { GuidedTour } from "./components/onboarding/GuidedTour";
import { DemoController } from "./components/onboarding/DemoController";
import { HelpMenu } from "./components/onboarding/HelpMenu";
import { KeyboardShortcutsModal } from "./components/onboarding/KeyboardShortcutsModal";

const fallbackSnapshot: CitySnapshot = {
  timestamp: new Date().toISOString(),
  weather: {
    weather_condition: "Clear",
    temperature: 27.4,
    humidity: 52,
    rainfall: 0,
    wind_speed: 9,
    timestamp: new Date().toISOString(),
    source_name: "Open-Meteo",
  },
  traffic: ["Central", "North", "South", "East", "West"].map((zone, index) => ({
    zone,
    average_speed: 42 + index * 2.5,
    congestion: 42 - index * 4,
    vehicle_count: 980 + index * 115,
    incident_count: index === 0 ? 1 : 0,
    timestamp: new Date().toISOString(),
    source_name: "TomTom Traffic / Simulated",
  })),
  transit: ["Central", "North", "South", "East", "West"].map((zone, index) => ({
    route_id: `R${12 + index}`,
    route_name: `${zone} Connector`,
    zone,
    delay_minutes: index === 0 ? 2.5 : 0.8,
    vehicles_affected: index === 0 ? 3 : 0,
    passenger_load: 68,
    status: "ON TIME",
    timestamp: new Date().toISOString(),
    source_name: "GTFS / Demo",
  })),
  incidents: [
    {
      id: "INC-2026-001",
      type: "traffic_congestion",
      severity: "high",
      zone: "Central",
      latitude: 26.9184,
      longitude: 75.7925,
      description: "Severe arterial congestion near MI Road intersection.",
      timestamp: new Date().toISOString(),
      status: "OPEN",
    },
  ],
  anomalies: [
    {
      metric: "traffic_congestion",
      zone: "Central",
      current_value: 48,
      baseline: 42,
      anomaly_score: 0.12,
      is_anomaly: false,
      severity: "low",
    },
  ],
  correlations: [
    {
      zone: "Central",
      metrics: ["traffic_congestion", "transit_delay"],
      coefficient: 0.78,
      explanation:
        "Central traffic density exhibits high observed correlation with feeder bus schedule deviation.",
    },
  ],
  risk: {
    score: 34,
    level: "normal",
    methodology: "Calibrated composite: 35% Traffic, 20% Environmental, 15% Infrastructure, 15% Transit, 15% Incidents.",
    breakdown: {
      overall: 34,
      traffic: 42,
      environment: 24,
      infrastructure: 28,
      transit: 22,
      incident: 30,
    },
    why_score: [
      "Arterial speed and volume constriction within nominal tolerances.",
      "Atmospheric conditions clear and stable.",
      "Transit routes operating within standard dispatch windows.",
    ],
  },
  insight:
    "City operations are currently stable within baseline operational envelopes. Traffic flow across primary avenues averages nominal transit times under Clear atmospheric conditions.",
  data_mode: "MIXED",
};

// Section 2: Primary and Secondary navigation definitions
const primaryNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "alerts", label: "Alerts", icon: "⚠" },
  { id: "insights", label: "Insights", icon: "✦" },
  { id: "zones", label: "Zones", icon: "◈" },
  { id: "analytics", label: "Analytics", icon: "∿" },
  { id: "replay", label: "Replay", icon: "◷" },
] as const;

const secondaryNavItems = [
  { id: "data-sources", label: "Data Sources", icon: "◇" },
  { id: "settings", label: "Settings", icon: "⚙" },
  { id: "about", label: "About CityPulse", icon: "ⓘ" },
] as const;

export default function App() {
  const { showSidebar, resolvedMapTheme, mapLabels, showMapControls } = useAppearance();
  const [snapshot, setSnapshot] = useState<CitySnapshot>(fallbackSnapshot);
  const [connected, setConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [step, setStep] = useState(0);
  const [mapMode, setMapMode] = useState<"map" | "3d">("map");
  const [layers, setLayers] = useState<MapLayersState>(defaultLayersState);
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [rightRailTab, setRightRailTab] = useState<"overview" | "investigate" | "ai" | "alerts">("overview");
  const initialHash = window.location.hash.slice(1);
  const [activeSection, setActiveSection] = useState(
    initialHash === "live-city" ? "dashboard" : initialHash || "dashboard"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusLocation, setFocusLocation] = useState<[number, number] | undefined>(undefined);
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Onboarding & Demo System state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Check if first-time visitor for Welcome Modal
  useEffect(() => {
    try {
      const tourCompleted = localStorage.getItem("citypulse_tour_completed");
      const tourSkipped = localStorage.getItem("citypulse_tour_skipped");
      const legacyWelcomed = localStorage.getItem("citypulse_welcomed");
      if (!tourCompleted && !tourSkipped && !legacyWelcomed) {
        setIsWelcomeOpen(true);
      }
    } catch {
      // Ignore localStorage exceptions
    }
  }, []);

  // Global Keyboard shortcut listener ('?' for shortcuts reference)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sample area selector helper for Guided Tour
  const handleTourSampleArea = (enable: boolean) => {
    if (enable) {
      const central = JAIPUR_CIVIC_ZONES[0];
      setSelectedArea({
        latitude: central.lat,
        longitude: central.lng,
        zone: central.name,
        traffic: 78,
        transitDelay: 6.5,
        incidents: 1,
        status: "WARNING",
        location: "MI Road Commercial Corridor",
        entityType: "location",
        entityName: "MI Road Corridor",
      });
    } else {
      setSelectedArea(null);
    }
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "CRITICAL",
      title: "Arterial Congestion Spike",
      description: "Central corridor speed reduced below 20 km/h on MI Road.",
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: "notif-2",
      type: "SOURCE",
      title: "Open-Meteo Synced",
      description: "Hourly atmospheric and air quality telemetry refreshed.",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      isRead: false,
    },
    {
      id: "notif-3",
      type: "AI",
      title: "AI Analysis Generated",
      description: "Root cause correlation completed for Central Zone.",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      isRead: true,
    },
  ]);

  // Keep current time updated every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Load initial snapshot and connect WebSocket
  useEffect(() => {
    api
      .getSnapshot(0)
      .then((data) => {
        if (data && data.traffic) setSnapshot(data);
      })
      .catch(() => undefined);

    let socket: WebSocket | undefined;
    try {
      socket = new WebSocket(
        `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/citypulse`
      );
      socket.onopen = () => setConnected(true);
      socket.onmessage = (event) => {
        try {
          const val = JSON.parse(event.data);
          if (val && val.traffic) setSnapshot(val);
        } catch {
          return;
        }
      };
      socket.onclose = () => setConnected(false);
      socket.onerror = () => setConnected(false);
    } catch {
      setConnected(false);
    }

    return () => socket?.close();
  }, []);

  // Demo playback loop
  useEffect(() => {
    if (!demoMode) return;
    const timer = setInterval(() => {
      setStep((current) => {
        const next = (current + 1) % 12;
        api
          .getSnapshot(next)
          .then((val) => {
            if (val && val.traffic) setSnapshot(val);
          })
          .catch(() => undefined);
        return next;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [demoMode]);

  // Hash route listener
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "tour") {
        setIsTourOpen(true);
        setActiveSection("dashboard");
        window.location.hash = "dashboard";
      } else if (hash === "live-city") {
        setActiveSection("dashboard");
        window.location.hash = "dashboard";
      } else {
        setActiveSection(hash || "dashboard");
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigateTo = (section: string) => {
    const target = section === "live-city" ? "dashboard" : section;
    setActiveSection(target);
    window.location.hash = target;
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectLocation = (loc: LocationSuggestion) => {
    // 1. Find nearest civic zone among JAIPUR_CIVIC_ZONES
    let closestZone = JAIPUR_CIVIC_ZONES[0];
    let minDistance = Infinity;
    for (const z of JAIPUR_CIVIC_ZONES) {
      const d = Math.hypot(loc.latitude - z.lat, loc.longitude - z.lng);
      if (d < minDistance) {
        minDistance = d;
        closestZone = z;
      }
    }

    const zoneTraffic =
      snapshot.traffic.find(
        (t) => t.zone.toLowerCase() === closestZone.name.toLowerCase()
      ) ?? snapshot.traffic[0];

    const zoneTransit =
      snapshot.transit.find(
        (t) => t.zone.toLowerCase() === closestZone.name.toLowerCase()
      ) ?? snapshot.transit[0];

    const zoneIncidents = snapshot.incidents.filter(
      (i) => i.zone.toLowerCase() === closestZone.name.toLowerCase()
    );

    const status: SelectedArea["status"] =
      zoneTraffic.congestion > 80 || zoneIncidents.length > 1
        ? "CRITICAL"
        : zoneTraffic.congestion > 50 || (zoneTransit?.delay_minutes ?? 0) > 8 || zoneIncidents.length > 0
        ? "WARNING"
        : "NORMAL";

    const newArea: SelectedArea = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      location: loc.name,
      zone: closestZone.name,
      traffic: zoneTraffic.congestion,
      transitDelay: zoneTransit?.delay_minutes ?? 0,
      incidents: zoneIncidents.length,
      status,
      entityType: "location",
      entityName: loc.name,
    };

    setSelectedArea(newArea);
    setFocusLocation([loc.latitude, loc.longitude]);

    if (mapMode === "3d") {
      setMapMode("map");
    }

    if (activeSection !== "dashboard") {
      navigateTo("dashboard");
    }
  };

  const handleSelectZone = (zone: CityZoneData) => {
    setSelectedArea({
      latitude: zone.latitude,
      longitude: zone.longitude,
      zone: zone.name,
      location: `${zone.name} Operations Sector`,
      traffic: zone.traffic_congestion,
      transitDelay: zone.transit_delay_min,
      incidents: zone.active_incidents,
      status: zone.status as any,
    });
    setIsDetailDrawerOpen(true);
    navigateTo("dashboard");
  };

  const dataModeLabel = demoMode ? "DEMO" : connected ? "MIXED" : "DEMO";
  const dataModeClass = demoMode ? "mode-demo" : connected ? "mode-live" : "mode-demo";

  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const activePageLabel = useMemo(() => {
    const p = [...primaryNavItems, ...secondaryNavItems].find((item) => item.id === activeSection);
    return p ? p.label : "Dashboard";
  }, [activeSection]);

  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="app-frame">
      {/* Mobile Hamburger Button */}
      <button
        className="mobile-menu-button"
        aria-label="Open navigation"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar Backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "is-visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Section 2: Consistent Desktop Sidebar Layout */}
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""} ${!showSidebar ? "is-collapsed" : ""}`}>
        <div className="sidebar-brand">
          <CityPulseLogo size={34} />
          <div className="brand-titles">
            <strong>CITYPULSE</strong>
            <CityPulseIndicator
              riskLevel={snapshot.risk?.level ?? "normal"}
              riskScore={snapshot.risk?.score ?? 34}
            />
          </div>
          <button
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "is-active" : ""}`}
              onClick={() => navigateTo(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Dedicated Guided Tour Navigation Item */}
        <div className="sidebar-tour-wrapper">
          <div className="sidebar-tour-divider" />
          <button
            type="button"
            className="nav-item nav-tour-item"
            onClick={() => {
              setIsTourOpen(true);
              setSidebarOpen(false);
            }}
            title="Interactive Guided Tour"
            aria-label="Start Guided Tour"
          >
            <div className="nav-tour-left">
              <span className="nav-icon nav-tour-icon">✦</span>
              <span className="nav-label">Guided Tour</span>
              <span className="nav-tour-spark" aria-hidden="true" />
            </div>
            <span className="nav-tour-badge">GUIDE</span>
          </button>
        </div>

        {/* Secondary Navigation & Bottom Status */}
        <div className="sidebar-lower">
          <div className="sidebar-nav secondary-nav">
            {secondaryNavItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? "is-active" : ""}`}
                onClick={() => navigateTo(item.id)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-divider" />

          {/* Section 20: Compact Demo Mode Pill */}
          <div className="demo-mode-pill-card">
            <div className="demo-info">
              <span className={`status-indicator ${demoMode ? "is-demo" : "is-live"}`}>●</span>
              <span className="demo-text">{demoMode ? "DEMO MODE" : "LIVE MODE"}</span>
            </div>
            <button
              className="demo-toggle-action"
              onClick={() => setDemoMode((v) => !v)}
              aria-label="Toggle demo mode"
            >
              {demoMode ? "Pause" : "Switch"}
            </button>
          </div>

          {/* System Operational Indicator */}
          <div className="system-status-indicator">
            <i className={connected ? "is-operational" : "is-degraded"} />
            <span>{connected ? "Operational" : "Degraded"}</span>
          </div>
        </div>
      </aside>

      {/* Main App Shell */}
      <main className="app-shell">
        {/* Section 3: Clean Top Header */}
        <header className="topbar">
          {/* Left: Current page / selected location */}
          <div className="header-left">
            <h1 className="header-location">
              {selectedArea
                ? `${selectedArea.location} · ${selectedArea.zone} (${selectedArea.latitude.toFixed(3)}°N, ${selectedArea.longitude.toFixed(3)}°E)`
                : activeSection === "dashboard"
                ? "Central · Jaipur"
                : `${activePageLabel} · Jaipur`}
            </h1>
          </div>

          {/* Center/Right: Weather, Time, System Mode */}
          <div className="header-center-info">
            <span className="header-info-item">
              {snapshot.weather.temperature}°C · {snapshot.weather.weather_condition}
            </span>
            <span className="header-sep">•</span>
            <span className="header-info-item time-item">{timeFormatted}</span>
            <span className="header-sep">•</span>
            <span className={`mode-badge ${dataModeClass}`}>
              [{dataModeLabel}]
            </span>
          </div>

          {/* Right: Search, Help, Notifications, Settings */}
          <div className="header-right-tools">
            <LocationSearch onSelectLocation={handleSelectLocation} />

            <div style={{ position: "relative" }}>
              <button
                className={`header-tool-btn help-btn ${isHelpMenuOpen ? "is-active" : ""}`}
                aria-label="Help and Demonstration"
                title="Help, Guided Tour & Shortcuts (?)"
                onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                ?
              </button>

              <HelpMenu
                isOpen={isHelpMenuOpen}
                onClose={() => setIsHelpMenuOpen(false)}
                onStartTour={() => {
                  setIsHelpMenuOpen(false);
                  setIsTourOpen(true);
                }}
                onStartDemo={() => {
                  setIsHelpMenuOpen(false);
                  setIsDemoActive(true);
                }}
                onOpenShortcuts={() => {
                  setIsHelpMenuOpen(false);
                  setIsShortcutsOpen(true);
                }}
                onOpenAbout={() => {
                  setIsHelpMenuOpen(false);
                  navigateTo("about");
                }}
              />
            </div>

            <button
              className="header-tool-btn"
              aria-label="Notifications"
              title="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              🔔
              {notifications.some((n) => !n.isRead) && (
                <span className="notif-count-pill">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>

            <button
              className="header-tool-btn"
              aria-label="Settings"
              title="Station Settings"
              onClick={() => navigateTo("settings")}
            >
              ⚙
            </button>
          </div>
        </header>

        {/* Notifications Drawer */}
        <NotificationDrawer
          notifications={notifications}
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          onMarkAsRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            )
          }
          onClearAll={() => setNotifications([])}
        />

        {/* Route Views */}
        {activeSection === "alerts" ? (
          <AlertsView
            onSelectAlert={(a) => setSelectedAlert(a)}
            onViewOnMap={(a) => {
              setSelectedArea({
                latitude: 26.9184,
                longitude: 75.7925,
                zone: a.zone,
                location: a.location,
                traffic: 65,
                transitDelay: 4,
                incidents: 1,
                status: "CRITICAL",
              });
              navigateTo("dashboard");
            }}
          />
        ) : activeSection === "insights" ? (
          <AskCityPulsePanel snapshot={snapshot} />
        ) : activeSection === "zones" ? (
          <ZonesView onSelectZone={handleSelectZone} />
        ) : activeSection === "analytics" ? (
          <AnalyticsView />
        ) : activeSection === "replay" ? (
          <div className="replay-page-layout">
            <div className="replay-map-container">
              <CityMapLibre
                snapshot={snapshot}
                layers={layers}
                focusLocation={
                  selectedArea ? [selectedArea.latitude, selectedArea.longitude] : undefined
                }
                onSelectArea={setSelectedArea}
                onOpenSettings={() => navigateTo("settings")}
              />
            </div>
            <CityReplayBar
              currentStep={step}
              isPlaying={demoMode}
              onStepChange={(newStep) => {
                setStep(newStep);
                api.getSnapshot(newStep).then((s) => setSnapshot(s));
              }}
              onTogglePlay={() => setDemoMode(!demoMode)}
            />
          </div>
        ) : activeSection === "data-sources" ? (
          <DataSourcesView />
        ) : activeSection === "settings" ? (
          <SettingsView />
        ) : activeSection === "about" ? (
          <AboutView snapshot={snapshot} onNavigate={navigateTo} />
        ) : (
          /* ==============================================
             Section 5: Redesigned Dashboard (Central City Command Center)
             ============================================== */
          <div className="dashboard-content-layout">
            {/* Top 4 Summary Cards (Traffic, Air Quality, Active Alerts, Civic Risk) */}
            <SummaryCards
              snapshot={snapshot}
              onSelectMetric={(mId) => {
                if (mId === "alerts") navigateTo("alerts");
                else if (mId === "civic-risk") navigateTo("insights");
              }}
            />

            {/* Main Center Stage: Map + Right Rail */}
            <div className="command-stage">
              {/* Map Centerpiece */}
              <section className={`map-panel command-map ${selectedArea ? "has-selected-area" : ""}`}>
                {/* Map Header with Segmented View Switcher & Layers Toggle */}
                <div className="map-view-header">
                  <div className="map-view-title-block">
                    <span className="map-area-eyebrow">
                      {selectedArea ? `${selectedArea.zone.toUpperCase()} SECTOR` : "JAIPUR CIVIC OPERATIONS"}
                    </span>
                    <span className="map-area-name">
                      {selectedArea ? selectedArea.location : "Amity University Jaipur HQ · 20 km Monitoring Radius"}
                    </span>
                  </div>

                  <div className="map-view-controls">
                    {/* Scan City Button (Requirement 1) */}
                    <button
                      className={`scan-city-btn ${isScanning ? "is-active" : ""}`}
                      onClick={() => setIsScanning(true)}
                      title="Perform sequential radar scan of all civic sectors"
                    >
                      <span className="scan-icon">📡</span>
                      <span>{isScanning ? "Scanning..." : "Scan City"}</span>
                    </button>

                    {/* Section 7: Segmented 2D / 3D Switcher */}
                    <div className="segmented-switcher">
                      <button
                        className={`switcher-tab ${mapMode === "map" ? "is-active" : ""}`}
                        onClick={() => setMapMode("map")}
                      >
                        2D Map
                      </button>
                      <button
                        className={`switcher-tab ${mapMode === "3d" ? "is-active" : ""}`}
                        onClick={() => setMapMode("3d")}
                      >
                        3D Earth
                      </button>
                    </div>

                    {/* Section 8: Layers Button */}
                    <button
                      className={`layers-popover-trigger ${showLayerControl ? "is-active" : ""}`}
                      onClick={() => setShowLayerControl(!showLayerControl)}
                    >
                      Layers ({activeLayersCount})
                    </button>
                  </div>
                </div>

                {/* Section 8: Layers Popover */}
                {showLayerControl && (
                  <MapLayerControl
                    layers={layers}
                    onChange={setLayers}
                    onClose={() => setShowLayerControl(false)}
                  />
                )}

                {/* Map Surface (2D MapLibre or 3D Earth) */}
                {mapMode === "map" ? (
                  <CityMapLibre
                    snapshot={snapshot}
                    layers={layers}
                    selectedArea={selectedArea}
                    focusLocation={focusLocation}
                    isLayersOpen={showLayerControl}
                    mapTheme={resolvedMapTheme}
                    mapLabels={mapLabels}
                    showControls={showMapControls}
                    isScanning={isScanning}
                    onScanComplete={(summary) => {
                      setIsScanning(false);
                      if (summary.highestImpactZone) {
                        const hz = JAIPUR_CIVIC_ZONES.find(
                          (z) => z.name.toLowerCase() === summary.highestImpactZone?.toLowerCase()
                        );
                        if (hz) {
                          setSelectedArea({
                            latitude: hz.lat,
                            longitude: hz.lng,
                            zone: hz.name,
                            traffic: 85,
                            transitDelay: 12,
                            incidents: 2,
                            status: "CRITICAL",
                            location: `${hz.name} Operational Sector`,
                            entityType: "zone",
                            entityName: hz.name,
                          });
                          setFocusLocation([hz.lat, hz.lng]);
                          setRightRailTab("investigate");
                        }
                      }
                    }}
                    onCancelScan={() => setIsScanning(false)}
                    onInvestigate={() => {
                      setRightRailTab("investigate");
                    }}
                    onSelectArea={(area) => {
                      setSelectedArea(area);
                    }}
                    onInspectDetails={() => navigateTo("zones")}
                    onOpenSettings={() => navigateTo("settings")}
                    onSwitchTo3D={() => setMapMode("3d")}
                  />
                ) : (
                  <EarthGlobe
                    snapshot={snapshot}
                    layers={layers}
                    selectedArea={selectedArea}
                    focusLocation={focusLocation}
                    isLayersOpen={showLayerControl}
                    showControls={showMapControls}
                    onSelectArea={(area) => {
                      setSelectedArea(area);
                    }}
                    onInspectDetails={() => navigateTo("zones")}
                    onSwitchTo2D={() => setMapMode("map")}
                  />
                )}
              </section>

              {/* Section 11 & 12: Simplified Right Rail */}
              <DashboardRightRail
                snapshot={snapshot}
                selectedArea={selectedArea}
                isInspecting={Boolean(selectedArea)}
                activeTabOverride={rightRailTab}
                onActivateLayer={(layerKey) => {
                  setLayers((prev) => ({
                    ...prev,
                    [layerKey]: true,
                  }));
                }}
                onInspectZone={(zoneName) => {
                  const zTraffic = snapshot.traffic.find((t) => t.zone === zoneName);
                  setSelectedArea({
                    latitude: 27.1769,
                    longitude: 75.9596,
                    zone: zoneName,
                    location: `${zoneName} Operational Sector`,
                    traffic: zTraffic?.congestion ?? 60,
                    transitDelay: 5,
                    incidents: snapshot.incidents.filter((i) => i.zone === zoneName).length,
                    status: "NORMAL",
                  });
                  setIsDetailDrawerOpen(true);
                }}
                onOpenAlerts={() => navigateTo("alerts")}
                onOpenAIConsole={() => navigateTo("insights")}
                onSelectAlert={(altId) => {
                  const alertItem = snapshot.incidents.find((i) => i.id === altId);
                  if (alertItem) {
                    setSelectedAlert({
                      id: alertItem.id,
                      title: alertItem.description,
                      severity: alertItem.severity as any,
                      zone: alertItem.zone,
                      location: alertItem.description,
                      timestamp: alertItem.timestamp,
                      change: "+24%",
                      confidence: 0.92,
                      source: "CityPulse Incident Stream",
                      current_measurement: "Elevated Flow Density",
                      previous_measurement: "Nominal Flow",
                      possible_causes: ["Arterial constriction", "Peak commuter influx"],
                      affected_area: `${alertItem.zone} Sector`,
                      recommended_action: "Coordinate localized arterial signal retiming",
                      source_status: "live",
                      status: alertItem.status as any,
                      acknowledged: false,
                      ai_analysis: alertItem.description,
                    });
                  }
                }}
              />
            </div>

            {/* Quick Actions Bar */}
            <QuickActionsBar
              onCreateAlert={() => {
                alert("New Civic Incident created and broadcast to field units.");
              }}
              onInspectZone={() => navigateTo("zones")}
              onViewIncidents={() => navigateTo("alerts")}
              onRunAIAnalysis={() => navigateTo("insights")}
              onReplayCity={() => navigateTo("replay")}
              onToggleLayers={() => setShowLayerControl(!showLayerControl)}
              onScanCity={() => setIsScanning(true)}
              onInvestigate={() => {
                setRightRailTab("investigate");
              }}
              onRunDemo={() => setIsDemoActive(true)}
              onStartTour={() => setIsTourOpen(true)}
            />
          </div>
        )}

        {/* Section 10: Reusable Right-Side Detail Drawer */}
        <ZoneDetailDrawer
          isOpen={isDetailDrawerOpen && selectedArea !== null}
          selectedArea={selectedArea}
          snapshot={snapshot}
          solarConditions={
            selectedArea
              ? computeSolarConditions(selectedArea.latitude, selectedArea.longitude)
              : undefined
          }
          onClose={() => setIsDetailDrawerOpen(false)}
          onViewAlerts={() => {
            setIsDetailDrawerOpen(false);
            navigateTo("alerts");
          }}
          onAnalyzeWithAI={() => {
            setIsDetailDrawerOpen(false);
            navigateTo("insights");
          }}
          onCenterMap={() => {
            if (selectedArea) {
              setSelectedArea({ ...selectedArea });
            }
          }}
        />

        {/* Global Modal for Alert Details */}
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={(id) => {
            api.acknowledgeAlert(id).then(() => {
              if (selectedAlert)
                setSelectedAlert({ ...selectedAlert, status: "INVESTIGATING", acknowledged: true });
            });
          }}
          onInvestigate={(id) => {
            api.acknowledgeAlert(id).then(() => {
              if (selectedAlert)
                setSelectedAlert({ ...selectedAlert, status: "INVESTIGATING" });
            });
          }}
          onResolve={(id) => {
            api.resolveAlert(id).then(() => {
              if (selectedAlert)
                setSelectedAlert({ ...selectedAlert, status: "RESOLVED" });
            });
          }}
          onViewOnMap={(a) => {
            setSelectedAlert(null);
            setSelectedArea({
              latitude: 26.9184,
              longitude: 75.7925,
              zone: a.zone,
              location: a.location,
              traffic: 65,
              transitDelay: 4,
              incidents: 1,
              status: "CRITICAL",
            });
            navigateTo("dashboard");
          }}
        />

        {/* Onboarding Welcome Modal */}
        <WelcomeModal
          isOpen={isWelcomeOpen}
          onStartTour={() => {
            setIsWelcomeOpen(false);
            setIsTourOpen(true);
          }}
          onStartDemo={() => {
            setIsWelcomeOpen(false);
            setIsDemoActive(true);
          }}
          onClose={() => setIsWelcomeOpen(false)}
        />

        {/* Interactive Step-by-Step Guided Tour */}
        <GuidedTour
          isOpen={isTourOpen}
          onClose={() => {
            setIsTourOpen(false);
            handleTourSampleArea(false);
            setShowLayerControl(false);
          }}
          onNavigate={navigateTo}
          onSelectSampleArea={handleTourSampleArea}
          onToggleLayers={setShowLayerControl}
          onSetRightRailTab={setRightRailTab}
          onStartDemo={() => {
            setIsTourOpen(false);
            setIsDemoActive(true);
          }}
        />

        {/* Automated 8-Scene Demo Mode Controller & Presenter */}
        <DemoController
          isActive={isDemoActive}
          onExit={() => {
            setIsDemoActive(false);
            setSelectedArea(null);
            setFocusLocation(undefined);
            navigateTo("dashboard");
          }}
          onNavigate={navigateTo}
          onSetFocusLocation={setFocusLocation}
          onUpdateLayers={(layersToUpdate) =>
            setLayers((prev) => ({ ...prev, ...layersToUpdate }))
          }
          onSetSelectedArea={setSelectedArea}
          onSetRightRailTab={setRightRailTab}
        />

        {/* Keyboard Shortcuts Reference Modal */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        {/* Footer */}
        <footer className="clean-footer">
          <span>CityPulse Civic Intelligence Platform</span>
          <span>Verified: Open-Meteo · TomTom · GTFS Telematics</span>
        </footer>
      </main>
    </div>
  );
}
