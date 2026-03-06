"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, MapPin, Home as HomeIcon, ChevronRight, 
  Loader2, Zap, ShieldCheck, ArrowRight, User, Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";

type Property = any;

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [clientPin, setClientPin] = useState("");

  const [filters, setFilters] = useState({
    type: "",
    town: "",
    region: "",
    beds: "",
    minPrice: "",
    maxPrice: "",
    reference: "",
    development: "",
    availableOnly: false,
  });

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

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      const matchDev = !filters.development || 
        p.development_name?.toLowerCase().trim() === filters.development.toLowerCase().trim();
      const hasUnits = p.units !== undefined ? Number(p.units) > 0 : true;
      const matchAvailable = !filters.availableOnly || hasUnits;
      const matchTown = !filters.town || p.town === filters.town;
      const matchRegion = !filters.region || p.region === filters.region;
      const matchType = !filters.type || 
        p.type?.toLowerCase().includes(filters.type.toLowerCase());
      const matchBeds = !filters.beds || Number(p.beds) >= Number(filters.beds);
      const price = Number(p.price);
      const matchMin = !filters.minPrice || price >= Number(filters.minPrice);
      const matchMax = !filters.maxPrice || price <= Number(filters.maxPrice);
      const matchRef = !filters.reference || 
        p.ref?.toLowerCase().includes(filters.reference.toLowerCase());

      return matchDev && matchAvailable && matchTown && matchRegion && matchType && matchBeds && matchMin && matchMax && matchRef;
    });
  }, [allProperties, filters]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== false);
  const propertiesToShow = hasActiveFilters ? filteredProperties : filteredProperties.slice(0, visibleCount);

  const handleSearch = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, region: "" });
    setVisibleCount(12);
    scrollToCollection();
  };

  const handleRegionClick = (regionName: string) => {
    setFilters({
      type: "", town: "", region: regionName, beds: "",
      minPrice: "", maxPrice: "", reference: "", development: "", availableOnly: false,
    });
    setVisibleCount(12);
    scrollToCollection();
  };

  const scrollToCollection = () => {
    const section = document.getElementById("collection");
    if (section) {
      setTimeout(() => { section.scrollIntoView({ behavior: "smooth" }); }, 100);
    }
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientPin.length >= 4) {
      localStorage.setItem("client_access_pin", clientPin);
      window.location.href = "/suivi-chantier"; // Redirection vers ta page de tracker
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-8" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse">Initialisation Amaru-Homes...</span>
      </div>
    );
  }

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* SECTION HERO AVEC OVERLAY SOMBRE */}
      <div className="relative">
        <Hero />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
        {/* BARRE DE RECHERCHE AVANCÉE (STYLE GLASSMORPHISM) */}
        <div className="bg-[#0F172A]/80 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <AdvancedSearch
            properties={allProperties}
            onSearch={handleSearch}
            activeFilters={filters}
          />
        </div>
      </div>

      {/* SECTION RÉGIONS (VIGNETTES) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em] whitespace-nowrap">Destinations Prisées</h2>
            <div className="h-px w-full bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
          </div>
          <RegionGrid
            properties={allProperties}
            onRegionClick={handleRegionClick}
          />
        </div>
      </section>

      {/* NOUVELLE SECTION : ESPACE PROPRIÉTAIRE (ACCÈS PIN) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#020617] p-12 md:p-20 rounded-[4rem] border border-white/5 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={300} className="text-emerald-500" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <span className="px-5 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase border border-emerald-500/20 tracking-[0.2em]">Service Exclusif</span>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                Votre projet <br /> <span className="text-emerald-500">en toute transparence</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                Chaque client Amaru-Homes bénéficie d'un accès privé pour suivre l'évolution de sa villa, les rapports d'experts et les documents légaux.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white italic">24/7</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Accès Cloud</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white italic">GPS</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Suivi Réel</span>
                </div>
              </div>
            </div>

            <div className="bg-black/40 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <User size={24} />
                 </div>
                 <div>
                   <h3 className="text-white font-black uppercase text-sm tracking-tight">Espace Propriétaire</h3>
                   <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Entrez votre code confidentiel</p>
                 </div>
               </div>

               <form onSubmit={handleClientLogin} className="space-y-6">
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••" 
                      value={clientPin}
                      onChange={(e) => setClientPin(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl text-center text-4xl font-black tracking-[0.5em] text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
                    />
                  </div>
                  <button className="w-full bg-white text-black py-7 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-white/5">
                    Se connecter au chantier <ArrowRight size={20} />
                  </button>
               </form>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LISTE DES BIENS */}
      <section id="collection" className="py-32 relative">
        {/* Décoration d'arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#10b98110_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-20 text-center space-y-6">
            <h3 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">
              {filters.region ? filters.region : "Collection Privée"}
            </h3>
            <div className="flex items-center justify-center gap-3 text-emerald-500 text-[11px] font-black uppercase tracking-[0.4em]">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {filteredProperties.length} Propriétés d'exception disponibles
            </div>
          </header>

          <div className="min-h-[400px]">
            <PropertyGrid activeFilters={filters} properties={propertiesToShow} />
          </div>

          {!hasActiveFilters && visibleCount < filteredProperties.length && (
            <div className="text-center mt-24">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="group relative px-16 py-8 bg-white/5 border border-white/10 text-white rounded-[2rem] uppercase text-[10px] tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all duration-700 overflow-hidden"
              >
                <span className="relative z-10">Explorer la suite de la collection</span>
                <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* STYLES GLOBAUX POUR LE DARK MODE */}
      <style jsx global>{`
        body { background-color: #020617; }
        .font-serif { font-family: var(--font-serif), serif; }
        
        /* Personnalisation de la Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
        ::-webkit-scrollbar-thumb:hover { background: #10b981; }

        /* Animation Smooth Scroll */
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}