import React, { useEffect, useRef } from "react";

export type MapLayersState = {
  traffic: boolean;
  incidents: boolean;
  zones: boolean;
  weather: boolean;
  airQuality: boolean;
  transit: boolean;
  infrastructure: boolean;
  parking: boolean;
  populationDensity: boolean;
  riskHeatmap: boolean;
};

interface MapLayerControlProps {
  layers: MapLayersState;
  onChange: (layers: MapLayersState) => void;
  onClose?: () => void;
}

export const defaultLayersState: MapLayersState = {
  traffic: false,
  incidents: false,
  zones: false,
  weather: false,
  airQuality: false,
  transit: false,
  infrastructure: false,
  parking: false,
  populationDensity: false,
  riskHeatmap: false,
};

export const MapLayerControl: React.FC<MapLayerControlProps> = ({ layers, onChange, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Click outside to close + ESC key listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest(".layers-trigger-btn") || target.closest(".map-switch")) return;
        onClose?.();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const toggle = (key: keyof MapLayersState) => {
    onChange({ ...layers, [key]: !layers[key] });
  };

  const layerItems: { key: keyof MapLayersState; label: string; icon: string }[] = [
    { key: "traffic", label: "Traffic Flow", icon: "⇋" },
    { key: "incidents", label: "Incidents", icon: "⚠" },
    { key: "zones", label: "Civic Zones", icon: "◈" },
    { key: "weather", label: "Weather", icon: "☁" },
    { key: "airQuality", label: "Air Quality", icon: "♨" },
    { key: "transit", label: "Public Transit", icon: "▣" },
    { key: "infrastructure", label: "Infrastructure", icon: "⌁" },
    { key: "parking", label: "Parking", icon: "P" },
    { key: "populationDensity", label: "Population Density", icon: "👥" },
    { key: "riskHeatmap", label: "Risk Heatmap", icon: "◬" },
  ];

  return (
    <div
      ref={panelRef}
      className="layer-control-panel"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="layer-control-header">
        <span className="layer-control-title">Layers</span>
        {onClose && (
          <button className="layer-control-close" onClick={onClose} aria-label="Close layers panel">
            ×
          </button>
        )}
      </div>

      <div className="layer-items-list">
        {layerItems.map((item) => {
          const active = layers[item.key];
          return (
            <button
              key={item.key}
              className={`layer-toggle-row ${active ? "is-active" : ""}`}
              onClick={() => toggle(item.key)}
              type="button"
            >
              <span className={`layer-check-pill ${active ? "checked" : ""}`}>
                {active ? "✓" : "○"}
              </span>
              <span className="layer-icon">{item.icon}</span>
              <span className="layer-name">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
