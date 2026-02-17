"use client";
import React, { useEffect, useState } from 'react';

export default function PropertyGrid({ activeFilters }: { activeFilters: any }) {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalize = (v: any) => {
    if (!v) return "";
    if (Array.isArray(v)) v = v[0];
    return String(v).trim().toLowerCase();
  };

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setAllProperties(data);
        setFilteredProps(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (allProperties.length === 0) return;

    const result = allProperties.filter((p: any) => {
      const pTown = normalize(p.town);
      const pType = normalize(p.type_fr);   // 🔥 LE BON CHAMP
      const pRef  = normalize(p.reference);
      const pPrice = Number(p.price) || 0;

      const fTown = normalize(activeFilters.town);
      const fType = normalize(activeFilters.type);
      const fRef  = normalize(activeFilters.reference);

      if (fTown && pTown !== fTown) return false;
      if (fType && pType !== fType) return false;
      if (activeFilters.beds && Number(p.beds) < Number(activeFilters.beds)) return false;
      if (activeFilters.minPrice && pPrice < Number(activeFilters.minPrice)) return false;
      if (activeFilters.maxPrice && pPrice > Number(activeFilters.maxPrice)) return false;
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
              {prop.town} - {prop.type_fr}
            </p>
            <p>{prop.price} €</p>
            <p>Ref : {prop.reference}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
