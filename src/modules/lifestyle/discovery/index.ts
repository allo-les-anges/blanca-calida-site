/**
 * discovery/ — mode "Discover the neighborhood" (Phase 5 de la roadmap).
 *
 * Statut : PAS ENCORE IMPLÉMENTÉ. CesiumLifestyleViewerV7.tsx a déjà un bouton
 * "Découvrir les lieux" / "Discover places" et un état isDiscovering, mais sans séquence
 * de visite réelle derrière (pas de script plage → golf → centre-ville → marina...).
 *
 * Ce module devra :
 * - construire une séquence ordonnée de POIs à visiter (dépend de scoring/ pour prioriser),
 * - piloter camera/CameraController.flyToPoi pour chaque étape,
 * - exposer un état play/pause/resume consommé par overlays/.
 * Aucune logique de vol de caméra à réimplémenter : CameraController couvre déjà le besoin.
 */
export {};
