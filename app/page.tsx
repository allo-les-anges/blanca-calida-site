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

type Property = any;

function HomeContent() {
  const router = useRouter();
  const searchParamsOrigin = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  
  const [mounted, setMounted] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [clientPin, setClientPin] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- LOGIQUE DE DÉTECTION DU PACK ---
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
        const res = await fetch("/api/properties");
        const data = await res.json();
        setAllProperties(data);
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [filters, setFilters] = useState({
    type: "", town: "", region: "", beds: "",
    minPrice: "", maxPrice: "", reference: "", development: "", availableOnly: false,
  });

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      const matchDev = !filters.development || p.development_name?.toLowerCase().trim() === filters.development.toLowerCase().trim();
      const matchTown = !filters.town || p.town === filters.town;
      const matchRegion = !filters.region || p.region === filters.region;
      const matchType = !filters.type || p.type?.toLowerCase().includes(filters.type.toLowerCase());
      const matchBeds = !filters.beds || Number(p.beds) >= Number(filters.beds);
      const price = Number(p.price);
      const matchMin = !filters.minPrice || price >= Number(filters.minPrice);
      const matchMax = !filters.maxPrice || price <= Number(filters.maxPrice);
      const matchRef = !filters.reference || p.ref?.toLowerCase().includes(filters.reference.toLowerCase());
      return matchDev && matchTown && matchRegion && matchType && matchBeds && matchMin && matchMax && matchRef;
    });
  }, [allProperties, filters]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== false);
  const propertiesToShow = hasActiveFilters ? filteredProperties : filteredProperties.slice(0, visibleCount);

  const handleSearch = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, region: "" });
    setVisibleCount(12);
    setIsSearchOpen(false);
    const section = document.getElementById("collection");
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleRegionClick = (regionName: string) => {
    setFilters({ type: "", town: "", region: regionName, beds: "", minPrice: "", maxPrice: "", reference: "", development: "", availableOnly: false });
    setVisibleCount(12);
    const section = document.getElementById("collection");
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  if (!mounted) return null;

  // Couleurs dynamiques selon le mode Light ou Dark
  const bgColor = isLight ? 'bg-white' : 'bg-[#020617]';
  const sectionBg = isLight ? 'bg-slate-50' : 'bg-[#0F172A]/40';
  const textColor = isLight ? 'text-slate-900' : 'text-white';
  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] mb-8" size={48} />
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37] animate-pulse">
          {t('home.loading.amaruExcellence')}
        </span>
      </div>
    );
  }

  return (
    <main className={`min-h-screen selection:bg-[#D4AF37]/30 font-sans overflow-x-hidden transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-[#020617]'}`}>
      <Navbar />
      
      {/* SECTION HERO */}
      <div className={`relative h-[80vh] flex flex-col items-center justify-center transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-[#020617]'}`}>
        <Hero />
        
        {/* BOUTON RECHERCHE */}
        <div className="absolute bottom-[12%] z-40">
           {!isSearchOpen && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-5 transition-all duration-700 ease-in-out"
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
        <section className={`max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12 ${bgColor}`}>
          <div className={`${sectionBg} p-6 sm:p-8 md:p-12 lg:p-20 border border-slate-200 dark:border-white/5 relative overflow-hidden`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">{t('home.ownerSection.badge')}</span>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight italic ${textColor}`}>
                  {t('home.ownerSection.title')} <br className="hidden sm:block" />
                  <span className="text-[#D4AF37] not-italic font-sans font-extrabold tracking-tighter text-xl sm:text-2xl md:text-3xl lg:text-5xl uppercase block sm:inline">{t('home.ownerSection.subtitle')}</span>
                </h2>
                <p className={`text-sm sm:text-base font-light leading-relaxed max-w-md mx-auto lg:mx-0 border-l border-slate-200 dark:border-white/10 pl-4 sm:pl-6 italic opacity-90 ${mutedText}`}>
                  {t('home.ownerSection.description')}
                </p>
              </div>
              <div className={`p-6 sm:p-8 md:p-10 border border-slate-200 dark:border-[#D4AF37]/20 shadow-xl max-w-md mx-auto w-full lg:mx-0 ${isLight ? 'bg-white' : 'bg-[#020617]'}`}>
                <form className="space-y-6 sm:space-y-8">
                  <input type="password" placeholder={t('home.ownerSection.pinPlaceholder')} className={`w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 sm:py-4 text-center text-xl sm:text-2xl font-black tracking-[0.6em] outline-none focus:border-[#D4AF37] transition-all ${textColor}`} />
                  <button type="submit" className="w-full bg-[#D4AF37] text-black py-4 sm:py-5 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-4">
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
          <PropertyGrid activeFilters={filters} properties={propertiesToShow} />
        </div>
      </section>

      {/* SECTION LEAD MAGNET (Spécifique Mode Light) */}
      {isLight && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-black text-white p-12 md:p-20 text-center space-y-8">
            <Mail className="mx-auto text-[#D4AF37]" size={40} />
            <h2 className="text-3xl md:text-5xl font-serif italic">Recevez notre sélection Off-Market</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm uppercase tracking-widest leading-relaxed">Inscrivez-vous pour accéder aux propriétés avant leur publication officielle.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto pt-4">
              <input type="email" placeholder="VOTRE EMAIL" className="bg-transparent border border-white/20 px-6 py-4 outline-none focus:border-[#D4AF37] transition-all flex-1 text-[10px] tracking-widest text-white" />
              <button className="bg-[#D4AF37] text-black px-8 py-4 font-bold text-[10px] tracking-widest uppercase hover:bg-white transition-all">S'inscrire</button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE RECHERCHE */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/95 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
        <div className={`relative w-full max-w-5xl rounded-none overflow-hidden shadow-2xl transition-transform duration-500 ${isSearchOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'} ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-5 right-5 w-10 h-10 bg-black text-[#D4AF37] rounded-none flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-all z-50"><X size={20} /></button>
          <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto">
            <AdvancedSearch properties={allProperties} onSearch={handleSearch} activeFilters={filters} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// EXPORT AVEC SUSPENSE POUR VERCEL
export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div>}>
      <HomeContent />
    </Suspense>
  );
}