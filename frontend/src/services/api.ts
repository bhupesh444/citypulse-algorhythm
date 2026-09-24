import {
  AirQualitySnapshot,
  AlertDetail,
  AskCityPulseResponse,
  CitySnapshot,
  CityZoneData,
  DataSourceHealth,
  Incident,
  RiskSnapshot,
  WeatherSnapshot,
} from "../types/citypulse";

const API_BASE = "";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Snapshot
  getSnapshot: (step: number = 0) =>
    fetchJson<CitySnapshot>(`/api/snapshot?step=${step}`),

  // Weather
  getWeatherCurrent: (lat?: number, lon?: number) =>
    fetchJson<WeatherSnapshot>(
      lat !== undefined && lon !== undefined
        ? `/api/weather/current?lat=${lat}&lon=${lon}`
        : "/api/weather/current"
    ),
  getWeatherForecast: (lat?: number, lon?: number, days: number = 3) =>
    fetchJson<any>(
      lat !== undefined && lon !== undefined
        ? `/api/weather/forecast?lat=${lat}&lon=${lon}&days=${days}`
        : `/api/weather/forecast?days=${days}`
    ),

  // Air Quality
  getAirQualityCurrent: (lat?: number, lon?: number) =>
    fetchJson<AirQualitySnapshot>(
      lat !== undefined && lon !== undefined
        ? `/api/air-quality/current?lat=${lat}&lon=${lon}`
        : "/api/air-quality/current"
    ),

  // Traffic
  getTrafficFlow: (lat?: number, lon?: number, zone: string = "Central") =>
    fetchJson<any>(
      lat !== undefined && lon !== undefined
        ? `/api/traffic/flow?lat=${lat}&lon=${lon}&zone=${encodeURIComponent(zone)}`
        : `/api/traffic/flow?zone=${encodeURIComponent(zone)}`
    ),
  getTrafficIncidents: () => fetchJson<any[]>("/api/traffic/incidents"),

  // Transit
  getTransitRoutes: (zone?: string) =>
    fetchJson<any[]>(zone ? `/api/transit/routes?zone=${encodeURIComponent(zone)}` : "/api/transit/routes"),
  getTransitVehicles: () => fetchJson<any[]>("/api/transit/vehicles"),
  getTransitAlerts: () => fetchJson<any[]>("/api/transit/alerts"),
  getTransitDelays: () => fetchJson<any>("/api/transit/delays"),

  // Incidents & Alerts
  getIncidents: (zone?: string, status?: string) => {
    const params = new URLSearchParams();
    if (zone) params.append("zone", zone);
    if (status) params.append("status", status);
    const q = params.toString() ? `?${params.toString()}` : "";
    return fetchJson<Incident[]>(`/api/incidents${q}`);
  },
  updateIncidentStatus: (id: string, status: string) =>
    fetchJson<Incident>(`/api/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getAlerts: () => fetchJson<AlertDetail[]>("/api/alerts"),
  acknowledgeAlert: (alertId: string) =>
    fetchJson<{ status: string; alert_id: string }>(`/api/alerts/${alertId}/acknowledge`, {
      method: "POST",
    }),
  resolveAlert: (alertId: string) =>
    fetchJson<{ status: string; alert_id: string }>(`/api/alerts/${alertId}/resolve`, {
      method: "POST",
    }),

  // Risk
  getRisk: (step: number = 0) => fetchJson<RiskSnapshot>(`/api/risk?step=${step}`),
  getRiskForecast: (step: number = 0) => fetchJson<any>(`/api/risk/forecast?step=${step}`),

  // Zones
  getZones: () => fetchJson<CityZoneData[]>("/api/zones"),
  getZone: (id: string) => fetchJson<CityZoneData>(`/api/zones/${id}`),

  // Analytics
  getAnalytics: (timeRange: string = "24H") =>
    fetchJson<any>(`/api/analytics?time_range=${timeRange}`),

  // AI Civic Intelligence
  getAISummary: (cityContext?: any) =>
    fetchJson<{ summary: string; provider: string; confidence: number; is_live: boolean }>(
      "/api/ai/summary",
      {
        method: "POST",
        body: JSON.stringify({ city_context: cityContext }),
      }
    ),
  askCityPulse: (question: string, context?: any) =>
    fetchJson<AskCityPulseResponse>("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    }),

  // Data Sources
  getSourcesStatus: () => fetchJson<DataSourceHealth[]>("/api/sources/status"),

  // Geocoding
  searchLocation: (query: string) =>
    fetchJson<Array<{ name: string; display_name: string; latitude: number; longitude: number; source: string }>>(
      `/api/geocoding/search?q=${encodeURIComponent(query)}`
    ),
};
