"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[]; // 👉 On reçoit les propriétés depuis Home
}

export default function PropertyGrid({ activeFilters, properties }: PropertyGridProps) {
  const [filtered, setFiltered] = useState<any[]>([]);

  // --- NORMALISATION ---
  const normalize = (v: any) =>
    typeof v === "string" ? v.trim().toLowerCase() : "";

  const getKindFromTitle = (p: any) =>
    p?.title ? p.title.split(" ")[0] : "";

  // --- FILTRAGE ---
  useEffect(() => {
    if (!properties.length) return;

    const f = activeFilters;

    const result = properties.filter((p) => {
      const pTown = normalize(p.town);
      const pType = normalize(p.type); // 👉 ton XML a <type>
      const pRef = normalize(p.ref);
      const pPrice = Number(p.price);

      const fTown = normalize(f.town);
      const fType = normalize(f.type);
      const fRef = normalize(f.reference);
      const fDev = f.development;
      const availableOnly = f.availableOnly;

      if (fTown && pTown !== fTown) return false;
      if (fType && pType !== fType) return false;
      if (fDev && p.development_name !== fDev) return false;
      if (f.beds && p.beds < Number(f.beds)) return false;
      if (f.minPrice && pPrice < Number(f.minPrice)) return false;
      if (f.maxPrice && pPrice > Number(f.maxPrice)) return false;
      if (fRef && !pRef.includes(fRef)) return false;
      if (availableOnly && p.availability !== "available") return false;

      return true;
    });

    setFiltered(result);
  }, [activeFilters, properties]);

  // --- AUCUN RÉSULTAT ---
  if (!filtered.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="font-serif text-2xl text-brand-primary mb-4">
          Aucun résultat
        </p>
        <p className="text-sm">
          Essayez d’élargir vos critères de recherche.
        </p>
      </div>
    );
  }

  // --- AFFICHAGE DES PROPRIÉTÉS ---
  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
      {filtered.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
