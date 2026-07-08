import { toCesiumPosition } from "@/modules/lifestyle/viewer/coordinateUtils";
import type { LifestylePoi } from "@/components/lifestyle/lifestyleTypes";
import { estimatePoiMinutes } from "@/components/lifestyle/lifestyleTypes";

type CesiumCollectionLike = {
  add: (options: Record<string, unknown>) => unknown;
  removeAll?: () => void;
};

type EntityRuntime = {
  Cartesian2: new (x: number, y: number) => unknown;
  Cartesian3: {
    fromDegrees: (longitude: number, latitude: number, height?: number) => unknown;
  };
  Color: {
    BLACK: unknown;
    WHITE: unknown;
    fromCssColorString: (color: string) => unknown;
  };
  HorizontalOrigin: {
    CENTER: unknown;
    LEFT: unknown;
    RIGHT: unknown;
  };
  HeightReference: {
    CLAMP_TO_GROUND: unknown;
  };
  BillboardCollection: new () => CesiumCollectionLike;
  LabelCollection: new () => CesiumCollectionLike;
  LabelStyle: {
    FILL_AND_OUTLINE: unknown;
  };
  PointPrimitiveCollection: new () => CesiumCollectionLike;
  PolylineCollection?: new () => CesiumCollectionLike;
  VerticalOrigin: {
    BOTTOM: unknown;
    CENTER: unknown;
  };
};

type ViewerLike = {
  isDestroyed?: () => boolean;
  scene?: {
    primitives?: {
      add: (primitive: unknown) => unknown;
      remove?: (primitive: unknown) => boolean;
    };
  };
};

export type LifestylePrimitiveRefs = {
  labels?: CesiumCollectionLike;
  points?: CesiumCollectionLike;
  billboards?: CesiumCollectionLike;
  lines?: CesiumCollectionLike;
};

export function renderLifestyleEntities(options: {
  Cesium: EntityRuntime;
  viewer: ViewerLike;
  latitude: number;
  longitude: number;
  primaryColor: string;
  pois: LifestylePoi[];
  highlightedPoiId?: string | null;
  selectedPoi?: LifestylePoi | null;
  surfaceHeights?: {
    property?: number;
    pois?: Record<string, number>;
  };
}) {
  const { Cesium, viewer, latitude, longitude, primaryColor, pois, highlightedPoiId, selectedPoi, surfaceHeights } = options;
  if (!isViewerReady(viewer)) return null;

  const points = new Cesium.PointPrimitiveCollection();
  const labels = new Cesium.LabelCollection();
  const billboards = new Cesium.BillboardCollection();
  const lines = Cesium.PolylineCollection ? new Cesium.PolylineCollection() : undefined;

  if (lines) viewer.scene?.primitives?.add(lines);
  viewer.scene?.primitives?.add(points);
  viewer.scene?.primitives?.add(billboards);
  viewer.scene?.primitives?.add(labels);

  const propertyBaseHeight = validSurfaceHeight(surfaceHeights?.property);
  debugCesiumAnchoring({
    latitude,
    longitude,
    propertyHeight: propertyBaseHeight,
    poiCount: pois.length,
    sampledPoiCount: Object.values(surfaceHeights?.pois || {}).filter((height) => validSurfaceHeight(height) != null).length,
  });
  renderPropertyMarker({ Cesium, points, labels, billboards, latitude, longitude, primaryColor, baseHeight: propertyBaseHeight });

  const labelPoiIds = prioritizedLabelPoiIds(pois, selectedPoi, highlightedPoiId);
  pois.slice(0, 50).forEach((poi) => {
    const isHighlighted = highlightedPoiId === poi.id;
    const showLabel = labelPoiIds.has(poi.id);
    renderPoiCallout({
      Cesium,
      points,
      labels,
      lines,
      poi,
      primaryColor,
      isHighlighted,
      showLabel,
      baseHeight: validSurfaceHeight(surfaceHeights?.pois?.[poi.id]),
    });
  });

  if (selectedPoi && lines) {
    const selectedPoiBaseHeight = validSurfaceHeight(surfaceHeights?.pois?.[selectedPoi.id]);
    const lineHeight = Math.max(propertyBaseHeight ?? 0, selectedPoiBaseHeight ?? 0) + 2;
    lines.add({
      positions: [
        toCesiumPosition(Cesium, { latitude, longitude }, lineHeight),
        toCesiumPosition(Cesium, selectedPoi.coordinates, lineHeight),
      ],
      width: 3,
    });
    labels.add({
      position: toCesiumPosition(Cesium, {
        latitude: (latitude + selectedPoi.coordinates.latitude) / 2,
        longitude: (longitude + selectedPoi.coordinates.longitude) / 2,
      }, 0),
      text: formatLineDistance(selectedPoi.distanceKm),
      font: "12px Inter, sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("rgba(15,23,42,0.78)"),
      backgroundPadding: new Cesium.Cartesian2(9, 5),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -8),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  }

  return { points, labels, billboards, lines };
}

export function clearLifestyleEntities(viewer: ViewerLike | null | undefined, refs: LifestylePrimitiveRefs | null) {
  if (!refs) return;
  try {
    const primitives = isViewerReady(viewer) ? viewer?.scene?.primitives : undefined;
    if (refs.points) primitives?.remove?.(refs.points);
    if (refs.labels) primitives?.remove?.(refs.labels);
    if (refs.billboards) primitives?.remove?.(refs.billboards);
    if (refs.lines) primitives?.remove?.(refs.lines);
    refs.points?.removeAll?.();
    refs.labels?.removeAll?.();
    refs.billboards?.removeAll?.();
    refs.lines?.removeAll?.();
  } catch {
    // Cesium can throw if cleanup races with widget destruction.
  }
}

function renderPropertyMarker(options: {
  Cesium: EntityRuntime;
  points: CesiumCollectionLike;
  labels: CesiumCollectionLike;
  billboards: CesiumCollectionLike;
  latitude: number;
  longitude: number;
  primaryColor: string;
  baseHeight?: number;
}) {
  const { Cesium, points, labels, billboards, latitude, longitude, primaryColor, baseHeight } = options;
  const groundHeight = baseHeight ?? 0;
  const accent = normalizeHexColor(primaryColor, "#2dd4bf");
  const teal = "#2dd4bf";

  points.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, groundHeight + 0.5),
    color: Cesium.Color.fromCssColorString("rgba(45,212,191,0.10)"),
    outlineColor: Cesium.Color.fromCssColorString("rgba(45,212,191,0.38)"),
    outlineWidth: 2,
    pixelSize: 76,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });
  points.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, groundHeight + 0.8),
    color: Cesium.Color.fromCssColorString("rgba(45,212,191,0.20)"),
    outlineColor: Cesium.Color.fromCssColorString("rgba(153,246,228,0.70)"),
    outlineWidth: 2,
    pixelSize: 48,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });
  points.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, groundHeight + 1.1),
    color: Cesium.Color.fromCssColorString("rgba(255,255,255,0.95)"),
    outlineColor: Cesium.Color.fromCssColorString(teal),
    outlineWidth: 8,
    pixelSize: 20,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });
  billboards.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, 0),
    image: createPropertyPinSvg(accent),
    width: 86,
    height: 112,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });
  labels.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, 0),
    text: "Votre bien",
    font: "600 13px Inter, sans-serif",
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    showBackground: true,
    backgroundColor: Cesium.Color.fromCssColorString("rgba(15,118,110,0.88)"),
    backgroundPadding: new Cesium.Cartesian2(13, 7),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -112),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });
}

function renderPoiCallout(options: {
  Cesium: EntityRuntime;
  points: CesiumCollectionLike;
  labels: CesiumCollectionLike;
  lines?: CesiumCollectionLike;
  poi: LifestylePoi;
  primaryColor: string;
  isHighlighted: boolean;
  showLabel: boolean;
  baseHeight?: number;
}) {
  const { Cesium, points, labels, lines, poi, primaryColor, isHighlighted, showLabel, baseHeight } = options;
  const longitude = poi.coordinates.longitude;
  const latitude = poi.coordinates.latitude;
  const groundHeight = baseHeight ?? 0;
  const anchorHeight = groundHeight + 0.8;
  const labelHeight = groundHeight + (isHighlighted ? 22 : 18);
  const walkMinutes = estimatePoiMinutes(poi.distanceKm, "walk");
  const distanceText = formatLineDistance(poi.distanceKm);
  const detailText = walkMinutes ? `${distanceText} - ${walkMinutes} min a pied` : distanceText;
  const icon = categoryGlyph(poi.category);
  const offset = calloutOffset(poi, isHighlighted);
  const accent = normalizeHexColor(primaryColor, "#2dd4bf");

  points.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, anchorHeight),
    color: Cesium.Color.fromCssColorString(isHighlighted ? "rgba(45,212,191,0.95)" : "rgba(255,255,255,0.92)"),
    outlineColor: Cesium.Color.fromCssColorString(isHighlighted ? accent : "rgba(255,255,255,0.78)"),
    outlineWidth: isHighlighted ? 5 : 2,
    pixelSize: isHighlighted ? 15 : 8,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });

  if (!showLabel) return;

  if (lines) {
    lines.add({
      positions: [
        toCesiumPosition(Cesium, { latitude, longitude }, anchorHeight + 3),
        toCesiumPosition(Cesium, { latitude, longitude }, labelHeight - 12),
      ],
      width: isHighlighted ? 2 : 1,
    });
  }

  labels.add({
    position: toCesiumPosition(Cesium, { latitude, longitude }, 0),
    text: `${icon}  ${poi.label}\n${detailText}`,
    font: isHighlighted ? "600 12px Inter, sans-serif" : "500 11px Inter, sans-serif",
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    showBackground: true,
    backgroundColor: Cesium.Color.fromCssColorString(isHighlighted ? "rgba(15,23,42,0.92)" : "rgba(15,23,42,0.85)"),
    backgroundPadding: new Cesium.Cartesian2(10, 7),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    horizontalOrigin: offset.x < 0 ? Cesium.HorizontalOrigin.RIGHT : Cesium.HorizontalOrigin.LEFT,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    pixelOffset: new Cesium.Cartesian2(offset.x, offset.y),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  });
}

function prioritizedLabelPoiIds(pois: LifestylePoi[], selectedPoi?: LifestylePoi | null, highlightedPoiId?: string | null) {
  const selectedId = selectedPoi?.id || highlightedPoiId || null;
  const ordered = [...pois]
    .slice(0, 50)
    .sort((a, b) => {
      if (selectedId && a.id === selectedId) return -1;
      if (selectedId && b.id === selectedId) return 1;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, 6);

  return new Set(ordered.map((poi) => poi.id));
}

function validSurfaceHeight(height: number | null | undefined) {
  const numericHeight = Number(height);
  return Number.isFinite(numericHeight) ? numericHeight : undefined;
}

function isViewerReady(viewer: ViewerLike | null | undefined) {
  if (!viewer?.scene?.primitives) return false;
  try {
    return typeof viewer.isDestroyed === "function" ? !viewer.isDestroyed() : true;
  } catch {
    return false;
  }
}

function formatLineDistance(distanceKm: number) {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

function categoryGlyph(category: LifestylePoi["category"]) {
  const icons: Record<LifestylePoi["category"], string> = {
    beach: "beach",
    sea: "sea",
    golf: "golf",
    restaurant: "food",
    school: "school",
    hospital: "med",
    shops: "shop",
    airport: "air",
    center: "city",
    transport: "bus",
    marina: "marina",
  };
  return icons[category] || "poi";
}

function calloutOffset(poi: LifestylePoi, isHighlighted: boolean) {
  const x = Number.isFinite(poi.labelOffsetX) ? poi.labelOffsetX : 28;
  const y = Number.isFinite(poi.labelOffsetY) ? poi.labelOffsetY : -36;
  const scale = isHighlighted ? 1.08 : 1;
  return {
    x: Math.round(x * scale),
    y: Math.round(y * scale),
  };
}

function normalizeHexColor(color: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function createPropertyPinSvg(color: string) {
  const svg = `
    <svg width="86" height="112" viewBox="0 0 86 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-45%" y="-35%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.03 0 0 0 0 0.85 0 0 0 0 0.95 0 0 0 .78 0"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee"/>
          <stop offset="1" stop-color="${color}"/>
        </linearGradient>
      </defs>
      <path filter="url(#glow)" d="M43 105C43 105 14 70 14 43C14 20.9 26.9 8 43 8C59.1 8 72 20.9 72 43C72 70 43 105 43 105Z" fill="url(#pin)" stroke="white" stroke-width="4"/>
      <circle cx="43" cy="43" r="15" fill="white"/>
      <circle cx="43" cy="43" r="7" fill="${color}"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}


function debugCesiumAnchoring(payload: {
  latitude: number;
  longitude: number;
  propertyHeight?: number;
  poiCount: number;
  sampledPoiCount: number;
}) {
  if (process.env.NODE_ENV !== "development") return;
  console.info("[LifestyleExplorer] Cesium anchoring", {
    markerObjects: ["PointPrimitiveCollection", "BillboardCollection", "LabelCollection", "PolylineCollection"],
    property: {
      latitude: payload.latitude,
      longitude: payload.longitude,
      sampledHeight: payload.propertyHeight ?? null,
      billboardHeightReference: "CLAMP_TO_GROUND",
      labelHeightReference: "CLAMP_TO_GROUND",
      pointHeightReference: "unsupported-by-point-primitive",
    },
    pois: {
      total: payload.poiCount,
      withSampledHeight: payload.sampledPoiCount,
      billboardHeightReference: "not-used-for-poi",
      labelHeightReference: "CLAMP_TO_GROUND",
      pointHeightReference: "unsupported-by-point-primitive",
    },
  });
}
