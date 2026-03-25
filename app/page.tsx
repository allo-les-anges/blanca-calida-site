"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Loader2, ShieldCheck, ArrowRight, User, X, Mail
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

// --- COMPOSANT INTERNE POUR ISOLER LA LOGIQUE SEARCH ---
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

  // LOGIQUE DE DÉTECTION DU PACK
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

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientPin.length >= 4) {
      localStorage.setItem("temp_client_pin", clientPin);
      localStorage.setItem("login_mode", "client"); 
      router.push("/login"); 
    }
  };

  if (!mounted) return null;

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

  const isDark = resolvedTheme === "dark";

  return (
    <main className="min-h-screen selection:bg-[#D4AF37]/30 font-sans overflow-x-hidden transition-colors duration-500 bg-white dark:bg-[#020617]">
      <Navbar />
      
      {/* SECTION HERO */}
      <div className="relative h-[80vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <Hero />
        
        {/* BOUTON RECHERCHE */}
        <div className="absolute bottom-[12%] z-40">
           {!isSearchOpen && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-5 transition-all duration-700 ease-in-out"
             >
                <div className={`w-10 h-10 border border-[#D4AF37]/30 ${isLight ? 'group-hover:bg-black group-hover:border-black' : 'group-hover:bg-[#D4AF37]'} rounded-full flex items-center justify-center text-[#D4AF37] group-hover:text-white transition-all duration-500`}>
                  <Search size={16} strokeWidth={1.5} />
                </div>
                <span className="text-[11px] md:text-[13px] font-light uppercase tracking-[0.6em] transition-colors duration-500" style={{ color: isDark ? '#FFFFFF' : '#0f172a' }}>
                  {t('home.findVilla')}
                </span>
             </button>
           )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-[#020617] to-transparent pointer-events-none transition-colors duration-500" />
      </div>

      <ScrollingBanner />

      <section className="py-12 bg-white dark:bg-[#020617] transition-colors duration-500">
          <RegionGrid properties={allProperties} onRegionClick={handleRegionClick} />
      </section>

      {!isLight && (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white dark:bg-[#020617]">
          <div className="bg-slate-50 dark:bg-[#0F172A]/40 p-6 sm:p-8 md:p-12 lg:p-20 rounded-none border border-slate-200 dark:border-white/5 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">{t('home.ownerSection.badge')}</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight italic" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                  {t('home.ownerSection.title')} <br className="hidden sm:block" />
                  <span className="text-[#D4AF37] not-italic font-sans font-extrabold tracking-tighter text-xl sm:text-2xl md:text-3xl lg:text-5xl uppercase block sm:inline">{t('home.ownerSection.subtitle')}</span>
                </h2>
                <p className="text-sm sm:text-base font-light leading-relaxed max-w-md mx-auto lg:mx-0 border-l border-slate-200 dark:border-white/10 pl-4 sm:pl-6 italic opacity-90" style={{ color: isDark ? '#CBD5E1' : '#64748b' }}>
                  {t('home.ownerSection.description')}
                </p>
              </div>
              <div className="bg-white dark:bg-[#020617] p-6 sm:p-8 md:p-10 rounded-none border border-slate-200 dark:border-[#D4AF37]/20 shadow-xl max-w-md mx-auto w-full lg:mx-0">
                <form onSubmit={handleClientLogin} className="space-y-6 sm:space-y-8">
                  <input type="password" placeholder={t('home.ownerSection.pinPlaceholder')} value={clientPin} onChange={(e) => setClientPin(e.target.value)} className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 sm:py-4 text-center text-xl sm:text-2xl font-black tracking-[0.6em] sm:tracking-[0.8em] outline-none focus:border-[#D4AF37] transition-all" style={{ color: isDark ? '#FFFFFF' : '#0f172a' }} />
                  <button type="submit" className="w-full bg-[#D4AF37] text-black py-4 sm:py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-4">
                    {t('home.ownerSection.accessButton')} <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="collection" className="py-12 relative bg-white dark:bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12 text-center space-y-4">
            <h3 className="text-4xl md:text-6xl font-serif italic leading-none" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
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

      {isLight && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-black text-white p-12 md:p-20 text-center space-y-8">
            <Mail className="mx-auto text-[#D4AF37]" size={40} />
            <h2 className="text-3xl md:text-5xl font-serif italic">Recevez notre sélection Off-Market</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm uppercase tracking-widest leading-relaxed">Inscrivez-vous pour accéder aux propriétés avant leur publication officielle.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto pt-4">
              <input type="email" placeholder="VOTRE EMAIL" className="bg-transparent border border-white/20 px-6 py-4 outline-none focus:border-[#D4AF37] transition-all flex-1 text-[10px] tracking-widest" />
              <button className="bg-[#D4AF37] text-black px-8 py-4 font-bold text-[10px] tracking-widest uppercase hover:bg-white transition-all">S'inscrire</button>
            </div>
          </div>
        </section>
      )}

      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/95 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
        <div className={`relative w-full max-w-5xl bg-white dark:bg-[#0A0A0A] rounded-none overflow-hidden shadow-2xl transition-transform duration-500 ${isSearchOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
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

// --- COMPOSANT EXPORTÉ AVEC SUSPENSE ---
export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}