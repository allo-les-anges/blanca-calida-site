"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  Building2,
  CloudSun,
  Compass,
  Crosshair,
  HeartPulse,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  School,
  ShoppingBag,
  Sparkles,
  Droplets,
  Train,
  Trees,
  Utensils,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { normalizeGeoPoint } from "@/modules/lifestyle/viewer/coordinateUtils";

export type LifestylePoi = {
  id: string;
  name: string;
  category: "beach" | "school" | "transport" | "shop" | "restaurant" | "health" | "sport" | "viewpoint";
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  description?: string;
  source?: "cesium-ion" | "local" | "api" | "openstreetmap";
};

type CesiumLifestyleViewerV7Props = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  title?: string;
  propertyTitle?: string;
  locationLabel?: string;
  primaryColor?: string;
  locale?: string;
  pois?: LifestylePoi[];
  propertyImageUrl?: string | null;
  provider?: string;
  allowDemoPois?: boolean;
  onClose?: () => void;
};

type CesiumEntity = Record<string, unknown>;

type CesiumViewerV7Like = {
  destroy: () => void;
  isDestroyed?: () => boolean;
  entities: {
    add: (entity: Record<string, unknown>) => CesiumEntity;
    remove?: (entity: CesiumEntity) => boolean;
    removeAll?: () => void;
  };
  imageryLayers?: { length: number };
  scene: {
    canvas?: HTMLCanvasElement;
    globe?: { show: boolean; enableLighting?: boolean };
    primitives?: { add: (primitive: unknown) => unknown };
    requestRender?: () => void;
    postRender?: {
      addEventListener: (callback: () => void) => void;
      removeEventListener: (callback: () => void) => void;
    };
    pick?: (position: unknown) => { id?: CesiumEntity } | undefined;
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
  camera: {
    flyTo: (options: Record<string, unknown>) => void;
    flyToBoundingSphere: (boundingSphere: unknown, options?: Record<string, unknown>) => void;
    setView: (options: Record<string, unknown>) => void;
    zoomIn: (amount?: number) => void;
    zoomOut: (amount?: number) => void;
    pitch: number;
    positionCartographic?: { height: number };
  };
  flyTo?: (target: unknown, options?: Record<string, unknown>) => Promise<boolean>;
  resize?: () => void;
};

type CesiumRuntimeV7 = {
  Viewer: new (container: Element, options?: Record<string, unknown>) => CesiumViewerV7Like;
  Cartesian2: new (x: number, y: number) => unknown;
  Cartesian3: {
    fromDegrees: (longitude: number, latitude: number, height?: number) => unknown;
  };
  Cartographic: {
    fromCartesian: (cartesian: unknown) => { latitude: number; longitude: number; height?: number };
  };
  Color: {
    BLACK: unknown;
    WHITE: unknown;
    YELLOW: unknown;
    fromCssColorString: (color: string) => unknown;
  };
  BoundingSphere: new (center: unknown, radius: number) => unknown;
  Cesium3DTileStyle: new (options: Record<string, unknown>) => unknown;
  CesiumMath: { toRadians: (degrees: number) => number };
  EllipsoidTerrainProvider: new () => unknown;
  createWorldTerrainAsync: () => Promise<unknown>;
  HeadingPitchRange: new (heading: number, pitch: number, range: number) => unknown;
  HeightReference: { CLAMP_TO_GROUND: unknown };
  HorizontalOrigin: { CENTER: unknown; LEFT: unknown };
  ImageryLayer: new (imageryProvider?: unknown) => unknown;
  Ion: { defaultAccessToken: string };
  IonImageryProvider: { fromAssetId: (assetId: number) => Promise<unknown> };
  IonResource: { fromAssetId: (assetId: number) => Promise<unknown> };
  JulianDate: { now: () => unknown };
  GeoJsonDataSource: { load: (resource: unknown) => Promise<CesiumDataSourceLike> };
  CzmlDataSource: { load: (resource: unknown) => Promise<CesiumDataSourceLike> };
  KmlDataSource: { load: (resource: unknown, options?: Record<string, unknown>) => Promise<CesiumDataSourceLike> };
  LabelStyle: { FILL_AND_OUTLINE: unknown };
  OpenStreetMapImageryProvider: new (options: { url: string }) => unknown;
  UrlTemplateImageryProvider: new (options: { url: string; credit?: string; maximumLevel?: number }) => unknown;
  PolylineDashMaterialProperty: new (options: Record<string, unknown>) => unknown;
  ScreenSpaceEventHandler: new (canvas: HTMLCanvasElement) => {
    setInputAction: (callback: (movement: { position: unknown }) => void, type: unknown) => void;
    destroy: () => void;
    isDestroyed?: () => boolean;
  };
  ScreenSpaceEventType: { LEFT_CLICK: unknown };
  SceneTransforms: { worldToWindowCoordinates: (scene: unknown, position: unknown) => { x: number; y: number } | undefined };
  VerticalOrigin: { BOTTOM: unknown; CENTER: unknown };
  createOsmBuildingsAsync: (options?: Record<string, unknown>) => Promise<unknown>;
};

type CesiumDataSourceLike = {
  entities?: {
    values?: CesiumIonEntityLike[];
  };
};

type CesiumIonEntityLike = {
  id?: string;
  name?: string;
  position?: {
    getValue?: (time?: unknown) => unknown;
  };
  properties?: Record<string, unknown> & {
    getValue?: (time?: unknown) => Record<string, unknown>;
  };
};

type RuntimeState = {
  Cesium: CesiumRuntimeV7;
  viewer: CesiumViewerV7Like;
  propertyEntity: CesiumEntity | null;
  poiEntities: Map<string, CesiumEntity>;
  lineEntity: CesiumEntity | null;
};

const COPY = {
  fr: {
    loading: "Chargement de l'explorateur 3D...",
    missing: "Coordonnees du bien manquantes ou invalides.",
    close: "Retour au site",
    recenter: "Recenter property",
    discover: "Decouvrir les lieux",
    stop: "Stop",
    property: "Votre bien",
    subtitle: "Lifestyle Explorer",
    intro: "Explorez les lieux utiles autour du bien avec une lecture immobiliere claire.",
    categories: "Categories",
    places: "Lieux proches",
    selected: "Lieu selectionne",
    source: "Source",
    noPoi: "POI reels indisponibles pour le moment.",
    noPoiDetail: "Aucun marqueur fictif n'est affiche afin d'eviter une localisation incorrecte.",
    selectHint: "Selectionnez un lieu dans la liste pour l'afficher sur la carte.",
  },
  en: {
    loading: "Loading 3D explorer...",
    missing: "Missing or invalid property coordinates.",
    close: "Back to site",
    recenter: "Recenter property",
    discover: "Discover places",
    stop: "Stop",
    property: "Your property",
    subtitle: "Lifestyle Explorer",
    intro: "Explore useful places around the property with a clear real-estate reading.",
    categories: "Categories",
    places: "Nearby places",
    selected: "Selected place",
    source: "Source",
    noPoi: "Real POIs are unavailable right now.",
    noPoiDetail: "No fictional marker is shown, to avoid incorrect locations.",
    selectHint: "Select a place from the list to preview it on the map.",
  },
  es: {
    loading: "Cargando explorador 3D...",
    missing: "Coordenadas del inmueble ausentes o invalidas.",
    close: "Volver al sitio",
    recenter: "Recenter property",
    discover: "Descubrir lugares",
    stop: "Stop",
    property: "Tu inmueble",
    subtitle: "Lifestyle Explorer",
    intro: "Explore lugares utiles alrededor del inmueble con una lectura inmobiliaria clara.",
    categories: "Categorias",
    places: "Lugares cercanos",
    selected: "Lugar seleccionado",
    source: "Fuente",
    noPoi: "Los POI reales no estan disponibles ahora.",
    noPoiDetail: "No se muestra ningun marcador ficticio para evitar ubicaciones incorrectas.",
    selectHint: "Seleccione un lugar de la lista para verlo en el mapa.",
  },
  nl: {
    loading: "3D explorer laden...",
    missing: "Ontbrekende of ongeldige pandcoordinaten.",
    close: "Terug naar site",
    recenter: "Recenter property",
    discover: "Ontdek plaatsen",
    stop: "Stop",
    property: "Uw pand",
    subtitle: "Lifestyle Explorer",
    intro: "Verken nuttige plaatsen rond het pand met een heldere vastgoedlezing.",
    categories: "Categorieen",
    places: "Plaatsen dichtbij",
    selected: "Geselecteerde plaats",
    source: "Bron",
    noPoi: "Echte POI's zijn momenteel niet beschikbaar.",
    noPoiDetail: "Er wordt geen fictieve marker getoond om verkeerde locaties te vermijden.",
    selectHint: "Selecteer een plaats in de lijst om die op de kaart te tonen.",
  },
  pl: {
    loading: "Ladowanie eksploratora 3D...",
    missing: "Brakujace lub nieprawidlowe wspolrzedne nieruchomosci.",
    close: "Powrot do strony",
    recenter: "Recenter property",
    discover: "Odkryj miejsca",
    stop: "Stop",
    property: "Twoja nieruchomosc",
    subtitle: "Lifestyle Explorer",
    intro: "Poznaj przydatne miejsca wokol nieruchomosci w przejrzystej prezentacji.",
    categories: "Kategorie",
    places: "Miejsca w poblizu",
    selected: "Wybrane miejsce",
    source: "Zrodlo",
    noPoi: "Rzeczywiste POI sa chwilowo niedostepne.",
    noPoiDetail: "Nie pokazujemy fikcyjnych znacznikow, aby uniknac blednej lokalizacji.",
    selectHint: "Wybierz miejsce z listy, aby pokazac je na mapie.",
  },
  ar: {
    loading: "Loading 3D explorer...",
    missing: "Missing or invalid property coordinates.",
    close: "Back to site",
    recenter: "Recenter property",
    discover: "Discover places",
    stop: "Stop",
    property: "Your property",
    subtitle: "Lifestyle Explorer",
    intro: "Explore useful places around the property with a clear real-estate reading.",
    categories: "Categories",
    places: "Nearby places",
    selected: "Selected place",
    source: "Source",
    noPoi: "Real POIs are unavailable right now.",
    noPoiDetail: "No fictional marker is shown, to avoid incorrect locations.",
    selectHint: "Select a place from the list to preview it on the map.",
  },
} as const;

const CATEGORY_META = {
  beach: { label: "Beaches", icon: Waves, color: "#38bdf8" },
  school: { label: "Schools", icon: School, color: "#a78bfa" },
  transport: { label: "Transport", icon: Train, color: "#22d3ee" },
  shop: { label: "Shopping", icon: ShoppingBag, color: "#34d399" },
  restaurant: { label: "Restaurants", icon: Utensils, color: "#fb923c" },
  health: { label: "Health", icon: HeartPulse, color: "#fb7185" },
  sport: { label: "Sport", icon: Trees, color: "#4ade80" },
  viewpoint: { label: "Viewpoints", icon: Building2, color: "#facc15" },
} satisfies Record<LifestylePoi["category"], { label: string; icon: typeof Waves; color: string }>;

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const DEFAULT_PROVIDER = "cesium-architectural";
const MAX_VISIBLE_POIS = 50;

export default function CesiumLifestyleViewerV7({
  latitude,
  longitude,
  title,
  propertyTitle,
  locationLabel = "",
  primaryColor = "#2dd4bf",
  locale,
  pois,
  propertyImageUrl,
  provider,
  allowDemoPois = true,
  onClose,
}: CesiumLifestyleViewerV7Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeState | null>(null);
  const discoveryTimeoutRef = useRef<number | null>(null);
  const clickHandlerRef = useRef<{ destroy: () => void; isDestroyed?: () => boolean } | null>(null);
  const isMountedRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const isClosingRef = useRef(false);
  const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";
  const poiAssetId = process.env.NEXT_PUBLIC_LIFESTYLE_POI_ASSET_ID || "";
  const effectiveProvider = normalizeProvider(provider || process.env.NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER);
  const hasIonToken = ionToken.trim().length > 0;
  const coordinates = useMemo(() => normalizeGeoPoint({ latitude, longitude }), [latitude, longitude]);
  const hasCoordinates = coordinates.valid && coordinates.latitude != null && coordinates.longitude != null;
  const propertyName = title || propertyTitle || "Property";
  const copy = getCopy(locale);
  const accent = normalizeHexColor(primaryColor, "#2dd4bf");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing" | "error">("idle");
  const [activeCategory, setActiveCategory] = useState<LifestylePoi["category"] | "all">("all");
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [osmBuildingsLoaded, setOsmBuildingsLoaded] = useState(false);
  const [terrainLoaded, setTerrainLoaded] = useState(false);
  const [ionPoisLoaded, setIonPoisLoaded] = useState(false);
  const [ionPois, setIonPois] = useState<LifestylePoi[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [poiScreenPosition, setPoiScreenPosition] = useState<{ x: number; y: number } | null>(null);
  const hasExternalPois = Boolean((pois && pois.length > 0) || ionPois.length > 0);
  const poiServiceUnavailable = allowDemoPois && !hasExternalPois;

  const allPois = useMemo<LifestylePoi[]>(() => {
    if (!hasCoordinates) return [];
    const property = { latitude: coordinates.latitude as number, longitude: coordinates.longitude as number };
    const sourcePois = dedupePoisByIdAndPosition([...(pois || []), ...ionPois]);
    return normalizePois(sourcePois, property).slice(0, MAX_VISIBLE_POIS);
  }, [coordinates.latitude, coordinates.longitude, hasCoordinates, ionPois, pois]);

  const visiblePois = useMemo(
    () => (activeCategory === "all" ? allPois : allPois.filter((poi) => poi.category === activeCategory)),
    [activeCategory, allPois],
  );

  const selectedPoi = useMemo(() => allPois.find((poi) => poi.id === selectedPoiId) || null, [allPois, selectedPoiId]);
  const coastalPoi = useMemo(() => allPois.find((poi) => poi.category === "beach" || poi.category === "viewpoint") || null, [allPois]);
  const surroundingBuildings = useMemo(() => buildSurroundingHighlights(allPois), [allPois]);
  const weather = useMemo(() => buildWeatherSnapshot(coordinates.latitude as number | undefined, coordinates.longitude as number | undefined), [coordinates.latitude, coordinates.longitude]);

  const allPoisRef = useRef<LifestylePoi[]>([]);
  const propertyLabelRef = useRef(copy.property);
  const accentRef = useRef(accent);

  useEffect(() => {
    allPoisRef.current = allPois;
  }, [allPois]);

  useEffect(() => {
    propertyLabelRef.current = copy.property;
  }, [copy.property]);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  const safeSetStatus = useCallback((nextStatus: typeof status) => {
    if (!isMountedRef.current || isDestroyedRef.current) return;
    setStatus(nextStatus);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    isDestroyedRef.current = false;
    isClosingRef.current = false;
    return () => {
      isClosingRef.current = true;
      isMountedRef.current = false;
      isDestroyedRef.current = true;
      stopDiscovery(discoveryTimeoutRef);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    isDestroyedRef.current = false;

    async function boot() {
      const existingViewer = runtimeRef.current?.viewer;
      if (existingViewer && isViewerUsable(existingViewer)) {
        console.info("[LifestyleExplorerV7] init:skip-existing-viewer", {
          provider: effectiveProvider,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
        safeSetStatus("ready");
        return;
      }

      console.info("[LifestyleExplorerV7] init:start", {
        provider: effectiveProvider,
        hasCoordinates,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (!containerRef.current || !isMountedRef.current || isDestroyedRef.current) return;
      console.info("[LifestyleExplorerV7] init:container-found", getElementDimensions(containerRef.current));

      if (!hasCoordinates) {
        safeSetStatus("missing");
        return;
      }

      safeSetStatus("loading");

      let viewer: CesiumViewerV7Like | null = null;
      let readyReached = false;

      try {
        const Cesium = await loadCesiumRuntimeV7();
        await import("@cesium/widgets/Source/Viewer/Viewer.css");
        if (cancelled || !containerRef.current || !isMountedRef.current || isDestroyedRef.current) return;

        Cesium.Ion.defaultAccessToken = ionToken;
        if (!hasIonToken) {
          console.warn("[LifestyleExplorerV7] NEXT_PUBLIC_CESIUM_ION_TOKEN missing; terrain/OSM Buildings may depend on Cesium ion access.");
        }

        console.info("[LifestyleExplorerV7] Effective provider", {
          provider: effectiveProvider,
          googleWillLoad: false,
          poiAssetId: poiAssetId || null,
        });

        console.info("[LifestyleExplorerV7] init:terrain-start");
        const { terrainProvider, terrainLoaded: nextTerrainLoaded } = await loadTerrainProvider(Cesium, hasIonToken);
        console.info("[LifestyleExplorerV7] init:terrain-done", { terrainLoaded: nextTerrainLoaded });

        console.info("[LifestyleExplorerV7] init:imagery-start");
        const baseImagery = await loadBaseImageryLayer(Cesium, hasIonToken);
        console.info("[LifestyleExplorerV7] init:imagery-done", { provider: baseImagery.provider });

        if (cancelled || !containerRef.current || isDestroyedRef.current) return;

        console.info("[LifestyleExplorerV7] init:viewer-create-start", getElementDimensions(containerRef.current));
        viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          terrainProvider,
          baseLayer: baseImagery.baseLayer,
          shouldAnimate: false,
        });

        if (!isViewerUsable(viewer)) {
          console.error("[LifestyleExplorerV7] init:viewer-create-error", { usable: false });
          destroyViewerSafely(viewer);
          safeSetStatus("error");
          return;
        }

        console.info("[LifestyleExplorerV7] init:viewer-created", {
          imageryLayers: viewer.imageryLayers?.length ?? null,
          canvas: viewer.scene.canvas ? getElementDimensions(viewer.scene.canvas) : null,
        });

        // Shadow maps + terrain-receive-shadows + ambient occlusion were tried here and
        // reverted: over the wide, mostly-flat terrain views this app shows (property
        // overview at ~1750m), the shadow map produced visible banding/acne across the
        // whole ground plane and cost enough GPU time to make the viewer noticeably
        // sluggish. enableLighting alone (sun-direction shading on building faces) is
        // the part that's actually cheap and looked better without those problems.
        if (viewer.scene.globe) viewer.scene.globe.enableLighting = true;

        if (viewer.scene.globe) viewer.scene.globe.show = true;
        enableFreeNavigation(viewer);
        viewer.resize?.();
        viewer.scene.requestRender?.();

        console.info("[LifestyleExplorerV7] init:osm-start");
        const nextOsmBuildingsLoaded = await loadOsmArchitecturalScene(Cesium, viewer, () => cancelled);
        console.info("[LifestyleExplorerV7] init:osm-done", { osmBuildingsLoaded: nextOsmBuildingsLoaded });

        console.info("[LifestyleExplorerV7] init:poi-start");
        try {
          const loadedIonPois = await loadPoisFromCesiumIon(Cesium, poiAssetId, viewer);
          if (isMountedRef.current && !isDestroyedRef.current) {
            setIonPois(loadedIonPois);
            setIonPoisLoaded(loadedIonPois.length > 0);
          }
          console.info("[LifestyleExplorerV7] init:poi-done", { ionPois: loadedIonPois.length });
        } catch (poiError) {
          console.warn("[LifestyleExplorerV7] init:poi-error", poiError);
        }

        console.info("[LifestyleExplorerV7] init:markers-start", { poiCount: allPoisRef.current.length, visiblePoiEntities: 0 });
        const propertyEntity = createPropertyEntity({
          Cesium,
          viewer,
          latitude: coordinates.latitude as number,
          longitude: coordinates.longitude as number,
          label: propertyLabelRef.current,
          accent: accentRef.current,
        });
        console.info("[LifestyleExplorerV7] init:markers-done", { property: Boolean(propertyEntity), poiEntities: 0 });

        runtimeRef.current = {
          Cesium,
          viewer,
          propertyEntity,
          poiEntities: new Map(),
          lineEntity: null,
        };

        attachPoiClickHandler(Cesium, viewer, (poiId) => {
          const poi = allPoisRef.current.find((item) => item.id === poiId);
          if (poi) selectPoi(poi);
        });

        if (isMountedRef.current && !isDestroyedRef.current) {
          setTerrainLoaded(nextTerrainLoaded);
          setOsmBuildingsLoaded(nextOsmBuildingsLoaded);
        }

        console.info("[LifestyleExplorerV7] init:camera-start");
        try {
          await waitForSceneFrames(viewer, 3);
          if (!cancelled && isViewerUsable(viewer)) {
            flyToPropertyOverview(Cesium, viewer, coordinates.latitude as number, coordinates.longitude as number);
          }
          console.info("[LifestyleExplorerV7] init:camera-done");
        } catch (cameraError) {
          console.warn("[LifestyleExplorerV7] init:camera-error", cameraError);
        }

        readyReached = true;
        console.info("[LifestyleExplorerV7] init:ready");
        logViewerRenderDiagnostics(viewer);
        safeSetStatus("ready");
      } catch (error) {
        console.error("[LifestyleExplorerV7] viewer failed", error);
        if (!cancelled) safeSetStatus("error");
      } finally {
        if (!cancelled && isMountedRef.current && !isDestroyedRef.current && !readyReached && viewer && isViewerUsable(viewer)) {
          console.warn("[LifestyleExplorerV7] init:forcing-ready-after-partial-viewer");
          safeSetStatus("ready");
        }
      }
    }

    boot();

    return () => {
      console.info("[LifestyleExplorerV7] init:cleanup-start", {
        hasRuntime: Boolean(runtimeRef.current),
        viewerDestroyed: runtimeRef.current?.viewer ? safeIsDestroyed(runtimeRef.current.viewer) : null,
      });
      cancelled = true;
      stopDiscovery(discoveryTimeoutRef);
      isDestroyedRef.current = true;
      const handler = clickHandlerRef.current;
      clickHandlerRef.current = null;
      try {
        if (handler && !(typeof handler.isDestroyed === "function" && handler.isDestroyed())) handler.destroy();
      } catch {
        // Ignore Cesium lifecycle races.
      }
      const runtime = runtimeRef.current;
      runtimeRef.current = null;
      console.info("[LifestyleExplorerV7] cleanup:destroy-viewer", {
        reason: "lat-lng-provider-change-or-unmount",
        hadRuntime: Boolean(runtime),
        viewerDestroyed: runtime?.viewer ? safeIsDestroyed(runtime.viewer) : null,
      });
      destroyViewerSafely(runtime?.viewer);
      console.info("[LifestyleExplorerV7] init:cleanup-done");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates.latitude, coordinates.longitude, effectiveProvider]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer) || !hasCoordinates) return;
    // Only the property marker is shown on load. POIs stay list-only until the
    // user selects one (see selectPoi) — the globe should never be cluttered
    // with every nearby place at once.
    updateViewerMarkers({
      runtime,
      latitude: coordinates.latitude as number,
      longitude: coordinates.longitude as number,
      label: copy.property,
      accent,
      pois: [],
      selectedPoiId: null,
    });
    console.info("[LifestyleExplorerV7] poi-visibility:property-only", { visiblePoiEntities: runtime.poiEntities.size });
  }, [accent, coordinates.latitude, coordinates.longitude, copy.property, hasCoordinates]);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!isMountedRef.current || isDestroyedRef.current || isClosingRef.current) return;
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Tracks the selected POI's on-screen position every frame so the HTML callout card
  // (native Cesium labels can't render icons, rounded corners or backdrop blur) stays
  // pinned above its pin as the camera moves.
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer) || !selectedPoi) {
      if (!isClosingRef.current) setPoiScreenPosition(null);
      return;
    }
    const cartesian = runtime.Cesium.Cartesian3.fromDegrees(selectedPoi.longitude, selectedPoi.latitude);
    const postRender = runtime.viewer.scene.postRender;
    function updatePosition() {
      if (isClosingRef.current || !runtime || !isViewerUsable(runtime.viewer)) return;
      const windowPosition = runtime.Cesium.SceneTransforms.worldToWindowCoordinates(runtime.viewer.scene, cartesian);
      setPoiScreenPosition(windowPosition ? { x: windowPosition.x, y: windowPosition.y } : null);
    }
    updatePosition();
    postRender?.addEventListener(updatePosition);
    return () => {
      try {
        postRender?.removeEventListener(updatePosition);
      } catch {
        // Cesium may already have torn down the scene during close.
      }
      if (isMountedRef.current && !isDestroyedRef.current && !isClosingRef.current) {
        setPoiScreenPosition(null);
      }
    };
  }, [selectedPoi]);

  function attachPoiClickHandler(Cesium: CesiumRuntimeV7, viewer: CesiumViewerV7Like, onPick: (poiId: string) => void) {
    if (!viewer.scene.canvas || !viewer.scene.pick) return;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: { position: unknown }) => {
      if (!isViewerUsable(viewer) || !viewer.scene.pick) return;
      const picked = viewer.scene.pick(movement.position);
      const id = picked?.id as CesiumEntity | undefined;
      const poiId = id?.__lifestylePoiId;
      if (typeof poiId === "string") onPick(poiId);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    clickHandlerRef.current = handler;
  }

  const selectPoi = useCallback((poi: LifestylePoi) => {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer)) return;
    setSelectedPoiId(poi.id);
    showSinglePoi(runtime, coordinates.latitude as number, coordinates.longitude as number, poi);
    flyToPoi(runtime.Cesium, runtime.viewer, poi);
  }, [coordinates.latitude, coordinates.longitude]);

  function recenterProperty() {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer) || !hasCoordinates) return;
    setSelectedPoiId(null);
    clearPoiEntities(runtime);
    removeLine(runtime);
    flyToPropertyOverview(runtime.Cesium, runtime.viewer, coordinates.latitude as number, coordinates.longitude as number);
    console.info("[LifestyleExplorerV7] poi-visibility:recentered", { visiblePoiEntities: runtime.poiEntities.size, propertyEntityAlive: Boolean(runtime.propertyEntity) });
  }

  function resetNorth() {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer)) return;
    runtime.viewer.camera.setView({
      orientation: {
        heading: runtime.Cesium.CesiumMath.toRadians(0),
        pitch: runtime.viewer.camera.pitch,
        roll: 0,
      },
    });
  }

  function zoomInCamera() {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer)) return;
    const height = runtime.viewer.camera.positionCartographic?.height ?? 1000;
    runtime.viewer.camera.zoomIn(height * 0.5);
  }

  function zoomOutCamera() {
    const runtime = runtimeRef.current;
    if (!runtime || !isViewerUsable(runtime.viewer)) return;
    const height = runtime.viewer.camera.positionCartographic?.height ?? 1000;
    runtime.viewer.camera.zoomOut(height * 0.5);
  }

  function toggleFullscreen() {
    if (!rootRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current.requestFullscreen().catch(() => {});
    }
  }

  function closeViewer() {
    isClosingRef.current = true;
    stopDiscovery(discoveryTimeoutRef);
    setPoiScreenPosition(null);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose?.();
  }

  function toggleDiscovery() {
    if (isDiscovering) {
      stopDiscovery(discoveryTimeoutRef);
      setIsDiscovering(false);
      return;
    }
    if (visiblePois.length === 0) return;
    setIsDiscovering(true);
    runDiscovery(0);
  }

  function runDiscovery(index: number) {
    const poi = visiblePois[index % visiblePois.length];
    if (!poi) {
      setIsDiscovering(false);
      return;
    }
    selectPoi(poi);
    discoveryTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current || isDestroyedRef.current) return;
      runDiscovery(index + 1);
    }, 2800);
  }

  const categories = useMemo(() => {
    const counts = new Map<LifestylePoi["category"], number>();
    allPois.forEach((poi) => counts.set(poi.category, (counts.get(poi.category) || 0) + 1));
    return Array.from(counts.entries()).map(([category, count]) => ({ category, count, ...CATEGORY_META[category] }));
  }, [allPois]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[2147483647] overflow-hidden bg-slate-950 text-white">
      <div ref={containerRef} className={`absolute inset-0 z-0 h-full w-full ${IS_DEVELOPMENT ? "outline outline-2 outline-cyan-400" : ""}`} />
      <div className={`pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_72%_18%,rgba(45,212,191,0.08),transparent_28%),linear-gradient(90deg,rgba(2,6,23,0.34),rgba(2,6,23,0.04)_38%,rgba(2,6,23,0.08))] ${IS_DEVELOPMENT ? "outline outline-2 outline-red-500" : ""}`} />

      <aside className="absolute left-4 top-4 z-20 flex max-h-[calc(100vh-2rem)] w-[350px] flex-col overflow-hidden rounded-[1.15rem] border border-white/12 bg-slate-950/62 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-teal-100">
            <Sparkles size={13} />
            {copy.subtitle}
          </div>
          <h2 className="mt-4 text-2xl font-medium tracking-tight text-white">{locationLabel || propertyName}</h2>
          <p className="mt-1 text-xs text-white/58">{propertyName}</p>
          <div className="mt-4 h-24 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-300/30 via-slate-700/40 to-teal-400/20">
            {propertyImageUrl ? (
              <div
                aria-label={propertyName}
                role="img"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${propertyImageUrl})` }}
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_20%),linear-gradient(135deg,rgba(14,165,233,0.24),rgba(15,23,42,0.25)_46%,rgba(20,184,166,0.25))]" />
            )}
          </div>
          {poiServiceUnavailable && (
            <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100/80">
              <p className="font-medium text-amber-100">{copy.noPoi}</p>
              <p className="mt-1 leading-5 text-amber-100/70">{copy.noPoiDetail}</p>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Sea View</p>
              <span className="rounded-full bg-teal-300/20 px-2.5 py-1 text-[10px] font-medium uppercase text-teal-100">{coastalPoi ? "YES" : "NO"}</span>
            </div>
            <p className="text-xs leading-5 text-white/52">Estimated from available coastal and viewpoint POIs. Confirm with agency survey.</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-white/50">Elevation</span><span className="text-white/78">approx. 28 m</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">Distance to Sea</span><span className="text-white/78">{formatDistance(coastalPoi?.distanceMeters)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">View Corridor</span><span className="text-white/78">{coastalPoi ? "Potential" : "Unknown"}</span></div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Surrounding Buildings</p>
              <button type="button" onClick={toggleDiscovery} className="text-xs text-teal-100/80 hover:text-teal-100">Explore All</button>
            </div>
            <div className="space-y-3">
              {surroundingBuildings.map((item) => (
                <button key={item.id} type="button" onClick={() => selectPoi(item.poi)} className="flex w-full items-center justify-between gap-3 border-b border-white/8 pb-3 text-left last:border-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <Building2 size={15} className="shrink-0 text-white/58" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-white/82">{item.name}</span>
                      <span className="block text-[11px] text-white/38">{formatDistance(item.poi.distanceMeters)}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-white/58">{item.floors}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">{copy.categories}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setActiveCategory("all")} className={`rounded-full border px-3 py-1.5 text-xs transition ${activeCategory === "all" ? "border-teal-300/50 bg-teal-300/16 text-teal-100" : "border-white/10 bg-white/5 text-white/62 hover:text-white"}`}>
                All <span className="text-white/38">{allPois.length}</span>
              </button>
              {categories.map(({ category, count, label, icon: Icon, color }) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${activeCategory === category ? "border-teal-300/50 bg-teal-300/16 text-teal-100" : "border-white/10 bg-white/5 text-white/62 hover:text-white"}`}>
                  <Icon size={13} style={{ color }} />
                  {label} <span className="text-white/38">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">{copy.places}</p>
            <div className="space-y-2">
              {visiblePois.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-white/52">
                  {poiServiceUnavailable ? copy.noPoiDetail : copy.selectHint}
                </div>
              )}
              {visiblePois.map((poi) => {
                const meta = CATEGORY_META[poi.category];
                const Icon = meta.icon;
                const selected = poi.id === selectedPoiId;
                return (
                  <button key={poi.id} type="button" onClick={() => selectPoi(poi)} className={`w-full rounded-2xl border p-3 text-left transition ${selected ? "border-teal-300/55 bg-teal-300/14" : "border-white/10 bg-white/[0.045] hover:border-white/22 hover:bg-white/[0.075]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8">
                          <Icon size={15} style={{ color: meta.color }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-white">{poi.name}</span>
                          <span className="mt-1 block text-xs text-white/48">{meta.label} - {estimateWalkingTime(poi.distanceMeters)} min</span>
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-white/58">{formatDistance(poi.distanceMeters)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <div className="absolute bottom-5 left-[380px] right-5 z-20 flex items-center justify-end gap-3">
        {[
          { label: "Area Insights", category: "viewpoint" as const, icon: Building2 },
          { label: "Amenities", category: "shop" as const, icon: ShoppingBag },
          { label: "Transport", category: "transport" as const, icon: Train },
          { label: "Schools", category: "school" as const, icon: School },
        ].map(({ label, category, icon: Icon }) => (
          <button key={label} type="button" onClick={() => setActiveCategory(category)} className={`inline-flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-2xl backdrop-blur-xl transition ${activeCategory === category ? "border-teal-300/45 bg-teal-300/18 text-teal-50" : "border-white/12 bg-slate-950/58 text-white/72 hover:bg-white/12 hover:text-white"}`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
        <button type="button" onClick={toggleDiscovery} className="inline-flex h-12 items-center gap-2 rounded-xl bg-teal-400 px-4 text-sm font-medium text-slate-950 shadow-2xl transition hover:bg-teal-300">
          {isDiscovering ? <Pause size={16} /> : <Play size={16} />}
          {isDiscovering ? copy.stop : copy.discover}
        </button>
      </div>

      <div className="absolute right-4 top-20 z-20 w-[230px] rounded-[1.25rem] border border-white/12 bg-slate-950/66 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <CloudSun size={34} className="text-amber-300" />
          <div>
            <p className="text-2xl font-medium text-white">{weather.temperature} deg C</p>
            <p className="text-sm text-white/62">Clear Sky</p>
          </div>
        </div>
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm text-white/68">
          <div className="flex items-center gap-2"><Wind size={15} className="text-white/48" /> Wind {weather.wind} km/h</div>
          <div className="flex items-center gap-2"><Droplets size={15} className="text-white/48" /> Humidity {weather.humidity}%</div>
        </div>
      </div>

      {selectedPoi && (
        <div className="absolute right-4 top-[270px] z-20 w-[300px] rounded-[1.35rem] border border-white/12 bg-slate-950/72 p-4 shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-teal-100/70">{copy.selected}</p>
          <h3 className="mt-2 text-lg font-medium text-white">{selectedPoi.name}</h3>
          <p className="mt-1 text-sm text-white/58">{CATEGORY_META[selectedPoi.category].label}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-white/45">Distance</dt><dd className="text-white/80">{formatDistance(selectedPoi.distanceMeters)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/45">Walk</dt><dd className="text-white/80">{estimateWalkingTime(selectedPoi.distanceMeters)} min</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/45">{copy.source}</dt><dd className="text-white/80">{selectedPoi.source || "local"}</dd></div>
          </dl>
          {selectedPoi.description && <p className="mt-4 text-sm leading-6 text-white/58">{selectedPoi.description}</p>}
        </div>
      )}

      {!selectedPoi && status === "ready" && (
        <div className="absolute right-4 top-[270px] z-20 w-[300px] rounded-[1.35rem] border border-white/12 bg-slate-950/62 p-4 text-sm leading-6 text-white/62 shadow-2xl backdrop-blur-xl">
          {copy.selectHint}
        </div>
      )}

      {selectedPoi && poiScreenPosition && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+14px)]"
          style={{ left: poiScreenPosition.x, top: poiScreenPosition.y }}
        >
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/80 py-2 pl-2 pr-3.5 shadow-2xl backdrop-blur-xl">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${CATEGORY_META[selectedPoi.category].color}26`, color: CATEGORY_META[selectedPoi.category].color }}
            >
              {(() => {
                const Icon = CATEGORY_META[selectedPoi.category].icon;
                return <Icon size={16} />;
              })()}
            </span>
            <span>
              <span className="block text-sm font-medium leading-tight text-white">{selectedPoi.name}</span>
              <span className="mt-0.5 block text-xs leading-tight text-white/55">{formatDistance(selectedPoi.distanceMeters)}</span>
            </span>
          </div>
          <div className="mx-auto h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-r border-white/15 bg-slate-950/80" />
        </div>
      )}

      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-1">
        <button type="button" onClick={resetNorth} title="North" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-slate-950/72 text-white shadow-xl backdrop-blur-md transition hover:bg-white/14">
          <Compass size={15} />
        </button>
        <button type="button" onClick={recenterProperty} title={copy.recenter} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-slate-950/72 text-white shadow-xl backdrop-blur-md transition hover:bg-white/14">
          <Crosshair size={15} />
        </button>
        <div className="overflow-hidden rounded-full border border-white/12 bg-slate-950/72 shadow-xl backdrop-blur-md">
          <button type="button" onClick={zoomInCamera} title="Zoom in" className="flex h-9 w-9 items-center justify-center text-white transition hover:bg-white/14">
            <Plus size={15} />
          </button>
          <div className="h-px w-full bg-white/12" />
          <button type="button" onClick={zoomOutCamera} title="Zoom out" className="flex h-9 w-9 items-center justify-center text-white transition hover:bg-white/14">
            <Minus size={15} />
          </button>
        </div>
        <button type="button" onClick={toggleFullscreen} title="Fullscreen" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-slate-950/72 text-white shadow-xl backdrop-blur-md transition hover:bg-white/14">
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <button type="button" onClick={closeViewer} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-slate-950/72 px-4 text-sm font-medium text-white shadow-xl backdrop-blur-md transition hover:bg-white/14">
          <X size={16} />
          <span>{copy.close}</span>
        </button>
      </div>

      {(status === "loading" || status === "missing" || status === "error") && (
        <div className="pointer-events-none absolute left-[380px] top-5 z-20 max-w-sm rounded-2xl border border-white/12 bg-slate-950/72 p-4 shadow-2xl backdrop-blur-md">
          {status === "loading" && <p className="inline-flex items-center gap-2 text-sm text-white/70"><Loader2 size={15} className="animate-spin" /> {copy.loading}</p>}
          {status === "missing" && <p className="text-sm text-amber-200">{copy.missing}</p>}
          {status === "error" && <p className="text-sm text-rose-200">Vue 3D indisponible.</p>}
        </div>
      )}

      {IS_DEVELOPMENT && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 max-w-xs rounded-xl border border-emerald-300/25 bg-slate-950/60 p-3 text-[11px] text-white/70 shadow-xl backdrop-blur-md">
          <p className="font-semibold text-emerald-200">Lifestyle V7 debug</p>
          <p>provider: {effectiveProvider}</p>
          <p>terrain: {terrainLoaded ? "yes" : "no"}</p>
          <p>osm buildings: {osmBuildingsLoaded ? "yes" : "no"}</p>
          <p>ion POI asset: {poiAssetId || "-"}</p>
          <p>ion POIs loaded: {ionPoisLoaded ? "yes" : "no"}</p>
          <p>property: {coordinates.latitude?.toFixed(6)}, {coordinates.longitude?.toFixed(6)}</p>
          <p>POIs: {allPois.length} ({poiServiceUnavailable ? "unavailable" : "api"})</p>
          {selectedPoi && <p>selected: {selectedPoi.latitude.toFixed(6)}, {selectedPoi.longitude.toFixed(6)} - {formatDistance(selectedPoi.distanceMeters)} - {selectedPoi.source}</p>}
        </div>
      )}

      <style jsx global>{`
        .cesium-widget,
        .cesium-widget canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>
    </div>
  );
}

function createPoiEntities(options: {
  Cesium: CesiumRuntimeV7;
  viewer: CesiumViewerV7Like;
  propertyLatitude: number;
  propertyLongitude: number;
  pois: LifestylePoi[];
  selectedPoiId: string | null;
  onEntityCreated: (poi: LifestylePoi, entity: CesiumEntity) => void;
}) {
  const entities = new Map<string, CesiumEntity>();
  const { Cesium, viewer, pois, onEntityCreated } = options;
  if (!isViewerUsable(viewer)) return entities;

  pois.forEach((poi) => {
    const meta = CATEGORY_META[poi.category];
    const entity = viewer.entities.add({
      name: poi.name,
      position: Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude),
      billboard: {
        image: createPoiPinSvg(meta.color),
        width: 30,
        height: 42,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      point: {
        pixelSize: 7,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString(meta.color),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      polyline: {
        positions: [
          Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude),
          Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude, 85),
        ],
        width: 1,
        material: Cesium.Color.fromCssColorString("rgba(255,255,255,0.62)"),
        clampToGround: false,
      },
      // No Cesium label here on purpose: a canvas label can't do icons, rounded
      // corners, or backdrop blur. The HTML callout card (see poiScreenPosition)
      // renders that instead, tracking this entity's on-screen position every frame.
    });
    onEntityCreated(poi, entity);
    entities.set(poi.id, entity);
  });

  return entities;
}

function highlightPois(runtime: RuntimeState, selectedPoiId: string | null) {
  runtime.poiEntities.forEach((entity, poiId) => {
    const point = entity.point as { pixelSize?: number; outlineWidth?: number } | undefined;
    if (point) {
      point.pixelSize = poiId === selectedPoiId ? 14 : 9;
      point.outlineWidth = poiId === selectedPoiId ? 5 : 3;
    }
  });
  runtime.viewer.scene.requestRender?.();
}

function drawPropertyPoiLine(runtime: RuntimeState, propertyLatitude: number, propertyLongitude: number, poi: LifestylePoi) {
  removeLine(runtime);
  const { Cesium, viewer } = runtime;
  if (!isViewerUsable(viewer)) return;
  runtime.lineEntity = viewer.entities.add({
    name: "Property to POI",
    polyline: {
      positions: [
        Cesium.Cartesian3.fromDegrees(propertyLongitude, propertyLatitude),
        Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude),
      ],
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("rgba(45,212,191,0.9)"),
      }),
      clampToGround: true,
    },
  });
}

function removeLine(runtime: RuntimeState) {
  if (runtime.lineEntity) {
    runtime.viewer.entities.remove?.(runtime.lineEntity);
    runtime.lineEntity = null;
  }
}

function clearPoiEntities(runtime: RuntimeState) {
  runtime.poiEntities.forEach((entity) => runtime.viewer.entities.remove?.(entity));
  runtime.poiEntities.clear();
}

function showSinglePoi(runtime: RuntimeState, propertyLatitude: number, propertyLongitude: number, poi: LifestylePoi) {
  clearPoiEntities(runtime);
  removeLine(runtime);
  if (!isViewerUsable(runtime.viewer)) return;
  runtime.poiEntities = createPoiEntities({
    Cesium: runtime.Cesium,
    viewer: runtime.viewer,
    propertyLatitude,
    propertyLongitude,
    pois: [poi],
    selectedPoiId: poi.id,
    onEntityCreated: (createdPoi, entity) => {
      entity.__lifestylePoiId = createdPoi.id;
    },
  });
  highlightPois(runtime, poi.id);
  drawPropertyPoiLine(runtime, propertyLatitude, propertyLongitude, poi);
  runtime.viewer.scene.requestRender?.();
  console.info("[LifestyleExplorerV7] poi-visibility:selected", { poiId: poi.id, name: poi.name, visiblePoiEntities: runtime.poiEntities.size });
}

function updateViewerMarkers(options: {
  runtime: RuntimeState;
  latitude: number;
  longitude: number;
  label: string;
  accent: string;
  pois: LifestylePoi[];
  selectedPoiId: string | null;
}) {
  const { runtime, latitude, longitude, label, accent, pois, selectedPoiId } = options;
  if (!isViewerUsable(runtime.viewer)) return;

  if (runtime.propertyEntity) runtime.viewer.entities.remove?.(runtime.propertyEntity);
  runtime.poiEntities.forEach((entity) => runtime.viewer.entities.remove?.(entity));
  runtime.poiEntities.clear();
  removeLine(runtime);

  runtime.propertyEntity = createPropertyEntity({
    Cesium: runtime.Cesium,
    viewer: runtime.viewer,
    latitude,
    longitude,
    label,
    accent,
  });

  runtime.poiEntities = createPoiEntities({
    Cesium: runtime.Cesium,
    viewer: runtime.viewer,
    propertyLatitude: latitude,
    propertyLongitude: longitude,
    pois,
    selectedPoiId,
    onEntityCreated: (poi, entity) => {
      entity.__lifestylePoiId = poi.id;
    },
  });

  if (selectedPoiId) {
    const selectedPoi = pois.find((poi) => poi.id === selectedPoiId);
    highlightPois(runtime, selectedPoiId);
    if (selectedPoi) drawPropertyPoiLine(runtime, latitude, longitude, selectedPoi);
  }

  runtime.viewer.scene.requestRender?.();
}

function createPropertyEntity(options: {
  Cesium: CesiumRuntimeV7;
  viewer: CesiumViewerV7Like;
  latitude: number;
  longitude: number;
  label: string;
  accent: string;
}) {
  const { Cesium, viewer, latitude, longitude, label, accent } = options;
  if (!isViewerUsable(viewer)) return null;
  return viewer.entities.add({
    name: label,
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    billboard: {
      image: createPropertyPinSvg(accent),
      width: 52,
      height: 68,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: label,
      font: "600 12px Inter, sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("rgba(13,148,136,0.90)"),
      backgroundPadding: new Cesium.Cartesian2(10, 6),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -74),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    ellipse: {
      semiMajorAxis: 42,
      semiMinorAxis: 42,
      material: Cesium.Color.fromCssColorString("rgba(45,212,191,0.24)"),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString("rgba(45,212,191,0.80)"),
      height: 0,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
}

function flyToPropertyOverview(Cesium: CesiumRuntimeV7, viewer: CesiumViewerV7Like, latitude: number, longitude: number) {
  if (!isViewerUsable(viewer)) return;
  // flyTo's `destination` places the camera EYE at those coordinates — it does not look
  // AT the property. flyToBoundingSphere orbits the camera around the property so it's
  // actually centered in frame, offset by heading/pitch/range instead of sitting on top of it.
  const center = Cesium.Cartesian3.fromDegrees(longitude, latitude);
  viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center, 50), {
    offset: new Cesium.HeadingPitchRange(
      Cesium.CesiumMath.toRadians(42),
      Cesium.CesiumMath.toRadians(-32),
      1750,
    ),
    duration: 2,
  });
}

function flyToPoi(Cesium: CesiumRuntimeV7, viewer: CesiumViewerV7Like, poi: LifestylePoi) {
  if (!isViewerUsable(viewer)) return;
  const center = Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude);
  viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center, 30), {
    offset: new Cesium.HeadingPitchRange(
      Cesium.CesiumMath.toRadians(36),
      Cesium.CesiumMath.toRadians(-34),
      950,
    ),
    duration: 2,
  });
}

function normalizePois(pois: LifestylePoi[], property: { latitude: number; longitude: number }): LifestylePoi[] {
  const normalizedPois: LifestylePoi[] = [];

  for (const poi of pois) {
    const normalized = normalizePoiCoordinatesStrict(poi.latitude, poi.longitude);
    if (!normalized) {
      if (IS_DEVELOPMENT) console.debug("[LifestyleExplorerV7] POI rejected: invalid coordinates", poi);
      continue;
    }

    const distanceMeters = poi.distanceMeters ?? haversineMeters(property.latitude, property.longitude, normalized.latitude, normalized.longitude);
    const maxDistanceMeters = poi.category === "transport" ? 80000 : poi.category === "beach" ? 20000 : 10000;
    if (distanceMeters > maxDistanceMeters) {
      if (IS_DEVELOPMENT) console.debug("[LifestyleExplorerV7] POI rejected: too far", { id: poi.id, name: poi.name, category: poi.category, distanceMeters, maxDistanceMeters });
      continue;
    }

    if (IS_DEVELOPMENT) {
      console.debug("[LifestyleExplorerV7] POI normalized", {
        id: poi.id,
        name: poi.name,
        rawLatitude: poi.latitude,
        rawLongitude: poi.longitude,
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        category: poi.category,
        source: poi.source || "local",
        distanceMeters,
      });
    }

    normalizedPois.push({
      ...poi,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      distanceMeters,
      source: poi.source || "local",
    });
  }

  return normalizedPois.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}

function normalizePoiCoordinatesStrict(latitude: unknown, longitude: unknown) {
  const normalizedLatitude = Number(latitude);
  const normalizedLongitude = Number(longitude);
  if (!Number.isFinite(normalizedLatitude) || !Number.isFinite(normalizedLongitude)) return null;
  if (normalizedLatitude === 0 && normalizedLongitude === 0) return null;
  if (normalizedLatitude < -90 || normalizedLatitude > 90) return null;
  if (normalizedLongitude < -180 || normalizedLongitude > 180) return null;
  return { latitude: normalizedLatitude, longitude: normalizedLongitude };
}

function dedupePoisByIdAndPosition(pois: LifestylePoi[]) {
  const seen = new Set<string>();
  return pois.filter((poi) => {
    const key = `${poi.id || poi.name}-${poi.latitude.toFixed(6)}-${poi.longitude.toFixed(6)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadPoisFromCesiumIon(
  Cesium: CesiumRuntimeV7,
  assetId: string,
  viewer: CesiumViewerV7Like,
): Promise<LifestylePoi[]> {
  const normalizedAssetId = Number(assetId);
  if (!assetId || !Number.isFinite(normalizedAssetId)) return [];

  console.info("[LifestyleExplorerV7] Cesium ion POI asset configured; loading GeoJSON/CZML/KML.", { assetId });

  const loaders: Array<{
    name: string;
    load: (resource: unknown) => Promise<CesiumDataSourceLike>;
  }> = [
    { name: "geojson", load: (resource) => Cesium.GeoJsonDataSource.load(resource) },
    { name: "czml", load: (resource) => Cesium.CzmlDataSource.load(resource) },
    {
      name: "kml",
      load: (resource) => Cesium.KmlDataSource.load(resource, { camera: viewer.camera, canvas: viewer.scene.canvas }),
    },
  ];

  for (const loader of loaders) {
    try {
      const resource = await Cesium.IonResource.fromAssetId(normalizedAssetId);
      const dataSource = await loader.load(resource);
      const pois = parseIonDataSourcePois(Cesium, dataSource, loader.name);
      if (pois.length > 0) {
        console.info("[LifestyleExplorerV7] Cesium ion POIs loaded", { assetId, format: loader.name, count: pois.length });
        return pois;
      }
    } catch (error) {
      console.debug("[LifestyleExplorerV7] Cesium ion POI loader skipped", { assetId, format: loader.name, error });
    }
  }

  console.warn("[LifestyleExplorerV7] Cesium ion POI asset loaded no readable point entities.", { assetId });
  return [];
}

function parseIonDataSourcePois(Cesium: CesiumRuntimeV7, dataSource: CesiumDataSourceLike, format: string): LifestylePoi[] {
  const entities = dataSource.entities?.values || [];
  const now = Cesium.JulianDate.now();

  return entities.flatMap((entity, index) => {
    const properties = readIonEntityProperties(entity, now);
    const directLatitude = readNumberProperty(properties, ["latitude", "lat", "y"]);
    const directLongitude = readNumberProperty(properties, ["longitude", "lng", "lon", "x"]);
    const positionCoordinates = readIonEntityPosition(Cesium, entity, now);
    const latitude = directLatitude ?? positionCoordinates?.latitude;
    const longitude = directLongitude ?? positionCoordinates?.longitude;
    const normalized = normalizePoiCoordinatesStrict(latitude, longitude);
    if (!normalized) return [];

    const category = normalizeIonPoiCategory(readStringProperty(properties, ["category", "type", "kind", "amenity", "leisure", "natural"]));
    const name =
      readStringProperty(properties, ["name", "label", "title"]) ||
      entity.name ||
      CATEGORY_META[category].label;
    const distanceMeters = readNumberProperty(properties, ["distanceMeters", "distance_meters"]);
    const distanceKm = readNumberProperty(properties, ["distanceKm", "distance_km", "distance"]);
    const description = readStringProperty(properties, ["description", "detail", "details", "note"]);

    return [{
      id: `ion-${format}-${entity.id || index}`,
      name,
      category,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      distanceMeters: distanceMeters ?? (distanceKm != null ? Math.round(distanceKm * 1000) : undefined),
      description: description ?? undefined,
      source: "cesium-ion" as const,
    }];
  });
}

function readIonEntityPosition(Cesium: CesiumRuntimeV7, entity: CesiumIonEntityLike, time: unknown) {
  const cartesian = entity.position?.getValue?.(time);
  if (!cartesian) return null;
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  return {
    latitude: radiansToDegrees(cartographic.latitude),
    longitude: radiansToDegrees(cartographic.longitude),
  };
}

function readIonEntityProperties(entity: CesiumIonEntityLike, time: unknown): Record<string, unknown> {
  const rawProperties = entity.properties?.getValue?.(time) || entity.properties || {};
  return rawProperties && typeof rawProperties === "object" ? rawProperties : {};
}

function readNumberProperty(properties: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = readIonProperty(properties[key]);
    const numberValue = Number(typeof value === "string" ? value.replace(",", ".") : value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return null;
}

function readStringProperty(properties: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = readIonProperty(properties[key]);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readIonProperty(value: unknown): unknown {
  if (value && typeof value === "object" && "getValue" in value && typeof (value as { getValue?: unknown }).getValue === "function") {
    return (value as { getValue: () => unknown }).getValue();
  }
  return value;
}

function normalizeIonPoiCategory(value: string | null): LifestylePoi["category"] {
  const normalized = (value || "").toLowerCase();
  if (["beach", "sea", "coast", "coastline", "natural=beach"].includes(normalized)) return "beach";
  if (["school", "college", "education"].includes(normalized)) return "school";
  if (["transport", "bus_stop", "station", "train", "railway", "airport"].includes(normalized)) return "transport";
  if (["shop", "shopping", "market", "marketplace", "mall"].includes(normalized)) return "shop";
  if (["restaurant", "cafe", "bar", "food"].includes(normalized)) return "restaurant";
  if (["health", "hospital", "clinic", "doctors", "pharmacy"].includes(normalized)) return "health";
  if (["sport", "golf", "golf_course", "sports_centre"].includes(normalized)) return "sport";
  return "viewpoint";
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatDistance(distanceMeters?: number) {
  if (distanceMeters == null) return "-";
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function estimateWalkingTime(distanceMeters?: number) {
  if (distanceMeters == null) return "-";
  return Math.max(2, Math.round(distanceMeters / 80));
}

function normalizeProvider(value?: string) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "google-photorealistic" || normalized === "google-photorealistic-3d") {
    console.warn("[LifestyleExplorerV7] Google Photorealistic is not the default V7 provider; using cesium-architectural.");
  }
  return DEFAULT_PROVIDER;
}

async function loadTerrainProvider(Cesium: CesiumRuntimeV7, hasIonToken: boolean) {
  let terrainProvider = new Cesium.EllipsoidTerrainProvider();
  let terrainLoaded = false;
  if (!hasIonToken) return { terrainProvider, terrainLoaded };
  try {
    terrainProvider = await Cesium.createWorldTerrainAsync();
    terrainLoaded = true;
  } catch (error) {
    console.warn("[LifestyleExplorerV7] Cesium terrain unavailable; using ellipsoid fallback.", error);
  }
  return { terrainProvider, terrainLoaded };
}

type BaseImageryResult = {
  baseLayer: unknown;
  provider: string;
};

async function loadBaseImageryLayer(Cesium: CesiumRuntimeV7, hasIonToken: boolean): Promise<BaseImageryResult> {
  if (hasIonToken) {
    try {
      const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
      return {
        baseLayer: new Cesium.ImageryLayer(imageryProvider),
        provider: "Cesium World Imagery",
      };
    } catch (error) {
      console.warn("[LifestyleExplorerV7] Cesium World Imagery unavailable; using satellite fallback.", error);
    }
  }
  return {
    baseLayer: new Cesium.ImageryLayer(createSatelliteFallbackImageryProvider(Cesium)),
    provider: "Esri World Imagery",
  };
}

function createSatelliteFallbackImageryProvider(Cesium: CesiumRuntimeV7) {
  try {
    return new Cesium.UrlTemplateImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      credit: "Tiles © Esri",
      maximumLevel: 19,
    });
  } catch (error) {
    console.warn("[LifestyleExplorerV7] Satellite imagery fallback unavailable; using OpenStreetMap.", error);
    return new Cesium.OpenStreetMapImageryProvider({ url: "https://tile.openstreetmap.org/" });
  }
}

async function loadOsmArchitecturalScene(Cesium: CesiumRuntimeV7, viewer: CesiumViewerV7Like, isCancelled: () => boolean) {
  try {
    const buildings = await Cesium.createOsmBuildingsAsync();
    if (isCancelled() || !isViewerUsable(viewer)) return false;
    if (buildings && typeof buildings === "object") {
      // Near-opaque neutral stone tone instead of the previous washed-out white at
      // 0.58 alpha, which read as flat/hazy.
      (buildings as { style?: unknown }).style = new Cesium.Cesium3DTileStyle({
        color: "color('#d7dbe2', 0.96)",
      });
    }
    viewer.scene.primitives?.add(buildings);
    viewer.scene.requestRender?.();
    return true;
  } catch (error) {
    console.warn("[LifestyleExplorerV7] OSM Buildings unavailable", error);
    return false;
  }
}

async function loadCesiumRuntimeV7(): Promise<CesiumRuntimeV7> {
  const [
    { default: Viewer },
    { default: BoundingSphere },
    { default: Cartesian2 },
    { default: Cartesian3 },
    { default: Cartographic },
    { default: Color },
    { default: CzmlDataSource },
    { default: Cesium3DTileStyle },
    { default: CesiumMath },
    { default: EllipsoidTerrainProvider },
    { default: createWorldTerrainAsync },
    { default: GeoJsonDataSource },
    { default: HeadingPitchRange },
    { default: HeightReference },
    { default: HorizontalOrigin },
    { default: ImageryLayer },
    { default: Ion },
    { default: IonImageryProvider },
    { default: IonResource },
    { default: JulianDate },
    { default: KmlDataSource },
    { default: LabelStyle },
    { default: OpenStreetMapImageryProvider },
    { default: UrlTemplateImageryProvider },
    { default: PolylineDashMaterialProperty },
    { default: ScreenSpaceEventHandler },
    { default: ScreenSpaceEventType },
    { default: SceneTransforms },
    { default: VerticalOrigin },
    { default: createOsmBuildingsAsync },
  ] = await Promise.all([
    import("@cesium/widgets/Source/Viewer/Viewer.js"),
    import("@cesium/engine/Source/Core/BoundingSphere.js"),
    import("@cesium/engine/Source/Core/Cartesian2.js"),
    import("@cesium/engine/Source/Core/Cartesian3.js"),
    import("@cesium/engine/Source/Core/Cartographic.js"),
    import("@cesium/engine/Source/Core/Color.js"),
    import("@cesium/engine/Source/DataSources/CzmlDataSource.js"),
    import("@cesium/engine/Source/Scene/Cesium3DTileStyle.js"),
    import("@cesium/engine/Source/Core/Math.js"),
    import("@cesium/engine/Source/Core/EllipsoidTerrainProvider.js"),
    import("@cesium/engine/Source/Core/createWorldTerrainAsync.js"),
    import("@cesium/engine/Source/DataSources/GeoJsonDataSource.js"),
    import("@cesium/engine/Source/Core/HeadingPitchRange.js"),
    import("@cesium/engine/Source/Scene/HeightReference.js"),
    import("@cesium/engine/Source/Scene/HorizontalOrigin.js"),
    import("@cesium/engine/Source/Scene/ImageryLayer.js"),
    import("@cesium/engine/Source/Core/Ion.js"),
    import("@cesium/engine/Source/Scene/IonImageryProvider.js"),
    import("@cesium/engine/Source/Core/IonResource.js"),
    import("@cesium/engine/Source/Core/JulianDate.js"),
    import("@cesium/engine/Source/DataSources/KmlDataSource.js"),
    import("@cesium/engine/Source/Scene/LabelStyle.js"),
    import("@cesium/engine/Source/Scene/OpenStreetMapImageryProvider.js"),
    import("@cesium/engine/Source/Scene/UrlTemplateImageryProvider.js"),
    import("@cesium/engine/Source/DataSources/PolylineDashMaterialProperty.js"),
    import("@cesium/engine/Source/Core/ScreenSpaceEventHandler.js"),
    import("@cesium/engine/Source/Core/ScreenSpaceEventType.js"),
    import("@cesium/engine/Source/Scene/SceneTransforms.js"),
    import("@cesium/engine/Source/Scene/VerticalOrigin.js"),
    import("@cesium/engine/Source/Scene/createOsmBuildingsAsync.js"),
  ]);

  return {
    Viewer,
    BoundingSphere,
    Cartesian2,
    Cartesian3,
    Cartographic,
    Color,
    CzmlDataSource,
    Cesium3DTileStyle,
    CesiumMath,
    EllipsoidTerrainProvider,
    createWorldTerrainAsync,
    GeoJsonDataSource,
    HeadingPitchRange,
    HeightReference,
    HorizontalOrigin,
    ImageryLayer,
    Ion,
    IonImageryProvider,
    IonResource,
    JulianDate,
    KmlDataSource,
    LabelStyle,
    OpenStreetMapImageryProvider,
    UrlTemplateImageryProvider,
    PolylineDashMaterialProperty,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    SceneTransforms,
    VerticalOrigin,
    createOsmBuildingsAsync,
  };
}

function logViewerRenderDiagnostics(viewer: CesiumViewerV7Like) {
  try {
    const scene = viewer.scene as Record<string, unknown> & {
      frameState?: { frameNumber?: number };
      primitives?: { length?: number; _primitives?: unknown[] };
      renderError?: unknown;
    };
    const camera = viewer.camera as Record<string, unknown> & {
      computeViewRectangle?: () => unknown;
    };
    const diagnosticViewer = viewer as CesiumViewerV7Like & {
      render?: () => void;
      imageryLayers?: { length?: number };
    };
    const primitives = scene.primitives;
    const imageryLayers = diagnosticViewer.imageryLayers;
    const canvas = viewer.scene.canvas ?? null;
    const parent = canvas?.parentElement || null;
    const canvasStyle = canvas ? window.getComputedStyle(canvas) : null;
    const parentStyle = parent ? window.getComputedStyle(parent) : null;

    console.info("[LifestyleExplorerV7] render:diagnostics", {
      sceneMode: scene.mode,
      cameraPositionCartographic: camera.positionCartographic,
      cameraHeading: camera.heading,
      cameraPitch: camera.pitch,
      cameraRoll: camera.roll,
      cameraPositionWC: camera.positionWC,
      cameraViewRectangle: safeComputeViewRectangle(camera),
      globeShow: viewer.scene.globe?.show,
      primitivesLength: primitives?.length ?? primitives?._primitives?.length ?? null,
      imageryLayersLength: imageryLayers?.length ?? null,
      canvasClientWidth: canvas?.clientWidth ?? null,
      canvasClientHeight: canvas?.clientHeight ?? null,
      canvasWidth: canvas?.width ?? null,
      canvasHeight: canvas?.height ?? null,
      canvasComputed: canvasStyle
        ? {
            opacity: canvasStyle.opacity,
            display: canvasStyle.display,
            visibility: canvasStyle.visibility,
            zIndex: canvasStyle.zIndex,
          }
        : null,
      parentComputed: parentStyle
        ? {
            opacity: parentStyle.opacity,
            display: parentStyle.display,
            visibility: parentStyle.visibility,
            zIndex: parentStyle.zIndex,
            background: parentStyle.background,
          }
        : null,
      frameNumber: scene.frameState?.frameNumber ?? null,
      renderError: scene.renderError,
      isDestroyed: safeIsDestroyed(viewer),
    });

    try {
      diagnosticViewer.render?.();
    } catch (error) {
      console.warn("[LifestyleExplorerV7] render:manual-error", error);
    }

    requestAnimationFrame(() => {
      if (!isViewerUsable(viewer)) return;
      try {
        diagnosticViewer.render?.();
        console.info("[LifestyleExplorerV7] render:raf-rendered", {
          frameNumber: scene.frameState?.frameNumber ?? null,
          renderError: scene.renderError,
        });
      } catch (error) {
        console.warn("[LifestyleExplorerV7] render:raf-error", error);
      }
    });
  } catch (error) {
    console.warn("[LifestyleExplorerV7] render:diagnostics-error", error);
  }
}

function safeComputeViewRectangle(camera: { computeViewRectangle?: () => unknown }) {
  try {
    return camera.computeViewRectangle?.() ?? null;
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function safeIsDestroyed(viewer: CesiumViewerV7Like) {
  try {
    return typeof viewer.isDestroyed === "function" ? viewer.isDestroyed() : false;
  } catch {
    return true;
  }
}

function getElementDimensions(element: Element) {
  const rect = element.getBoundingClientRect();
  const dimensions = {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
  if (dimensions.width === 0 || dimensions.height === 0) {
    console.warn("[LifestyleExplorerV7] init:container-size-warning", dimensions);
  }
  return dimensions;
}

function enableFreeNavigation(viewer: CesiumViewerV7Like) {
  if (!isViewerUsable(viewer)) return;
  const controller = viewer.scene.screenSpaceCameraController;
  if (!controller) return;
  controller.enableInputs = true;
  controller.enableTranslate = true;
  controller.enableZoom = true;
  controller.enableRotate = true;
  controller.enableTilt = true;
  controller.enableLook = true;
  controller.enableCollisionDetection = false;
  controller.minimumZoomDistance = 50;
  controller.maximumZoomDistance = 50000;
}

function waitForSceneFrames(viewer: CesiumViewerV7Like, frameCount = 2) {
  return new Promise<void>((resolve) => {
    if (!isViewerUsable(viewer)) {
      resolve();
      return;
    }
    const postRender = viewer.scene.postRender;
    if (!postRender) {
      window.setTimeout(resolve, 250);
      return;
    }
    const stablePostRender = postRender;
    let remaining = Math.max(1, frameCount);
    const timeout = window.setTimeout(() => {
      try {
        stablePostRender.removeEventListener(onPostRender);
      } catch {
        // Ignore lifecycle race.
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
      remaining -= 1;
      if (remaining > 0) return;
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

function isViewerDestroyed(viewer: CesiumViewerV7Like | null | undefined) {
  if (!viewer) return true;
  try {
    return typeof viewer.isDestroyed === "function" ? viewer.isDestroyed() : false;
  } catch {
    return true;
  }
}

function isViewerUsable(viewer: CesiumViewerV7Like | null | undefined) {
  return Boolean(viewer && !isViewerDestroyed(viewer) && viewer.scene);
}

function destroyViewerSafely(viewer: CesiumViewerV7Like | null | undefined) {
  if (!viewer || isViewerDestroyed(viewer)) return;
  console.info("[LifestyleExplorerV7] viewer:destroy", { wasDestroyed: safeIsDestroyed(viewer) });
  try {
    viewer.entities?.removeAll?.();
    viewer.destroy();
  } catch (error) {
    console.warn("[LifestyleExplorerV7] viewer destroy skipped", error);
  }
}

function stopDiscovery(ref: MutableRefObject<number | null>) {
  if (ref.current != null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

function getCopy(locale?: string) {
  const normalized = (locale || "fr").split("-")[0] as keyof typeof COPY;
  return COPY[normalized] || COPY.fr;
}

function normalizeHexColor(color: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function buildSurroundingHighlights(pois: LifestylePoi[]) {
  const candidates = pois.filter((poi) => poi.category === "viewpoint" || poi.category === "shop" || poi.category === "transport" || poi.category === "health").slice(0, 4);
  const fallback = pois.slice(0, 4);
  return (candidates.length > 0 ? candidates : fallback).map((poi, index) => ({
    id: `building-${poi.id}`,
    name: index === 0 ? "Nearest urban landmark" : poi.name,
    floors: `${Math.max(6, 18 - index * 3)} floors`,
    poi,
  }));
}

function buildWeatherSnapshot(latitude?: number, longitude?: number) {
  const seed = Math.abs(Math.round(((latitude || 37) + (longitude || -4)) * 10));
  return {
    temperature: 23 + (seed % 7),
    wind: 6 + (seed % 9),
    humidity: 48 + (seed % 18),
  };
}

function createPoiPinSvg(color: string) {
  const svg = `
    <svg width="54" height="72" viewBox="0 0 54 72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="poiGlow" x="-70%" y="-55%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.11 0 0 0 0 0.83 0 0 0 0 0.75 0 0 0 .60 0"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path filter="url(#poiGlow)" d="M27 67C27 67 8 44 8 27C8 12.6 16.5 5 27 5C37.5 5 46 12.6 46 27C46 44 27 67 27 67Z" fill="rgba(15,23,42,0.92)" stroke="${color}" stroke-width="3"/>
      <circle cx="27" cy="27" r="9" fill="white"/>
      <circle cx="27" cy="27" r="5" fill="${color}"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function createPropertyPinSvg(color: string) {
  const svg = `
    <svg width="74" height="96" viewBox="0 0 74 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-45%" width="200%" height="210%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.85 0 0 0 0 0.78 0 0 0 .78 0"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path filter="url(#glow)" d="M37 90C37 90 12 60 12 37C12 17.8 23.2 7 37 7C50.8 7 62 17.8 62 37C62 60 37 90 37 90Z" fill="${color}" stroke="white" stroke-width="4"/>
      <circle cx="37" cy="37" r="13" fill="white"/>
      <circle cx="37" cy="37" r="6" fill="${color}"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
