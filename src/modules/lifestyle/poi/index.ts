/**
 * poi/ — état + rendu des points d'intérêt dans la scène Cesium.
 *
 * PoiRenderer.ts : migré tel quel depuis src/components/lifestyle/PoiEntityManager.ts
 * (renommé pour refléter son rôle réel : rendu par primitives Cesium, pas de state React).
 *
 * TODO (prochaine étape, hors scope de cette migration) : un PoiController dédié pour
 * l'état (sélection, catégorie active, filtre) n'existe pas encore — cette logique vit
 * aujourd'hui directement dans CesiumLifestyleViewerV7.tsx (useState locaux). À extraire
 * lors de la décomposition du viewer (roadmap LifestyleExplorerV8.md, étape 3).
 */
export * from "./PoiRenderer";
