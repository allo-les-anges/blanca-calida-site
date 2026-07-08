/**
 * property/ — PropertyController (marker du bien, métadonnées, hauteur du terrain).
 *
 * Statut : PAS ENCORE EXTRAIT. Le rendu du marker du bien vit aujourd'hui dans
 * `renderPropertyMarker()` à l'intérieur de src/modules/lifestyle/poi/PoiRenderer.ts
 * (migré tel quel depuis PoiEntityManager.ts), et la logique d'entité "propriété" côté
 * CesiumLifestyleViewerV7 vit dans `createPropertyEntity()` /
 * src/components/lifestyle/CesiumLifestyleViewerV7.tsx.
 *
 * Extraire un vrai PropertyController (indépendant du rendu POI) fait partie de l'étape 3
 * de la roadmap (consolidation des viewers) — non fait ici pour ne pas toucher au rendu
 * Cesium sans pouvoir le vérifier visuellement dans cet environnement.
 */
export {};
