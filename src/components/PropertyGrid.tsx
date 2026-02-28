"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[];
}

export default function PropertyGrid({ activeFilters, properties }: PropertyGridProps) {
  const [filtered, setFiltered] = useState<any[]>([]);

  // Fonction pour nettoyer les chaînes de caractères (casse et espaces)
  const normalize = (v: any) =>
    typeof v === "string" ? v.trim().toLowerCase() : "";

  useEffect(() => {
    if (!properties.length) {
      setFiltered([]);
      return;
    }

    const f = activeFilters;

    const result = properties.filter((p) => {
      // Préparation des données de la propriété
      const pTown = normalize(p.town || p.ville);
      const pType = normalize(p.type);
      const pRef = normalize(p.ref || p.id_externe);
      const pPrice = Number(p.price || p.prix);
      const pBeds = Number(p.beds || 0);
      // On s'assure que la surface est traitée comme un nombre pour d'éventuels filtres
      const pSurface = Number(p.surface_built || 0);

      // Préparation des filtres actifs
      const fTown = normalize(f.town);
      const fType = normalize(f.type);
      const fRef = normalize(f.reference);

      // Logique de filtrage
      if (fTown && !pTown.includes(fTown)) return false;
      if (fType && pType !== fType) return false;
      if (fRef && !pRef.includes(fRef)) return false;

      // Filtre Chambres
      if (f.beds && pBeds < Number(f.beds)) return false;

      // Filtre Prix (Min/Max)
      if (f.minPrice && pPrice < Number(f.minPrice)) return false;
      if (f.maxPrice && pPrice > Number(f.maxPrice)) return false;

      // Optionnel : Si vous ajoutez un filtre de surface dans le futur
      if (f.minSurface && pSurface < Number(f.minSurface)) return false;

      return true;
    });

    setFiltered(result);
  }, [activeFilters, properties]);

  // État vide si aucun résultat ne correspond aux filtres
  if (!filtered.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="font-serif text-2xl text-slate-800 mb-4">
          Aucun résultat trouvé
        </p>
        <p className="text-sm">Essayez de modifier vos critères de recherche ou d'élargir la zone géographique.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-20">
      {filtered.map((p) => (
        <PropertyCard key={p.id || p.id_externe} property={p} />
      ))}
    </div>
  );
}