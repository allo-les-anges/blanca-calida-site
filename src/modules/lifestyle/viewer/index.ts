/**
 * viewer/ — bootstrap du moteur Cesium (Viewer, World Terrain, World Imagery, OSM Buildings).
 *
 * Statut de migration :
 * - coordinateUtils.ts : migré depuis src/components/lifestyle/coordinateUtils.ts (inchangé).
 * - providers/ : nouvelle abstraction Provider Strategy (voir providers/types.ts), pas encore
 *   branchée sur CesiumLifestyleViewerV7 — c'est l'étape suivante de la migration.
 * - Le bootstrap complet du Viewer (création de l'instance Cesium.Viewer, ajout des
 *   bâtiments OSM, cycle de vie/cleanup) vit encore dans
 *   src/components/lifestyle/CesiumLifestyleViewerV7.tsx. Le déplacer ici nécessite une
 *   validation visuelle (rendu WebGL, caméra, interactions) qui n'est pas possible dans cet
 *   environnement d'exécution ; il est donc volontairement laissé en place pour ne pas
 *   introduire de régression non vérifiable.
 */
export * from "./coordinateUtils";
export * from "./providers";
