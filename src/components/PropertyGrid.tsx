"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "./PropertyCard";
import { Loader2, SearchX } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[];
  isLight?: boolean; // Ajout de la prop pour TypeScript
}

export default function PropertyGrid({ 
  activeFilters, 
  properties, 
  isLight: isLightProp // On récupère la prop passée par le parent
}: PropertyGridProps) {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const searchParamsOrigin = useSearchParams();
  
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Détection combinée : prop du parent OU paramètre d'URL
  const isLight = isLightProp || searchParamsOrigin.get('pack') === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Sécurité : si properties n'est pas un tableau, on ne fait rien pour éviter le crash .filter
    if (!properties || !Array.isArray(properties)) {
      setFiltered([]);
      return;
    }

    setIsAnimating(true);
    
    const result = properties.filter((p) => {
      if (!p) return false;
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

  // Logique visuelle pour le texte (Blanc si Dark pur, Noir si Light ou pack=light)
  const isDarkVisual = resolvedTheme === "dark" && !isLight;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-0 transition-colors duration-500">
      
      {isAnimating && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
            {t('home.loading.updating')}
          </p>
        </div>
      ) : filtered.length === 0 && !isAnimating ? (
        <div className="flex flex-col items-center justify-center py-24 md:py-40 px-6 space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-none bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
            <SearchX size={32} className="text-[#D4AF37] opacity-60" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">
              {t('home.collection.noMatch')}
            </p>
            <p 
              className="font-serif italic text-xl md:text-2xl leading-relaxed"
              style={{ color: isDarkVisual ? '#FFFFFF' : '#0F172A' }}
            >
              {t('home.collection.noMatchDescription')}
            </p>
            <p className="text-slate-500 text-sm font-light italic">
              {t('home.collection.tryWider')}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-[10px] uppercase font-bold tracking-widest border-b border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-all"
            style={{ color: isDarkVisual ? '#FFFFFF' : '#0F172A' }}
          >
            {t('home.collection.reset')}
          </button>
        </div>
      ) : (
        <div className={`transition-all duration-700 ease-in-out ${isAnimating ? 'opacity-30 blur-sm scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-20">
            {filtered.map((p, index) => (
              <div 
                key={p.id || index}
                className="group animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards rounded-none overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <PropertyCard property={p} isLight={isLight} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}