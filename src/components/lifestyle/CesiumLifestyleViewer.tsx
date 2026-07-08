"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Car,
  Compass,
  Crosshair,
  Droplets,
  GraduationCap,
  Loader2,
  MapPin,
  Navigation,
  Play,
  ShoppingCart,
  Sparkles,
  Sun,
  Umbrella,
  Waves,
  Wind,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { flyToPoi, flyToPropertyOverview } from "@/modules/lifestyle/camera/CameraController";
import { distanceKmBetween, normalizeGeoPoint, validatePoiCoordinates } from "@/modules/lifestyle/viewer/coordinateUtils";
import MiniMap from "./MiniMap";
import POIDetails from "./POIDetails";
import POISidebar from "./POISidebar";
import { clearLifestyleEntities, renderLifestyleEntities, type LifestylePrimitiveRefs } from "@/modules/lifestyle/poi/PoiRenderer";
import { getLifestyleCopy } from "./lifestyleTypes";
import type { LifestylePoi, LifestylePoiCategory, LifestylePoiGroup } from "./lifestyleTypes";

type Lifestyle3DProvider = "cesium-architectural" | "cesium-basic" | "google-photorealistic-3d" | "maptiler-3d";

type CesiumLifestyleViewerProps = {
  latitude?: number | null;
  longitude?: number | null;
  propertyTitle?: string;
  locationLabel: string;
  primaryColor: string;
  price?: string;
  images?: string[];
  provider?: Lifestyle3DProvider;
  locale?: string;
  onClose?: () => void;
};

type CesiumViewerLike = {
  destroy: () => void;
  isDestroyed?: () => boolean;
  scene?: {
    cartesianToCanvasCoordinates?: (position: unknown) => { x: number; y: number } | undefined;
    sampleHeightMostDetailed?: (positions: unknown[]) => Promise<unknown[]>;
    postRender?: {
      addEventListener: (callback: () => void) => void;
      removeEventListener: (callback: () => void) => void;
    };
    camera: {
      flyTo: (options: unknown) => void;
    };
    primitives?: {
      add: (primitive: unknown) => unknown;
      remove?: (primitive: unknown) => boolean;
    };
    screenSpaceCameraController?: {
      enableInputs?: boolean;
      enableTranslate?: boolean;
      enableZoom?: boolean;
      enableRotate?: boolean;
      enableTilt?: boolean;
      enableLook?: boolean;
      enableCollisionDetection?: boolean;
      minimumZoomDistance?: number;
      maximumZoomDistance?: number;
    };
  };
};

type CesiumCollectionLike = {
  add: (options: Record<string, unknown>) => unknown;
  removeAll?: () => void;
  destroy?: () => void;
};

type CesiumRuntime = {
  BoundingSphere: {
    fromPoints: (positions: unknown[]) => unknown;
  };
  Cartesian2: new (x: number, y: number) => unknown;
  Cartesian3: {
    fromDegrees: (longitude: number, latitude: number, height?: number) => unknown;
  };
  Cartographic: {
    fromDegrees: (longitude: number, latitude: number, height?: number) => unknown;
  };
  Cesium3DTileset: {
    fromUrl: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  };
  Cesium3DTileStyle: new (options: Record<string, unknown>) => unknown;
  CesiumMath: {
    toRadians: (degrees: number) => number;
  };
  CesiumWidget: new (container: Element, options?: Record<string, unknown>) => CesiumViewerLike;
  Color: {
    BLACK: unknown;
    WHITE: unknown;
    fromCssColorString: (color: string) => unknown;
  };
  EllipsoidTerrainProvider: new () => unknown;
  HeadingPitchRange: new (heading: number, pitch: number, range: number) => unknown;
  HeightReference: {
    CLAMP_TO_GROUND: unknown;
  };
  HorizontalOrigin: {
    CENTER: unknown;
    LEFT: unknown;
    RIGHT: unknown;
  };
  BillboardCollection: new () => CesiumCollectionLike;
  ImageryLayer: new (imageryProvider?: unknown) => unknown;
  Ion: { defaultAccessToken: string };
  IonImageryProvider: { fromAssetId: (assetId: number) => Promise<unknown> };
  LabelCollection: new () => CesiumCollectionLike;
  LabelStyle: {
    FILL_AND_OUTLINE: unknown;
  };
  OpenStreetMapImageryProvider: new (options: { url: string }) => unknown;
  PointPrimitiveCollection: new () => CesiumCollectionLike;
  PolylineCollection: new () => CesiumCollectionLike;
  VerticalOrigin: {
    BOTTOM: unknown;
    CENTER: unknown;
  };
  createOsmBuildingsAsync: (options?: Record<string, unknown>) => Promise<unknown>;
  createWorldTerrainAsync: () => Promise<unknown>;
};

const GOOGLE_3D_ROOT = "https://tile.googleapis.com/v1/3dtiles/root.json";
const DEMO_POI_FALLBACK = false;
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const PRESENTATION_NAV: Array<{ label: string; icon: LucideIcon; active?: boolean }> = [
  { label: "3D", icon: Sparkles, active: true },
  { label: "Explorer", icon: Compass },
  { label: "POI", icon: MapPin },
  { label: "Transports", icon: Car },
  { label: "Ecoles", icon: GraduationCap },
  { label: "Partager", icon: Navigation },
];

const MAP_POIS: Array<{
  id: string;
  category: LifestylePoiCategory;
  label: string;
  detail: string;
  icon: LucideIcon;
  bearing: number;
  distanceKm: number;
  color: string;
  labelOffsetX: number;
  labelOffsetY: number;
}> = [
  { id: "beach", category: "beach", label: "Plage", detail: "Distance estimee - 2.5 km", icon: Umbrella, bearing: 72, distanceKm: 2.5, color: "#67e8f9", labelOffsetX: 34, labelOffsetY: -62 },
  { id: "sea", category: "sea", label: "Mer Mediterranee", detail: "Distance estimee - 3.6 km", icon: Waves, bearing: 104, distanceKm: 3.6, color: "#38bdf8", labelOffsetX: 46, labelOffsetY: -18 },
  { id: "golf", category: "golf", label: "Golf Club", detail: "Distance estimee - 4.1 km", icon: Sparkles, bearing: 246, distanceKm: 4.1, color: "#86efac", labelOffsetX: -220, labelOffsetY: -24 },
  { id: "restaurants", category: "restaurant", label: "Restaurants", detail: "Distance estimee - 1.2 km", icon: ShoppingCart, bearing: 158, distanceKm: 1.2, color: "#fdba74", labelOffsetX: 34, labelOffsetY: 28 },
  { id: "center", category: "center", label: "Centre-ville", detail: "Distance estimee - 3.2 km", icon: Building2, bearing: 22, distanceKm: 3.2, color: "#facc15", labelOffsetX: 42, labelOffsetY: -78 },
];

type MapPoi = LifestylePoi;

type ApiPoi = {
  id: string;
  category: string;
  label: string;
  detail: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  source?: string;
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
};

const BOTTOM_FILTERS: Array<LifestylePoiGroup & { icon: LucideIcon }> = [
  { id: "area", label: "Area insights", icon: Building2, description: "Vue mer, score quartier et contexte residentiel.", categories: ["beach", "sea", "golf", "center", "marina"] },
  { id: "amenities", label: "Amenities", icon: ShoppingCart, description: "Restaurants, commerces et services du quotidien.", categories: ["restaurant", "shops", "hospital"] },
  { id: "transport", label: "Transport", icon: Car, description: "Acces routiers, aeroport et mobilite autour du bien.", categories: ["airport", "transport", "center", "marina"] },
  { id: "schools", label: "Schools", icon: GraduationCap, description: "Ecoles et etablissements proches.", categories: ["school"] },
];

type WeatherSnapshot = {
  temperature: number;
  humidity: number | null;
  windSpeed: number | null;
  code: number | null;
};

type SurfaceHeights = {
  property?: number;
  pois?: Record<string, number>;
};

type NormalizedCoordinates = {
  latitude: number | null;
  longitude: number | null;
  valid: boolean;
  reason?: string;
  swapped?: boolean;
};

export default function CesiumLifestyleViewer({
  latitude,
  longitude,
  propertyTitle,
  locationLabel,
  primaryColor,
  provider = "cesium-architectural",
  locale,
  onClose,
}: CesiumLifestyleViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<CesiumViewerLike | null>(null);
  const cesiumRef = useRef<CesiumRuntime | null>(null);
  const introTimeoutRef = useRef<number | null>(null);
  const hasFramedPoisRef = useRef(false);
  const isMountedRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const geoPrimitiveRef = useRef<LifestylePrimitiveRefs | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing-coordinates" | "error">("idle");
  const [, setIsIntroPlaying] = useState(false);
  const [, setIsExploreMode] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Lifestyle3DProvider>(provider);
  const [, setProviderNote] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [activeCategory, setActiveCategory] = useState(BOTTOM_FILTERS[0].id);
  const [realPois, setRealPois] = useState<MapPoi[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<MapPoi | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);
  const [, setRejectedPoiCount] = useState(0);
  const [, setRejectedPoiReasons] = useState<Array<{ id: string; label: string; category: string; reason: string }>>([]);
  const [surfaceHeights, setSurfaceHeights] = useState<SurfaceHeights>({});
  const [surfaceReady, setSurfaceReady] = useState(false);
  const [entitiesReady, setEntitiesReady] = useState(false);
  const [poisLoaded, setPoisLoaded] = useState(false);
  const [, setGoogle3dLoaded] = useState(false);
  const [, setArchitecturalFallback] = useState(false);
  const [freeExplorationEnabled, setFreeExplorationEnabled] = useState(true);
  const coordinates = useMemo(() => normalizeCoordinates({ latitude, longitude }), [latitude, longitude]);
  const hasCoordinates = coordinates.valid && coordinates.latitude != null && coordinates.longitude != null;
  const normalizedLatitude = coordinates.latitude;
  const normalizedLongitude = coordinates.longitude;
  const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";
  const configured3dProvider = process.env.NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER || "";
  const googleTilesKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY || "";
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const hasIonToken = token.trim().length > 0;
  const hasGoogleTilesKey = googleTilesKey.trim().length > 0;
  const hasGoogleMapsApiKey = googleMapsApiKey.trim().length > 0;
  const mapPois = useMemo(() => {
    if (realPois.length > 0) return realPois;
    if (!DEMO_POI_FALLBACK) return [];
    if (!hasCoordinates) return [];
    const adjustedPois = applyCoastalContext(MAP_POIS, locationLabel);
    return adjustedPois.map((poi) => ({
      ...poi,
      detail: `Distance estimee - ${formatDistance(poi.distanceKm)}`,
      source: "demo" as const,
      coordinates: destinationPoint(normalizedLatitude as number, normalizedLongitude as number, poi.bearing, poi.distanceKm),
    }));
  }, [hasCoordinates, normalizedLatitude, normalizedLongitude, locationLabel, realPois]);

  const activePanelCopy = useMemo(() => {
    return BOTTOM_FILTERS.find((filter) => filter.id === activeCategory) || BOTTOM_FILTERS[0];
  }, [activeCategory]);

  const visibleMapPois = useMemo(() => {
    return mapPois.slice(0, 50);
  }, [mapPois]);

  useEffect(() => {
    isMountedRef.current = true;
    isDestroyedRef.current = false;
    return () => {
      isMountedRef.current = false;
      isDestroyedRef.current = true;
    };
  }, []);

  useEffect(() => {
    debugGeo("[LifestyleExplorer] Property coordinates", {
      propertyTitle,
      rawLatitude: latitude,
      rawLongitude: longitude,
      rawLatitudeType: typeof latitude,
      rawLongitudeType: typeof longitude,
      normalizedLatitude: coordinates.latitude,
      normalizedLongitude: coordinates.longitude,
      valid: coordinates.valid,
      reason: coordinates.reason || null,
      swapped: coordinates.swapped || false,
    });
  }, [coordinates, latitude, longitude, propertyTitle]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    if (isMountedRef.current) isDestroyedRef.current = false;

    async function loadCesium() {
      if (!containerRef.current || isDestroyedRef.current || !isMountedRef.current) return;
      if (!hasCoordinates) {
        if (isMountedRef.current) setStatus("missing-coordinates");
        return;
      }

      if (isMountedRef.current) setStatus("loading");
      setSurfaceReady(false);
      setEntitiesReady(false);
      hasFramedPoisRef.current = false;

      try {
        const Cesium = await loadCesiumRuntime();
        if (cancelled || isDestroyedRef.current || !isMountedRef.current) return;
        cesiumRef.current = Cesium;
        await import("@cesium/engine/Source/Widget/CesiumWidget.css");
        if (cancelled || isDestroyedRef.current || !isMountedRef.current || !containerRef.current) return;

        Cesium.Ion.defaultAccessToken = token;

        const requestedProvider = provider;
        const isProductionRuntime = process.env.NODE_ENV === "production";
        const googleExplicitlyAllowed = !isProductionRuntime && requestedProvider === "google-photorealistic-3d";
        const canUseGoogle3D = googleExplicitlyAllowed && hasGoogleTilesKey;
        const nextProvider: Lifestyle3DProvider = canUseGoogle3D ? "google-photorealistic-3d" : "cesium-architectural";
        const nextFallbackReason = "";
        console.info("[LifestyleExplorer] 3D provider selected", {
          selectedProvider: nextProvider,
          requestedProvider,
          env: {
            NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER: configured3dProvider || "[missing]",
            NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY: redactGoogleKey(googleTilesKey),
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: redactGoogleKey(googleMapsApiKey),
          },
          googleMaps3dKey: hasGoogleTilesKey ? "PRESENT" : "ABSENT",
          googleMapsApiKey: hasGoogleMapsApiKey ? "PRESENT" : "ABSENT",
          hasCesiumIonToken: hasIonToken,
          fallbackReason: nextFallbackReason || null,
          google3dSkippedInProduction: requestedProvider === "google-photorealistic-3d" && isProductionRuntime,
        });
        if (isMountedRef.current && !isDestroyedRef.current) {
          setActiveProvider(nextProvider);
          setFallbackReason("");
          setProviderNote(
            nextProvider === "google-photorealistic-3d"
              ? "Bati photorealiste Google charge a la demande."
              : "Rendu architectural 3D - donnees OpenStreetMap.",
          );
        }

        const imageryProvider = hasIonToken
          ? await Cesium.IonImageryProvider.fromAssetId(2)
          : new Cesium.OpenStreetMapImageryProvider({
              url: "https://tile.openstreetmap.org/",
            });
        if (cancelled || isDestroyedRef.current || !isMountedRef.current || !containerRef.current) return;

        const terrainProvider = hasIonToken
          ? await Cesium.createWorldTerrainAsync()
          : new Cesium.EllipsoidTerrainProvider();
        if (cancelled || isDestroyedRef.current || !isMountedRef.current || !containerRef.current) return;

        const viewer = new Cesium.CesiumWidget(containerRef.current, {
          terrainProvider,
          baseLayer: new Cesium.ImageryLayer(imageryProvider),
        }) as CesiumViewerLike;

        if (cancelled || isDestroyedRef.current || !isMountedRef.current || isViewerDestroyed(viewer)) {
          destroyViewerSafely(viewer);
          return;
        }
        viewerRef.current = viewer;
        enableFreeNavigation(viewer);

        if (nextProvider === "google-photorealistic-3d") {
          const tilesetUrl = `${GOOGLE_3D_ROOT}?key=${encodeURIComponent(googleTilesKey)}`;
          const redactedTilesetUrl = `${GOOGLE_3D_ROOT}?key=[present]`;
          console.info("[LifestyleExplorer] Loading Google Photorealistic 3D Tiles", {
            selectedProvider: nextProvider,
            url: redactedTilesetUrl,
            hasGoogleTilesKey,
            googleMaps3dKey: redactGoogleKey(googleTilesKey),
          });
          try {
            const googleTileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl, {
              maximumScreenSpaceError: 4,
            });
            if (!cancelled && isMountedRef.current && !isDestroyedRef.current && isViewerUsable(viewer)) {
              viewer.scene?.primitives?.add(googleTileset);
              setGoogle3dLoaded(true);
              setArchitecturalFallback(false);
              console.info("[LifestyleExplorer] Google Photorealistic 3D Tiles loaded");
            }
          } catch (googleError) {
            const diagnostic = describeProviderError(googleError);
            console.error("[LifestyleExplorer] Google Photorealistic 3D Tiles failed", {
              name: diagnostic.name,
              message: diagnostic.message,
              stack: diagnostic.stack,
              statusCode: diagnostic.statusCode,
              response: diagnostic.response,
              responseHeaders: diagnostic.responseHeaders,
              json: diagnostic.json,
              selectedProvider: nextProvider,
              requestedProvider,
              env: {
                NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER: configured3dProvider || "[missing]",
                NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY: redactGoogleKey(googleTilesKey),
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: redactGoogleKey(googleMapsApiKey),
              },
              googleMaps3dKey: hasGoogleTilesKey ? "PRESENT" : "ABSENT",
              googleMapsApiKey: hasGoogleMapsApiKey ? "PRESENT" : "ABSENT",
              googleTilesetUrl: redactedTilesetUrl,
              probableCauses: googleProviderProbableCauses(`${diagnostic.message} ${diagnostic.response || ""}`),
            });
            if (isMountedRef.current && !isDestroyedRef.current) {
              setGoogle3dLoaded(false);
              setFallbackReason("");
              setActiveProvider("cesium-architectural");
              setProviderNote("Mode 3D architectural - donnees OpenStreetMap/Cesium.");
            }
            await addOsmBuildingsFallback({
              Cesium,
              viewer,
              cancelled: () => cancelled || isDestroyedRef.current || !isMountedRef.current || !isViewerUsable(viewer),
              onLoaded: () => {
                if (isMountedRef.current && !isDestroyedRef.current) setArchitecturalFallback(true);
              },
            });
          }
        } else {
          setGoogle3dLoaded(false);
          await addOsmBuildingsFallback({
            Cesium,
            viewer,
            cancelled: () => cancelled || isDestroyedRef.current || !isMountedRef.current || !isViewerUsable(viewer),
            onLoaded: () => {
              if (isMountedRef.current && !isDestroyedRef.current) setArchitecturalFallback(true);
            },
          });
        }

        if (isMountedRef.current && !isDestroyedRef.current && isViewerUsable(viewer)) {
          await waitForCesiumSceneFrames(viewer, 3);
        }

        if (isMountedRef.current && !isDestroyedRef.current && isViewerUsable(viewer)) {
          setStatus("ready");
        }
      } catch (error) {
        const diagnostic = describeProviderError(error);
        const requestedProvider = provider;
        const redactedTilesetUrl = `${GOOGLE_3D_ROOT}?key=${hasGoogleTilesKey ? redactGoogleKey(googleTilesKey) : "[missing]"}`;
        console.error("[LifestyleExplorer] Cesium viewer failed", {
          name: diagnostic.name,
          message: diagnostic.message,
          stack: diagnostic.stack,
          statusCode: diagnostic.statusCode,
          response: diagnostic.response,
          responseHeaders: diagnostic.responseHeaders,
          json: diagnostic.json,
          requestedProvider,
          env: {
            NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER: configured3dProvider || "[missing]",
            NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY: redactGoogleKey(googleTilesKey),
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: redactGoogleKey(googleMapsApiKey),
          },
          googleMaps3dKey: hasGoogleTilesKey ? "PRESENT" : "ABSENT",
          googleMapsApiKey: hasGoogleMapsApiKey ? "PRESENT" : "ABSENT",
          googleTilesetUrl: redactedTilesetUrl,
          probableCauses: googleProviderProbableCauses(`${diagnostic.message} ${diagnostic.response || ""}`),
        });
        if (isMountedRef.current && !isDestroyedRef.current) {
          setFallbackReason(diagnostic.message || "Erreur inconnue pendant le chargement 3D.");
          setStatus("error");
        }
      }
    }

    loadCesium();

    return () => {
      cancelled = true;
      isDestroyedRef.current = true;
      if (introTimeoutRef.current) window.clearTimeout(introTimeoutRef.current);
      introTimeoutRef.current = null;
      clearGeoPrimitives();
      destroyViewerSafely(viewerRef.current);
      viewerRef.current = null;
      cesiumRef.current = null;
    };
  // The runtime helpers intentionally stay outside the dependency list; Cesium must restart only when provider or coordinates change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleTilesKey, hasCoordinates, hasGoogleTilesKey, hasIonToken, normalizedLatitude, normalizedLongitude, provider, token]);

  useEffect(() => {
    if (!hasCoordinates) return;
    let cancelled = false;

    async function loadWeather() {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(normalizedLatitude as number));
        url.searchParams.set("longitude", String(normalizedLongitude as number));
        url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code");
        url.searchParams.set("timezone", "auto");
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
        const payload = await response.json() as {
          current?: {
            temperature_2m?: number;
            relative_humidity_2m?: number;
            wind_speed_10m?: number;
            weather_code?: number;
          };
        };
        if (cancelled || !payload.current || typeof payload.current.temperature_2m !== "number") return;
        setWeather({
          temperature: Math.round(payload.current.temperature_2m),
          humidity: typeof payload.current.relative_humidity_2m === "number" ? Math.round(payload.current.relative_humidity_2m) : null,
          windSpeed: typeof payload.current.wind_speed_10m === "number" ? Math.round(payload.current.wind_speed_10m) : null,
          code: typeof payload.current.weather_code === "number" ? payload.current.weather_code : null,
        });
      } catch (error) {
        console.warn("[LifestyleExplorer] Weather unavailable", error);
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [hasCoordinates, normalizedLatitude, normalizedLongitude]);

  useEffect(() => {
    if (!hasCoordinates) return;
    const controller = new AbortController();
    setPoisLoaded(false);

    async function loadPois() {
      try {
        const poiUrl = `/api/lifestyle/pois?lat=${encodeURIComponent(String(normalizedLatitude as number))}&lng=${encodeURIComponent(String(normalizedLongitude as number))}`;
        console.info("[LifestyleExplorer] Fetching POIs", {
          url: poiUrl,
          latitude: normalizedLatitude,
          longitude: normalizedLongitude,
        });
        const response = await fetch(poiUrl, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { pois?: ApiPoi[] };
        const rawPois = payload.pois || [];
        const { pois, rejected } = normalizeApiPois(rawPois, normalizedLatitude as number, normalizedLongitude as number);
        setRejectedPoiCount(rejected.length);
        setRejectedPoiReasons(rejected.slice(0, 12));
        debugGeo("[LifestyleExplorer] POIs received", {
          total: rawPois.length,
          valid: pois.length,
          rejected: rejected.length,
          rejectedSamples: rejected.slice(0, 8),
          byCategory: countPoisByCategory(pois),
        });
        if (pois.length > 0) {
          setRealPois(pois);
        } else {
          debugGeo("[LifestyleExplorer] No real POIs received; demoPoiFallback is active.", {
            demoPoiFallback: DEMO_POI_FALLBACK,
          });
          setRealPois([]);
          setRejectedPoiReasons(rejected.slice(0, 12));
          setSelectedPoi(null);
          setSelectedPoiId(null);
          setHighlightedPoiId(null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("[LifestyleExplorer] POI API unavailable.", error);
        }
      } finally {
        if (!controller.signal.aborted && isMountedRef.current && !isDestroyedRef.current) {
          setPoisLoaded(true);
        }
      }
    }

    loadPois();

    return () => controller.abort();
  }, [hasCoordinates, normalizedLatitude, normalizedLongitude]);

  useEffect(() => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (status !== "ready" || !Cesium || !viewer?.scene || !hasCoordinates || !isViewerUsable(viewer) || isDestroyedRef.current) {
      return;
    }

    setSurfaceReady(false);
    const sampleHeightMostDetailed = viewer.scene.sampleHeightMostDetailed;
    if (typeof sampleHeightMostDetailed !== "function") {
      setSurfaceHeights({});
      setSurfaceReady(true);
      return;
    }

    let cancelled = false;
    const propertyPosition = Cesium.Cartographic.fromDegrees(normalizedLongitude as number, normalizedLatitude as number);
    const poiPositions = visibleMapPois.map((poi) =>
      Cesium.Cartographic.fromDegrees(poi.coordinates.longitude, poi.coordinates.latitude),
    );

    sampleHeightMostDetailed.call(viewer.scene, [propertyPosition, ...poiPositions])
      .then((sampledPositions) => {
        if (cancelled || !isMountedRef.current || isDestroyedRef.current || !isViewerUsable(viewer)) return;
        const poiHeights: Record<string, number> = {};
        visibleMapPois.forEach((poi, index) => {
          const height = sampledHeight(sampledPositions[index + 1]);
          if (height != null) poiHeights[poi.id] = height;
        });
        const propertyHeight = sampledHeight(sampledPositions[0]);
        debugGeo("[LifestyleExplorer] Cesium sampled heights", {
          propertyHeight: propertyHeight ?? null,
          sampledPoiCount: Object.keys(poiHeights).length,
          totalPoiCount: visibleMapPois.length,
          fallback: propertyHeight == null ? "CLAMP_TO_GROUND" : null,
        });
        setSurfaceHeights({
          ...(propertyHeight != null ? { property: propertyHeight } : {}),
          pois: poiHeights,
        });
        setSurfaceReady(true);
      })
      .catch((error) => {
        if (!cancelled && isMountedRef.current && !isDestroyedRef.current) {
          console.warn("[LifestyleExplorer] Cesium height sampling unavailable; using low offset above tiles.", error);
          setSurfaceHeights({});
          setSurfaceReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasCoordinates, normalizedLatitude, normalizedLongitude, status, visibleMapPois]);

  useEffect(() => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (
      status !== "ready" ||
      !Cesium ||
      !viewer ||
      !hasCoordinates ||
      !poisLoaded ||
      !surfaceReady ||
      !entitiesReady ||
      hasFramedPoisRef.current ||
      selectedPoi ||
      !isViewerUsable(viewer) ||
      isDestroyedRef.current
    ) {
      return;
    }

    hasFramedPoisRef.current = true;
    flyToPropertyOverview({
      Cesium,
      viewer,
      latitude: normalizedLatitude as number,
      longitude: normalizedLongitude as number,
      pois: visibleMapPois,
      provider: activeProvider,
      onComplete: () => {
        if (!isMountedRef.current || isDestroyedRef.current) return;
        setIsIntroPlaying(false);
        setIsExploreMode(true);
      },
    });
  }, [activeProvider, entitiesReady, hasCoordinates, normalizedLatitude, normalizedLongitude, poisLoaded, selectedPoi, status, surfaceReady, visibleMapPois]);

  useEffect(() => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (status !== "ready" || !surfaceReady || !Cesium || !viewer || !hasCoordinates || !isViewerUsable(viewer) || isDestroyedRef.current) return;
    clearGeoPrimitives();
    if (!isViewerUsable(viewer) || isDestroyedRef.current) return;

    try {
      geoPrimitiveRef.current = renderLifestyleEntities({
        Cesium,
        viewer,
        latitude: normalizedLatitude as number,
        longitude: normalizedLongitude as number,
        primaryColor,
        pois: visibleMapPois,
        highlightedPoiId,
        selectedPoi,
        surfaceHeights,
      });
      setEntitiesReady(Boolean(geoPrimitiveRef.current));
    } catch (error) {
      console.warn("[LifestyleExplorer] Cesium primitives skipped after viewer destroy.", error);
      setEntitiesReady(false);
    }

    return () => {
      setEntitiesReady(false);
      clearGeoPrimitives();
    };
  }, [hasCoordinates, highlightedPoiId, normalizedLatitude, normalizedLongitude, primaryColor, selectedPoi, status, surfaceHeights, surfaceReady, visibleMapPois]);

  function runCinematicApproach(Cesium = cesiumRef.current, viewer = viewerRef.current, mode = activeProvider) {
    if (!viewer?.scene || !Cesium || !hasCoordinates || !isViewerUsable(viewer) || isDestroyedRef.current) return;

    if (introTimeoutRef.current) window.clearTimeout(introTimeoutRef.current);
    if (isMountedRef.current && !isDestroyedRef.current) {
      setIsIntroPlaying(true);
      setIsExploreMode(false);
    }

    const finishIntro = () => {
      if (!isMountedRef.current || isDestroyedRef.current || !isViewerUsable(viewer)) return;
      setIsIntroPlaying(false);
      setIsExploreMode(true);
      introTimeoutRef.current = null;
    };

    try {
      flyToPropertyOverview({
        Cesium,
        viewer,
        latitude: normalizedLatitude as number,
        longitude: normalizedLongitude as number,
        pois: visibleMapPois,
        provider: mode,
        onComplete: finishIntro,
      });
    } catch (error) {
      console.warn("[LifestyleExplorer] Cinematic camera skipped after viewer destroy.", error);
      finishIntro();
      return;
    }

    introTimeoutRef.current = window.setTimeout(finishIntro, mode === "google-photorealistic-3d" ? 3600 : 3000);
  }

  function clearGeoPrimitives() {
    clearLifestyleEntities(viewerRef.current, geoPrimitiveRef.current);
    geoPrimitiveRef.current = null;
  }

  function focusPoi(poi: MapPoi) {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer?.scene || !isViewerUsable(viewer) || isDestroyedRef.current || !Number.isFinite(poi.coordinates.latitude) || !Number.isFinite(poi.coordinates.longitude)) return;

    setSelectedPoiId(poi.id);
    setSelectedPoi(poi);
    setHighlightedPoiId(poi.id);
    setIsIntroPlaying(false);
    setIsExploreMode(true);
    setFreeExplorationEnabled(true);

    try {
      flyToPoi({
        Cesium,
        viewer,
        poi,
        provider: activeProvider,
      });
    } catch (error) {
      console.warn("[LifestyleExplorer] POI camera focus skipped after viewer destroy.", error);
    }
  }

  function returnToProperty() {
    setSelectedPoiId(null);
    setSelectedPoi(null);
    setHighlightedPoiId(null);
    setFreeExplorationEnabled(true);
    runCinematicApproach(cesiumRef.current, viewerRef.current, activeProvider);
  }

  function toggleFreeExploration() {
    const nextEnabled = !freeExplorationEnabled;
    setFreeExplorationEnabled(nextEnabled);
    setIsExploreMode(nextEnabled);
    if (!nextEnabled) returnToProperty();
  }

  return (
    <div className="fixed inset-0 z-[2147483647] h-screen w-screen overflow-hidden bg-[#050b16]">
      <div ref={containerRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.22),transparent_24%,transparent_82%,rgba(2,6,23,0.10)),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_42%,rgba(2,6,23,0.16))]" />

      <div className="absolute inset-y-0 left-0 z-30 hidden w-16 flex-col items-center justify-between border-r border-white/10 bg-slate-950/62 py-4 text-white shadow-2xl backdrop-blur-xl lg:flex">
        <div className="flex flex-col items-center gap-6">
          {PRESENTATION_NAV.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`group flex flex-col items-center gap-1.5 text-[9px] font-medium transition ${active ? "text-white" : "text-white/72 hover:text-white"}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/12" : "border-transparent bg-transparent"}`}
                style={active ? { color: primaryColor } : undefined}
              >
                <Icon size={18} />
              </span>
              <span className="max-w-[52px] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xs font-medium">HD</div>
      </div>

      <POISidebar
        groups={BOTTOM_FILTERS}
        pois={mapPois}
        activeGroupId={activeCategory}
        selectedPoiId={selectedPoiId}
        realPoiCount={realPois.length}
        demoFallback={DEMO_POI_FALLBACK}
        onGroupChange={setActiveCategory}
        onSelectPoi={focusPoi}
      />
      <POIDetails
        poi={selectedPoi}
        primaryColor={primaryColor}
        locale={locale}
        onFocusPoi={focusPoi}
        onReturnToProperty={returnToProperty}
      />
      <MiniMap
        propertyLabel={townFromLocation(locationLabel) || propertyTitle || getLifestyleCopy(locale).propertyFallback}
        selectedPoi={selectedPoi}
        primaryColor={primaryColor}
        locale={locale}
      />

      <div className="absolute right-6 top-20 z-30 hidden rounded-xl border border-white/10 bg-slate-950/58 p-4 text-white shadow-2xl backdrop-blur-xl xl:block">
        <div className="flex items-center gap-4">
          <Sun size={36} style={{ color: primaryColor }} />
          <div>
            <p className="text-xl font-medium">{weather ? `${weather.temperature} deg C` : "-- deg C"}</p>
            <p className="text-xs text-white/62">{weather ? weatherLabel(weather.code) : "Meteo en cours"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-3 text-xs text-white/72">
          <span className="flex items-center gap-2"><Wind size={14} /> Vent {weather?.windSpeed != null ? `${weather.windSpeed} km/h` : "--"}</span>
          <span className="flex items-center gap-2"><Droplets size={14} /> Humidite {weather?.humidity != null ? `${weather.humidity}%` : "--"}</span>
        </div>
      </div>

      {(status === "idle" || status === "loading") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.22),transparent_30%),#050b16] px-6 text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-white/55">Preparation de la demo 3D premium</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/58">
            Chargement du provider {provider === "google-photorealistic-3d" ? "Google Photorealistic 3D" : "Mode 3D architectural"} uniquement apres votre clic.
          </p>
        </div>
      )}

      {status === "missing-coordinates" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050b16] px-6 text-center text-white">
          <MapPin size={36} style={{ color: primaryColor }} />
          <p className="mt-4 text-xl font-medium">Coordonnees indisponibles</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
            Coordonnees du bien manquantes ou invalides. La vue 3D necessite une latitude et une longitude fiables.
          </p>
          {coordinates.reason && (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/62">
              Diagnostic: {coordinates.reason}
            </p>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050b16] px-6 text-center text-white">
          <Crosshair size={36} style={{ color: primaryColor }} />
          <p className="mt-4 text-xl font-medium">Vue 3D indisponible</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
            Le provider 3D n&apos;a pas pu etre initialise. La fiche conserve la carte classique et les donnees lifestyle.
          </p>
          {fallbackReason && process.env.NODE_ENV === "development" && (
            <p className="mt-4 max-w-md rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs leading-5 text-white/60">
              Diagnostic provider: {fallbackReason}
            </p>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-[390px] right-4 z-20 hidden items-end justify-between gap-4 lg:flex">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/66 p-2 text-white shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={returnToProperty}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-medium text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ backgroundColor: primaryColor }}
          >
            <Crosshair size={15} /> Retour au bien
          </button>
          <button
            type="button"
            onClick={toggleFreeExploration}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 text-xs text-white/78 transition hover:bg-white/15 hover:text-white"
          >
            <Navigation size={15} /> Exploration libre
          </button>
          <button
            type="button"
            onClick={() => runCinematicApproach()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 text-xs text-white/78 transition hover:bg-white/15 hover:text-white"
          >
            <Play size={15} /> Rejouer
          </button>
        </div>
        <div className="pointer-events-auto rounded-xl border border-white/10 bg-slate-950/62 p-2 text-white shadow-2xl backdrop-blur-xl xl:flex xl:gap-2">
          {BOTTOM_FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-xs font-medium transition ${
                activePanelCopy.label === label
                  ? "border-white/18 bg-white/16 text-white shadow-lg"
                  : "border-white/10 bg-white/[0.055] text-white/72 hover:bg-white/12 hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute right-3 top-3 z-20 flex gap-2 md:right-4 md:top-4">
        <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/58 text-white shadow-xl backdrop-blur md:inline-flex">
          <Sparkles size={17} style={{ color: primaryColor }} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/62 px-3 text-sm font-medium text-white shadow-xl backdrop-blur transition hover:bg-white/15"
          aria-label="Fermer la vue 3D"
        >
          <X size={18} />
          <span className="hidden sm:inline">Retour au site</span>
        </button>
      </div>

      <div className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        <button type="button" onClick={returnToProperty} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/58 text-white shadow-xl backdrop-blur transition hover:bg-white/15" aria-label="Retour au bien">
          <Crosshair size={17} />
        </button>
        <button type="button" onClick={() => runCinematicApproach()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/58 text-white shadow-xl backdrop-blur transition hover:bg-white/15" aria-label="Relancer la presentation">
          <Play size={16} />
        </button>
        <button type="button" onClick={toggleFreeExploration} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/58 text-white shadow-xl backdrop-blur transition hover:bg-white/15" aria-label="Exploration libre">
          <Navigation size={16} />
        </button>
      </div>
    </div>
  );
}

async function loadCesiumRuntime(): Promise<CesiumRuntime> {
  const [
    { default: CesiumWidget },
    { default: BoundingSphere },
    { default: Cartesian2 },
    { default: Cartesian3 },
    { default: Cartographic },
    { default: CesiumMath },
    { default: Color },
    { default: EllipsoidTerrainProvider },
    { default: HeadingPitchRange },
    { default: HeightReference },
    { default: HorizontalOrigin },
    { default: BillboardCollection },
    { default: ImageryLayer },
    { default: Ion },
    { default: IonImageryProvider },
    { default: LabelCollection },
    { default: LabelStyle },
    { default: OpenStreetMapImageryProvider },
    { default: PointPrimitiveCollection },
    { default: PolylineCollection },
    { default: VerticalOrigin },
    { default: createWorldTerrainAsync },
    { default: Cesium3DTileset },
    { default: Cesium3DTileStyle },
    { default: createOsmBuildingsAsync },
  ] = await Promise.all([
    import("@cesium/engine/Source/Widget/CesiumWidget.js"),
    import("@cesium/engine/Source/Core/BoundingSphere.js"),
    import("@cesium/engine/Source/Core/Cartesian2.js"),
    import("@cesium/engine/Source/Core/Cartesian3.js"),
    import("@cesium/engine/Source/Core/Cartographic.js"),
    import("@cesium/engine/Source/Core/Math.js"),
    import("@cesium/engine/Source/Core/Color.js"),
    import("@cesium/engine/Source/Core/EllipsoidTerrainProvider.js"),
    import("@cesium/engine/Source/Core/HeadingPitchRange.js"),
    import("@cesium/engine/Source/Scene/HeightReference.js"),
    import("@cesium/engine/Source/Scene/HorizontalOrigin.js"),
    import("@cesium/engine/Source/Scene/BillboardCollection.js"),
    import("@cesium/engine/Source/Scene/ImageryLayer.js"),
    import("@cesium/engine/Source/Core/Ion.js"),
    import("@cesium/engine/Source/Scene/IonImageryProvider.js"),
    import("@cesium/engine/Source/Scene/LabelCollection.js"),
    import("@cesium/engine/Source/Scene/LabelStyle.js"),
    import("@cesium/engine/Source/Scene/OpenStreetMapImageryProvider.js"),
    import("@cesium/engine/Source/Scene/PointPrimitiveCollection.js"),
    import("@cesium/engine/Source/Scene/PolylineCollection.js"),
    import("@cesium/engine/Source/Scene/VerticalOrigin.js"),
    import("@cesium/engine/Source/Core/createWorldTerrainAsync.js"),
    import("@cesium/engine/Source/Scene/Cesium3DTileset.js"),
    import("@cesium/engine/Source/Scene/Cesium3DTileStyle.js"),
    import("@cesium/engine/Source/Scene/createOsmBuildingsAsync.js"),
  ]);

  return {
    BoundingSphere,
    Cartesian2,
    Cartesian3,
    Cartographic,
    Cesium3DTileset,
    Cesium3DTileStyle,
    CesiumMath,
    CesiumWidget,
    Color,
    EllipsoidTerrainProvider,
    HeadingPitchRange,
    HeightReference,
    HorizontalOrigin,
    BillboardCollection,
    ImageryLayer,
    Ion,
    IonImageryProvider,
    LabelCollection,
    LabelStyle,
    OpenStreetMapImageryProvider,
    PointPrimitiveCollection,
    PolylineCollection,
    VerticalOrigin,
    createOsmBuildingsAsync,
    createWorldTerrainAsync,
  };
}

function townFromLocation(locationLabel: string) {
  return locationLabel.split(",").map((part) => part.trim()).filter(Boolean)[0] || "";
}

function enableFreeNavigation(viewer: CesiumViewerLike) {
  if (!isViewerUsable(viewer)) return;
  const controller = viewer.scene?.screenSpaceCameraController;
  if (!controller) return;
  controller.enableInputs = true;
  controller.enableTranslate = true;
  controller.enableZoom = true;
  controller.enableRotate = true;
  controller.enableTilt = true;
  controller.enableLook = true;
  controller.enableCollisionDetection = false;
  controller.minimumZoomDistance = 80;
  controller.maximumZoomDistance = 50000;
}

function isViewerDestroyed(viewer: CesiumViewerLike | null | undefined) {
  if (!viewer) return true;
  try {
    return typeof viewer.isDestroyed === "function" ? viewer.isDestroyed() : false;
  } catch {
    return true;
  }
}

function isViewerUsable(viewer: CesiumViewerLike | null | undefined) {
  return Boolean(viewer && !isViewerDestroyed(viewer) && viewer.scene);
}

function waitForCesiumSceneFrames(viewer: CesiumViewerLike, frameCount = 2) {
  return new Promise<void>((resolve) => {
    if (!isViewerUsable(viewer)) {
      resolve();
      return;
    }

    const postRender = viewer.scene?.postRender;
    if (!postRender || typeof postRender.addEventListener !== "function" || typeof postRender.removeEventListener !== "function") {
      window.setTimeout(resolve, 250);
      return;
    }
    const stablePostRender = postRender;

    let remainingFrames = Math.max(1, frameCount);
    const timeout = window.setTimeout(() => {
      try {
        stablePostRender.removeEventListener(onPostRender);
      } catch {
        // Cesium may have been destroyed while waiting for the scene to settle.
      }
      resolve();
    }, 1200);

    function onPostRender() {
      if (!isViewerUsable(viewer)) {
        window.clearTimeout(timeout);
        try {
          stablePostRender.removeEventListener(onPostRender);
        } catch {
          // Ignore lifecycle race.
        }
        resolve();
        return;
      }

      remainingFrames -= 1;
      if (remainingFrames > 0) return;

      window.clearTimeout(timeout);
      try {
        stablePostRender.removeEventListener(onPostRender);
      } catch {
        // Ignore lifecycle race.
      }
      resolve();
    }

    stablePostRender.addEventListener(onPostRender);
  });
}

async function addOsmBuildingsFallback(options: {
  Cesium: CesiumRuntime;
  viewer: CesiumViewerLike;
  cancelled: () => boolean;
  onLoaded: () => void;
}) {
  const { Cesium, viewer, cancelled, onLoaded } = options;
  if (cancelled()) return;

  try {
    console.info("[LifestyleExplorer] Loading OSM Buildings architectural fallback");
    const buildings = await Cesium.createOsmBuildingsAsync();
    if (cancelled()) return;
    if (buildings && typeof buildings === "object") {
      try {
        (buildings as { style?: unknown }).style = new Cesium.Cesium3DTileStyle({
          color: "color('white', 0.9)",
        });
      } catch (styleError) {
        console.warn("[LifestyleExplorer] OSM Buildings style skipped", styleError);
      }
    }
    viewer.scene?.primitives?.add(buildings);
    onLoaded();
    console.info("[LifestyleExplorer] OSM Buildings architectural fallback loaded");
  } catch (fallbackError) {
    const diagnostic = describeProviderError(fallbackError);
    console.warn("[LifestyleExplorer] OSM Buildings fallback unavailable", {
      name: diagnostic.name,
      message: diagnostic.message,
      stack: diagnostic.stack,
      json: diagnostic.json,
    });
  }
}


function sampledHeight(position: unknown) {
  if (!position || typeof position !== "object" || !("height" in position)) return undefined;
  const height = Number((position as { height?: unknown }).height);
  return Number.isFinite(height) ? height : undefined;
}

function describeProviderError(error: unknown) {
  const record = isRecord(error) ? error : {};
  const name = error instanceof Error ? error.name : typeof error;
  const rawResponse = typeof record.response === "string" ? record.response : "";
  const parsedResponse = parseProviderResponse(rawResponse);
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : parsedResponse?.error?.message || tryStringify(error) || "Erreur inconnue pendant le chargement 3D.";
  const stack = error instanceof Error ? error.stack || null : null;
  return {
    name,
    message,
    stack,
    statusCode: typeof record.statusCode === "number" ? record.statusCode : parsedResponse?.error?.code || null,
    response: rawResponse || null,
    responseHeaders: isRecord(record.responseHeaders) ? record.responseHeaders : null,
    json: tryStringify(error),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function debugGeo(message: string, payload: Record<string, unknown>) {
  if (!IS_DEVELOPMENT) return;
  console.info(message, payload);
}

function parseProviderResponse(response: string): { error?: { code?: number; message?: string; status?: string } } | null {
  if (!response) return null;
  try {
    const parsed = JSON.parse(response) as { error?: { code?: number; message?: string; status?: string } };
    return parsed;
  } catch {
    return null;
  }
}

function tryStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function redactGoogleKey(key: string) {
  if (!key) return "[missing]";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "[present]";
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

function googleProviderProbableCauses(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("referer") || normalized.includes("referrer")) {
    return "Restriction HTTP referer incompatible avec le domaine courant.";
  }
  if (normalized.includes("satellite tiles and 3d tiles are not available") || normalized.includes("account and region")) {
    return "Restriction Google Maps EEA / compte-region : les tuiles satellite et 3D ne sont pas disponibles pour ce compte ou cette region.";
  }
  if (normalized.includes("api key") || normalized.includes("key") || normalized.includes("permission_denied")) {
    return "Cle Google absente, invalide, restreinte, Map Tiles API non autorisee, ou compte non eligible.";
  }
  if (normalized.includes("billing") || normalized.includes("quota") || normalized.includes("429")) {
    return "Billing/quota Google Cloud a verifier pour Map Tiles API.";
  }
  if (normalized.includes("cors")) {
    return "Erreur CORS lors du chargement des tuiles Google.";
  }
  if (normalized.includes("404") || normalized.includes("not found")) {
    return "Endpoint Google 3D Tiles ou parametres de requete incorrects.";
  }
  return "Verifier Map Tiles API, restriction HTTP referer, billing/quota et reponse Cesium3DTileset.fromUrl.";
}

function destroyViewerSafely(viewer: CesiumViewerLike | null | undefined) {
  if (!viewer || isViewerDestroyed(viewer)) return;
  try {
    viewer.destroy();
  } catch (error) {
    console.warn("[LifestyleExplorer] Cesium viewer destroy skipped after lifecycle race.", error);
  }
}

function normalizeCoordinates(input: { latitude?: number | string | null; longitude?: number | string | null }): NormalizedCoordinates {
  const normalized = normalizeGeoPoint(input);
  return {
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    valid: normalized.valid,
    reason: normalized.reason,
    swapped: normalized.swapped,
  };
}

function countPoisByCategory(pois: MapPoi[]) {
  return pois.reduce<Record<string, number>>((counts, poi) => {
    counts[poi.category] = (counts[poi.category] || 0) + 1;
    return counts;
  }, {});
}

function normalizeApiPois(rawPois: ApiPoi[], propertyLatitude: number, propertyLongitude: number) {
  const property = { latitude: propertyLatitude, longitude: propertyLongitude };
  const pois: MapPoi[] = [];
  const rejected: Array<{ id: string; label: string; category: string; reason: string }> = [];

  for (const rawPoi of rawPois) {
    const mapped = mapApiPoi(rawPoi, property);
    if (mapped.poi) {
      pois.push(mapped.poi);
      debugGeo("[LifestyleExplorer] Valid POI coordinates", {
        id: rawPoi.id,
        name: rawPoi.name || rawPoi.label,
        rawLatitude: rawPoi.latitude,
        rawLongitude: rawPoi.longitude,
        rawLatitudeType: typeof rawPoi.latitude,
        rawLongitudeType: typeof rawPoi.longitude,
        normalizedLatitude: mapped.poi.coordinates.latitude,
        normalizedLongitude: mapped.poi.coordinates.longitude,
        category: mapped.poi.category,
        source: mapped.poi.source || rawPoi.source || "unknown",
        distanceKm: Number(mapped.poi.distanceKm.toFixed(3)),
      });
    } else {
      rejected.push({
        id: rawPoi.id,
        label: rawPoi.name || rawPoi.label || "POI",
        category: rawPoi.category,
        reason: mapped.reason || "POI invalide.",
      });
      debugGeo("[LifestyleExplorer] Rejected POI coordinates", {
        id: rawPoi.id,
        label: rawPoi.name || rawPoi.label,
        category: rawPoi.category,
        latitude: rawPoi.latitude,
        longitude: rawPoi.longitude,
        latitudeType: typeof rawPoi.latitude,
        longitudeType: typeof rawPoi.longitude,
        source: rawPoi.source || "unknown",
        reason: mapped.reason,
      });
    }
  }

  return {
    pois: pois.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 50),
    rejected,
  };
}

function mapApiPoi(poi: ApiPoi, property: { latitude: number; longitude: number }): { poi: MapPoi | null; reason?: string } {
  const preset = poiPreset(poi.category);
  if (!preset) return { poi: null, reason: `Categorie inconnue: ${poi.category}` };

  const validation = validatePoiCoordinates({
    latitude: poi.latitude,
    longitude: poi.longitude,
    category: preset.category,
    property,
  });
  if (!validation.valid || !validation.coordinates) {
    return { poi: null, reason: validation.reason || "Coordonnees invalides." };
  }

  const distanceKm = validation.distanceKm ?? distanceKmBetween(
    property.latitude,
    property.longitude,
    validation.coordinates.latitude,
    validation.coordinates.longitude,
  );

  return {
    poi: {
      ...preset,
      id: poi.id,
      category: preset.category,
      label: poi.name || poi.label || preset.label,
      detail: poi.detail || `Distance a vol d'oiseau - ${formatDistance(distanceKm)}`,
      distanceKm,
      address: poi.address,
      phone: poi.phone,
      website: poi.website,
      rating: poi.rating,
      reviews: poi.reviews,
      source: poi.source === "google_places" ? "google_places" : "openstreetmap",
      coordinates: validation.coordinates,
    },
    reason: validation.swapped ? "Coordonnees inversees corrigees." : undefined,
  };
}

function poiPreset(category: string) {
  if (category === "beach") return { ...MAP_POIS[0], labelOffsetX: 42, labelOffsetY: -54 };
  if (category === "golf") return { ...MAP_POIS[2], labelOffsetX: -210, labelOffsetY: -28 };
  if (category === "restaurant") return { ...MAP_POIS[3], labelOffsetX: 36, labelOffsetY: 30 };
  if (category === "school") return { ...MAP_POIS[4], id: "school", category: "school" as const, label: "Ecoles", detail: "Ecole proche", icon: GraduationCap, color: "#818cf8", labelOffsetX: -204, labelOffsetY: 34 };
  if (category === "hospital") return { ...MAP_POIS[4], id: "hospital", category: "hospital" as const, label: "Hopital", detail: "Service medical", icon: Building2, color: "#f87171", labelOffsetX: 44, labelOffsetY: -84 };
  if (category === "shops") return { ...MAP_POIS[3], id: "shops", category: "shops" as const, label: "Commerces", detail: "Commerces proches", icon: ShoppingCart, color: "#10b981", labelOffsetX: 38, labelOffsetY: 44 };
  if (category === "airport") return { ...MAP_POIS[4], id: "airport", category: "airport" as const, label: "Aeroport", detail: "Aeroport proche", icon: Navigation, color: "#60a5fa", labelOffsetX: 44, labelOffsetY: -34 };
  return null;
}

function formatDistance(distanceKm: number) {
  if (!Number.isFinite(distanceKm)) return "Non determinee";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

function applyCoastalContext(pois: typeof MAP_POIS, locationLabel: string) {
  const normalized = locationLabel.toLowerCase();
  const isCostaDelSol =
    normalized.includes("san pedro") ||
    normalized.includes("marbella") ||
    normalized.includes("estepona") ||
    normalized.includes("manilva") ||
    normalized.includes("fuengirola") ||
    normalized.includes("malaga") ||
    normalized.includes("málaga");
  const isCostaBlanca =
    normalized.includes("benidorm") ||
    normalized.includes("alicante") ||
    normalized.includes("orihuela") ||
    normalized.includes("altea") ||
    normalized.includes("finestrat");

  return pois.map((poi) => {
    if (!isCostaDelSol && !isCostaBlanca) return poi;
    if (poi.id === "beach") {
      return {
        ...poi,
        bearing: isCostaDelSol ? 155 : 105,
        distanceKm: isCostaDelSol ? 1.1 : 1.4,
        labelOffsetX: isCostaDelSol ? 38 : 34,
        labelOffsetY: isCostaDelSol ? -44 : -62,
      };
    }
    if (poi.id === "sea") {
      return {
        ...poi,
        bearing: isCostaDelSol ? 165 : 112,
        distanceKm: isCostaDelSol ? 2.2 : 2.8,
        labelOffsetX: 42,
        labelOffsetY: 12,
      };
    }
    if (poi.id === "golf") {
      return {
        ...poi,
        bearing: isCostaDelSol ? 245 : 280,
        distanceKm: isCostaDelSol ? 2.4 : 4.1,
      };
    }
    if (poi.id === "center") {
      return {
        ...poi,
        bearing: isCostaDelSol ? 42 : 24,
        distanceKm: isCostaDelSol ? 1.8 : 3.2,
      };
    }
    return poi;
  });
}

function weatherLabel(code: number | null) {
  if (code == null) return "Meteo en cours";
  if (code === 0) return "Ciel degage";
  if ([1, 2, 3].includes(code)) return "Partiellement nuageux";
  if ([45, 48].includes(code)) return "Brume";
  if ([51, 53, 55, 56, 57].includes(code)) return "Bruine";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Pluie";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neige";
  if ([95, 96, 99].includes(code)) return "Orage";
  return "Conditions variables";
}

function destinationPoint(latitude: number, longitude: number, angle: number, distanceKm: number) {
  const radius = 6371;
  const bearing = (angle * Math.PI) / 180;
  const lat1 = (latitude * Math.PI) / 180;
  const lon1 = (longitude * Math.PI) / 180;
  const angularDistance = distanceKm / radius;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
}
