"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Loader2, ArrowRight, X, Mail
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import ScrollingBanner from "@/components/ScrollingBanner";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import IntroGate from "@/components/IntroGate";

type Property = any;
const DEFAULT_MIN_PRICE = "500000";
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

function getPropertyRegion(property: Property) {
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

function HomeContent() {
  const router = useRouter();
  const searchParamsOrigin = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  
  const [mounted, setMounted] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- LOGIQUE DE DÉTECTION DU PACK ---
  // On vérifie l'URL et l'attribut HTML injecté par le serveur
  const isLight = searchParamsOrigin.get('pack') === 'light' || 
                  (typeof document !== 'undefined' && document.documentElement.getAttribute('data-package') === 'light');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "unset";
  }, [isSearchOpen]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties?minPrice=${DEFAULT_MIN_PRICE}&limit=96`);
        const data = await res.json();
        
        // CORRECTION : On s'assure que data est bien un tableau pour éviter "filter is not a function"
        if (data && Array.isArray(data)) {
          setAllProperties(data);
        } else {
          console.error("Format de données invalide reçu de l'API");
          setAllProperties([]);
        }
      } catch (err) {
        console.error("Erreur API:", err);
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [filters, setFilters] = useState({
    type: "", town: "", region: "", beds: "",
    minPrice: DEFAULT_MIN_PRICE, maxPrice: "", reference: "", development: "", availableOnly: false,
  });

  // CORRECTION : Sécurisation du filter
  const filteredProperties = useMemo(() => {
    const baseProps = Array.isArray(allProperties) ? allProperties : [];
    
    return baseProps.filter((p) => {
      if (!p) return false;
      const matchDev = !filters.development || p.development_name?.toLowerCase().trim() === filters.development.toLowerCase().trim();
      const matchTown = !filters.town || p.town === filters.town;
      const matchRegion = !filters.region || getPropertyRegion(p) === filters.region;
      const matchType = !filters.type || p.type?.toLowerCase().includes(filters.type.toLowerCase());
      const matchBeds = !filters.beds || Number(p.beds) >= Number(filters.beds);
      const price = parsePropertyPrice(p.price);
      const matchMin = !filters.minPrice || price >= Number(filters.minPrice);
      const matchMax = !filters.maxPrice || price <= Number(filters.maxPrice);
      const matchRef = !filters.reference || p.ref?.toLowerCase().includes(filters.reference.toLowerCase());
      return matchDev && matchTown && matchRegion && matchType && matchBeds && matchMin && matchMax && matchRef;
    });
  }, [allProperties, filters]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "minPrice") return value !== DEFAULT_MIN_PRICE;
    return value !== "" && value !== false;
  });
  const propertiesToShow = hasActiveFilters ? filteredProperties : filteredProperties.slice(0, visibleCount);

  const handleSearch = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, region: "" });
    setVisibleCount(12);
    setIsSearchOpen(false);
    const section = document.getElementById("collection");
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleRegionClick = (regionName: string) => {
    setFilters({ type: "", town: "", region: regionName, beds: "", minPrice: DEFAULT_MIN_PRICE, maxPrice: "", reference: "", development: "", availableOnly: false });
    setVisibleCount(12);
    const section = document.getElementById("collection");
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  if (!mounted) return null;

  // Couleurs dynamiques
  const bgColor = isLight ? 'bg-white' : 'bg-[#020617]';
  const textColor = isLight ? 'text-slate-900' : 'text-white';
  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  if (loading) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${isLight ? 'bg-white' : 'bg-[#020617]'}`}>
        <Loader2 className="animate-spin text-[#D4AF37] mb-8" size={48} />
        <span className={`text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse ${isLight ? 'text-black' : 'text-[#D4AF37]'}`}>
          {t('home.loading.amaruExcellence')}
        </span>
      </div>
    );
  }

  return (
    <main className={`min-h-screen selection:bg-[#D4AF37]/30 font-sans overflow-x-hidden transition-colors duration-500 ${bgColor}`}>
      <Navbar />
      
      {/* SECTION HERO */}
      <div className={`relative h-[80vh] flex flex-col items-center justify-center transition-colors duration-500 ${bgColor}`}>
        <Hero />
        <div className="absolute bottom-[12%] z-40">
           {!isSearchOpen && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-5 transition-all duration-700"
             >
                <div className={`w-10 h-10 border border-[#D4AF37]/30 ${isLight ? 'bg-black text-white' : 'bg-transparent text-[#D4AF37]'} rounded-full flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500`}>
                  <Search size={16} strokeWidth={1.5} />
                </div>
                <span className={`text-[11px] md:text-[13px] font-light uppercase tracking-[0.6em] transition-colors duration-500 ${textColor}`}>
                  {t('home.findVilla')}
                </span>
             </button>
           )}
        </div>
        <div className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t ${isLight ? 'from-white' : 'from-[#020617]'} to-transparent pointer-events-none transition-colors duration-500`} />
      </div>

      <ScrollingBanner />

      {/* GRILLE DES RÉGIONS */}
      <section className={`py-12 transition-colors duration-500 ${bgColor}`}>
          <RegionGrid properties={allProperties} onRegionClick={handleRegionClick} />
      </section>

      {/* SECTION ESPACE PROPRIÉTAIRE (Masquée en mode Light) */}
      {!isLight && (
        <section className={`max-w-[1600px] mx-auto px-4 py-12 ${bgColor}`}>
          <div className="bg-[#0F172A]/40 p-12 border border-white/5 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">{t('home.ownerSection.badge')}</span>
                <h2 className="text-4xl md:text-6xl font-serif italic text-white leading-tight">
                  {t('home.ownerSection.title')} <br />
                  <span className="text-[#D4AF37] not-italic font-sans font-extrabold text-3xl md:text-5xl uppercase">{t('home.ownerSection.subtitle')}</span>
                </h2>
              </div>
              <div className="p-10 border border-[#D4AF37]/20 bg-[#020617] shadow-xl">
                <form className="space-y-8">
                  <input type="password" placeholder={t('home.ownerSection.pinPlaceholder')} className="w-full bg-transparent border-b border-white/10 py-4 text-center text-2xl font-black tracking-[0.6em] outline-none focus:border-[#D4AF37] text-white" />
                  <button type="submit" className="w-full bg-[#D4AF37] text-black py-5 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-4">
                    {t('home.ownerSection.accessButton')} <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION COLLECTION */}
      <section id="collection" className={`py-12 relative transition-colors duration-500 ${bgColor}`}>
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12 text-center space-y-4">
            <h3 className={`text-4xl md:text-6xl font-serif italic leading-none ${textColor}`}>
              {filters.region ? filters.region : t('home.collection.title')}
            </h3>
            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4">
               <span className="w-4 h-px bg-[#D4AF37]/40"></span>
               {filteredProperties.length} {t('home.collection.propertiesSelected')}
               <span className="w-4 h-px bg-[#D4AF37]/40"></span>
            </p>
          </header>
          {/* On passe isLight au Grid pour les vignettes */}
          <PropertyGrid activeFilters={filters} properties={propertiesToShow} isLight={isLight} />
        </div>
      </section>

      {/* SECTION LEAD MAGNET (Spécifique Mode Light) */}
      {isLight && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-black text-white p-12 md:p-20 text-center space-y-8">
            <Mail className="mx-auto text-[#D4AF37]" size={40} />
            <h2 className="text-3xl md:text-5xl font-serif italic">Recevez notre sélection Off-Market</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm uppercase tracking-widest">Inscrivez-vous pour accéder aux propriétés avant leur publication officielle.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto pt-4">
              <input type="email" placeholder="VOTRE EMAIL" className="bg-transparent border border-white/20 px-6 py-4 outline-none focus:border-[#D4AF37] flex-1 text-[10px] tracking-widest text-white" />
              <button className="bg-[#D4AF37] text-black px-8 py-4 font-bold text-[10px] tracking-widest uppercase hover:bg-white transition-all">S'inscrire</button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE RECHERCHE */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
        <div className={`relative w-full max-w-5xl overflow-hidden shadow-2xl transition-all duration-500 ${isSearchOpen ? 'scale-100' : 'scale-95'} ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-5 right-5 w-10 h-10 bg-black text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-black z-50 transition-all"><X size={20} /></button>
          <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto">
            <AdvancedSearch properties={allProperties} onSearch={handleSearch} activeFilters={filters} isLight={isLight} />
          </div>
        </div>
      </div>

      <Footer isLight={isLight} />
    </main>
  );
}

export default function Home() {
  return (
    <>
      <IntroGate />
      <Suspense fallback={<div className="h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div>}>
        <HomeContent />
      </Suspense>
    </>
  );
}
