"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, MapPin, Home as HomeIcon, ChevronRight, 
  Loader2, Zap, ShieldCheck, ArrowRight, User, Globe, X
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
  
  // NOUVEL ÉTAT POUR L'OUVERTURE DE LA RECHERCHE
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    setIsSearchOpen(false); // Ferme la barre après la recherche
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
      window.location.href = "/suivi-chantier";
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] mb-8" size={48} />
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37] animate-pulse">Amaru Homes Excellence...</span>
      </div>
    );
  }

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 selection:bg-[#D4AF37]/30 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* SECTION HERO */}
      <div className="relative">
        <Hero />
        
        {/* BOUTON DÉCLENCHEUR DE RECHERCHE (AU CENTRE DU HERO) */}
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
           {!isSearchOpen && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="pointer-events-auto group flex items-center gap-6 bg-[#020617]/40 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-full hover:border-[#D4AF37]/50 transition-all duration-500 shadow-2xl"
             >
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                  <Search size={20} />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em]">Trouver une villa</span>
                  <span className="block text-white font-serif italic text-lg leading-none">Lancer la recherche</span>
                </div>
             </button>
           )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none" />
      </div>

      {/* MODAL DE RECHERCHE (ANIMÉE) */}
      <div className={`max-w-7xl mx-auto px-6 relative z-50 transition-all duration-700 ease-in-out ${isSearchOpen ? 'opacity-100 -mt-40' : 'opacity-0 pointer-events-none mt-0'}`}>
        <div className="bg-[#0F172A]/90 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-[#D4AF37]/30 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative">
          
          {/* Bouton Fermer */}
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute -top-4 -right-4 w-10 h-10 bg-[#D4AF37] text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl z-50"
          >
            <X size={20} />
          </button>

          <AdvancedSearch
            properties={allProperties}
            onSearch={handleSearch}
            activeFilters={filters}
          />
        </div>
      </div>

      {/* SECTION RÉGIONS */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.6em]">Emplacements Prisés</h2>
            <div className="h-px w-24 bg-[#D4AF37] mx-auto opacity-50"></div>
          </div>
          <RegionGrid
            properties={allProperties}
            onRegionClick={handleRegionClick}
          />
        </div>
      </section>

      {/* SECTION : ESPACE PROPRIÉTAIRE */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#0F172A]/40 p-12 md:p-24 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-10%] right-[-5%] opacity-[0.03] pointer-events-none rotate-12">
            <ShieldCheck size={600} className="text-[#D4AF37]" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Propriétaires Amaru</span>
                <h2 className="text-5xl md:text-7xl font-serif text-white leading-[1.1] italic">
                  Suivez votre vision <br /> 
                  <span className="text-[#D4AF37] not-italic font-sans font-light tracking-tighter">en temps réel.</span>
                </h2>
              </div>
              
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-lg border-l border-white/10 pl-8">
                Un portail digital exclusif pour nos clients. Accédez aux rapports d'étape, documents juridiques et flux vidéo de votre future résidence.
              </p>

              <div className="flex items-center gap-12 pt-6">
                <div>
                  <span className="block text-2xl font-light text-white italic">01.</span>
                  <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-[0.2em]">Rapports</span>
                </div>
                <div>
                  <span className="block text-2xl font-light text-white italic">02.</span>
                  <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-[0.2em]">Direct</span>
                </div>
                <div>
                  <span className="block text-2xl font-light text-white italic">03.</span>
                  <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-[0.2em]">Juridique</span>
                </div>
              </div>
            </div>

            <div className="bg-[#020617]/80 p-12 rounded-[2rem] border border-[#D4AF37]/20 backdrop-blur-xl shadow-inner">
               <div className="text-center mb-12">
                  <User size={32} className="text-[#D4AF37] mx-auto mb-4 opacity-80" />
                  <h3 className="text-white font-serif text-2xl italic tracking-wide">Accès Résident</h3>
                  <div className="w-12 h-px bg-[#D4AF37]/30 mx-auto mt-2"></div>
               </div>

               <form onSubmit={handleClientLogin} className="space-y-8">
                  <div className="relative group">
                    <input 
                      type="password" 
                      placeholder="CODE PIN" 
                      value={clientPin}
                      onChange={(e) => setClientPin(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-6 text-center text-3xl font-light tracking-[1em] text-white outline-none focus:border-[#D4AF37] transition-all placeholder:text-slate-800 placeholder:tracking-widest"
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[#D4AF37] group-focus-within:w-full transition-all duration-700"></div>
                  </div>
                  <button className="w-full bg-[#D4AF37] text-black py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-all duration-500 flex items-center justify-center gap-4 group">
                    Entrer dans mon espace <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
               </form>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LISTE DES BIENS */}
      <section id="collection" className="py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#D4AF3708_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-24 text-center space-y-4">
            <h3 className="text-5xl md:text-8xl font-serif italic text-white leading-none">
              {filters.region ? filters.region : "Collection Privée"}
            </h3>
            <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.5em] flex items-center justify-center gap-4">
              <span className="w-8 h-px bg-[#D4AF37]/30"></span>
              {filteredProperties.length} Propriétés Sélectionnées
              <span className="w-8 h-px bg-[#D4AF37]/30"></span>
            </p>
          </header>

          <div className="min-h-[400px]">
            <PropertyGrid activeFilters={filters} properties={propertiesToShow} />
          </div>

          {!hasActiveFilters && visibleCount < filteredProperties.length && (
            <div className="text-center mt-32">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="group relative px-20 py-8 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full uppercase text-[10px] tracking-[0.5em] font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-700"
              >
                Découvrir la suite
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Inter:wght@300;400;700&display=swap');

        body { 
          background-color: #020617; 
          font-family: 'Inter', sans-serif;
        }
        
        .font-serif { 
          font-family: 'Cormorant Garamond', serif; 
        }

        h2, h3 {
          letter-spacing: -0.02em;
        }

        /* Scrollbar Gold */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }

        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}