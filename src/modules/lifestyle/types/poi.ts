/**
 * DTO Poi unifié — sérialisable, sans dépendance UI (pas d'icône, pas de couleur).
 *
 * Contexte : trois définitions de "LifestylePoi" coexistent aujourd'hui dans le code
 * (src/components/lifestyle/lifestyleTypes.ts, celle interne à CesiumLifestyleViewerV7.tsx,
 * et celle de src/app/api/lifestyle/pois/route.ts). Ce fichier est la cible de convergence :
 * services/poiService.ts l'utilise déjà pour parler à l'API ; les viewers legacy ne sont pas
 * encore reconnectés dessus (voir LifestyleExplorerV8.md, étape 3).
 */

export type PoiCategory =
  | "beach"
  | "sea"
  | "restaurant"
  | "cafe"
  | "bar"
  | "shop"
  | "supermarket"
  | "school"
  | "hospital"
  | "pharmacy"
  | "golf"
  | "marina"
  | "port"
  | "park"
  | "transport"
  | "airport"
  | "shopping_mall"
  | "viewpoint";

export type Poi = {
  id: string;
  name: string;
  category: PoiCategory;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distanceMeters: number;
  walkMinutes?: number;
  driveMinutes?: number;
  /** 0-1, poids de ce POI dans le scoring/discovery. Calculé plus tard (scoring/). */
  priority?: number;
  description?: string;
  source: "openstreetmap" | "computed" | "demo";
};

const CATEGORY_ALIASES: Record<string, PoiCategory> = {
  beach: "beach",
  sea: "sea",
  marina: "marina",
  port: "port",
  restaurant: "restaurant",
  restaurants: "restaurant",
  cafe: "cafe",
  bar: "bar",
  shop: "shop",
  shops: "shop",
  shopping: "shop",
  shopping_mall: "shopping_mall",
  supermarket: "supermarket",
  school: "school",
  schools: "school",
  hospital: "hospital",
  health: "hospital",
  pharmacy: "pharmacy",
  golf: "golf",
  sport: "golf",
  park: "park",
  transport: "transport",
  airport: "airport",
  viewpoint: "viewpoint",
};

function readNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(typeof value === "string" ? value.replace(",", ".") : value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeCategory(value: unknown): PoiCategory {
  const key = String(value ?? "").toLowerCase();
  return CATEGORY_ALIASES[key] ?? "viewpoint";
}

/**
 * Normalise un enregistrement brut (venant de /api/lifestyle/pois ou d'ailleurs) vers le DTO
 * unifié. Retourne null si les coordonnées sont invalides. Remplace
 * `normalizeApiPoisForV7` (dupliqué aujourd'hui dans LifestyleExplorer.tsx).
 */
export function normalizeLifestylePoi(raw: unknown, index = 0): Poi | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const latitude = readNumber(record.latitude ?? record.lat);
  const longitude = readNumber(record.longitude ?? record.lng ?? record.lon);
  if (latitude == null || longitude == null) return null;
  if (latitude === 0 && longitude === 0) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  const category = normalizeCategory(record.category);
  const distanceMeters = readNumber(record.distanceMeters) ?? (() => {
    const km = readNumber(record.distanceKm);
    return km == null ? 0 : Math.round(km * 1000);
  })();

  const source = readString(record.source);

  return {
    id: readString(record.id) || `poi-${category}-${index}`,
    name: readString(record.name) || readString(record.label) || category,
    category,
    coordinates: { latitude, longitude },
    distanceMeters,
    walkMinutes: readNumber(record.walkMinutes) ?? undefined,
    driveMinutes: readNumber(record.driveMinutes) ?? undefined,
    description: readString(record.description) || readString(record.detail) || undefined,
    source: source === "openstreetmap" ? "openstreetmap" : source === "demo" ? "demo" : "computed",
  };
}

export function normalizeLifestylePoiList(rawList: unknown[]): Poi[] {
  return rawList.flatMap((raw, index) => {
    const poi = normalizeLifestylePoi(raw, index);
    return poi ? [poi] : [];
  });
}
