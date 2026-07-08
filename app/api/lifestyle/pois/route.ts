import { NextResponse } from "next/server";

type LifestylePoiCategory = "beach" | "restaurant" | "shop" | "school" | "transport" | "health" | "sport" | "viewpoint";

type OverpassElement = {
  type?: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type LifestylePoi = {
  id: string;
  name: string;
  category: LifestylePoiCategory;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  walkMinutes?: number;
  description?: string;
  source: "openstreetmap";
};

const CATEGORY_LIMIT = 5;
const DEFAULT_RADIUS_METERS = 2500;
const MIN_RADIUS_METERS = 250;
const MAX_RADIUS_METERS = 10000;

// overpass-api.de is a shared free instance and is intermittently slow/unavailable
// under load (observed: same query taking anywhere from ~2s to timing out past 10s).
// A single attempt against it is not reliable enough, so we race a short timeout per
// mirror and fall back to a second public mirror before giving up.
const OVERPASS_MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const OVERPASS_TIMEOUT_MS = 9000;

// Give the retry-across-mirrors logic enough wall-clock room to try both before
// the platform kills the function (default serverless timeout is 10s).
export const maxDuration = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));
  const radiusMeters = clampRadius(Number(searchParams.get("radius") || DEFAULT_RADIUS_METERS));

  if (!isValidCoordinate(latitude, longitude)) {
    return NextResponse.json({ pois: [], source: "openstreetmap", radiusMeters, error: "Invalid coordinates" }, { status: 400 });
  }

  const query = buildOverpassQuery(latitude, longitude, radiusMeters);

  let lastError: string = "Overpass unavailable";
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const response = await fetch(mirror, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "DataHome Lifestyle Explorer (contact: support@data-home.app)",
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        console.warn("[LifestyleExplorer] Overpass mirror unavailable", mirror, response.status);
        lastError = `Overpass unavailable (${response.status})`;
        continue;
      }

      const payload = (await response.json()) as { elements?: OverpassElement[] };
      const pois = normalizeOverpassPois(payload.elements || [], latitude, longitude);

      return NextResponse.json(
        { pois, source: "openstreetmap", radiusMeters },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        },
      );
    } catch (error) {
      console.warn("[LifestyleExplorer] Overpass mirror failed", mirror, error);
      lastError = "POI service unavailable";
    }
  }

  return NextResponse.json({ pois: [], source: "openstreetmap", radiusMeters, error: lastError }, { status: 502 });
}

function buildOverpassQuery(latitude: number, longitude: number, radiusMeters: number) {
  const around = `around:${radiusMeters},${latitude},${longitude}`;
  // nwr(...) queries node+way+relation in one statement instead of three separate
  // ones. Dense areas (large touristic urbanizations) made the original 23-statement
  // query heavy enough for Overpass's public instance to time out server-side (504);
  // this cuts it down to 16 statements, and categories that are essentially always
  // mapped as single points in OSM (restaurant/cafe/transport/health/marketplace)
  // stay node-only since a way/relation lookup there is pure overhead.
  return `
    [out:json][timeout:20];
    (
      nwr(${around})["natural"="beach"];
      node(${around})["amenity"="restaurant"];
      node(${around})["amenity"="cafe"];
      nwr(${around})["shop"];
      nwr(${around})["amenity"="school"];
      node(${around})["public_transport"="station"];
      node(${around})["railway"="station"];
      node(${around})["highway"="bus_stop"];
      nwr(${around})["amenity"="hospital"];
      node(${around})["amenity"="clinic"];
      node(${around})["amenity"="doctors"];
      node(${around})["amenity"="pharmacy"];
      nwr(${around})["leisure"="golf_course"];
      nwr(${around})["leisure"="sports_centre"];
      nwr(${around})["tourism"="viewpoint"];
      node(${around})["amenity"="marketplace"];
    );
    out center tags;
  `;
}

function normalizeOverpassPois(elements: OverpassElement[], latitude: number, longitude: number): LifestylePoi[] {
  const byCategory = new Map<LifestylePoiCategory, LifestylePoi[]>();
  const seen = new Set<string>();

  for (const element of elements) {
    const pointLatitude = element.lat ?? element.center?.lat;
    const pointLongitude = element.lon ?? element.center?.lon;
    if (!isValidCoordinate(pointLatitude, pointLongitude)) continue;

    const category = getCategory(element.tags || {});
    if (!category) continue;

    const id = `${element.type || "osm"}-${element.id}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const safeLatitude = pointLatitude as number;
    const safeLongitude = pointLongitude as number;
    const distanceMeters = Math.round(distanceMetersBetween(latitude, longitude, safeLatitude, safeLongitude));
    const name = getPoiName(element.tags || {}, category);
    const description = getPoiDescription(element.tags || {}, category);

    const poi: LifestylePoi = {
      id,
      name,
      category,
      latitude: safeLatitude,
      longitude: safeLongitude,
      distanceMeters,
      walkMinutes: estimateWalkMinutes(distanceMeters),
      description,
      source: "openstreetmap",
    };

    const list = byCategory.get(category) || [];
    list.push(poi);
    byCategory.set(category, list);
  }

  return Array.from(byCategory.entries())
    .flatMap(([, pois]) => pois.sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, CATEGORY_LIMIT))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function getCategory(tags: Record<string, string>): LifestylePoiCategory | null {
  if (tags.natural === "beach") return "beach";
  if (tags.amenity === "restaurant" || tags.amenity === "cafe") return "restaurant";
  if (tags.shop || tags.amenity === "marketplace") return "shop";
  if (tags.amenity === "school") return "school";
  if (tags.public_transport === "station" || tags.railway === "station" || tags.highway === "bus_stop") return "transport";
  if (["hospital", "clinic", "doctors", "pharmacy"].includes(tags.amenity || "")) return "health";
  if (tags.leisure === "golf_course" || tags.leisure === "sports_centre") return "sport";
  if (tags.tourism === "viewpoint") return "viewpoint";
  return null;
}

function getPoiName(tags: Record<string, string>, category: LifestylePoiCategory) {
  const fallback: Record<LifestylePoiCategory, string> = {
    beach: "Beach",
    restaurant: tags.amenity === "cafe" ? "Cafe" : "Restaurant",
    shop: "Shop",
    school: "School",
    transport: "Transport stop",
    health: "Health service",
    sport: tags.leisure === "golf_course" ? "Golf course" : "Sport",
    viewpoint: "Viewpoint",
  };
  return tags.name || tags["name:en"] || tags.brand || tags.operator || fallback[category];
}

function getPoiDescription(tags: Record<string, string>, category: LifestylePoiCategory) {
  const details = [
    tags.cuisine,
    tags.shop,
    tags.healthcare,
    tags.leisure,
    tags.public_transport,
    tags.railway,
    tags.highway,
  ].filter(Boolean);
  return details.length > 0 ? details.join(" - ") : category;
}

function clampRadius(radius: number) {
  if (!Number.isFinite(radius)) return DEFAULT_RADIUS_METERS;
  return Math.min(MAX_RADIUS_METERS, Math.max(MIN_RADIUS_METERS, Math.round(radius)));
}

function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function estimateWalkMinutes(distanceMeters: number) {
  return Math.max(1, Math.round(distanceMeters / 80));
}

function distanceMetersBetween(latA: number, lonA: number, latB: number, lonB: number) {
  const radius = 6371000;
  const deltaLat = ((latB - latA) * Math.PI) / 180;
  const deltaLon = ((lonB - lonA) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos((latA * Math.PI) / 180) *
      Math.cos((latB * Math.PI) / 180) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
