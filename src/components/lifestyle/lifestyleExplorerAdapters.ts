export type LifestyleMapEngineId = "maplibre" | "deckgl" | "cesium-architectural" | "cesium-basic" | "maptiler-3d" | "mapbox" | "google-photorealistic-3d";

export type LifestyleMapEngine = {
  id: LifestyleMapEngineId;
  label: string;
  status: "primary" | "fallback" | "planned";
  requiresPaidKey: boolean;
  description: string;
};

export const LIFESTYLE_MAP_ENGINES: LifestyleMapEngine[] = [
  {
    id: "google-photorealistic-3d",
    label: "Google Photorealistic 3D",
    status: "planned",
    requiresPaidKey: true,
    description: "Provider premium V4 via Google Map Tiles API, charge uniquement au clic et protege par variable d'environnement.",
  },
  {
    id: "cesium-architectural",
    label: "Mode 3D architectural",
    status: "primary",
    requiresPaidKey: false,
    description: "Provider stable par defaut avec CesiumJS, batiments OpenStreetMap stylises et rendu architectural premium.",
  },
  {
    id: "cesium-basic",
    label: "Cesium basic",
    status: "fallback",
    requiresPaidKey: false,
    description: "Fallback 3D open source avec imagerie/terrain Cesium ion si un token est configure.",
  },
  {
    id: "maplibre",
    label: "MapLibre",
    status: "fallback",
    requiresPaidKey: false,
    description: "Fallback 2D open source avec tuiles OpenStreetMap et couches lifestyle locales.",
  },
  {
    id: "deckgl",
    label: "deck.gl",
    status: "planned",
    requiresPaidKey: false,
    description: "Couche V2.1 pour arcs, heatmap, points animes et zones lifestyle.",
  },
  {
    id: "maptiler-3d",
    label: "MapTiler 3D",
    status: "planned",
    requiresPaidKey: true,
    description: "Alternative 3D future pour l'Europe si Google Photorealistic 3D reste indisponible.",
  },
  {
    id: "mapbox",
    label: "Mapbox",
    status: "planned",
    requiresPaidKey: true,
    description: "Option premium future pour styles proprietaires, geocoding et routage.",
  },
];
