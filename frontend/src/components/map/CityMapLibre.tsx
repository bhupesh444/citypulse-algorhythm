import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CitySnapshot, SelectedArea } from "../../types/citypulse";
import { MapLayersState } from "./MapLayerControl";
import { MAP_CONFIG, isMapTilerConfigured } from "../../config/mapConfig";
import { computeSolarConditions, SolarConditions } from "../../utils/solarCalculator";
import { reverseGeocode } from "../../utils/reverseGeocoding";
import { MapInspectionPanel } from "./MapInspectionPanel";
import { CityScan, CityScanSummary } from "./CityScan";

export const AMITY_CENTER: [number, number] = [75.9596886, 27.1769338]; // [lng, lat] for MapLibre

// 5 Core Civic Zones with real coordinates
export const JAIPUR_CIVIC_ZONES = [
  { id: "central", name: "Central", lat: 27.1769, lng: 75.9597, baseCongestion: 72 },
  { id: "north", name: "North", lat: 27.245, lng: 75.892, baseCongestion: 48 },
  { id: "south", name: "South", lat: 27.112, lng: 75.923, baseCongestion: 85 },
  { id: "east", name: "East", lat: 27.185, lng: 76.035, baseCongestion: 56 },
  { id: "west", name: "West", lat: 27.162, lng: 75.882, baseCongestion: 38 },
];

interface CityMapLibreProps {
  snapshot: CitySnapshot;
  layers: MapLayersState;
  selectedArea?: SelectedArea | null;
  focusLocation?: [number, number]; // [lat, lng]
  isLayersOpen?: boolean;
  mapTheme?: "dark" | "light";
  mapLabels?: "standard" | "reduced";
  showControls?: boolean;
  isScanning?: boolean;
  onScanComplete?: (summary: CityScanSummary) => void;
  onCancelScan?: () => void;
  onInvestigate?: (zoneName?: string) => void;
  onSelectArea: (area: SelectedArea | null) => void;
  onOpenSettings?: () => void;
  onSwitchTo3D?: () => void;
  onInspectDetails?: () => void;
}

export const CityMapLibre: React.FC<CityMapLibreProps> = ({
  snapshot,
  layers,
  selectedArea,
  focusLocation,
  isLayersOpen = false,
  mapTheme = "dark",
  mapLabels = "standard",
  showControls = true,
  isScanning = false,
  onScanComplete,
  onCancelScan,
  onInvestigate,
  onSelectArea,
  onOpenSettings,
  onSwitchTo3D,
  onInspectDetails,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const selectedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const onSelectAreaRef = useRef(onSelectArea);
  onSelectAreaRef.current = onSelectArea;

  const [mapError, setMapError] = useState<string | null>(null);
  const [keyMissing, setKeyMissing] = useState(false);
  const [dismissNotice, setDismissNotice] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Dynamic Day/Night Solar State
  const [solarConditions, setSolarConditions] = useState<SolarConditions>(() =>
    computeSolarConditions(AMITY_CENTER[1], AMITY_CENTER[0])
  );

  // User Geolocation status
  const [locatingStatus, setLocatingStatus] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [showMoreControls, setShowMoreControls] = useState(false);
  const toastTimerRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setStatusToast(null), 4000);
  };

  const maptilerKey = MAP_CONFIG.mapTilerApiKey;

  // Recalculate solar conditions periodically (every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      const center = mapRef.current?.getCenter() || { lng: AMITY_CENTER[0], lat: AMITY_CENTER[1] };
      setSolarConditions(computeSolarConditions(center.lat, center.lng));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Update solar condition when map moves
  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    setSolarConditions(computeSolarConditions(center.lat, center.lng));
  }, []);

  // Apply Muted Blue-Gray Road Colors with Solar Lighting Awareness
  const applyRoadColors = useCallback(
    (map: maplibregl.Map, isDimmed: boolean = false) => {
      const style = map.getStyle();
      if (!style || !style.layers) return;

      const solar = computeSolarConditions(
        map.getCenter().lat,
        map.getCenter().lng
      );

      style.layers.forEach((layer) => {
        if (layer.type !== "line") return;
        const id = layer.id.toLowerCase();
        // Skip our dedicated selected roads highlight layers
        if (id.startsWith("selected-roads-")) return;

        const sourceLayer = ((layer as any)["source-layer"] || "").toLowerCase();

        // Target authentic road and transportation geometry
        const isRoad =
          sourceLayer === "transportation" ||
          sourceLayer === "road" ||
          id.includes("road") ||
          id.includes("highway") ||
          id.includes("street") ||
          id.includes("motorway") ||
          id.includes("trunk") ||
          id.includes("primary") ||
          id.includes("secondary") ||
          id.includes("tertiary");

        // Strictly exclude boundaries, railways, water lines, zones, traffic flow
        const isExcluded =
          id.includes("traffic") ||
          id.includes("zone") ||
          id.includes("boundary") ||
          id.includes("admin") ||
          id.includes("border") ||
          id.includes("rail") ||
          id.includes("train") ||
          id.includes("metro") ||
          id.includes("water") ||
          id.includes("river") ||
          id.includes("label") ||
          id.includes("text") ||
          id.includes("shield");

        if (isRoad && !isExcluded) {
          let roadColor = solar.secondaryRoadColor; // Muted blue-gray #607786 (Day) / #526A78 (Night)
          if (
            id.includes("motorway") ||
            id.includes("trunk") ||
            id.includes("primary") ||
            id.includes("major") ||
            id.includes("expressway") ||
            id.includes("highway")
          ) {
            roadColor = solar.majorRoadColor; // Major road #6B8492 (Day) / #5D7685 (Night)
          } else if (
            id.includes("minor") ||
            id.includes("service") ||
            id.includes("street") ||
            id.includes("residential") ||
            id.includes("path") ||
            id.includes("track") ||
            id.includes("link")
          ) {
            roadColor = solar.minorRoadColor; // Minor road #526A77 (Day) / #445967 (Night)
          }

          // In investigation/inspection mode, dim background roads so attention stays on highlighted paths
          if (isDimmed) {
            roadColor = "#1a2a38";
          }

          try {
            map.setPaintProperty(layer.id, "line-color", roadColor);
          } catch {
            // Ignore static/non-dynamic layers
          }
        }
      });
    },
    []
  );

  // Optimize label hierarchy & styling for Google Maps-style geographic details
  const applyLabelHierarchy = useCallback(
    (map: maplibregl.Map, isDimmed: boolean = false) => {
      const style = map.getStyle();
      if (!style || !style.layers) return;

      style.layers.forEach((layer) => {
        if (layer.type !== "symbol") return;
        const id = layer.id;
        const lowerId = id.toLowerCase();

        try {
          // 1. Neighborhoods, Localities, Colonies, Suburbs (Place labels)
          if (id === "Place labels" || lowerId.includes("place label")) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#d1e4eb");
              map.setPaintProperty(id, "text-halo-color", "#040d13");
              map.setPaintProperty(id, "text-halo-width", 1.5);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(148, 178, 194, 0.45)");
            }
          }

          // 2. City, Town & Capital labels
          if (
            id === "City labels" ||
            id === "Town labels" ||
            id === "Capital city labels"
          ) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#f0fdf4");
              map.setPaintProperty(id, "text-halo-color", "#030a0f");
              map.setPaintProperty(id, "text-halo-width", 1.8);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(203, 213, 225, 0.4)");
            }
          }

          // 3. Road / Street Names (Road labels)
          if (id === "Road labels" || lowerId.includes("road label")) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#93c5fd");
              map.setPaintProperty(id, "text-halo-color", "#03080d");
              map.setPaintProperty(id, "text-halo-width", 1.4);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(147, 197, 253, 0.35)");
            }
          }

          // 4. Universities, Colleges & Schools (Education POIs)
          if (id === "Education" || lowerId.includes("education")) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#67e8f9"); // Subtle cyan
              map.setPaintProperty(id, "text-halo-color", "#030d12");
              map.setPaintProperty(id, "text-halo-width", 1.4);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(103, 232, 249, 0.3)");
            }
          }

          // 5. Hospitals, Clinics & Medical (Healthcare POIs)
          if (id === "Healthcare" || lowerId.includes("healthcare")) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#fca5a5"); // Subtle soft red/coral
              map.setPaintProperty(id, "text-halo-color", "#080303");
              map.setPaintProperty(id, "text-halo-width", 1.4);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(252, 165, 165, 0.3)");
            }
          }

          // 6. Railway Stations, Metro & Bus Terminals (Station & Transport POIs)
          if (
            id === "Station" ||
            id === "Transport" ||
            lowerId.includes("station") ||
            lowerId.includes("transit")
          ) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#7dd3fc"); // Sky blue
              map.setPaintProperty(id, "text-halo-color", "#020a10");
              map.setPaintProperty(id, "text-halo-width", 1.4);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(125, 211, 252, 0.3)");
            }
          }

          // 7. Parks, Gardens & Recreation
          if (id === "Park" || lowerId.includes("park")) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#86efac"); // Soft emerald
              map.setPaintProperty(id, "text-halo-color", "#030a06");
              map.setPaintProperty(id, "text-halo-width", 1.4);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(134, 239, 172, 0.3)");
            }
          }

          // 8. Markets, Shopping, Malls & Commercial Hubs
          if (
            id === "Shopping" ||
            id === "Food" ||
            id === "Tourism" ||
            id === "Culture"
          ) {
            map.setLayoutProperty(id, "visibility", "visible");
            if (!isDimmed) {
              map.setPaintProperty(id, "text-color", "#fde68a"); // Amber/warm civic gold
              map.setPaintProperty(id, "text-halo-color", "#0a0702");
              map.setPaintProperty(id, "text-halo-width", 1.4);
            } else {
              map.setPaintProperty(id, "text-color", "rgba(253, 230, 138, 0.3)");
            }
          }
        } catch {
          // Ignore layers without text-color or with immutable styles
        }
      });
    },
    []
  );

  // Ensure highlight GeoJSON source and layers exist for selected location roads
  const ensureHighlightLayers = useCallback((map: maplibregl.Map) => {
    if (!map || !map.isStyleLoaded()) return false;

    try {
      if (!map.getSource("selected-roads-source")) {
        map.addSource("selected-roads-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }

      // Layer 1: Dark Casing for contrast against any basemap background
      if (!map.getLayer("selected-roads-casing")) {
        map.addLayer({
          id: "selected-roads-casing",
          type: "line",
          source: "selected-roads-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#011624",
            "line-width": 6.5,
            "line-opacity": 0.85,
          },
        });
      }

      // Layer 2: Subtle Cyan/Blue Glow effect
      if (!map.getLayer("selected-roads-glow")) {
        map.addLayer({
          id: "selected-roads-glow",
          type: "line",
          source: "selected-roads-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#06b6d4",
            "line-width": 5.2,
            "line-blur": 3.2,
            "line-opacity": 0.72,
          },
        });
      }

      // Layer 3: Crisp Bright Blue Core line
      if (!map.getLayer("selected-roads-core")) {
        map.addLayer({
          id: "selected-roads-core",
          type: "line",
          source: "selected-roads-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#38bdf8",
            "line-width": 2.6,
            "line-opacity": 0.98,
          },
        });
      }
      return true;
    } catch (err) {
      console.warn("[CityPulse] ensureHighlightLayers style not ready:", err);
      return false;
    }
  }, []);

  // Extract authentic road & path vector geometries directly from MapLibre rendered layers around coordinate
  const extractNearbyRoads = useCallback(
    (map: maplibregl.Map, lng: number, lat: number) => {
      try {
        const point = map.project([lng, lat]);
        // Search window ~160px box around the selected point
        const radiusPx = 160;
        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [Math.max(0, point.x - radiusPx), Math.max(0, point.y - radiusPx)],
          [point.x + radiusPx, point.y + radiusPx],
        ];

        const rendered = map.queryRenderedFeatures(bbox);
        const roadFeatures: any[] = [];
        const seenGeometries = new Set<string>();

        for (const f of rendered) {
          if (
            f.geometry.type !== "LineString" &&
            f.geometry.type !== "MultiLineString"
          ) {
            continue;
          }

          const layerId = (f.layer?.id || "").toLowerCase();
          const sourceLayer = (f.sourceLayer || "").toLowerCase();

          // Strictly skip our own selection layers and overlay layers
          if (layerId.startsWith("selected-roads-") || layerId.includes("traffic")) {
            continue;
          }

          // Verify this feature belongs to a legitimate road/transportation layer
          const isRoadLayer =
            sourceLayer === "transportation" ||
            sourceLayer === "road" ||
            layerId.includes("road") ||
            layerId.includes("street") ||
            layerId.includes("highway") ||
            layerId.includes("motorway") ||
            layerId.includes("trunk") ||
            layerId.includes("primary") ||
            layerId.includes("secondary") ||
            layerId.includes("tertiary") ||
            layerId.includes("link") ||
            layerId.includes("service") ||
            layerId.includes("residential") ||
            layerId.includes("path") ||
            layerId.includes("track");

          // Exclude railways, admin, water, labels
          const isExcluded =
            layerId.includes("rail") ||
            layerId.includes("admin") ||
            layerId.includes("boundary") ||
            layerId.includes("border") ||
            layerId.includes("water") ||
            layerId.includes("label") ||
            layerId.includes("text") ||
            layerId.includes("shield");

          if (isRoadLayer && !isExcluded) {
            // Deduplicate by coords fingerprint
            const key = JSON.stringify(f.geometry.coordinates);
            if (!seenGeometries.has(key)) {
              seenGeometries.add(key);
              roadFeatures.push({
                type: "Feature",
                geometry: f.geometry,
                properties: { ...f.properties },
              });
            }
          }
        }

        return roadFeatures;
      } catch (err) {
        console.warn("[CityPulse] Could not query rendered roads:", err);
        return [];
      }
    },
    []
  );

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    setMapError(null);

    if (!isMapTilerConfigured()) {
      setKeyMissing(true);
    } else {
      setKeyMissing(false);
    }

    const targetMapStyle =
      mapTheme === "light"
        ? (MAP_CONFIG.lightStyleUrl || MAP_CONFIG.styleUrl)
        : (MAP_CONFIG.darkStyleUrl || MAP_CONFIG.styleUrl);

    const styleSpec: string | maplibregl.StyleSpecification =
      isMapTilerConfigured()
        ? targetMapStyle
        : mapTheme === "light"
        ? {
            version: 8,
            sources: {
              "osm-tiles": {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© MapTiler, © OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "background-light",
                type: "background",
                paint: { "background-color": "#f8fafc" },
              },
              {
                id: "osm-raster-layer",
                type: "raster",
                source: "osm-tiles",
                minzoom: 0,
                maxzoom: 19,
                paint: {
                  "raster-opacity": 0.95,
                  "raster-contrast": 0.05,
                  "raster-brightness-min": 0.1,
                  "raster-brightness-max": 0.95,
                  "raster-saturation": -0.15,
                },
              },
            ],
          }
        : {
            version: 8,
            sources: {
              "osm-tiles": {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© MapTiler, © OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "background-dark",
                type: "background",
                paint: { "background-color": "#07161b" },
              },
              {
                id: "osm-raster-layer",
                type: "raster",
                source: "osm-tiles",
                minzoom: 0,
                maxzoom: 19,
                paint: {
                  "raster-opacity": 0.85,
                  "raster-contrast": 0.25,
                  "raster-brightness-min": 0.05,
                  "raster-brightness-max": 0.65,
                  "raster-saturation": -0.85,
                },
              },
            ],
          };

    let mapInstance: maplibregl.Map;
    try {
      mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: styleSpec,
        center: AMITY_CENTER,
        zoom: 11,
        minZoom: 2,
        maxZoom: 19,
        pitch: 35,
        bearing: -8,
        attributionControl: false,
        scrollZoom: true,
        dragPan: true,
        dragRotate: true,
        doubleClickZoom: true,
        touchZoomRotate: true,
      });
    } catch (err: any) {
      console.error("[CityPulse Map Error]", err);
      setMapError("Failed to initialize MapLibre WebGL context.");
      return;
    }

    // Map attribution (Preserve legitimate MapTiler and OpenStreetMap attribution)
    mapInstance.addControl(
      new maplibregl.AttributionControl({
        customAttribution: "© MapTiler, © OpenStreetMap contributors",
        compact: true,
      }),
      "bottom-right"
    );

    // Dynamic Road Colors, Label Hierarchy, and Highlight Layer Setup on Load & Style Update
    const onMapReady = () => {
      ensureHighlightLayers(mapInstance);
      applyRoadColors(mapInstance, Boolean(selectedArea));
      applyLabelHierarchy(mapInstance, Boolean(selectedArea));
    };

    mapInstance.on("load", onMapReady);
    mapInstance.on("style.load", onMapReady);
    mapInstance.on("styledata", () => {
      if (mapInstance.isStyleLoaded()) {
        ensureHighlightLayers(mapInstance);
        applyRoadColors(mapInstance, Boolean(selectedArea));
        applyLabelHierarchy(mapInstance, Boolean(selectedArea));
      }
    });
    mapInstance.on("moveend", handleMapMoveEnd);

    // Responsive Canvas Resize Observer
    const ro = new ResizeObserver(() => {
      mapInstance.resize();
    });
    ro.observe(mapContainer.current);

    // Error handling
    mapInstance.on("error", (e: any) => {
      const msg = e?.error?.message || "";
      if (
        msg.includes("401") ||
        msg.includes("403") ||
        msg.includes("Key") ||
        msg.includes("Unauthorized")
      ) {
        console.error("[CityPulse] MapTiler key unauthorized or invalid:", msg);
        setMapError("Invalid MapTiler API Key (401/403). Please verify VITE_MAPTILER_API_KEY in .env.");
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        console.error("[CityPulse] MapTiler network connection error:", msg);
        setMapError("Network error while connecting to MapTiler basemap service.");
      }
    });

    // -------------------------------------------------------------
    // PART 4: CLICK ANYWHERE ON 2D MAP -> CIVIC INSPECTION
    // -------------------------------------------------------------
    mapInstance.on("click", async (e: maplibregl.MapMouseEvent) => {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;

      // 1. Identify nearest civic zone & distance
      let nearestZone = JAIPUR_CIVIC_ZONES[0];
      let minDist = 999;
      JAIPUR_CIVIC_ZONES.forEach((z) => {
        const d = Math.hypot(lat - z.lat, lng - z.lng);
        if (d < minDist) {
          minDist = d;
          nearestZone = z;
        }
      });

      // Zone radius threshold ~25 KM (0.24 degrees)
      const isInsideZone = minDist < 0.24;

      // 2. Reverse Geocode (MapTiler or Jaipur Landmark fallback)
      const locationName = await reverseGeocode(lat, lng);

      // 3. Telemetry extraction from current snapshot
      const zoneTraffic = isInsideZone
        ? snapshot.traffic.find(
            (t) => t.zone.toLowerCase() === nearestZone.name.toLowerCase()
          ) ?? snapshot.traffic[0]
        : undefined;

      const zoneTransit = isInsideZone
        ? snapshot.transit.find(
            (t) => t.zone.toLowerCase() === nearestZone.name.toLowerCase()
          ) ?? snapshot.transit[0]
        : undefined;

      const zoneIncidents = isInsideZone
        ? snapshot.incidents.filter(
            (i) => i.zone.toLowerCase() === nearestZone.name.toLowerCase()
          )
        : [];

      const status: SelectedArea["status"] = !isInsideZone
        ? "NORMAL"
        : zoneTraffic && (zoneTraffic.congestion > 80 || zoneIncidents.length > 1)
        ? "CRITICAL"
        : zoneTraffic && (zoneTraffic.congestion > 50 || (zoneTransit?.delay_minutes ?? 0) > 8 || zoneIncidents.length > 0)
        ? "WARNING"
        : "NORMAL";

      // 4. Update shared application state
      onSelectAreaRef.current({
        latitude: lat,
        longitude: lng,
        zone: isInsideZone ? nearestZone.name : "Outside Monitored Area",
        location: locationName,
        traffic: isInsideZone ? (zoneTraffic?.congestion ?? 40) : 0,
        transitDelay: isInsideZone ? (zoneTransit?.delay_minutes ?? 0) : 0,
        incidents: zoneIncidents.length,
        status,
        isNearby: !isInsideZone,
        entityType: "location",
        entityName: locationName,
      });
    });

    mapRef.current = mapInstance;

    return () => {
      ro.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (selectedMarkerRef.current) selectedMarkerRef.current.remove();
      if (userMarkerRef.current) userMarkerRef.current.remove();
      mapInstance.remove();
      mapRef.current = null;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [maptilerKey, reloadKey, mapTheme, applyRoadColors, handleMapMoveEnd]);

  // Requirements 2 & 8: Freeze/Pause Map Interaction Handlers in Inspection Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedArea) {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    } else {
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.dragRotate.enable();
      map.keyboard.enable();
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
    }
  }, [selectedArea]);

  // Handle focus flyTo when selected location changes externally (e.g. from 3D or search)
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return;
    mapRef.current.flyTo({
      center: [focusLocation[1], focusLocation[0]],
      zoom: 14.2,
      pitch: 42,
      speed: 1.3,
      curve: 1.4,
    });
  }, [focusLocation]);

  // Update Selected Location Reticle Marker, Radial Spotlight Coordinates & Authentic Road Highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Toggle .is-selected-feature on matching marker elements
    const container = mapContainer.current;
    if (container) {
      container
        .querySelectorAll(".is-selected-feature")
        .forEach((el) => el.classList.remove("is-selected-feature"));

      if (selectedArea?.zone) {
        const matchingZoneEl = container.querySelector(
          `[data-zone="${selectedArea.zone}"]`
        );
        if (matchingZoneEl) {
          matchingZoneEl.classList.add("is-selected-feature");
        }
      }
    }

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedArea) {
      // 1. Update CSS custom properties for radial spotlight centered on selected point
      if (container) {
        try {
          const pt = map.project([selectedArea.longitude, selectedArea.latitude]);
          container.style.setProperty("--selected-px-x", `${Math.round(pt.x)}px`);
          container.style.setProperty("--selected-px-y", `${Math.round(pt.y)}px`);
        } catch {
          container.style.setProperty("--selected-px-x", "50%");
          container.style.setProperty("--selected-px-y", "50%");
        }
      }

      // 2. Multi-ring pulse & ripple reticle
      const el = document.createElement("div");
      el.className = "selected-location-reticle";
      el.innerHTML = `
        <div class="reticle-core"></div>
        <div class="reticle-ping"></div>
        <div class="reticle-ripple"></div>
      `;

      const m = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([selectedArea.longitude, selectedArea.latitude])
        .addTo(map);

      selectedMarkerRef.current = m;

      // 3. Highlight authentic roads around selected coordinate safely
      const updateHighlightedRoads = () => {
        if (!map.isStyleLoaded()) return;
        ensureHighlightLayers(map);

        const roads = extractNearbyRoads(
          map,
          selectedArea.longitude,
          selectedArea.latitude
        );

        const src = map.getSource("selected-roads-source") as maplibregl.GeoJSONSource | undefined;
        if (src) {
          src.setData({
            type: "FeatureCollection",
            features: roads,
          });
        }

        // Dim background roads and labels so highlighted paths shine cleanly
        applyRoadColors(map, true);
        applyLabelHierarchy(map, true);
      };

      if (map.isStyleLoaded()) {
        ensureHighlightLayers(map);
        updateHighlightedRoads();
      } else {
        map.once("style.load", updateHighlightedRoads);
      }

      // If map is currently animating or loading tiles, re-extract on next render
      const onMapIdle = () => {
        updateHighlightedRoads();
      };
      map.once("idle", onMapIdle);

      return () => {
        map.off("style.load", updateHighlightedRoads);
        map.off("idle", onMapIdle);
      };
    } else {
      // Clear highlighted roads and restore solar road colors and label brightness when no location is selected
      if (map.isStyleLoaded()) {
        const src = map.getSource("selected-roads-source") as maplibregl.GeoJSONSource | undefined;
        if (src) {
          src.setData({
            type: "FeatureCollection",
            features: [],
          });
        }
        applyRoadColors(map, false);
        applyLabelHierarchy(map, false);
      }
    }
  }, [selectedArea, ensureHighlightLayers, extractNearbyRoads, applyRoadColors, applyLabelHierarchy]);

  // PART 4: Reset View directly to Amity University Jaipur HQ
  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: AMITY_CENTER, zoom: 12.5, pitch: 35, bearing: -8 });
    showToast("Centered on Amity University Jaipur HQ");
    onSelectAreaRef.current({
      latitude: AMITY_CENTER[1],
      longitude: AMITY_CENTER[0],
      zone: "Central",
      location: "Amity University Jaipur HQ Operations Center",
      traffic: 65,
      transitDelay: 1,
      incidents: 0,
      status: "NORMAL",
      entityType: "hq",
    });
  };

  // Device GPS Location Handler (LOCATE ME only)
  const handleLocateUser = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      showToast("Geolocation not supported — returned to Amity HQ.");
      handleResetView();
      return;
    }

    setLocatingStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingStatus(null);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (userMarkerRef.current) userMarkerRef.current.remove();
        const userEl = document.createElement("div");
        userEl.className = "user-location-pin";
        userEl.innerHTML = `<div class="user-dot"></div><div class="user-pulse"></div><span class="user-lbl">● YOU ARE HERE</span>`;
        const uMarker = new maplibregl.Marker({ element: userEl })
          .setLngLat([lng, lat])
          .addTo(map);
        userMarkerRef.current = uMarker;

        map.flyTo({ center: [lng, lat], zoom: 14, pitch: 40, speed: 1.2 });
        showToast("Location acquired — centered on your device.");

        onSelectAreaRef.current({
          latitude: lat,
          longitude: lng,
          zone: "Local Device Area",
          location: `Current Device: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
          traffic: 35,
          transitDelay: 0,
          incidents: 0,
          status: "NORMAL",
          entityType: "user",
        });
      },
      (err) => {
        console.warn("[CityPulse] Geolocation unavailable:", err.message);
        setLocatingStatus(null);
        showToast("Location unavailable — returned to Amity HQ.");
        handleResetView();
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  // Render Optional Data Layers & Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // -------------------------------------------------------------
    // OPTIONAL DATA LAYERS (Rendered ONLY if explicitly enabled in Layers menu)
    // -------------------------------------------------------------
    if (layers.incidents && snapshot.incidents) {
      snapshot.incidents.forEach((inc) => {
        const el = document.createElement("div");
        el.className = "incident-map-pin";
        const isCrit = inc.severity === "critical" || inc.severity === "high";
        el.innerHTML = `
          <div class="incident-badge ${isCrit ? "crit" : "warn"}">
            <span class="incident-icon-glow"></span>
            <i>⚠</i>
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectAreaRef.current({
            latitude: inc.latitude,
            longitude: inc.longitude,
            zone: inc.zone,
            location: inc.description,
            traffic: 85,
            transitDelay: 6,
            incidents: 1,
            status: isCrit ? "CRITICAL" : "WARNING",
            entityType: "incident",
            entityName: inc.type,
          });
        });

        const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(`
          <div class="map-popup-card">
            <div class="popup-tag ${inc.severity}">${inc.severity.toUpperCase()}</div>
            <strong>${inc.type.replaceAll("_", " ").toUpperCase()}</strong>
            <p>${inc.description}</p>
            <small>Zone: ${inc.zone} · Status: ${inc.status}</small>
          </div>
        `);

        const m = new maplibregl.Marker({ element: el })
          .setLngLat([inc.longitude, inc.latitude])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(m);
      });
    }
  }, [snapshot, layers]);

  return (
    <div className={`city-maplibre-container ${selectedArea ? "has-selected-area" : ""}`}>
      {/* 2D MapLibre WebGL Canvas Container */}
      <div ref={mapContainer} className="maplibre-gl-canvas" tabIndex={0} />

      {/* Toast Notification */}
      {statusToast && (
        <div className="map-toast-notice">
          <span>{statusToast}</span>
        </div>
      )}

      {/* Map Inspection Dim Overlay (Clicking empty map closes inspection) */}
      {selectedArea && (
        <div
          className="map-inspection-dim-overlay"
          onClick={() => onSelectAreaRef.current(null as any)}
        />
      )}

      {/* Primary Inspection Details Panel (Inside Left Side of Map) */}
      {selectedArea && (
        <MapInspectionPanel
          selectedArea={selectedArea}
          snapshot={snapshot}
          onClose={() => onSelectAreaRef.current(null as any)}
          onInspectDetails={onInspectDetails}
          onInvestigate={() => {
            if (onInvestigate) {
              onInvestigate(selectedArea.zone);
            }
          }}
        />
      )}

      {/* Cinematic Radar City Scan Overlay (Requirement 1) */}
      {isScanning && (
        <CityScan
          snapshot={snapshot}
          onComplete={(summary: CityScanSummary) => {
            if (onScanComplete) onScanComplete(summary);
          }}
          onCancel={() => {
            if (onCancelScan) onCancelScan();
          }}
          onSelectZone={(zoneId: string) => {
            const z = JAIPUR_CIVIC_ZONES.find((x) => x.id === zoneId);
            if (z) {
              const trafficData =
                snapshot.traffic.find(
                  (t) => t.zone.toLowerCase() === z.name.toLowerCase()
                ) ?? { congestion: z.baseCongestion };
              mapRef.current?.flyTo({ center: [z.lng, z.lat], zoom: 13.5, pitch: 35 });
              onSelectAreaRef.current({
                latitude: z.lat,
                longitude: z.lng,
                zone: z.name,
                traffic: trafficData.congestion,
                transitDelay: Math.round(z.baseCongestion / 7),
                incidents: snapshot.incidents.filter((i) => i.zone === z.name).length,
                status:
                  trafficData.congestion > 70
                    ? "CRITICAL"
                    : trafficData.congestion > 50
                    ? "WARNING"
                    : "NORMAL",
                location: `${z.name} Operational Sector`,
                entityType: "zone",
                entityName: z.name,
              });
            }
          }}
        />
      )}

      {/* Tactical 2D Controls (HIDDEN WHEN LAYERS PANEL IS OPEN, FADED IN INSPECTION MODE) */}
      {!isLayersOpen && showControls && (
        <div className={`map-tactical-controls ${selectedArea ? "is-dimmed" : ""}`}>
          <button
            type="button"
            className="map-tactical-btn"
            aria-label="Zoom In"
            title="Zoom In"
            disabled={Boolean(selectedArea)}
            onClick={() => mapRef.current?.zoomIn()}
          >
            +
          </button>
          <button
            type="button"
            className="map-tactical-btn"
            aria-label="Zoom Out"
            title="Zoom Out"
            disabled={Boolean(selectedArea)}
            onClick={() => mapRef.current?.zoomOut()}
          >
            −
          </button>
          <button
            type="button"
            className="map-tactical-btn map-btn-locate"
            aria-label="Locate me"
            title={locatingStatus ? "Locating..." : "Locate My Device (GPS)"}
            disabled={Boolean(selectedArea)}
            onClick={handleLocateUser}
          >
            ⌖
          </button>
          <button
            type="button"
            className={`map-tactical-btn ${showMoreControls ? "is-active" : ""}`}
            aria-label="Map Controls"
            title="Map Controls"
            disabled={Boolean(selectedArea)}
            onClick={() => setShowMoreControls(!showMoreControls)}
          >
            ⋯
          </button>

          {showMoreControls && (
            <div className="map-advanced-popover" onClick={(e) => e.stopPropagation()}>
              <button
                className="map-popover-item"
                onClick={() => {
                  handleResetView();
                  setShowMoreControls(false);
                }}
              >
                Reset to HQ
              </button>
              <button
                className="map-popover-item"
                onClick={() => {
                  const map = mapRef.current;
                  if (!map) return;
                  const currentPitch = map.getPitch();
                  map.easeTo({ pitch: currentPitch > 20 ? 0 : 45, duration: 600 });
                  setShowMoreControls(false);
                }}
              >
                Toggle 3D Tilt
              </button>
              {onSwitchTo3D && (
                <button
                  className="map-popover-item highlight"
                  onClick={() => {
                    setShowMoreControls(false);
                    onSwitchTo3D();
                  }}
                >
                  Switch to 3D Earth
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Missing MapTiler API Key Notice */}
      {keyMissing && !dismissNotice && (
        <div className="map-error-overlay">
          <div className="map-error-card floating-panel">
            <span className="eyebrow">MAP PROVIDER NOT CONFIGURED</span>
            <h3>MapTiler API key is not configured.</h3>
            <p>
              Please add <b>VITE_MAPTILER_API_KEY</b> to your <code>frontend/.env</code> file.
              Until configured, CityPulse operates on the tactical basemap canvas.
            </p>
            <div className="map-error-actions">
              {onOpenSettings && (
                <button className="open-settings-btn" onClick={onOpenSettings}>
                  Open Settings
                </button>
              )}
              <button
                className="fallback-canvas-btn"
                onClick={() => setDismissNotice(true)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Service / Tile Error Overlay */}
      {mapError && (
        <div className="map-error-overlay">
          <div className="map-error-card floating-panel is-service-error">
            <span className="eyebrow" style={{ color: "#ef7f68" }}>
              MAP SERVICE UNAVAILABLE
            </span>
            <h3>Unable to load the basemap</h3>
            <p>{mapError}</p>
            <div className="map-error-actions">
              <button
                className="retry-map-btn"
                onClick={() => {
                  setMapError(null);
                  setReloadKey((k) => k + 1);
                }}
              >
                Retry
              </button>
              {onOpenSettings && (
                <button className="open-settings-btn" onClick={onOpenSettings}>
                  Open Settings
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
