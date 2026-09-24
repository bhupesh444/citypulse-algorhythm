const mapTilerApiKey = (import.meta.env.VITE_MAPTILER_API_KEY as string | undefined)?.trim();

export const MAP_CONFIG = {
  mapTilerApiKey:
    mapTilerApiKey &&
    mapTilerApiKey !== "YOUR_MAPTILER_API_KEY_HERE" &&
    mapTilerApiKey !== "your_maptiler_key_here"
      ? mapTilerApiKey
      : "",
  styleUrl:
    mapTilerApiKey &&
    mapTilerApiKey !== "YOUR_MAPTILER_API_KEY_HERE" &&
    mapTilerApiKey !== "your_maptiler_key_here"
      ? `https://api.maptiler.com/maps/streets-v4/style.json?key=${mapTilerApiKey}`
      : "",
  darkStyleUrl:
    mapTilerApiKey &&
    mapTilerApiKey !== "YOUR_MAPTILER_API_KEY_HERE" &&
    mapTilerApiKey !== "your_maptiler_key_here"
      ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerApiKey}`
      : "",
  lightStyleUrl:
    mapTilerApiKey &&
    mapTilerApiKey !== "YOUR_MAPTILER_API_KEY_HERE" &&
    mapTilerApiKey !== "your_maptiler_key_here"
      ? `https://api.maptiler.com/maps/dataviz-light/style.json?key=${mapTilerApiKey}`
      : "",
};

export function isMapTilerConfigured(): boolean {
  return Boolean(MAP_CONFIG.mapTilerApiKey);
}

const cesiumIonToken = (import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined)?.trim();

export const CESIUM_CONFIG = {
  ionToken:
    cesiumIonToken &&
    cesiumIonToken !== "YOUR_CESIUM_ION_TOKEN" &&
    cesiumIonToken !== "your_cesium_ion_token_here"
      ? cesiumIonToken
      : "",
};

export function isCesiumConfigured(): boolean {
  return Boolean(CESIUM_CONFIG.ionToken);
}

