import { MAP_CONFIG, isMapTilerConfigured } from "../config/mapConfig";

const KNOWN_JAIPUR_POINTS = [
  { name: "Amity University Jaipur HQ", lat: 27.1769, lng: 75.9597, radius: 0.05 },
  { name: "MI Road & Pink City Historic Center", lat: 26.9184, lng: 75.7925, radius: 0.04 },
  { name: "Sitapura Technology & Academic Corridor", lat: 27.245, lng: 75.892, radius: 0.045 },
  { name: "Mansarovar Sector & Metro Environs", lat: 26.858, lng: 75.762, radius: 0.045 },
  { name: "Durgapura Logistics & Industrial Hub", lat: 27.112, lng: 75.923, radius: 0.045 },
  { name: "Malviya Nagar Commercial District", lat: 26.852, lng: 75.815, radius: 0.04 },
  { name: "East Commercial Corridor", lat: 27.185, lng: 76.035, radius: 0.045 },
  { name: "Jaipur International Airport Sector", lat: 26.828, lng: 75.805, radius: 0.035 },
  { name: "Amber Hills & Fort Environs", lat: 26.985, lng: 75.851, radius: 0.04 },
];

/**
 * Cleans location text to remove technical road codes (MDR188, SH-12, etc.)
 * and ensures human-readable geographic naming.
 */
function sanitizeLocationName(rawName: string, lat: number, lng: number): string {
  // Check known landmark matches first
  for (const pt of KNOWN_JAIPUR_POINTS) {
    const dist = Math.hypot(lat - pt.lat, lng - pt.lng);
    if (dist <= pt.radius) {
      return pt.name;
    }
  }

  // Filter out technical road patterns like MDR188, SH12, NH48, etc.
  const isRoadIdentifier = /^(MDR|SH|NH|ODR|State Highway|Major District Road|National Highway)\s*\d+/i.test(
    rawName.trim()
  );

  if (isRoadIdentifier) {
    if (Math.hypot(lat - 27.1769, lng - 75.9597) < 0.08) {
      return "Amity University Jaipur HQ Sector";
    }
    return `Jaipur Metropolitan Area (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
  }

  // Split parts and filter out road codes
  const parts = rawName
    .split(",")
    .map((s) => s.trim())
    .filter((s) => !/^(MDR|ODR|SH)\s*\d+/i.test(s));

  const unique = Array.from(new Set(parts));
  if (unique.length === 0) {
    return `Jaipur Metropolitan Area (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
  }

  return unique.slice(0, 3).join(", ");
}

/**
 * Reverse geocodes [lat, lng] into a clean human-readable location name.
 * Uses MapTiler Geocoding API if key configured; falls back gracefully to known landmarks or coordinates.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 1. Direct match with primary Jaipur landmarks
  for (const pt of KNOWN_JAIPUR_POINTS) {
    const dist = Math.hypot(lat - pt.lat, lng - pt.lng);
    if (dist <= pt.radius) {
      return pt.name;
    }
  }

  // 2. Try MapTiler Geocoding API if configured
  if (isMapTilerConfigured()) {
    try {
      const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAP_CONFIG.mapTilerApiKey}&limit=1`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const json = await res.json();
        if (json && json.features && json.features.length > 0) {
          const feat = json.features[0];
          const rawName = feat.place_name || feat.text;
          if (rawName) {
            return sanitizeLocationName(rawName, lat, lng);
          }
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 3. Fallback to coordinate notation
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}
