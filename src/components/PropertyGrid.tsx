"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "./PropertyCard";
import { SearchX } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";
import AmaruLoader from "@/components/AmaruLoader";

interface PropertyGridProps {
  activeFilters: any;
  properties: any[];
  isLight?: boolean; // Ajout de la prop pour TypeScript
}

const CITY_TO_REGION_MAP: Record<string, string> = {
  alicante: "Costa Blanca", benidorm: "Costa Blanca", altea: "Costa Blanca",
  calpe: "Costa Blanca", denia: "Costa Blanca", javea: "Costa Blanca",
  xabia: "Costa Blanca", moraira: "Costa Blanca", torrevieja: "Costa Blanca",
  orihuela: "Costa Blanca", "orihuela costa": "Costa Blanca", guardamar: "Costa Blanca",
  "santa pola": "Costa Blanca", finestrat: "Costa Blanca", villajoyosa: "Costa Blanca",
  polop: "Costa Blanca", elche: "Costa Blanca", "el campello": "Costa Blanca",
  busot: "Costa Blanca", "cumbre del sol": "Costa Blanca",
  marbella: "Costa del Sol", estepona: "Costa del Sol", mijas: "Costa del Sol",
  fuengirola: "Costa del Sol", benalmadena: "Costa del Sol", torremolinos: "Costa del Sol",
  malaga: "Costa del Sol", nerja: "Costa del Sol", casares: "Costa del Sol",
  manilva: "Costa del Sol", sotogrande: "Costa del Sol", "san pedro de alcantara": "Costa del Sol",
  benahavis: "Costa del Sol", cancelada: "Costa del Sol", "san roque": "Costa del Sol",
  murcia: "Costa Calida", cartagena: "Costa Calida", "los alcazares": "Costa Calida",
  "san javier": "Costa Calida", "san pedro del pinatar": "Costa Calida", mazarron: "Costa Calida",
  aguilas: "Costa Calida", "la manga": "Costa Calida", sucina: "Costa Calida",
  "bano y mendigo": "Costa Calida",
  almeria: "Costa Almeria", "roquetas de mar": "Costa Almeria", mojacar: "Costa Almeria",
  vera: "Costa Almeria", "san juan de los terreros": "Costa Almeria", pulpi: "Costa Almeria",
  "cuevas del almanzora": "Costa Almeria"
};
const PROVINCE_TO_REGION_MAP: Record<string, string> = {
  alicante: "Costa Blanca",
  malaga: "Costa del Sol",
  cadiz: "Costa del Sol",
  murcia: "Costa Calida",
  almeria: "Costa Almeria"
};

function normalizeLocation(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    : "";
}

function getPropertyRegion(property: any) {
  const directRegion = property.region?.trim();
  if (directRegion) return directRegion;

  const city = normalizeLocation(property.town || property.ville);
  const province = normalizeLocation(property.province);
  return CITY_TO_REGION_MAP[city] || PROVINCE_TO_REGION_MAP[province] || "";
}

function parsePropertyPrice(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;

  const digitsOnly = value.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
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
      const matchRegion = !activeFilters.region || getPropertyRegion(p) === activeFilters.region;
      const matchBeds = !activeFilters.beds || Number(p.beds) >= Number(activeFilters.beds);
      const matchBaths = !activeFilters.baths || Number(p.baths) >= Number(activeFilters.baths);
      const matchSurface = !activeFilters.surfaceMin || Number(p.surface_built || p.surface_area?.built || 0) >= Number(activeFilters.surfaceMin);
      const matchPool = !activeFilters.pool || p.pool === "Oui" || p.pool === true || p.pool === "1";
      const price = parsePropertyPrice(p.price || p.prix);
      const matchMin = !activeFilters.minPrice || price >= Number(activeFilters.minPrice);
      const matchMax = !activeFilters.maxPrice || price <= Number(activeFilters.maxPrice);
      const matchRef = !activeFilters.reference || p.ref?.toLowerCase().includes(activeFilters.reference.toLowerCase());
      return matchType && matchTown && matchRegion && matchMin && matchMax && matchBeds && matchBaths && matchSurface && matchPool && matchRef;
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
        <AmaruLoader className="py-40" isLight={!isDarkVisual} label={t('home.loading.updating')} />
      ) : filtered.length === 0 && !isAnimating ? (
        <div className="flex flex-col items-center justify-center py-24 md:py-40 px-6 space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-none bg-[#D8C9B6]/10 flex items-center justify-center border border-[#D8C9B6]/20">
            <SearchX size={32} className="text-[#D8C9B6] opacity-60" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-[#D8C9B6] text-[10px] font-bold uppercase tracking-[0.4em]">
              {t('home.collection.noMatch')}
            </p>
            <p 
              className="font-serif italic text-xl md:text-2xl leading-relaxed"
              style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
            >
              {t('home.collection.noMatchDescription')}
            </p>
            <p className="text-slate-500 text-sm font-light italic">
              {t('home.collection.tryWider')}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-[10px] uppercase font-bold tracking-widest border-b border-[#D8C9B6] pb-1 hover:text-[#D8C9B6] transition-all"
            style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
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
