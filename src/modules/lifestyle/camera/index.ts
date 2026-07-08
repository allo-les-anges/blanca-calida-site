/**
 * camera/ — CameraController : mise en scène de la caméra Cesium.
 * Migré tel quel depuis src/components/lifestyle/CameraController.ts (aucun changement
 * de comportement, seuls les chemins d'import ont été mis à jour).
 *
 * discovery/ s'appuiera sur flyToPoi pour enchaîner les étapes du mode
 * "Discover the neighborhood" — pas de logique de vol de caméra à réimplémenter.
 */
export * from "./CameraController";
