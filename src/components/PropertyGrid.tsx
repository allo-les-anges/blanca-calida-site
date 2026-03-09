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
  const [mounted, setMounted] = useState(false);

  // Évite les erreurs d'hydratation et assure la détection du mode
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

  return (
    // On ajoute bg-white et dark:bg-transparent (ou la couleur de votre choix) pour suivre le thème global
    <div className="w-full max-w-7xl mx-auto px-4 md:px-0 transition-colors duration-500">
      <style jsx global>{`
        /* FORÇAGE DU TEXTE INTELLIGENT */
        .grid-smart-text {
          color: #1a1a1a !important;
          transition: color 0.5s ease;
        }

        :global(.dark) .grid-smart-text {
          color: #ffffff !important;
        }

        .grid-smart-subtext {
          color: #64748b !important;
        }

        :global(.dark) .grid-smart-subtext {
          color: #94a3b8 !important;
        }
      `}</style>

      {/* ÉTAT DE CHARGEMENT */}
      {isAnimating && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
            Mise à jour...
          </p>
        </div>
      ) : filtered.length === 0 && !isAnimating ? (
        /* ÉTAT VIDE */
        <div className="flex flex-col items-center justify-center py-24 md:py-40 px-6 space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
            <SearchX size={32} className="text-[#D4AF37] opacity-60" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Aucune correspondance</p>
            <p className="grid-smart-text font-serif italic text-xl md:text-2xl leading-relaxed">
              Nous n'avons pas trouvé de propriété <br className="hidden md:block" /> correspondant à vos critères.
            </p>
            <p className="grid-smart-subtext text-sm font-light italic">
              Essayez d'élargir vos filtres.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-[10px] uppercase font-bold tracking-widest grid-smart-text border-b border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-all"
          >
            Réinitialiser
          </button>
        </div>
      ) : (
        /* GRILLE DE CARTES */
        <div className={`transition-all duration-700 ease-in-out ${isAnimating ? 'opacity-30 blur-sm scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>
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
      )}
    </div>
  );
}