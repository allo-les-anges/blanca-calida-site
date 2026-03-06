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
    
    // Logique de filtrage robuste
    const result = properties.filter((p) => {
      const matchType = !activeFilters.type || p.type?.toLowerCase().includes(activeFilters.type.toLowerCase());
      const matchTown = !activeFilters.town || p.town?.toLowerCase().includes(activeFilters.town.toLowerCase());
      const matchRegion = !activeFilters.region || p.region?.toLowerCase().includes(activeFilters.region.toLowerCase());
      
      const price = Number(p.price || p.prix || 0);
      const matchMin = !activeFilters.minPrice || price >= Number(activeFilters.minPrice);
      const matchMax = !activeFilters.maxPrice || price <= Number(activeFilters.maxPrice);
      
      return matchType && matchTown && matchRegion && matchMin && matchMax;
    });

    // Petit délai pour une transition fluide lors du changement de filtres
    const timer = setTimeout(() => {
      setFiltered(result);
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeFilters, properties]);

  // ÉTAT : AUCUN RÉSULTAT
  if (filtered.length === 0 && !isAnimating) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
          <SearchX size={32} className="text-[#D4AF37] opacity-40" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Aucune correspondance</p>
          <p className="text-white font-serif italic text-2xl opacity-60">
            Nous n'avons pas trouvé de bien <br /> correspondant à ces critères.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-[9px] uppercase font-black tracking-widest text-white border-b border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors"
        >
          Réinitialiser la recherche
        </button>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-700 ${isAnimating ? 'opacity-30 blur-sm scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
        {filtered.map((p, index) => (
          <div 
            key={p.id || p.id_externe || index}
            className="group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <PropertyCard property={p} />
          </div>
        ))}
      </div>
    </div>
  );
}