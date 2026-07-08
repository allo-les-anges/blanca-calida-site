import { toCesiumPosition } from "@/modules/lifestyle/viewer/coordinateUtils";
import type { LifestylePoi } from "@/components/lifestyle/lifestyleTypes";

type Lifestyle3DProvider = "cesium-architectural" | "cesium-basic" | "google-photorealistic-3d" | "maptiler-3d";

type CameraRuntime = {
  BoundingSphere: {
    fromPoints: (positions: unknown[]) => unknown;
  };
  Cartesian3: {
    fromDegrees: (longitude: number, latitude: number, height?: number) => unknown;
  };
  CesiumMath: {
    toRadians: (degrees: number) => number;
  };
  HeadingPitchRange: new (heading: number, pitch: number, range: number) => unknown;
};

type ViewerLike = {
  isDestroyed?: () => boolean;
  scene?: {
    camera?: {
      flyTo: (options: unknown) => void;
      flyToBoundingSphere?: (boundingSphere: unknown, options: unknown) => void;
    };
  };
};

export function flyToProperty(options: {
  Cesium: CameraRuntime | null;
  viewer: ViewerLike | null;
  latitude: number;
  longitude: number;
  provider: Lifestyle3DProvider;
  onComplete?: () => void;
}) {
  const { Cesium, viewer, latitude, longitude, provider, onComplete } = options;
  if (!Cesium || !isViewerReady(viewer)) return;
  const camera = viewer?.scene?.camera;
  if (!camera) return;

  camera.flyTo({
    destination: toCesiumPosition(Cesium, { latitude, longitude }, provider === "google-photorealistic-3d" ? 420 : 1450),
    orientation: {
      heading: Cesium.CesiumMath.toRadians(34),
      pitch: Cesium.CesiumMath.toRadians(provider === "google-photorealistic-3d" ? -20 : -48),
      roll: 0,
    },
    duration: provider === "google-photorealistic-3d" ? 2 : 1.7,
    complete: onComplete,
    cancel: onComplete,
  });
}

export function flyToPropertyOverview(options: {
  Cesium: CameraRuntime | null;
  viewer: ViewerLike | null;
  latitude: number;
  longitude: number;
  pois?: LifestylePoi[];
  provider: Lifestyle3DProvider;
  onComplete?: () => void;
}) {
  const { Cesium, viewer, latitude, longitude, pois = [], provider, onComplete } = options;
  if (!Cesium || !isViewerReady(viewer)) {
    onComplete?.();
    return;
  }
  const camera = viewer?.scene?.camera;
  if (!camera) {
    onComplete?.();
    return;
  }

  const framingPois = pois
    .filter((poi) => Number.isFinite(poi.coordinates.latitude) && Number.isFinite(poi.coordinates.longitude) && Number.isFinite(poi.distanceKm))
    .filter((poi) => poi.distanceKm <= 4)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);
  const positions = [
    toCesiumPosition(Cesium, { latitude, longitude }, 0),
    ...framingPois.map((poi) => toCesiumPosition(Cesium, poi.coordinates, 0)),
  ];
  const maxDistanceKm = framingPois.reduce((max, poi) => Math.max(max, poi.distanceKm), 0);
  const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
  const sphereRadius = Number((boundingSphere as { radius?: unknown }).radius);
  const fallbackRange = 900 + framingPois.length * 40 + maxDistanceKm * 190;
  const range = clamp(
    Number.isFinite(sphereRadius) ? sphereRadius * 2.5 : fallbackRange,
    950,
    provider === "google-photorealistic-3d" ? 2400 : 3400,
  );
  const offset = new Cesium.HeadingPitchRange(
    Cesium.CesiumMath.toRadians(34),
    Cesium.CesiumMath.toRadians(provider === "google-photorealistic-3d" ? -35 : -38),
    range,
  );

  if (typeof camera.flyToBoundingSphere === "function") {
    camera.flyToBoundingSphere(boundingSphere, {
      duration: provider === "google-photorealistic-3d" ? 2.1 : 1.7,
      offset,
      complete: onComplete,
      cancel: onComplete,
    });
    return;
  }

  camera.flyTo({
    destination: toCesiumPosition(Cesium, { latitude, longitude }, range),
    orientation: {
      heading: Cesium.CesiumMath.toRadians(34),
      pitch: Cesium.CesiumMath.toRadians(provider === "google-photorealistic-3d" ? -35 : -38),
      roll: 0,
    },
    duration: provider === "google-photorealistic-3d" ? 2.1 : 1.7,
    complete: onComplete,
    cancel: onComplete,
  });
}

export function flyToPoi(options: {
  Cesium: CameraRuntime | null;
  viewer: ViewerLike | null;
  poi: LifestylePoi;
  provider: Lifestyle3DProvider;
}) {
  const { Cesium, viewer, poi, provider } = options;
  if (!Cesium || !isViewerReady(viewer)) return;
  const camera = viewer?.scene?.camera;
  if (!camera) return;

  camera.flyTo({
    destination: toCesiumPosition(Cesium, poi.coordinates, provider === "google-photorealistic-3d" ? 250 : 900),
    orientation: {
      heading: Cesium.CesiumMath.toRadians(38),
      pitch: Cesium.CesiumMath.toRadians(provider === "google-photorealistic-3d" ? -28 : -44),
      roll: 0,
    },
    duration: 2,
  });
}

function isViewerReady(viewer: ViewerLike | null | undefined) {
  if (!viewer?.scene?.camera) return false;
  try {
    return typeof viewer.isDestroyed === "function" ? !viewer.isDestroyed() : true;
  } catch {
    return false;
  }
}



function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
