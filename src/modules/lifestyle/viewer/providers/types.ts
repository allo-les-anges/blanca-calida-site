/**
 * Provider Strategy — moteur 3D du Lifestyle Explorer.
 *
 * Pourquoi cette abstraction existe :
 * Google Maps Platform ne permet plus l'usage des Photorealistic 3D Tiles pour les
 * comptes de facturation EEE (confirmé officiellement par Google Maps Platform, 2026).
 * Ce provider est donc définitivement abandonné comme moteur de rendu actif.
 *
 * Plutôt que de supprimer toute notion de "provider" (ce qui obligerait à un nouveau
 * refactor le jour où DATAhome voudra brancher Cesium ion, Mapbox 3D ou un autre
 * fournisseur), on garde une interface commune : chaque provider sait juste préparer
 * une scène Cesium (terrain + imagerie de base). Le provider Google reste déclaré dans
 * le registre mais avec status "unavailable" et une raison explicite — il ne s'exécute
 * jamais, mais l'abstraction est prête à accueillir un futur remplaçant sans
 * réécriture du viewer.
 */

export type Lifestyle3DProviderId =
  | "cesium-architectural"
  | "cesium-basic"
  | "google-photorealistic-3d"
  | "mapbox-3d"
  | "maptiler-3d";

export type Lifestyle3DProviderStatus = "available" | "unavailable" | "planned";

/**
 * Sous-ensemble minimal du runtime Cesium requis pour préparer une scène.
 * Signature structurelle (pas d'import direct de "cesium") pour rester compatible
 * avec le chargement dynamique déjà utilisé par les viewers existants.
 */
export type Lifestyle3DCesiumRuntime = {
  Ion: { defaultAccessToken: string };
  EllipsoidTerrainProvider: new () => unknown;
  createWorldTerrainAsync: () => Promise<unknown>;
  ImageryLayer: new (imageryProvider?: unknown) => unknown;
  IonImageryProvider: { fromAssetId: (assetId: number) => Promise<unknown> };
  OpenStreetMapImageryProvider: new (options: { url: string }) => unknown;
  createOsmBuildingsAsync: (options?: Record<string, unknown>) => Promise<unknown>;
};

export type Lifestyle3DSceneSetup = {
  terrainProvider: unknown;
  terrainLoaded: boolean;
  baseLayer: unknown;
  baseLayerLabel: string;
};

export type Lifestyle3DProviderContext = {
  hasIonToken: boolean;
};

export interface Lifestyle3DProvider {
  id: Lifestyle3DProviderId;
  label: string;
  status: Lifestyle3DProviderStatus;
  requiresApiKey: boolean;
  /** Renseigné uniquement quand status === "unavailable". */
  unavailableReason?: string;
  /**
   * Prépare terrain + imagerie de base pour ce provider.
   * Ne doit jamais être appelée si status === "unavailable" (voir resolveLifestyle3DProvider).
   */
  setupScene: (Cesium: Lifestyle3DCesiumRuntime, context: Lifestyle3DProviderContext) => Promise<Lifestyle3DSceneSetup>;
}
