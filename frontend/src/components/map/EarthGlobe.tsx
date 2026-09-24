import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { CitySnapshot, SelectedArea } from "../../types/citypulse";
import { MapLayersState } from "./MapLayerControl";
import { MAP_CONFIG, isMapTilerConfigured, CESIUM_CONFIG, isCesiumConfigured } from "../../config/mapConfig";
import { MapInspectionPanel } from "./MapInspectionPanel";

import {
  JAIPUR_HQ,
  JAIPUR_ZONES,
  JAIPUR_INFRASTRUCTURE,
} from "./cesiumConstants";

export { JAIPUR_HQ, JAIPUR_ZONES, JAIPUR_INFRASTRUCTURE };

export interface EarthGlobeProps {
  snapshot: CitySnapshot;
  layers: MapLayersState;
  selectedArea?: SelectedArea | null;
  focusLocation?: [number, number];
  isLayersOpen?: boolean;
  showControls?: boolean;
  onSelectArea: (area: SelectedArea | null) => void;
  onInspectDetails?: () => void;
  onSwitchTo2D?: () => void;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  snapshot,
  layers,
  selectedArea,
  focusLocation,
  isLayersOpen = false,
  showControls = true,
  onSelectArea,
  onInspectDetails,
  onSwitchTo2D,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const onSelectAreaRef = useRef(onSelectArea);
  onSelectAreaRef.current = onSelectArea;

  const [dismissTokenNotice, setDismissTokenNotice] = useState(false);
  const [terrainActive, setTerrainActive] = useState(isCesiumConfigured());
  const [pitchState, setPitchState] = useState<-45 | -85>(-45);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setStatusToast(null), 3500);
  };

  // 1. Initialize Cesium Viewer
  useEffect(() => {
    if (!containerRef.current) return;

    if (isCesiumConfigured()) {
      Cesium.Ion.defaultAccessToken = CESIUM_CONFIG.ionToken;
    }

    let viewer: Cesium.Viewer;
    try {
      viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        requestRenderMode: false,
      });
    } catch (err) {
      console.error("[CityPulse 3D] Failed to initialize Cesium Viewer:", err);
      return;
    }

    viewerRef.current = viewer;

    // Atmospheric visual styling & lighting
    const scene = viewer.scene;
    scene.globe.enableLighting = true;
    scene.globe.depthTestAgainstTerrain = false;
    scene.backgroundColor = Cesium.Color.fromCssColorString("#060b13");

    // Hide default credit container text if present
    if (viewer.cesiumWidget.creditContainer) {
      (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
    }

    // Configure terrain and imagery
    if (isCesiumConfigured()) {
      Cesium.createWorldTerrainAsync({
        requestWaterMask: true,
        requestVertexNormals: true,
      })
        .then((terrainProvider) => {
          if (!viewer.isDestroyed()) {
            viewer.terrainProvider = terrainProvider;
            setTerrainActive(true);
          }
        })
        .catch((err) => {
          console.warn("[CityPulse 3D] Cesium world terrain unavailable, using ellipsoid:", err);
        });
    } else {
      // Fallback imagery if Ion token not configured so globe renders high-detail tiles
      try {
        if (isMapTilerConfigured()) {
          const mtProvider = new Cesium.UrlTemplateImageryProvider({
            url: `https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=${MAP_CONFIG.mapTilerApiKey}`,
            maximumLevel: 19,
            credit: "© MapTiler, © OpenStreetMap",
          });
          viewer.imageryLayers.addImageryProvider(mtProvider);
        } else {
          const osmProvider = new Cesium.UrlTemplateImageryProvider({
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            subdomains: ["a", "b", "c"],
            maximumLevel: 19,
            credit: "© OpenStreetMap contributors",
          });
          viewer.imageryLayers.addImageryProvider(osmProvider);
        }
      } catch (err) {
        console.warn("[CityPulse 3D] Fallback imagery provider error:", err);
      }
    }

    // Initial camera flight centered around Jaipur / Amity HQ
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(JAIPUR_HQ.lng, JAIPUR_HQ.lat, 18000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
      duration: 1.6,
    });

    // Handle Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!viewer.isDestroyed()) {
        viewer.resize();
      }
    });
    resizeObserver.observe(containerRef.current);

    // Click handler for picking entities or coordinates
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id) {
        const entity = picked.id;
        const z = (entity as any).zoneData;
        if (z) {
          const zTraffic =
            snapshot.traffic.find(
              (t) => t.zone.toLowerCase() === z.name.toLowerCase()
            ) ?? snapshot.traffic[0];
          const zTransit =
            snapshot.transit.find(
              (t) => t.zone.toLowerCase() === z.name.toLowerCase()
            ) ?? snapshot.transit[0];
          const zIncidents = snapshot.incidents.filter(
            (i) => i.zone.toLowerCase() === z.name.toLowerCase()
          );

          onSelectAreaRef.current({
            latitude: z.lat,
            longitude: z.lng,
            zone: z.name,
            location: z.fullName,
            traffic: zTraffic.congestion,
            transitDelay: zTransit?.delay_minutes ?? 0,
            incidents: zIncidents.length,
            status:
              zTraffic.congestion > 75
                ? "CRITICAL"
                : zTraffic.congestion > 50
                ? "WARNING"
                : "NORMAL",
          });
          return;
        }
      }

      // Pick ground cartesian coordinates
      const ray = viewer.camera.getPickRay(click.position);
      if (ray) {
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          const carto = Cesium.Cartographic.fromCartesian(cartesian);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const lng = Cesium.Math.toDegrees(carto.longitude);

          let closestZone = JAIPUR_ZONES[0];
          let minD = Infinity;
          JAIPUR_ZONES.forEach((z) => {
            const d = Math.hypot(lat - z.lat, lng - z.lng);
            if (d < minD) {
              minD = d;
              closestZone = z;
            }
          });

          const zTraffic =
            snapshot.traffic.find(
              (t) => t.zone.toLowerCase() === closestZone.name.toLowerCase()
            ) ?? snapshot.traffic[0];

          onSelectAreaRef.current({
            latitude: lat,
            longitude: lng,
            zone: closestZone.name,
            location: `3D Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
            traffic: zTraffic.congestion,
            transitDelay: 3,
            incidents: 0,
            status: "NORMAL",
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      resizeObserver.disconnect();
      handler.destroy();
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, []);

  // 2. Pause/Freeze Camera Controls during Location Inspection Mode
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const controller = viewer.scene.screenSpaceCameraController;
    if (selectedArea) {
      controller.enableRotate = false;
      controller.enableTranslate = false;
      controller.enableZoom = false;
      controller.enableTilt = false;
      controller.enableLook = false;
    } else {
      controller.enableRotate = true;
      controller.enableTranslate = true;
      controller.enableZoom = true;
      controller.enableTilt = true;
      controller.enableLook = true;
    }
  }, [selectedArea]);

  // 3. Render CityPulse 3D Overlays (HQ, Zones, Incidents, Reticle)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.entities.removeAll();

    // A. Jaipur HQ Center & Monitoring Envelope
    viewer.entities.add({
      id: "jaipur-hq-pin",
      position: Cesium.Cartesian3.fromDegrees(JAIPUR_HQ.lng, JAIPUR_HQ.lat, 80),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString("#2dd4bf"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: "AMITY HQ · JAIPUR",
        font: "bold 11px Inter, sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    viewer.entities.add({
      id: "jaipur-monitoring-ring",
      position: Cesium.Cartesian3.fromDegrees(JAIPUR_HQ.lng, JAIPUR_HQ.lat, 10),
      ellipse: {
        semiMinorAxis: 14000,
        semiMajorAxis: 14000,
        material: Cesium.Color.fromCssColorString("#2dd4bf").withAlpha(0.06),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#2dd4bf").withAlpha(0.5),
        outlineWidth: 2,
      },
    });

    // B. Civic Zones (Central, North, South, East, West)
    JAIPUR_ZONES.forEach((zone) => {
      const zTraffic =
        snapshot.traffic.find(
          (t) => t.zone.toLowerCase() === zone.name.toLowerCase()
        ) ?? snapshot.traffic[0];
      const congestion = zTraffic.congestion;
      const isCritical = congestion > 75;
      const isWarn = congestion > 50;

      const hexColor = isCritical ? "#ef4444" : isWarn ? "#f59e0b" : "#2dd4bf";
      const cesiumColor = Cesium.Color.fromCssColorString(hexColor);
      const isSelected = selectedArea?.zone?.toLowerCase() === zone.name.toLowerCase();

      // Zone Surface Ellipse
      viewer.entities.add({
        id: `zone-boundary-${zone.id}`,
        position: Cesium.Cartesian3.fromDegrees(zone.lng, zone.lat, 5),
        ellipse: {
          semiMinorAxis: 4200,
          semiMajorAxis: 4200,
          material: cesiumColor.withAlpha(isSelected ? 0.32 : 0.16),
          outline: true,
          outlineColor: isSelected ? Cesium.Color.WHITE : cesiumColor.withAlpha(0.8),
          outlineWidth: isSelected ? 3 : 2,
        },
      });

      // Extruded Telemetry Pillar
      const pillarHeight = Math.max(700, congestion * 22);
      viewer.entities.add({
        id: `zone-pillar-${zone.id}`,
        position: Cesium.Cartesian3.fromDegrees(zone.lng, zone.lat, pillarHeight / 2),
        cylinder: {
          length: pillarHeight,
          topRadius: 550,
          bottomRadius: 550,
          material: cesiumColor.withAlpha(0.35),
          outline: true,
          outlineColor: cesiumColor.withAlpha(0.75),
        },
      });

      // Zone Pin & Label
      const entity = viewer.entities.add({
        id: `zone-pin-${zone.id}`,
        position: Cesium.Cartesian3.fromDegrees(zone.lng, zone.lat, pillarHeight + 60),
        point: {
          pixelSize: isSelected ? 16 : 12,
          color: cesiumColor,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `${zone.name.toUpperCase()} (${congestion}%)`,
          font: "bold 11px Inter, sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      (entity as any).zoneData = zone;
    });

    // C. Incidents
    snapshot.incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;
      const isHigh = inc.severity === "high";
      const incColor = Cesium.Color.fromCssColorString(isHigh ? "#ef4444" : "#f59e0b");

      viewer.entities.add({
        id: `incident-${inc.id}`,
        position: Cesium.Cartesian3.fromDegrees(inc.longitude, inc.latitude, 250),
        point: {
          pixelSize: 11,
          color: incColor,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `⚠ ${inc.type.toUpperCase()}`,
          font: "bold 10px Inter, sans-serif",
          fillColor: incColor,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    });

    // D. Selected Area Target Reticle
    if (selectedArea) {
      viewer.entities.add({
        id: "selected-area-reticle",
        position: Cesium.Cartesian3.fromDegrees(
          selectedArea.longitude,
          selectedArea.latitude,
          200
        ),
        point: {
          pixelSize: 16,
          color: Cesium.Color.fromCssColorString("#2dd4bf"),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        cylinder: {
          length: 1000,
          topRadius: 180,
          bottomRadius: 650,
          material: Cesium.Color.fromCssColorString("#2dd4bf").withAlpha(0.4),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
        },
        label: {
          text: `TARGET: ${(selectedArea.location || selectedArea.zone || "LOCATION").toUpperCase()}`,
          font: "bold 11px Inter, sans-serif",
          fillColor: Cesium.Color.fromCssColorString("#2dd4bf"),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }
  }, [snapshot, selectedArea]);

  // 4. Handle External Focus FlyTo (e.g. from search selection)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !focusLocation) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        focusLocation[1],
        focusLocation[0],
        14000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0,
      },
      duration: 1.4,
    });
  }, [focusLocation]);

  // Camera Controls
  const handleZoomIn = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.35);
  };

  const handleZoomOut = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.45);
  };

  const handleRotate = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(25));
  };

  const handleToggleTilt = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    const nextPitch = pitchState === -45 ? -85 : -45;
    setPitchState(nextPitch);
    const pos = viewer.camera.positionCartographic;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, pos.height),
      orientation: {
        heading: viewer.camera.heading,
        pitch: Cesium.Math.toRadians(nextPitch),
        roll: 0,
      },
      duration: 0.8,
    });
  };

  const handleHomeJaipur = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(JAIPUR_HQ.lng, JAIPUR_HQ.lat, 18000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 1.4,
    });
    showToast("Centered on Jaipur Operational HQ");
  };

  const handleResetCamera = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(75.92, 27.16, 42000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-85),
        roll: 0,
      },
      duration: 1.2,
    });
    showToast("Camera reset to tactical overview");
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      containerRef.current.requestFullscreen().catch(() => undefined);
    }
  };

  const handleToggleTerrain = async () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (!isCesiumConfigured()) {
      showToast("3D terrain services unavailable — add Cesium Ion token");
      return;
    }

    if (terrainActive) {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      setTerrainActive(false);
      showToast("Standard terrain enabled");
    } else {
      try {
        const tp = await Cesium.createWorldTerrainAsync({
          requestWaterMask: true,
          requestVertexNormals: true,
        });
        viewer.terrainProvider = tp;
        setTerrainActive(true);
        showToast("World elevation terrain enabled");
      } catch {
        showToast("Unable to activate world terrain");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`city-earth-cesium-container earth-globe ${selectedArea ? "has-selected-area" : ""}`}
    >
      {/* Missing Ion Token In-App Notice */}
      {!isCesiumConfigured() && !dismissTokenNotice && (
        <div className="cesium-token-notice" role="alert">
          <div className="notice-content">
            <span className="notice-icon">⚠</span>
            <span className="notice-text">
              3D terrain services unavailable — add Cesium Ion token
            </span>
          </div>
          <div className="notice-actions">
            <button
              type="button"
              className="notice-dismiss-btn"
              onClick={() => setDismissTokenNotice(true)}
              aria-label="Dismiss notice"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Left HUD Status Badge */}
      <div className="map-solar-hud cesium-hud">
        <span className="solar-icon">🌍</span>
        <span className="solar-phase">3D EARTH DIGITAL TWIN</span>
        <span className="solar-sep">·</span>
        <span className="solar-elev">JAIPUR HQ</span>
        <span className="solar-sep">·</span>
        <span className="solar-time">{snapshot.data_mode || "DEMO"}</span>
      </div>

      {/* Toast Notification */}
      {statusToast && (
        <div className="map-toast-notice">
          <span>{statusToast}</span>
        </div>
      )}

      {/* Tactical 3D Camera Controls */}
      {!isLayersOpen && showControls && (
        <div className={`map-tactical-controls cesium-controls ${selectedArea ? "is-dimmed" : ""}`}>
          <button
            className="map-tactical-btn"
            aria-label="Zoom In"
            title="Zoom In"
            disabled={Boolean(selectedArea)}
            onClick={handleZoomIn}
          >
            +
          </button>
          <button
            className="map-tactical-btn"
            aria-label="Zoom Out"
            title="Zoom Out"
            disabled={Boolean(selectedArea)}
            onClick={handleZoomOut}
          >
            −
          </button>
          <button
            className="map-tactical-btn"
            aria-label="Rotate View"
            title="Rotate View"
            disabled={Boolean(selectedArea)}
            onClick={handleRotate}
          >
            ↻
          </button>
          <button
            className="map-tactical-btn"
            aria-label="Toggle Tilt"
            title={pitchState === -45 ? "Switch to Top-Down View" : "Switch to 45° Pitch"}
            disabled={Boolean(selectedArea)}
            onClick={handleToggleTilt}
          >
            ◬
          </button>
          <button
            className="map-tactical-btn"
            aria-label="Home Jaipur"
            title="Home Jaipur HQ"
            disabled={Boolean(selectedArea)}
            onClick={handleHomeJaipur}
          >
            ⌂
          </button>
          <button
            className="map-tactical-btn"
            aria-label="Reset Camera"
            title="Tactical Overview"
            disabled={Boolean(selectedArea)}
            onClick={handleResetCamera}
          >
            ↺
          </button>
          <button
            className="map-tactical-btn"
            aria-label="Fullscreen"
            title="Toggle Fullscreen"
            disabled={Boolean(selectedArea)}
            onClick={handleToggleFullscreen}
          >
            ⛶
          </button>
          <button
            className={`map-tactical-btn ${terrainActive ? "is-active" : ""}`}
            aria-label="Toggle Terrain"
            title={terrainActive ? "Disable Elevation Terrain" : "Enable Elevation Terrain"}
            disabled={Boolean(selectedArea)}
            onClick={handleToggleTerrain}
          >
            ⛰
          </button>
          {onSwitchTo2D && (
            <button
              className="map-tactical-btn switch-2d-btn"
              aria-label="Switch to 2D Map"
              title="Switch to 2D Map"
              onClick={onSwitchTo2D}
            >
              2D
            </button>
          )}
        </div>
      )}

      {/* Dim Overlay in Inspection Mode */}
      {selectedArea && (
        <div
          className="map-inspection-dim-overlay"
          onClick={() => onSelectAreaRef.current(null)}
        />
      )}

      {/* Primary Inspection Details Panel (Inside Left Side of Map) */}
      {selectedArea && (
        <MapInspectionPanel
          selectedArea={selectedArea}
          snapshot={snapshot}
          onClose={() => onSelectAreaRef.current(null)}
          onInspectDetails={onInspectDetails}
        />
      )}
    </div>
  );
};
