"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[];
}

export default function PropertyGrid({ activeFilters, properties }: PropertyGridProps) {
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    if (!properties) return;
    
    // Logique de filtrage identique à ton code précédent
    const result = properties.filter((p) => {
      const matchType = !activeFilters.type || p.type?.toLowerCase().includes(activeFilters.type.toLowerCase());
      const matchTown = !activeFilters.town || p.town?.toLowerCase().includes(activeFilters.town.toLowerCase());
      const price = Number(p.price || p.prix || 0);
      const matchMin = !activeFilters.minPrice || price >= Number(activeFilters.minPrice);
      const matchMax = !activeFilters.maxPrice || price <= Number(activeFilters.maxPrice);
      
      return matchType && matchTown && matchMin && matchMax;
    });

    setFiltered(result);
  }, [activeFilters, properties]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 font-serif italic">
        Aucun bien ne correspond à vos critères.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
      {filtered.map((p) => (
        <PropertyCard key={p.id || p.id_externe} property={p} />
      ))}
    </div>
  );
}