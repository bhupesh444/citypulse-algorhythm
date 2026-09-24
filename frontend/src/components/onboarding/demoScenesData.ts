export interface DemoScene {
  id: string;
  sceneNumber: number;
  totalScenes: number;
  durationSeconds: number; // scene auto-advance time
  title: string;
  shortDesc: string;
  presenterScript: string;
  presenterAction: string;
  badge: "OBSERVED" | "SIMULATION" | "PREDICTIVE";
  section: "dashboard" | "alerts" | "insights" | "zones" | "analytics" | "replay";
  mapFocus?: [number, number];
  mapZoom?: number;
  mapPitch?: number;
  layersToEnable?: string[];
  selectSampleArea?: boolean;
  rightRailTab?: "overview" | "investigate" | "ai" | "alerts";
}

export const DEMO_SCENES: DemoScene[] = [
  {
    id: "scene-overview",
    sceneNumber: 1,
    totalScenes: 8,
    durationSeconds: 22,
    title: "City Overview & Health Signals",
    shortDesc: "Initial urban command state and baseline civic indicators.",
    presenterScript:
      "CityPulse continuously summarizes municipal health across four core indicators: Traffic Congestion, Air Quality Index, Active Alerts, and Composite Civic Risk.",
    presenterAction: "Displaying citywide overview at Amity University Jaipur HQ monitoring radius.",
    badge: "OBSERVED",
    section: "dashboard",
    mapFocus: [26.9124, 75.7873],
    mapZoom: 12.8,
    mapPitch: 0,
    layersToEnable: [],
    rightRailTab: "overview",
  },
  {
    id: "scene-traffic",
    sceneNumber: 2,
    totalScenes: 8,
    durationSeconds: 24,
    title: "Arterial Traffic Detection",
    shortDesc: "Real-time corridor speed reduction and congestion mapping.",
    presenterScript:
      "The platform monitors vehicle throughput and detects arterial slowdowns. Here on MI Road, traffic congestion has elevated to 65% with speeds falling below 20 km/h.",
    presenterAction: "Flying camera to Central Sector and activating real-time traffic flow overlay.",
    badge: "OBSERVED",
    section: "dashboard",
    mapFocus: [26.9184, 75.7925],
    mapZoom: 14.6,
    mapPitch: 32,
    layersToEnable: ["traffic"],
    rightRailTab: "overview",
  },
  {
    id: "scene-inspection",
    sceneNumber: 3,
    totalScenes: 8,
    durationSeconds: 25,
    title: "Location Click-to-Inspect",
    shortDesc: "Interactive spatial inspection and localized sensor query.",
    presenterScript:
      "Operators can tap any point on the 2D map to inspect localized telemetry. The map pauses background visual interactions while displaying weather, congestion, speeds, and active incident alerts.",
    presenterAction: "Opening left-side location inspection panel at MI Road intersection.",
    badge: "OBSERVED",
    section: "dashboard",
    mapFocus: [26.9184, 75.7925],
    mapZoom: 14.8,
    mapPitch: 32,
    layersToEnable: ["traffic"],
    selectSampleArea: true,
    rightRailTab: "overview",
  },
  {
    id: "scene-environmental",
    sceneNumber: 4,
    totalScenes: 8,
    durationSeconds: 24,
    title: "Environmental & Air Quality Context",
    shortDesc: "Atmospheric micro-climate readings and AQI sensor networks.",
    presenterScript:
      "Urban mobility correlates closely with environmental conditions. CityPulse streams hourly weather and air quality to detect particulate spikes during peak congestion hours.",
    presenterAction: "Enabling air quality and weather telemetry overlays.",
    badge: "OBSERVED",
    section: "dashboard",
    mapFocus: [26.9124, 75.7873],
    mapZoom: 13.2,
    mapPitch: 15,
    layersToEnable: ["weather", "airQuality"],
    selectSampleArea: false,
    rightRailTab: "overview",
  },
  {
    id: "scene-risk",
    sceneNumber: 5,
    totalScenes: 8,
    durationSeconds: 24,
    title: "Civic Risk & Civic DNA Modeling",
    shortDesc: "Multidimensional urban health score synthesizing six key axes.",
    presenterScript:
      "The Civic DNA radar evaluates Mobility, Environment, Safety, Infrastructure, Transit, and Weather to compute a calibrated composite risk score on a 0–100 scale.",
    presenterAction: "Focusing on Civic DNA radar and composite risk breakdown.",
    badge: "OBSERVED",
    section: "dashboard",
    mapFocus: [26.9124, 75.7873],
    mapZoom: 13.0,
    layersToEnable: [],
    selectSampleArea: false,
    rightRailTab: "overview",
  },
  {
    id: "scene-alerts",
    sceneNumber: 6,
    totalScenes: 8,
    durationSeconds: 24,
    title: "Alert Triage & Incident Lifecycle",
    shortDesc: "Priority-ranked incident response and operator actions.",
    presenterScript:
      "When sensor thresholds breach operational baselines, high-priority alerts appear with location coordinates, severity classification, and instant acknowledge/resolve options.",
    presenterAction: "Opening the active alerts triage queue in the command rail.",
    badge: "OBSERVED",
    section: "dashboard",
    mapFocus: [26.9184, 75.7925],
    mapZoom: 14.2,
    layersToEnable: ["incidents"],
    selectSampleArea: false,
    rightRailTab: "alerts",
  },
  {
    id: "scene-ai",
    sceneNumber: 7,
    totalScenes: 8,
    durationSeconds: 25,
    title: "AI Civic Intelligence Synthesis",
    shortDesc: "Automated multi-domain correlation and root-cause explanations.",
    presenterScript:
      "CityPulse's AI engine analyzes cross-sector telemetry to generate actionable insights, explaining how arterial congestion on MI Road is creating cascading transit bus delays.",
    presenterAction: "Switching to AI Summary tab with automated root-cause hypotheses.",
    badge: "PREDICTIVE",
    section: "dashboard",
    mapFocus: [26.9184, 75.7925],
    mapZoom: 13.5,
    layersToEnable: [],
    selectSampleArea: false,
    rightRailTab: "ai",
  },
  {
    id: "scene-replay",
    sceneNumber: 8,
    totalScenes: 8,
    durationSeconds: 26,
    title: "Scenario Replay & Time Scrubber",
    shortDesc: "Historical timeline review and simulated incident playback.",
    presenterScript:
      "Replay mode enables civic teams to scrub through temporal sequences step-by-step for post-incident review, operator drills, and simulated emergency planning.",
    presenterAction: "Navigating to Replay City timeline. Clearly marked as SIMULATION.",
    badge: "SIMULATION",
    section: "replay",
    layersToEnable: ["traffic", "incidents"],
    selectSampleArea: false,
  },
];
