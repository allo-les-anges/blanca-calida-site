/**
 * overlays/ — panneaux React superposés au viewer (Overview, Lifestyle, Amenities,
 * Transport, Education, Healthcare, Shopping, Sports, Climate, Investment — Phase 6).
 *
 * Statut : PAS ENCORE IMPLÉMENTÉ. Les composants existants (POISidebar.tsx, POIDetails.tsx,
 * MiniMap.tsx dans src/components/lifestyle/) préfigurent ce module mais dépendent encore
 * du type LifestylePoi couplé à l'icône (lifestyleTypes.ts) plutôt que du DTO unifié
 * (types/poi.ts). À reconnecter lors de la consolidation du viewer.
 *
 * Règle : chaque panneau ne lit que services/ (jamais de fetch direct), et un
 * PanelRegistry simple ({ id, label, icon, component }) permettra d'activer/désactiver des
 * panneaux sans toucher à l'orchestrateur (LifestyleExplorer.tsx).
 */
export {};
