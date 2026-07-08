# src/modules/lifestyle

Architecture modulaire du Lifestyle Explorer (voir `LifestyleExplorerV8.md` à la racine du
dépôt pour le plan complet). État au {date de cette migration} :

| Module | Statut |
|---|---|
| `viewer/` | `coordinateUtils.ts` migré (inchangé). `providers/` : nouvelle abstraction Provider Strategy, prête mais pas encore branchée sur un viewer. Bootstrap complet du `Cesium.Viewer` encore dans `CesiumLifestyleViewerV7.tsx`. |
| `camera/` | `CameraController.ts` migré tel quel (fly-to property/overview/poi). |
| `poi/` | `PoiRenderer.ts` migré tel quel (ex-`PoiEntityManager.ts`, rendu par primitives Cesium). État/sélection pas encore extrait. |
| `property/` | Pas encore extrait — le marker du bien vit dans `poi/PoiRenderer.ts` (`renderPropertyMarker`) et dans `CesiumLifestyleViewerV7.tsx` (`createPropertyEntity`). |
| `routing/` | Pas implémenté. Estimation actuelle = vol d'oiseau (`lifestyleTypes.ts`). Décision produit en attente. |
| `discovery/` | Pas implémenté. Le bouton "Discover" existe déjà dans V7 sans séquence réelle derrière. |
| `overlays/` | Pas implémenté. `POISidebar/POIDetails/MiniMap` existants en préfigurent le rôle mais dépendent encore de l'ancien type `LifestylePoi`. |
| `weather/` | Pas implémenté — bloqué sur le choix de fournisseur. |
| `neighborhood/` | Pas implémenté. |
| `scoring/` | Pas implémenté — types prêts dans `types/score.ts`. |
| `services/` | `poiService.ts` : seul service réel, branché sur `/api/lifestyle/pois`. |
| `types/` | DTO unifiés (`Poi`, `LifestyleProperty`, `LifestyleScore`) — pas encore adoptés par les viewers existants. |

## Règle de dépendance

`viewer/camera/property/poi` ne connaissent que Cesium et les DTO de `types/`.
`overlays/weather/neighborhood/scoring/discovery` ne connaissent que les DTO et `services/`.
Aucun module ne fait de `fetch()` direct vers un fournisseur externe — uniquement vers
`/api/lifestyle/*` via `services/`.

## Ce qui n'a PAS été touché dans cette passe

`src/components/lifestyle/CesiumLifestyleViewer.tsx` (base), `CesiumLifestyleViewerV6.tsx`,
`CesiumLifestyleViewerV7.tsx` et `LifestyleExplorer.tsx` continuent de fonctionner exactement
comme avant (seuls leurs imports de `CameraController`/`PoiEntityManager`/`coordinateUtils`
ont été redirigés vers les nouveaux chemins). Décomposer le bootstrap de V7 dans
`viewer/camera/property/poi` est l'étape suivante ; elle touche à du rendu WebGL et à des
séquences d'initialisation asynchrones (terrain, imagerie, bâtiments OSM, caméra) qui ne
peuvent pas être validées visuellement dans cet environnement. Elle est donc volontairement
séquencée après une revue.
