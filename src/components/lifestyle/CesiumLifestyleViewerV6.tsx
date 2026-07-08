"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Loader2, X } from "lucide-react";
import { normalizeGeoPoint } from "@/modules/lifestyle/viewer/coordinateUtils";

type CesiumLifestyleViewerV6Props = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  propertyTitle?: string;
  locationLabel: string;
  primaryColor: string;
  locale?: string;
  onClose?: () => void;
  provider?: LifestyleV6Provider;
};

type CesiumEntity = unknown;

type CesiumViewerV6Like = {
  destroy: () => void;
  isDestroyed?: () => boolean;
  entities: {
    add: (entity: Record<string, unknown>) => CesiumEntity;
    removeAll?: () => void;
  };
  imageryLayers?: {
    length: number;
  };
  scene: {
    globe?: {
      show: boolean;
    };
    primitives?: {
      add: (primitive: unknown) => unknown;
    };
    postRender?: {
      addEventListener: (callback: () => void) => void;
      removeEventListener: (callback: () => void) => void;
    };
    requestRender?: () => void;
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
    flyToBoundingSphere?: (sphere: unknown, options: Record<string, unknown>) => void;
  };
  flyTo?: (target: unknown, options?: Record<string, unknown>) => Promise<boolean>;
  resize?: () => void;
};

type CesiumRuntimeV6 = {
  Viewer: new (container: Element, options?: Record<string, unknown>) => CesiumViewerV6Like;
  Cartesian2: new (x: number, y: number) => unknown;
  Cartesian3: {
    fromDegrees: (longitude: number, latitude: number, height?: number) => unknown;
  };
  Color: {
    BLACK: unknown;
    WHITE: unknown;
    fromCssColorString: (color: string) => unknown;
  };
  Cesium3DTileStyle: new (options: Record<string, unknown>) => unknown;
  CesiumMath: {
    toRadians: (degrees: number) => number;
  };
  EllipsoidTerrainProvider: new () => unknown;
  createWorldTerrainAsync: () => Promise<unknown>;
  createGooglePhotorealistic3DTileset: (apiOptions?: Record<string, unknown>, tilesetOptions?: Record<string, unknown>) => Promise<unknown>;
  HeadingPitchRange: new (heading: number, pitch: number, range: number) => unknown;
  HeightReference: {
    CLAMP_TO_GROUND: unknown;
  };
  HorizontalOrigin: {
    CENTER: unknown;
  };
  ImageryLayer: new (imageryProvider?: unknown) => unknown;
  Ion: { defaultAccessToken: string };
  IonImageryProvider: { fromAssetId: (assetId: number) => Promise<unknown> };
  LabelStyle: {
    FILL_AND_OUTLINE: unknown;
  };
  VerticalOrigin: {
    BOTTOM: unknown;
  };
  OpenStreetMapImageryProvider: new (options: { url: string }) => unknown;
  createOsmBuildingsAsync: (options?: Record<string, unknown>) => Promise<unknown>;
};

type DebugState = {
  entityCreated: boolean;
  viewerDestroyed: boolean;
  provider: string;
  ionTokenPresent: boolean;
  osmBuildingsLoaded: boolean;
  googleTilesLoaded: boolean;
  googleSkipped: boolean;
  terrainLoaded: boolean;
};

const COPY = {
  fr: {
    loading: "Chargement de la vue 3D...",
    missing: "Coordonnees du bien manquantes ou invalides.",
    close: "Retour au site",
    recenter: "Recentrer le bien",
    property: "Votre bien",
  },
  en: {
    loading: "Loading 3D view...",
    missing: "Missing or invalid property coordinates.",
    close: "Back to site",
    recenter: "Recenter property",
    property: "Your property",
  },
  es: {
    loading: "Cargando vista 3D...",
    missing: "Coordenadas del inmueble ausentes o invalidas.",
    close: "Volver al sitio",
    recenter: "Centrar inmueble",
    property: "Tu inmueble",
  },
  nl: {
    loading: "3D-weergave laden...",
    missing: "Ontbrekende of ongeldige pandcoordinaten.",
    close: "Terug naar site",
    recenter: "Pand centreren",
    property: "Uw pand",
  },
  pl: {
    loading: "Ladowanie widoku 3D...",
    missing: "Brakujace lub nieprawidlowe wspolrzedne nieruchomosci.",
    close: "Powrot do strony",
    recenter: "Wycentruj nieruchomosc",
    property: "Twoja nieruchomosc",
  },
  ar: {
    loading: "Loading 3D view...",
    missing: "Missing or invalid property coordinates.",
    close: "Back to site",
    recenter: "Recenter property",
    property: "Your property",
  },
} as const;

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
type LifestyleV6Provider = "cesium-architectural" | "google-photorealistic";

const DEFAULT_PROVIDER: LifestyleV6Provider = "cesium-architectural";

export default function CesiumLifestyleViewerV6({
  latitude,
  longitude,
  propertyTitle,
  locationLabel,
  primaryColor,
  locale,
  onClose,
  provider,
}: CesiumLifestyleViewerV6Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<CesiumViewerV6Like | null>(null);
  const entityRef = useRef<CesiumEntity | null>(null);
  const isMountedRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";
  const googleTilesKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const rawProvider = process.env.NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER;
  const requestedProvider = provider || normalizeProvider(rawProvider);
  const hasIonToken = ionToken.trim().length > 0;
  const hasGoogleTilesKey = googleTilesKey.trim().length > 0;
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing" | "error">("idle");
  const [debug, setDebug] = useState<DebugState>({
    entityCreated: false,
    viewerDestroyed: false,
    provider: requestedProvider,
    ionTokenPresent: hasIonToken,
    osmBuildingsLoaded: false,
    googleTilesLoaded: false,
    googleSkipped: requestedProvider === "cesium-architectural",
    terrainLoaded: false,
  });

  const copy = getCopy(locale);
  const coordinates = useMemo(() => normalizeGeoPoint({ latitude, longitude }), [latitude, longitude]);
  const hasCoordinates = coordinates.valid && coordinates.latitude != null && coordinates.longitude != null;
  const accent = normalizeHexColor(primaryColor, "#2dd4bf");

  useEffect(() => {
    isMountedRef.current = true;
    isDestroyedRef.current = false;
    return () => {
      isMountedRef.current = false;
      isDestroyedRef.current = true;
    };
  }, []);


  const safeSetStatus = useCallback((nextStatus: typeof status) => {
    if (!isMountedRef.current || isDestroyedRef.current) return;
    setStatus(nextStatus);
  }, []);

  useEffect(() => {
    console.info("[LifestyleExplorerV6] Effective provider", {
      provider: requestedProvider,
      rawProvider: rawProvider || null,
      overrideFromParent: provider || null,
      googleWillLoad: requestedProvider === "google-photorealistic",
    });
  }, [provider, rawProvider, requestedProvider]);

  useEffect(() => {
    if (!IS_DEVELOPMENT) return;
    console.info("[LifestyleExplorerV6] coordinates", {
      propertyTitle,
      rawLatitude: latitude,
      rawLongitude: longitude,
      rawLatitudeType: typeof latitude,
      rawLongitudeType: typeof longitude,
      normalizedLatitude: coordinates.latitude,
      normalizedLongitude: coordinates.longitude,
      valid: coordinates.valid,
      reason: coordinates.reason || null,
      provider: requestedProvider,
    });
  }, [coordinates, latitude, longitude, propertyTitle, requestedProvider]);

  useEffect(() => {
    if (!IS_DEVELOPMENT) return;
    const element = containerRef.current;
    if (!element) return;
    const container = element;

    function logDimensions(label: string) {
      const rect = container.getBoundingClientRect();
      const canvas = container.querySelector("canvas");
      const canvasRect = canvas?.getBoundingClientRect();
      console.info("[LifestyleExplorerV6] container dimensions", {
        label,
        containerWidth: Math.round(rect.width),
        containerHeight: Math.round(rect.height),
        canvasWidth: canvasRect ? Math.round(canvasRect.width) : null,
        canvasHeight: canvasRect ? Math.round(canvasRect.height) : null,
        legacyOverlayRendered: false,
      });
    }

    logDimensions("mount");
    const timeout = window.setTimeout(() => logDimensions("after-render"), 350);
    return () => window.clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!containerRef.current || !isMountedRef.current || isDestroyedRef.current) return;
      if (!hasCoordinates) {
        safeSetStatus("missing");
        return;
      }

      safeSetStatus("loading");

      try {
        const Cesium = await loadCesiumRuntimeV6();
        await import("@cesium/widgets/Source/Viewer/Viewer.css");
        if (cancelled || !containerRef.current || !isMountedRef.current || isDestroyedRef.current) return;

        Cesium.Ion.defaultAccessToken = ionToken;
        if (!hasIonToken) {
          console.warn("[LifestyleExplorerV6] NEXT_PUBLIC_CESIUM_ION_TOKEN missing; OSM Buildings may fail depending on Cesium Ion access.");
        }

        const { terrainProvider, terrainLoaded } = await loadTerrainProvider(Cesium, hasIonToken);
        const baseImagery = await loadBaseImageryLayer(Cesium, hasIonToken);

        const viewer = new Cesium.Viewer(containerRef.current, {
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

        if (cancelled || !isViewerUsable(viewer)) {
          destroyViewerSafely(viewer);
          return;
        }

        viewerRef.current = viewer;
        if (viewer.scene.globe) viewer.scene.globe.show = true;
        enableFreeNavigation(viewer);
        viewer.resize?.();
        viewer.scene.requestRender?.();
        logViewerDimensions(containerRef.current, "viewer-created");
        logImageryState({
          viewer,
          hasIonToken,
          imageryProviderLoaded: baseImagery.imageryProviderLoaded,
          imageryProviderName: baseImagery.imageryProviderName,
          osmBuildingsLoaded: false,
        });

        let activeProvider: LifestyleV6Provider = requestedProvider;
        let osmBuildingsLoaded = false;
        let googleTilesLoaded = false;
        let googleSkipped = requestedProvider === "cesium-architectural";

        if (requestedProvider === "cesium-architectural") {
          console.info("[LifestyleExplorerV6] Architectural mode forced. Skipping Google Photorealistic.");
        }

        if (requestedProvider === "google-photorealistic") {
          if (!hasGoogleTilesKey) {
            console.warn("[LifestyleExplorerV6] Google Photorealistic requested but NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing; using OSM Buildings fallback.");
            activeProvider = "cesium-architectural";
            googleSkipped = false;
          } else {
            try {
              console.info("[LifestyleExplorerV6] Loading Google Photorealistic 3D Tiles", {
                provider: requestedProvider,
                googleKey: "present",
              });
              const googleTileset = await Cesium.createGooglePhotorealistic3DTileset(
                { key: googleTilesKey, onlyUsingWithGoogleGeocoder: true },
                { maximumScreenSpaceError: 4 },
              );
              if (!cancelled && isViewerUsable(viewer)) {
                viewer.scene.primitives?.add(googleTileset);
                googleTilesLoaded = true;
              }
            } catch (error) {
              activeProvider = "cesium-architectural";
              googleSkipped = false;
              const diagnostic = describeErrorForLog(error);
              console.warn("[LifestyleExplorerV6] Google Photorealistic 3D Tiles unavailable; using OSM Buildings fallback.", {
                error,
                name: diagnostic.name,
                message: diagnostic.message,
                stack: diagnostic.stack,
                url: diagnostic.url,
                resource: diagnostic.resource,
                response: diagnostic.response,
                statusCode: diagnostic.statusCode,
                hasGoogleKey: hasGoogleTilesKey,
                provider: requestedProvider,
              });
            }
          }
        }

        if (!googleTilesLoaded) {
          osmBuildingsLoaded = await loadOsmArchitecturalScene(Cesium, viewer, () => cancelled);
          logImageryState({
            viewer,
            hasIonToken,
            imageryProviderLoaded: baseImagery.imageryProviderLoaded,
            imageryProviderName: baseImagery.imageryProviderName,
            osmBuildingsLoaded,
          });
        }

        if (cancelled || !isViewerUsable(viewer)) return;
        await waitForSceneFrames(viewer, 3);
        if (cancelled || !isViewerUsable(viewer)) return;

        const entity = createPropertyEntity({
          Cesium,
          viewer,
          latitude: coordinates.latitude as number,
          longitude: coordinates.longitude as number,
          label: copy.property,
          accent,
        });
        entityRef.current = entity;

        if (IS_DEVELOPMENT && isMountedRef.current && !isDestroyedRef.current) {
          setDebug({
            entityCreated: Boolean(entity),
            viewerDestroyed: isViewerDestroyed(viewer),
            provider: activeProvider,
            ionTokenPresent: hasIonToken,
            osmBuildingsLoaded,
            googleTilesLoaded,
            googleSkipped,
            terrainLoaded,
          });
        }

        await waitForSceneFrames(viewer, 2);
        if (cancelled || !isViewerUsable(viewer)) return;
        flyToProperty({ Cesium, viewer, entity, latitude: coordinates.latitude as number, longitude: coordinates.longitude as number });
        safeSetStatus("ready");
      } catch (error) {
        console.error("[LifestyleExplorerV6] viewer failed", error);
        if (!cancelled && isMountedRef.current && !isDestroyedRef.current) safeSetStatus("error");
      }
    }

    boot();

    return () => {
      cancelled = true;
      isDestroyedRef.current = true;
      const viewer = viewerRef.current;
      viewerRef.current = null;
      entityRef.current = null;
      destroyViewerSafely(viewer);
    };
  }, [accent, coordinates.latitude, coordinates.longitude, copy.property, googleTilesKey, hasCoordinates, hasGoogleTilesKey, hasIonToken, ionToken, requestedProvider, safeSetStatus]);


  async function recenter() {
    const viewer = viewerRef.current;
    const entity = entityRef.current;
    if (!viewer || !isViewerUsable(viewer) || !entity || !hasCoordinates) return;
    const Cesium = await loadCesiumRuntimeV6();
    if (!isViewerUsable(viewer)) return;
    flyToProperty({ Cesium, viewer, entity, latitude: coordinates.latitude as number, longitude: coordinates.longitude as number });
  }

  return (
    <div
      className="fixed inset-0 z-[2147483647] overflow-hidden bg-slate-950 text-white"
      style={IS_DEVELOPMENT ? { outline: "2px solid red", outlineOffset: "-2px" } : undefined}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 h-full w-full"
        style={IS_DEVELOPMENT ? { outline: "2px solid #3b82f6", outlineOffset: "-6px" } : undefined}
      />

      {(status === "loading" || status === "missing" || status === "error") && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-sm rounded-2xl border border-white/12 bg-slate-950/64 p-4 shadow-2xl backdrop-blur-md">
          <h2 className="text-base font-medium tracking-normal text-white">{propertyTitle || locationLabel}</h2>
          <p className="mt-1 text-xs text-white/60">{locationLabel}</p>
          {status === "loading" && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70"><Loader2 size={15} className="animate-spin" /> {copy.loading}</p>
          )}
          {status === "missing" && <p className="mt-3 text-sm text-amber-200">{copy.missing}</p>}
          {status === "error" && <p className="mt-3 text-sm text-rose-200">Vue 3D indisponible.</p>}
        </div>
      )}

      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <button type="button" onClick={recenter} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-slate-950/72 px-4 text-sm font-medium text-white shadow-xl backdrop-blur-md transition hover:bg-white/14" aria-label={copy.recenter}>
          <Crosshair size={16} />
          <span className="hidden sm:inline">{copy.recenter}</span>
        </button>
        <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-slate-950/72 px-4 text-sm font-medium text-white shadow-xl backdrop-blur-md transition hover:bg-white/14" aria-label={copy.close}>
          <X size={16} />
          <span>{copy.close}</span>
        </button>
      </div>

      <style jsx global>{`
        .cesium-widget,
        .cesium-widget canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>

      {IS_DEVELOPMENT && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-xs rounded-xl border border-emerald-300/25 bg-slate-950/60 p-3 text-[11px] text-white/70 shadow-xl backdrop-blur-md">
          <p className="font-semibold text-emerald-200">Lifestyle V6 debug</p>
          <p>raw: {String(latitude)} / {String(longitude)}</p>
          <p>normalized: {coordinates.latitude ?? "-"} / {coordinates.longitude ?? "-"}</p>
          <p>entity: {debug.entityCreated ? "yes" : "no"}</p>
          <p>provider: {debug.provider}</p>
          <p>ion token: {debug.ionTokenPresent ? "yes" : "no"}</p>
          <p>google tiles: {debug.googleTilesLoaded ? "yes" : "no"}</p>
          <p>google skipped: {debug.googleSkipped ? "yes" : "no"}</p>
          <p>osm buildings: {debug.osmBuildingsLoaded ? "yes" : "no"}</p>
          <p>terrain: {debug.terrainLoaded ? "yes" : "no"}</p>
          <p>destroyed: {debug.viewerDestroyed ? "yes" : "no"}</p>
        </div>
      )}
    </div>
  );
}

function logViewerDimensions(element: HTMLDivElement | null, label: string) {
  if (!IS_DEVELOPMENT || !element) return;
  const rect = element.getBoundingClientRect();
  const canvas = element.querySelector("canvas");
  const canvasRect = canvas?.getBoundingClientRect();
  console.info("[LifestyleExplorerV6] viewer dimensions", {
    label,
    containerWidth: Math.round(rect.width),
    containerHeight: Math.round(rect.height),
    canvasWidth: canvasRect ? Math.round(canvasRect.width) : null,
    canvasHeight: canvasRect ? Math.round(canvasRect.height) : null,
    legacyOverlayRendered: false,
  });
}

function normalizeProvider(value?: string): LifestyleV6Provider {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "google-photorealistic") return "google-photorealistic";
  if (normalized === "cesium-architectural") return "cesium-architectural";
  return DEFAULT_PROVIDER;
}

async function loadTerrainProvider(Cesium: CesiumRuntimeV6, hasIonToken: boolean) {
  let terrainProvider = new Cesium.EllipsoidTerrainProvider();
  let terrainLoaded = false;
  if (!hasIonToken) return { terrainProvider, terrainLoaded };

  try {
    terrainProvider = await Cesium.createWorldTerrainAsync();
    terrainLoaded = true;
  } catch (error) {
    console.warn("[LifestyleExplorerV6] Cesium World Terrain unavailable; using ellipsoid fallback.", describeErrorForLog(error));
  }

  return { terrainProvider, terrainLoaded };
}

async function loadBaseImageryLayer(Cesium: CesiumRuntimeV6, hasIonToken: boolean) {
  if (hasIonToken) {
    try {
      const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
      return {
        baseLayer: new Cesium.ImageryLayer(imageryProvider),
        imageryProviderLoaded: true,
        imageryProviderName: "Cesium World Imagery",
      };
    } catch (error) {
      console.warn("[LifestyleExplorerV6] Cesium World Imagery unavailable; using OpenStreetMap imagery fallback.", describeErrorForLog(error));
    }
  }

  try {
    const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/",
    });
    return {
      baseLayer: new Cesium.ImageryLayer(imageryProvider),
      imageryProviderLoaded: true,
      imageryProviderName: "OpenStreetMap",
    };
  } catch (error) {
    console.warn("[LifestyleExplorerV6] OpenStreetMap imagery unavailable", describeErrorForLog(error));
    return {
      baseLayer: undefined,
      imageryProviderLoaded: false,
      imageryProviderName: "none",
    };
  }
}

function logImageryState(options: {
  viewer: CesiumViewerV6Like;
  hasIonToken: boolean;
  imageryProviderLoaded: boolean;
  imageryProviderName: string;
  osmBuildingsLoaded: boolean;
}) {
  if (!IS_DEVELOPMENT) return;
  console.info("[LifestyleExplorerV6] imagery state", {
    imageryProviderLoaded: options.imageryProviderLoaded,
    imageryProviderName: options.imageryProviderName,
    imageryLayersLength: options.viewer.imageryLayers?.length ?? 0,
    hasCesiumIonToken: options.hasIonToken,
    globeVisible: options.viewer.scene.globe?.show ?? null,
    osmBuildingsLoaded: options.osmBuildingsLoaded,
  });
}

async function loadOsmArchitecturalScene(Cesium: CesiumRuntimeV6, viewer: CesiumViewerV6Like, isCancelled: () => boolean) {
  try {
    const buildings = await Cesium.createOsmBuildingsAsync();
    if (isCancelled() || !isViewerUsable(viewer)) return false;
    if (buildings && typeof buildings === "object") {
      (buildings as { style?: unknown }).style = new Cesium.Cesium3DTileStyle({
        color: "color('white', 0.58)",
      });
    }
    viewer.scene.primitives?.add(buildings);
    viewer.scene.requestRender?.();
    return true;
  } catch (error) {
    console.warn("[LifestyleExplorerV6] OSM Buildings unavailable", describeErrorForLog(error));
    return false;
  }
}

function describeErrorForLog(error: unknown): {
  name?: string;
  message?: string;
  stack?: string;
  url?: unknown;
  resource?: unknown;
  response?: unknown;
  statusCode?: unknown;
} {
  if (error instanceof Error) {
    const details = error as Error & {
      url?: unknown;
      resource?: unknown;
      response?: unknown;
      statusCode?: unknown;
    };
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: details.url,
      resource: details.resource,
      response: details.response,
      statusCode: details.statusCode,
    };
  }
  if (error && typeof error === "object") {
    const details = error as {
      name?: string;
      message?: string;
      stack?: string;
      url?: unknown;
      resource?: unknown;
      response?: unknown;
      statusCode?: unknown;
    };
    return {
      name: details.name,
      message: details.message,
      stack: details.stack,
      url: details.url,
      resource: details.resource,
      response: details.response,
      statusCode: details.statusCode,
    };
  }
  return { message: String(error) };
}

async function loadCesiumRuntimeV6(): Promise<CesiumRuntimeV6> {
  const [
    { default: Viewer },
    { default: Cartesian2 },
    { default: Cartesian3 },
    { default: Color },
    { default: Cesium3DTileStyle },
    { default: CesiumMath },
    { default: EllipsoidTerrainProvider },
    { default: createWorldTerrainAsync },
    { default: createGooglePhotorealistic3DTileset },
    { default: HeadingPitchRange },
    { default: HeightReference },
    { default: HorizontalOrigin },
    { default: ImageryLayer },
    { default: Ion },
    { default: IonImageryProvider },
    { default: LabelStyle },
    { default: VerticalOrigin },
    { default: OpenStreetMapImageryProvider },
    { default: createOsmBuildingsAsync },
  ] = await Promise.all([
    import("@cesium/widgets/Source/Viewer/Viewer.js"),
    import("@cesium/engine/Source/Core/Cartesian2.js"),
    import("@cesium/engine/Source/Core/Cartesian3.js"),
    import("@cesium/engine/Source/Core/Color.js"),
    import("@cesium/engine/Source/Scene/Cesium3DTileStyle.js"),
    import("@cesium/engine/Source/Core/Math.js"),
    import("@cesium/engine/Source/Core/EllipsoidTerrainProvider.js"),
    import("@cesium/engine/Source/Core/createWorldTerrainAsync.js"),
    import("@cesium/engine/Source/Scene/createGooglePhotorealistic3DTileset.js"),
    import("@cesium/engine/Source/Core/HeadingPitchRange.js"),
    import("@cesium/engine/Source/Scene/HeightReference.js"),
    import("@cesium/engine/Source/Scene/HorizontalOrigin.js"),
    import("@cesium/engine/Source/Scene/ImageryLayer.js"),
    import("@cesium/engine/Source/Core/Ion.js"),
    import("@cesium/engine/Source/Scene/IonImageryProvider.js"),
    import("@cesium/engine/Source/Scene/LabelStyle.js"),
    import("@cesium/engine/Source/Scene/VerticalOrigin.js"),
    import("@cesium/engine/Source/Scene/OpenStreetMapImageryProvider.js"),
    import("@cesium/engine/Source/Scene/createOsmBuildingsAsync.js"),
  ]);

  return {
    Viewer,
    Cartesian2,
    Cartesian3,
    Color,
    Cesium3DTileStyle,
    CesiumMath,
    EllipsoidTerrainProvider,
    createWorldTerrainAsync,
    createGooglePhotorealistic3DTileset,
    HeadingPitchRange,
    HeightReference,
    HorizontalOrigin,
    ImageryLayer,
    Ion,
    IonImageryProvider,
    LabelStyle,
    VerticalOrigin,
    OpenStreetMapImageryProvider,
    createOsmBuildingsAsync,
  };
}

function createPropertyEntity(options: {
  Cesium: CesiumRuntimeV6;
  viewer: CesiumViewerV6Like;
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
    point: {
      pixelSize: 10,
      color: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString(accent),
      outlineWidth: 3,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    billboard: {
      image: createPropertyPinSvg(accent),
      width: 34,
      height: 44,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: label,
      font: "500 11px Inter, sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("rgba(15,118,110,0.76)"),
      backgroundPadding: new Cesium.Cartesian2(8, 5),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -48),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

function flyToProperty(options: {
  Cesium: CesiumRuntimeV6;
  viewer: CesiumViewerV6Like;
  entity: CesiumEntity | null;
  latitude: number;
  longitude: number;
}) {
  const { Cesium, viewer, entity, latitude, longitude } = options;
  if (!isViewerUsable(viewer)) return;

  if (entity && typeof viewer.flyTo === "function") {
    void viewer.flyTo(entity, {
      duration: 1.9,
      offset: new Cesium.HeadingPitchRange(
        Cesium.CesiumMath.toRadians(34),
        Cesium.CesiumMath.toRadians(-40),
        950,
      ),
    });
    return;
  }

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 950),
    orientation: {
      heading: Cesium.CesiumMath.toRadians(34),
      pitch: Cesium.CesiumMath.toRadians(-40),
      roll: 0,
    },
    duration: 1.9,
  });
}

function enableFreeNavigation(viewer: CesiumViewerV6Like) {
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
  controller.minimumZoomDistance = 60;
  controller.maximumZoomDistance = 50000;
}

function waitForSceneFrames(viewer: CesiumViewerV6Like, frameCount = 2) {
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

function isViewerDestroyed(viewer: CesiumViewerV6Like | null | undefined) {
  if (!viewer) return true;
  try {
    return typeof viewer.isDestroyed === "function" ? viewer.isDestroyed() : false;
  } catch {
    return true;
  }
}

function isViewerUsable(viewer: CesiumViewerV6Like | null | undefined) {
  return Boolean(viewer && !isViewerDestroyed(viewer) && viewer.scene);
}

function destroyViewerSafely(viewer: CesiumViewerV6Like | null | undefined) {
  if (!viewer || isViewerDestroyed(viewer)) return;
  try {
    viewer.entities?.removeAll?.();
    viewer.destroy();
  } catch (error) {
    console.warn("[LifestyleExplorerV6] viewer destroy skipped", error);
  }
}

function getCopy(locale?: string) {
  const normalized = (locale || "fr").split("-")[0] as keyof typeof COPY;
  return COPY[normalized] || COPY.fr;
}

function normalizeHexColor(color: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
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
