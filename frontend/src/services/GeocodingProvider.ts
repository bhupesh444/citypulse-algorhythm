import { MAP_CONFIG, isMapTilerConfigured } from "../config/mapConfig";

export interface LocationSuggestion {
  id: string;
  name: string;
  secondaryText: string;
  latitude: number;
  longitude: number;
  placeType?: string;
  source: "maptiler" | "backend" | "local";
}

// Curated list of prominent Jaipur civic landmarks and operational centers
const LOCAL_JAIPUR_LANDMARKS: LocationSuggestion[] = [
  {
    id: "amity-univ",
    name: "Amity University Rajasthan",
    secondaryText: "Kant Kalwar, NH-11C, Jaipur, Rajasthan, India",
    latitude: 27.1769338,
    longitude: 75.9596886,
    placeType: "university",
    source: "local",
  },
  {
    id: "kalwar",
    name: "Kalwar",
    secondaryText: "Jaipur, Rajasthan, India",
    latitude: 26.984,
    longitude: 75.592,
    placeType: "locality",
    source: "local",
  },
  {
    id: "kalwar-road",
    name: "Kalwar Road",
    secondaryText: "Road · Jaipur, Rajasthan, India",
    latitude: 26.945,
    longitude: 75.712,
    placeType: "road",
    source: "local",
  },
  {
    id: "kalwar-civic-zone",
    name: "Kalwar Civic Zone",
    secondaryText: "Civic Zone · West Sector, Jaipur",
    latitude: 26.972,
    longitude: 75.618,
    placeType: "zone",
    source: "local",
  },
  {
    id: "jaipur-airport",
    name: "Jaipur International Airport",
    secondaryText: "Airport Road, Sanganer, Jaipur, Rajasthan, India",
    latitude: 26.828,
    longitude: 75.805,
    placeType: "airport",
    source: "local",
  },
  {
    id: "mi-road",
    name: "MI Road",
    secondaryText: "Mirza Ismail Road, Pink City, Jaipur, Rajasthan, India",
    latitude: 26.9184,
    longitude: 75.8015,
    placeType: "road",
    source: "local",
  },
  {
    id: "vaishali-nagar",
    name: "Vaishali Nagar",
    secondaryText: "Civic Sub-district, West Jaipur, Rajasthan, India",
    latitude: 26.907,
    longitude: 75.742,
    placeType: "neighbourhood",
    source: "local",
  },
  {
    id: "malviya-nagar",
    name: "Malviya Nagar",
    secondaryText: "Commercial & Institutional Sector, South Jaipur, Rajasthan",
    latitude: 26.853,
    longitude: 75.819,
    placeType: "neighbourhood",
    source: "local",
  },
  {
    id: "mansarovar",
    name: "Mansarovar",
    secondaryText: "Metro Corridor & Housing Sector, Southwest Jaipur, Rajasthan",
    latitude: 26.858,
    longitude: 75.762,
    placeType: "neighbourhood",
    source: "local",
  },
  {
    id: "sitapura",
    name: "Sitapura Industrial Area",
    secondaryText: "Tech & Industrial Corridor, North-South Axis, Jaipur",
    latitude: 27.245,
    longitude: 75.892,
    placeType: "industrial",
    source: "local",
  },
  {
    id: "hawa-mahal",
    name: "Hawa Mahal",
    secondaryText: "Badi Chaupar, Old Historic City, Jaipur, Rajasthan, India",
    latitude: 26.9239,
    longitude: 75.8267,
    placeType: "monument",
    source: "local",
  },
  {
    id: "amber-fort",
    name: "Amber Fort & Palace",
    secondaryText: "Devisinghpura, Amer, Jaipur, Rajasthan, India",
    latitude: 26.9855,
    longitude: 75.8513,
    placeType: "fort",
    source: "local",
  },
  {
    id: "city-palace",
    name: "City Palace",
    secondaryText: "Tulsi Marg, Gangori Bazar, J.D.A. Market, Jaipur, Rajasthan",
    latitude: 26.9258,
    longitude: 75.8236,
    placeType: "palace",
    source: "local",
  },
  {
    id: "raja-park",
    name: "Raja Park",
    secondaryText: "Commercial Hub & Jawahar Nagar, Jaipur, Rajasthan",
    latitude: 26.897,
    longitude: 75.826,
    placeType: "commercial",
    source: "local",
  },
  {
    id: "c-scheme",
    name: "C-Scheme",
    secondaryText: "Ashok Nagar Financial & Civic District, Jaipur, Rajasthan",
    latitude: 26.911,
    longitude: 75.798,
    placeType: "district",
    source: "local",
  },
  {
    id: "tonk-road",
    name: "Tonk Road Corridor",
    secondaryText: "Arterial Transit Highway, Jaipur, Rajasthan, India",
    latitude: 26.865,
    longitude: 75.802,
    placeType: "arterial",
    source: "local",
  },
  {
    id: "jagatpura",
    name: "Jagatpura",
    secondaryText: "Growth & Institutional Sector, Jaipur, Rajasthan",
    latitude: 26.815,
    longitude: 75.85,
    placeType: "neighbourhood",
    source: "local",
  },
  {
    id: "durgapura",
    name: "Durgapura Civic Sector",
    secondaryText: "South Operational Environs, Jaipur, Rajasthan",
    latitude: 27.112,
    longitude: 75.923,
    placeType: "civic",
    source: "local",
  },
  {
    id: "vidhyadhar-nagar",
    name: "Vidhyadhar Nagar",
    secondaryText: "North Jaipur Planned Sector, Rajasthan, India",
    latitude: 26.962,
    longitude: 75.778,
    placeType: "residential",
    source: "local",
  },
  {
    id: "chomu",
    name: "Chomu Tehsil",
    secondaryText: "Northwest Operational Envelope, Jaipur District, Rajasthan",
    latitude: 27.162,
    longitude: 75.882,
    placeType: "tehsil",
    source: "local",
  },
];

export class GeocodingProvider {
  private cache = new Map<string, { timestamp: number; data: LocationSuggestion[] }>();
  private cacheTtl = 1000 * 60 * 30; // 30 minutes in-memory TTL
  private activeController: AbortController | null = null;

  /**
   * Search locations by text query with debouncing, request cancellation,
   * MapTiler Geocoding API integration, and local landmark fallback.
   */
  async searchLocations(
    query: string,
    signal?: AbortSignal
  ): Promise<LocationSuggestion[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery || cleanQuery.length < 2) {
      return [];
    }

    // 1. Check in-memory cache
    const cached = this.cache.get(cleanQuery);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return cached.data;
    }

    // Cancel previous stale request if pending
    if (this.activeController) {
      this.activeController.abort();
    }
    this.activeController = new AbortController();
    const activeSignal = signal || this.activeController.signal;

    const results: LocationSuggestion[] = [];
    const seenCoordinates = new Set<string>();

    const addSuggestion = (sug: LocationSuggestion) => {
      const coordKey = `${sug.latitude.toFixed(3)},${sug.longitude.toFixed(3)}`;
      const nameKey = sug.name.toLowerCase();
      if (!seenCoordinates.has(coordKey) && !seenCoordinates.has(nameKey)) {
        seenCoordinates.add(coordKey);
        seenCoordinates.add(nameKey);
        results.push(sug);
      }
    };

    // 2. Query MapTiler Geocoding API if key configured
    if (isMapTilerConfigured()) {
      try {
        const encoded = encodeURIComponent(cleanQuery);
        // Proximity centered around Jaipur (lng: 75.80, lat: 26.92)
        const url = `https://api.maptiler.com/geocoding/${encoded}.json?key=${MAP_CONFIG.mapTilerApiKey}&proximity=75.80,26.92&limit=8`;
        const res = await fetch(url, {
          signal: activeSignal,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.features)) {
            for (const f of json.features) {
              const [lng, lat] = f.center || [0, 0];
              if (lat === 0 && lng === 0) continue;

              const name = f.text || f.place_name?.split(",")[0] || cleanQuery;
              // Build clean secondary text from place_name
              const parts: string[] = (f.place_name || "")
                .split(",")
                .map((p: string) => p.trim())
                .filter((p: string) => p.toLowerCase() !== name.toLowerCase());

              const secondary =
                parts.length > 0 ? parts.join(", ") : "Jaipur, Rajasthan, India";

              addSuggestion({
                id: f.id || `mt-${lat}-${lng}`,
                name,
                secondaryText: secondary,
                latitude: lat,
                longitude: lng,
                placeType: f.place_type?.[0] || "location",
                source: "maptiler",
              });
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw err;
        }
        // Fallback gracefully to backend/local
      }
    }

    // 3. Fallback to backend geocoding endpoint if MapTiler returned few or no results
    if (results.length < 3) {
      try {
        const res = await fetch(
          `/api/geocoding/search?q=${encodeURIComponent(cleanQuery)}`,
          {
            signal: activeSignal,
            headers: { Accept: "application/json" },
          }
        );
        if (res.ok) {
          const backendData = await res.json();
          if (Array.isArray(backendData)) {
            for (const item of backendData) {
              const name = item.name || item.display_name?.split(",")[0] || cleanQuery;
              const secondary = item.display_name || "Jaipur, Rajasthan, India";
              addSuggestion({
                id: `backend-${item.latitude}-${item.longitude}`,
                name,
                secondaryText: secondary,
                latitude: item.latitude,
                longitude: item.longitude,
                source: "backend",
              });
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw err;
        }
      }
    }

    // 4. Match local curated Jaipur landmarks (ensuring high-value places always match quickly)
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
    for (const lm of LOCAL_JAIPUR_LANDMARKS) {
      const lmLower = (lm.name + " " + lm.secondaryText).toLowerCase();
      const matchesAllTokens = queryTokens.every((token) => lmLower.includes(token));
      if (matchesAllTokens) {
        addSuggestion(lm);
      }
    }

    const finalResults = results.slice(0, 8);

    // Save in cache
    if (finalResults.length > 0) {
      this.cache.set(cleanQuery, {
        timestamp: Date.now(),
        data: finalResults,
      });
    }

    return finalResults;
  }

  /**
   * Get detail information for a location by ID
   */
  async getLocationDetails(id: string): Promise<LocationSuggestion | null> {
    for (const [, entry] of this.cache) {
      const match = entry.data.find((item) => item.id === id);
      if (match) return match;
    }
    return LOCAL_JAIPUR_LANDMARKS.find((lm) => lm.id === id) || null;
  }
}

// Global singleton instance
export const geocodingProvider = new GeocodingProvider();
