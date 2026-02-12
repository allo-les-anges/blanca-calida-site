"use client";
import React, { useEffect, useState } from 'react';

export default function PropertyGrid({ activeFilters }: { activeFilters: any }) {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    console.log("⚙️ FILTRAGE EN COURS...", activeFilters);

    if (allProperties.length === 0) return;

    const result = allProperties.filter((p: any) => {
      // 1. Filtre Ville
      const matchTown = !activeFilters.town || 
        p.town?.toLowerCase().trim() === activeFilters.town.toLowerCase().trim();

      // 2. Filtre Type (Souple pour gérer Villa/Villas)
      const pType = (p.type || "").toLowerCase().trim();
      const fType = (activeFilters.type || "").toLowerCase().trim();
      const matchType = !fType || pType.includes(fType) || fType.includes(pType);

      // 3. Filtre Prix
      const pPrice = Number(p.price) || 0;
      const matchMinPrice = !activeFilters.minPrice || pPrice >= Number(activeFilters.minPrice);
      const matchMaxPrice = !activeFilters.maxPrice || pPrice <= Number(activeFilters.maxPrice);

      // 4. Filtre Référence
      const matchRef = !activeFilters.reference || 
        p.ref?.toLowerCase().includes(activeFilters.reference.toLowerCase().trim());

      return matchTown && matchType && matchMinPrice && matchMaxPrice && matchRef;
    });

    console.log("✅ FILTRAGE TERMINÉ - Trouvés:", result.length);
    setFilteredProps(result);
  }, [activeFilters, allProperties]);

  if (loading) return <div className="text-center py-20 uppercase tracking-widest animate-pulse">Chargement...</div>;

  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="mb-10 text-slate-400 text-[10px] uppercase font-bold">
        {filteredProps.length} résultats
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {filteredProps.map((prop: any) => (
          <div key={prop.id} className="border p-4">
             {/* Votre design de carte ici */}
             <p className="font-bold">{prop.town} - {prop.type}</p>
             <p>{prop.price} €</p>
          </div>
        ))}
      </div>
    </section>
  );
}