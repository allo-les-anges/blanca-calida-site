"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  activeFilters: any;
}

export default function PropertyGrid({ activeFilters }: PropertyGridProps) {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setAllProperties(data);
        setFiltered(data);
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- NORMALISATION ---
  const normalize = (v: any) =>
    typeof v === "string" ? v.trim().toLowerCase() : "";

  const getKindFromTitle = (p: any) =>
    p?.title ? p.title.split(" ")[0] : "";

  // --- FILTRAGE ---
  useEffect(() => {
    if (!allProperties.length) return;

    const f = activeFilters;

    const result = allProperties.filter((p) => {
      const pTown = normalize(p.town);
      const pType = normalize(getKindFromTitle(p));
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
      if (f.beds && p.features.beds < Number(f.beds)) return false;
      if (f.minPrice && pPrice < Number(f.minPrice)) return false;
      if (f.maxPrice && pPrice > Number(f.maxPrice)) return false;
      if (fRef && !pRef.includes(fRef)) return false;
      if (availableOnly && p.availability !== "available") return false;

      return true;
    });

    setFiltered(result);
  }, [activeFilters, allProperties]);

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 max-w-7xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="h-64 bg-gray-200 animate-pulse" />
            <div className="p-6 space-y-4">
              <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
