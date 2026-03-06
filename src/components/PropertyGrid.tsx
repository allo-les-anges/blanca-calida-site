"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import { Loader2, SearchX } from "lucide-react";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[];
}

export default function PropertyGrid({ activeFilters, properties }: PropertyGridProps) {
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!properties) return;
    
    setIsAnimating(true);
    
    // Logique de filtrage robuste incluant la région
    const result = properties.filter((p) => {
      const matchType = !activeFilters.type || p.type?.toLowerCase().includes(activeFilters.type.toLowerCase());
      const matchTown = !activeFilters.town || p.town?.toLowerCase().includes(activeFilters.town.toLowerCase());
      const matchRegion = !activeFilters.region || p.region?.toLowerCase().includes(activeFilters.region.toLowerCase());
      const matchBeds = !activeFilters.beds || Number(p.beds) >= Number(activeFilters.beds);
      
      const price = Number(p.price || p.prix || 0);
      const matchMin = !activeFilters.minPrice || price >= Number(activeFilters.minPrice);
      const matchMax = !activeFilters.maxPrice || price <= Number(activeFilters.maxPrice);
      
      const matchRef = !activeFilters.reference || p.ref?.toLowerCase().includes(activeFilters.reference.toLowerCase());

      return matchType && matchTown && matchRegion && matchMin && matchMax && matchBeds && matchRef;
    });

    // Délai pour une transition fluide
    const timer = setTimeout(() => {
      setFiltered(result);
      setIsAnimating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeFilters, properties]);

  // ÉTAT DE CHARGEMENT / ANIMATION
  if (isAnimating && filtered.length === 0) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  // ÉTAT : AUCUN RÉSULTAT
  if (filtered.length === 0 && !isAnimating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 md:py-40 px-6 space-y-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
          <SearchX size={32} className="text-[#D4AF37] opacity-40" />
        </div>
        <div className="text-center space-y-3">
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Aucune correspondance</p>
          <p className="text-white font-serif italic text-xl md:text-2xl opacity-60 leading-relaxed">
            Nous n'avons pas trouvé de propriété <br className="hidden md:block" /> correspondant à vos critères actuels.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-[10px] uppercase font-bold tracking-widest text-white border-b border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
      <div className={`transition-all duration-700 ease-in-out ${isAnimating ? 'opacity-30 blur-sm scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>
        {/* GRID RESPONSIVE : 
            - 1 colonne sur mobile (gap-y-12)
            - 2 colonnes sur tablettes (gap-x-8)
            - 3 colonnes sur PC (gap-x-12 gap-y-24)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-24">
          {filtered.map((p, index) => (
            <div 
              key={p.id || p.id_externe || index}
              className="group animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}