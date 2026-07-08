/**
 * routing/ — calcul des temps à pied / voiture entre le bien et un POI.
 *
 * Statut : PAS ENCORE IMPLÉMENTÉ.
 * Aujourd'hui, l'estimation vit en dur dans src/components/lifestyle/lifestyleTypes.ts
 * (`estimatePoiMinutes`, formule à vol d'oiseau : distance / vitesse moyenne). C'est un
 * point de départ raisonnable pour la V8 (aucune dépendance externe), mais ce n'est pas un
 * vrai temps de trajet routier/piéton.
 *
 * Prochaine étape (Phase 3 de la roadmap produit) : décider si un vrai moteur de routing
 * (ex. OSRM auto-hébergé, ou un fournisseur tiers) est nécessaire, ou si l'estimation à vol
 * d'oiseau suffit pour la V8. Décision à prendre avant d'écrire du code ici.
 */
export {};
