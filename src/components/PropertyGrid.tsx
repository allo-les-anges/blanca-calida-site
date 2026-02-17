"use client";
import React, { useEffect, useState } from 'react';

export default function PropertyGrid({ activeFilters }: { activeFilters: any }) {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalisation (clé du problème)
  const normalize = (v: any) => {
    if (!v) return "";
    if (Array.isArray(v)) v = v[0];
    return String(v).trim().toLowerCase();
  };

  // Chargement initial
  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setAllProperties(data);
        setFilteredProps(data);
        setLoading(false);
      });
  }, []);

  // Logique de filtrage
  useEffect(() => {
    if (allProperties.length === 0) return;

    const result = allProperties.filter((p: any) => {
      const pTown = normalize(p.town);
      const pType = normalize(p.subtype);     // 🔥 CORRECTION ICI : subtype
      const pRef  = normalize(p.reference);
      const pPrice = Number(p.price) || 0;

      const fTown = normalize(activeFilters.town);
      const fType = normalize(activeFilters.type);
      const fRef  = normalize(activeFilters.reference);

      // 1. Ville
      if (fTown && pTown !== fTown) return false;

      // 2. Type (match strict)
      if (fType && pType !== fType) return false;

      // 3. Chambres
      if (activeFilters.beds && Number(p.beds) < Number(activeFilters.beds)) return false;

      // 4. Prix min
      if (activeFilters.minPrice && pPrice < Number(activeFilters.minPrice)) return false;

      // 5. Prix max
      if (activeFilters.maxPrice && pPrice > Number(activeFilters.maxPrice)) return false;

      // 6. Référence
      if (fRef && !pRef.includes(fRef)) return false;

      return true;
    });

    setFilteredProps(result);
  }, [activeFilters, allProperties]);

  if (loading) {
    return (
      <div className="text-center py-20 uppercase tracking-widest animate-pulse">
        Chargement...
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="mb-10 text-slate-400 text-[10px] uppercase font-bold">
        {filteredProps.length} résultats
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {filteredProps.map((prop: any) => (
          <div key={prop.id} className="border p-4">
            <p className="font-bold">
              {prop.town} - {prop.subtype /* 🔥 AFFICHAGE CORRIGÉ */}
            </p>
            <p>{prop.price} €</p>
            <p>Ref : {prop.reference}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
