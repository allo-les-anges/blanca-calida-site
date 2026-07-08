import type {
  Lifestyle3DCesiumRuntime,
  Lifestyle3DProvider,
  Lifestyle3DProviderContext,
  Lifestyle3DProviderId,
  Lifestyle3DSceneSetup,
} from "./types";

/**
 * cesium-architectural — provider par défaut et seul provider "available" aujourd'hui.
 * Logique identique à celle déjà utilisée par CesiumLifestyleViewerV7 (loadTerrainProvider
 * + loadBaseImageryLayer), simplement rendue réutilisable : Cesium World Terrain + Cesium
 * World Imagery si un token Ion est configuré, sinon repli sur EllipsoidTerrainProvider +
 * tuiles OpenStreetMap.
 */
const cesiumArchitecturalProvider: Lifestyle3DProvider = {
  id: "cesium-architectural",
  label: "Mode 3D architectural (Cesium)",
  status: "available",
  requiresApiKey: false,
  async setupScene(Cesium: Lifestyle3DCesiumRuntime, context: Lifestyle3DProviderContext): Promise<Lifestyle3DSceneSetup> {
    let terrainProvider: unknown = new Cesium.EllipsoidTerrainProvider();
    let terrainLoaded = false;
    if (context.hasIonToken) {
      try {
        terrainProvider = await Cesium.createWorldTerrainAsync();
        terrainLoaded = true;
      } catch (error) {
        console.warn("[Lifestyle3D:cesium-architectural] World Terrain unavailable; using ellipsoid fallback.", error);
      }
    }

    if (context.hasIonToken) {
      try {
        const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
        return {
          terrainProvider,
          terrainLoaded,
          baseLayer: new Cesium.ImageryLayer(imageryProvider),
          baseLayerLabel: "Cesium World Imagery",
        };
      } catch (error) {
        console.warn("[Lifestyle3D:cesium-architectural] World Imagery unavailable; using OSM fallback.", error);
      }
    }

    return {
      terrainProvider,
      terrainLoaded,
      baseLayer: new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({ url: "https://tile.openstreetmap.org/" })),
      baseLayerLabel: "OpenStreetMap",
    };
  },
};

/**
 * cesium-basic — variante sans OSM Buildings (utile pour un mode "léger"/mobile).
 * Pas encore branchée sur un usage réel : réutilise la même scène que cesium-architectural,
 * c'est la couche appelante (viewer/) qui décide d'ajouter ou non les bâtiments OSM.
 */
const cesiumBasicProvider: Lifestyle3DProvider = {
  id: "cesium-basic",
  label: "Cesium basic",
  status: "planned",
  requiresApiKey: false,
  setupScene: cesiumArchitecturalProvider.setupScene,
};

/**
 * google-photorealistic-3d — DÉFINITIVEMENT INDISPONIBLE.
 * Google Maps Platform ne permet plus l'usage des Photorealistic 3D Tiles pour les
 * comptes de facturation EEE (confirmé officiellement, 2026). Ce provider reste déclaré
 * uniquement pour documenter la décision et garder la porte ouverte si Google change sa
 * politique ; `setupScene` ne doit jamais être invoquée (voir resolveLifestyle3DProvider).
 */
const googlePhotorealistic3DProvider: Lifestyle3DProvider = {
  id: "google-photorealistic-3d",
  label: "Google Photorealistic 3D",
  status: "unavailable",
  requiresApiKey: true,
  unavailableReason:
    "Google Maps Platform ne permet plus l'usage des Photorealistic 3D Tiles pour les comptes de facturation EEE (confirmé officiellement). Provider désactivé définitivement.",
  async setupScene() {
    throw new Error(
      "[Lifestyle3D] google-photorealistic-3d is unavailable for EEE billing accounts and must not be used. Use resolveLifestyle3DProvider() instead of accessing this provider directly.",
    );
  },
};

/** mapbox-3d — non implémenté, réservé pour une future intégration premium. */
const mapbox3DProvider: Lifestyle3DProvider = {
  id: "mapbox-3d",
  label: "Mapbox 3D",
  status: "planned",
  requiresApiKey: true,
  async setupScene() {
    throw new Error("[Lifestyle3D] mapbox-3d is not implemented yet.");
  },
};

/** maptiler-3d — non implémenté, alternative européenne envisagée si besoin d'un provider payant. */
const maptiler3DProvider: Lifestyle3DProvider = {
  id: "maptiler-3d",
  label: "MapTiler 3D",
  status: "planned",
  requiresApiKey: true,
  async setupScene() {
    throw new Error("[Lifestyle3D] maptiler-3d is not implemented yet.");
  },
};

export const LIFESTYLE_3D_PROVIDERS: Record<Lifestyle3DProviderId, Lifestyle3DProvider> = {
  "cesium-architectural": cesiumArchitecturalProvider,
  "cesium-basic": cesiumBasicProvider,
  "google-photorealistic-3d": googlePhotorealistic3DProvider,
  "mapbox-3d": mapbox3DProvider,
  "maptiler-3d": maptiler3DProvider,
};

export const DEFAULT_LIFESTYLE_3D_PROVIDER_ID: Lifestyle3DProviderId = "cesium-architectural";

/**
 * Résout un identifiant de provider en instance utilisable.
 * Ne renvoie jamais un provider "unavailable" : si demandé explicitement (ou configuré via
 * env), on retombe sur le provider par défaut en loggant un avertissement plutôt que de
 * planter le viewer.
 */
export function resolveLifestyle3DProvider(id?: string | null): Lifestyle3DProvider {
  const normalized = (id || "").trim().toLowerCase() as Lifestyle3DProviderId;
  const provider = LIFESTYLE_3D_PROVIDERS[normalized];

  if (!provider) {
    return LIFESTYLE_3D_PROVIDERS[DEFAULT_LIFESTYLE_3D_PROVIDER_ID];
  }

  if (provider.status === "unavailable") {
    console.warn(
      `[Lifestyle3D] Provider "${provider.id}" is unavailable (${provider.unavailableReason}). Falling back to "${DEFAULT_LIFESTYLE_3D_PROVIDER_ID}".`,
    );
    return LIFESTYLE_3D_PROVIDERS[DEFAULT_LIFESTYLE_3D_PROVIDER_ID];
  }

  if (provider.status === "planned") {
    console.warn(`[Lifestyle3D] Provider "${provider.id}" is not implemented yet. Falling back to "${DEFAULT_LIFESTYLE_3D_PROVIDER_ID}".`);
    return LIFESTYLE_3D_PROVIDERS[DEFAULT_LIFESTYLE_3D_PROVIDER_ID];
  }

  return provider;
}
