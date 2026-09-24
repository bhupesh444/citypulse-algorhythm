import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "dark" | "light" | "system";
export type AccentPreset = "teal" | "blue" | "purple" | "amber" | "red";
export type InterfaceDensity = "compact" | "comfortable" | "spacious";
export type TextSizeOption = "small" | "default" | "large";
export type MapThemeOption = "auto" | "dark" | "light";
export type MapLabelsOption = "standard" | "reduced";

export interface AppearanceState {
  theme: ThemeMode;
  accent: AccentPreset;
  density: InterfaceDensity;
  textSize: TextSizeOption;
  reduceMotion: boolean;
  glass: boolean;
  mapTheme: MapThemeOption;
  mapLabels: MapLabelsOption;
  highContrast: boolean;
  showSidebar: boolean;
  showMapControls: boolean;
  focusIndicators: boolean;
}

export interface AppearanceContextValue extends AppearanceState {
  resolvedTheme: "dark" | "light";
  resolvedMapTheme: "dark" | "light";
  isFullscreen: boolean;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentPreset) => void;
  setDensity: (density: InterfaceDensity) => void;
  setTextSize: (size: TextSizeOption) => void;
  setReduceMotion: (reduce: boolean) => void;
  setGlass: (glass: boolean) => void;
  setMapTheme: (mapTheme: MapThemeOption) => void;
  setMapLabels: (labels: MapLabelsOption) => void;
  setHighContrast: (contrast: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  setShowMapControls: (show: boolean) => void;
  setFocusIndicators: (focus: boolean) => void;
  toggleFullscreen: () => void;
  resetAppearance: () => void;
}

const STORAGE_KEYS = {
  theme: "citypulse-theme",
  accent: "citypulse-accent",
  density: "citypulse-density",
  textSize: "citypulse-text-size",
  reduceMotion: "citypulse-reduce-motion",
  glass: "citypulse-glass",
  mapTheme: "citypulse-map-theme",
  mapLabels: "citypulse-map-labels",
  highContrast: "citypulse-high-contrast",
  showSidebar: "citypulse-sidebar",
  showMapControls: "citypulse-map-controls",
  focusIndicators: "citypulse-focus-indicators",
} as const;

export const DEFAULT_APPEARANCE: AppearanceState = {
  theme: "dark",
  accent: "teal",
  density: "comfortable",
  textSize: "default",
  reduceMotion: false,
  glass: true,
  mapTheme: "auto",
  mapLabels: "standard",
  highContrast: false,
  showSidebar: true,
  showMapControls: true,
  focusIndicators: true,
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function getInitialValue<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    if (typeof fallback === "boolean") {
      return (item === "true") as unknown as T;
    }
    return item as unknown as T;
  } catch {
    return fallback;
  }
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    getInitialValue(STORAGE_KEYS.theme, DEFAULT_APPEARANCE.theme)
  );
  const [accent, setAccentState] = useState<AccentPreset>(() =>
    getInitialValue(STORAGE_KEYS.accent, DEFAULT_APPEARANCE.accent)
  );
  const [density, setDensityState] = useState<InterfaceDensity>(() =>
    getInitialValue(STORAGE_KEYS.density, DEFAULT_APPEARANCE.density)
  );
  const [textSize, setTextSizeState] = useState<TextSizeOption>(() =>
    getInitialValue(STORAGE_KEYS.textSize, DEFAULT_APPEARANCE.textSize)
  );
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() =>
    getInitialValue(STORAGE_KEYS.reduceMotion, DEFAULT_APPEARANCE.reduceMotion)
  );
  const [glass, setGlassState] = useState<boolean>(() =>
    getInitialValue(STORAGE_KEYS.glass, DEFAULT_APPEARANCE.glass)
  );
  const [mapTheme, setMapThemeState] = useState<MapThemeOption>(() =>
    getInitialValue(STORAGE_KEYS.mapTheme, DEFAULT_APPEARANCE.mapTheme)
  );
  const [mapLabels, setMapLabelsState] = useState<MapLabelsOption>(() =>
    getInitialValue(STORAGE_KEYS.mapLabels, DEFAULT_APPEARANCE.mapLabels)
  );
  const [highContrast, setHighContrastState] = useState<boolean>(() =>
    getInitialValue(STORAGE_KEYS.highContrast, DEFAULT_APPEARANCE.highContrast)
  );
  const [showSidebar, setShowSidebarState] = useState<boolean>(() =>
    getInitialValue(STORAGE_KEYS.showSidebar, DEFAULT_APPEARANCE.showSidebar)
  );
  const [showMapControls, setShowMapControlsState] = useState<boolean>(() =>
    getInitialValue(STORAGE_KEYS.showMapControls, DEFAULT_APPEARANCE.showMapControls)
  );
  const [focusIndicators, setFocusIndicatorsState] = useState<boolean>(() =>
    getInitialValue(STORAGE_KEYS.focusIndicators, DEFAULT_APPEARANCE.focusIndicators)
  );

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return Boolean(document.fullscreenElement);
  });

  // Track system dark mode preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Track fullscreen state
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const resolvedTheme: "dark" | "light" =
    theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  const resolvedMapTheme: "dark" | "light" =
    mapTheme === "auto" ? resolvedTheme : mapTheme;

  // Sync DOM attributes and localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.setAttribute("data-accent", accent);
    root.setAttribute("data-density", density);
    root.setAttribute("data-text-size", textSize);
    root.setAttribute("data-reduce-motion", String(reduceMotion));
    root.setAttribute("data-glass", String(glass));
    root.setAttribute("data-high-contrast", String(highContrast));
    root.setAttribute("data-focus-indicators", String(focusIndicators));
    root.setAttribute("data-sidebar-collapsed", String(!showSidebar));
  }, [
    resolvedTheme,
    accent,
    density,
    textSize,
    reduceMotion,
    glass,
    highContrast,
    focusIndicators,
    showSidebar,
  ]);

  // Setters with immediate localStorage persistence
  const setTheme = useCallback((val: ThemeMode) => {
    setThemeState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, val);
    } catch {}
  }, []);

  const setAccent = useCallback((val: AccentPreset) => {
    setAccentState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.accent, val);
    } catch {}
  }, []);

  const setDensity = useCallback((val: InterfaceDensity) => {
    setDensityState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.density, val);
    } catch {}
  }, []);

  const setTextSize = useCallback((val: TextSizeOption) => {
    setTextSizeState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.textSize, val);
    } catch {}
  }, []);

  const setReduceMotion = useCallback((val: boolean) => {
    setReduceMotionState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.reduceMotion, String(val));
    } catch {}
  }, []);

  const setGlass = useCallback((val: boolean) => {
    setGlassState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.glass, String(val));
    } catch {}
  }, []);

  const setMapTheme = useCallback((val: MapThemeOption) => {
    setMapThemeState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.mapTheme, val);
    } catch {}
  }, []);

  const setMapLabels = useCallback((val: MapLabelsOption) => {
    setMapLabelsState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.mapLabels, val);
    } catch {}
  }, []);

  const setHighContrast = useCallback((val: boolean) => {
    setHighContrastState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.highContrast, String(val));
    } catch {}
  }, []);

  const setShowSidebar = useCallback((val: boolean) => {
    setShowSidebarState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.showSidebar, String(val));
    } catch {}
  }, []);

  const setShowMapControls = useCallback((val: boolean) => {
    setShowMapControlsState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.showMapControls, String(val));
    } catch {}
  }, []);

  const setFocusIndicators = useCallback((val: boolean) => {
    setFocusIndicatorsState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.focusIndicators, String(val));
    } catch {}
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {}
  }, []);

  const resetAppearance = useCallback(() => {
    setThemeState(DEFAULT_APPEARANCE.theme);
    setAccentState(DEFAULT_APPEARANCE.accent);
    setDensityState(DEFAULT_APPEARANCE.density);
    setTextSizeState(DEFAULT_APPEARANCE.textSize);
    setReduceMotionState(DEFAULT_APPEARANCE.reduceMotion);
    setGlassState(DEFAULT_APPEARANCE.glass);
    setMapThemeState(DEFAULT_APPEARANCE.mapTheme);
    setMapLabelsState(DEFAULT_APPEARANCE.mapLabels);
    setHighContrastState(DEFAULT_APPEARANCE.highContrast);
    setShowSidebarState(DEFAULT_APPEARANCE.showSidebar);
    setShowMapControlsState(DEFAULT_APPEARANCE.showMapControls);
    setFocusIndicatorsState(DEFAULT_APPEARANCE.focusIndicators);

    try {
      localStorage.setItem(STORAGE_KEYS.theme, DEFAULT_APPEARANCE.theme);
      localStorage.setItem(STORAGE_KEYS.accent, DEFAULT_APPEARANCE.accent);
      localStorage.setItem(STORAGE_KEYS.density, DEFAULT_APPEARANCE.density);
      localStorage.setItem(STORAGE_KEYS.textSize, DEFAULT_APPEARANCE.textSize);
      localStorage.setItem(STORAGE_KEYS.reduceMotion, String(DEFAULT_APPEARANCE.reduceMotion));
      localStorage.setItem(STORAGE_KEYS.glass, String(DEFAULT_APPEARANCE.glass));
      localStorage.setItem(STORAGE_KEYS.mapTheme, DEFAULT_APPEARANCE.mapTheme);
      localStorage.setItem(STORAGE_KEYS.mapLabels, DEFAULT_APPEARANCE.mapLabels);
      localStorage.setItem(STORAGE_KEYS.highContrast, String(DEFAULT_APPEARANCE.highContrast));
      localStorage.setItem(STORAGE_KEYS.showSidebar, String(DEFAULT_APPEARANCE.showSidebar));
      localStorage.setItem(STORAGE_KEYS.showMapControls, String(DEFAULT_APPEARANCE.showMapControls));
      localStorage.setItem(STORAGE_KEYS.focusIndicators, String(DEFAULT_APPEARANCE.focusIndicators));
    } catch {}
  }, []);

  return (
    <AppearanceContext.Provider
      value={{
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
        resolvedMapTheme,
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
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
