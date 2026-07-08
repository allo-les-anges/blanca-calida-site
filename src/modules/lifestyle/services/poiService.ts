import { normalizeLifestylePoiList, type Poi } from "@/modules/lifestyle/types/poi";

export type FetchPoisOptions = {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  signal?: AbortSignal;
};

export type FetchPoisResult =
  | { status: "ready"; pois: Poi[] }
  | { status: "error"; pois: []; error: string };

/**
 * Unique point d'entrée front pour récupérer les POIs autour d'un bien.
 * Encapsule l'appel à /api/lifestyle/pois (seule route qui doit parler à
 * Overpass/OpenStreetMap) et la normalisation vers le DTO Poi unifié.
 *
 * Remplace la logique dupliquée `normalizeApiPoisForV7` de
 * src/components/lifestyle/LifestyleExplorer.tsx — cette fonction n'est pas encore
 * rebranchée sur ce service (voir LifestyleExplorerV8.md, étape 3) mais tout nouveau code
 * doit passer par ici plutôt que par un fetch direct.
 */
export async function fetchLifestylePois(options: FetchPoisOptions): Promise<FetchPoisResult> {
  const { latitude, longitude, radiusMeters = 2500, signal } = options;

  try {
    const response = await fetch(
      `/api/lifestyle/pois?lat=${encodeURIComponent(String(latitude))}&lng=${encodeURIComponent(String(longitude))}&radius=${encodeURIComponent(String(radiusMeters))}`,
      { signal },
    );

    if (!response.ok) {
      return { status: "error", pois: [], error: `POI request failed: ${response.status}` };
    }

    const payload = (await response.json()) as { pois?: unknown[] };
    return { status: "ready", pois: normalizeLifestylePoiList(payload.pois || []) };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { status: "error", pois: [], error: error instanceof Error ? error.message : "POI service unavailable" };
  }
}
