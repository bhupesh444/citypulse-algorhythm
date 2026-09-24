export type Severity = "low" | "medium" | "high" | "critical";

export type SourceStatus = "live" | "simulated" | "public" | "degraded" | "unavailable";

export type DataMode = "LIVE" | "DEMO" | "MIXED";

export type WeatherSnapshot = {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  weather_condition: string;
  timestamp: string;
  apparent_temperature?: number;
  wind_direction?: number;
  cloud_cover?: number;
  visibility?: number;
  weather_code?: number;
  source_status?: SourceStatus;
  source_name?: string;
};

export type TrafficSnapshot = {
  zone: string;
  average_speed: number;
  congestion: number;
  vehicle_count: number;
  incident_count: number;
  timestamp: string;
  source_status?: SourceStatus;
  source_name?: string;
};

export type TransitSnapshot = {
  route_id: string;
  route_name: string;
  zone: string;
  delay_minutes: number;
  vehicles_affected: number;
  passenger_load: number;
  status: string;
  timestamp: string;
  source_status?: SourceStatus;
  source_name?: string;
};

export type Incident = {
  id: string;
  type: string;
  severity: Severity;
  zone: string;
  latitude: number;
  longitude: number;
  description: string;
  timestamp: string;
  status: string;
  title?: string;
  source?: string;
  confidence?: number;
  affected_area?: string;
  source_status?: SourceStatus;
};

export type Anomaly = {
  metric: string;
  zone: string;
  current_value: number;
  baseline: number;
  anomaly_score: number;
  is_anomaly: boolean;
  severity: Severity;
};

export type Correlation = {
  zone: string;
  metrics: string[];
  coefficient: number;
  explanation: string;
};

export type RiskCategoryBreakdown = {
  overall: number;
  traffic: number;
  environment: number;
  infrastructure: number;
  transit: number;
  incident: number;
};

export type RiskForecastPoint = {
  minutes_ahead: number;
  traffic_risk: number;
  environmental_risk: number;
  infrastructure_risk: number;
  transit_risk: number;
  overall_risk: number;
  trend: "increasing" | "stable" | "decreasing";
};

export type RiskSnapshot = {
  score: number;
  level: string;
  methodology: string;
  breakdown?: RiskCategoryBreakdown;
  forecast?: RiskForecastPoint[];
  why_score?: string[];
};

export type CitySnapshot = {
  timestamp: string;
  weather: WeatherSnapshot;
  traffic: TrafficSnapshot[];
  transit: TransitSnapshot[];
  incidents: Incident[];
  anomalies: Anomaly[];
  correlations: Correlation[];
  risk: RiskSnapshot;
  insight: string;
  data_mode?: DataMode;
};

export type AirQualitySnapshot = {
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  aqi: number;
  timestamp: string;
  source_name: string;
  source_status: SourceStatus;
};

export type AlertDetail = {
  id: string;
  title: string;
  severity: Severity;
  location: string;
  zone: string;
  timestamp: string;
  source: string;
  current_measurement: string;
  previous_measurement: string;
  change: string;
  possible_causes: string[];
  affected_area: string;
  ai_analysis: string;
  confidence: number;
  recommended_action: string;
  status: string;
  acknowledged: boolean;
  source_status: SourceStatus;
};

export type CityZoneData = {
  id: string;
  name: string;
  risk_score: number;
  traffic_congestion: number;
  average_speed: number;
  active_incidents: number;
  aqi: number;
  weather_summary: string;
  transit_delay_min: number;
  infrastructure_status: string;
  latitude: number;
  longitude: number;
  status: string;
  source_status: SourceStatus;
};

export type DataSourceHealth = {
  provider: string;
  purpose: string;
  status: string;
  last_sync: string;
  latency_ms: number;
  data_freshness: string;
  api_type: string;
  environment: string;
  attribution: string;
  is_live: boolean;
};

export type AskCityPulseResponse = {
  question: string;
  answer: string;
  observed_changes: string[];
  contributing_factors: string[];
  confidence: number;
  sources: string[];
  is_simulated: boolean;
  timestamp: string;
};

export type SelectedArea = {
  latitude: number;
  longitude: number;
  zone: string;
  location?: string;
  traffic: number;
  transitDelay: number;
  incidents: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  isNearby?: boolean;
  entityType?: "location" | "zone" | "incident" | "transit" | "infrastructure" | "hq" | "user";
  entityName?: string;
  aqi?: number;
  riskScore?: number;
  riskLevel?: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "NOMINAL";
  id?: string;
  name?: string;
  type?: string;
  lat?: number;
  lng?: number;
  trafficCongestion?: number;
  transitDelayMinutes?: number;
};
