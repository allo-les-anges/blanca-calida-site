/**
 * services/ — seule couche autorisée à appeler /api/lifestyle/*.
 * Aucun autre module (viewer, overlays, discovery, scoring...) ne doit faire de fetch()
 * direct vers un fournisseur externe ou vers l'API : tout passe par ici.
 *
 * Statut : poiService.ts est le seul service réel aujourd'hui (branché sur la route
 * /api/lifestyle/pois déjà existante). weatherService, walkscoreService,
 * transitService, etc. seront ajoutés au fur et à mesure que les routes serveur
 * correspondantes existeront (voir LifestyleExplorerV8.md, section 3).
 */
export * from "./poiService";
