"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import { Loader2, SearchX } from "lucide-react";
import { useTheme } from "next-themes";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[];
}

export default function PropertyGrid({ activeFilters, properties }: PropertyGridProps) {
  const { resolvedTheme } = useTheme();
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!properties) return;
    
    setIsAnimating(true);
    
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

    const timer = setTimeout(() => {
      setFiltered(result);
      setIsAnimating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeFilters, properties]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 transition-colors duration-500">
      
      {/* ÉTAT DE CHARGEMENT */}
      {isAnimating && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
            Filtrage du Portfolio...
          </p>
        </div>
      ) : filtered.length === 0 && !isAnimating ? (
        /* ÉTAT VIDE */
        <div className="flex flex-col items-center justify-center py-24 md:py-40 px-6 space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/10">
            <SearchX size={32} className="text-[#D4AF37] opacity-60" />
          </div>
          <div className="text-center space-y-4">
            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.6em]">Aucun résultat</p>
            <h3 
              className="font-serif italic text-3xl md:text-5xl leading-tight"
              style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
            >
              Cette sélection est <br /> actuellement indisponible.
            </h3>
            <p 
              className="text-sm font-light italic opacity-60"
              style={{ color: isDark ? '#CBD5E1' : '#64748b' }}
            >
              Veuillez ajuster vos critères de recherche.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 text-[10px] uppercase font-bold tracking-[0.3em] px-8 py-4 border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black transition-all duration-500"
            style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
          >
            Réinitialiser
          </button>
        </div>
      ) : (
        /* GRILLE DE VIGNETTES RECTANGULAIRES */
        <div className={`transition-all duration-1000 ease-out ${isAnimating ? 'opacity-20 blur-xl scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 md:gap-y-24">
            {filtered.map((p, index) => (
              <div 
                key={p.id || p.id_externe || index}
                className="group relative animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-forwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Note : Pour que les vignettes soient parfaitement rectangulaires (paysage), 
                   assurez-vous que votre composant PropertyCard utilise un aspect-ratio 
                   de type aspect-[16/9] ou aspect-[3/2] sur son conteneur d'image.
                */}
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}