"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // Importation du router
import { 
  Search, Loader2, ShieldCheck, ArrowRight, User, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";

type Property = any;

export default function Home() {
  const router = useRouter(); // Initialisation du router
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [clientPin, setClientPin] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    scrollToCollection();
  };

  const handleRegionClick = (regionName: string) => {
    setFilters({ type: "", town: "", region: regionName, beds: "", minPrice: "", maxPrice: "", reference: "", development: "", availableOnly: false });
    setVisibleCount(12);
    scrollToCollection();
  };

  const scrollToCollection = () => {
    const section = document.getElementById("collection");
    if (section) {
      setTimeout(() => { section.scrollIntoView({ behavior: "smooth" }); }, 100);
    }
  };

  // --- MODIFICATION ICI : REDIRECTION VERS LOGIN ---
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientPin.length >= 4) {
      // On stocke le PIN et on marque que c'est une tentative "Client"
      localStorage.setItem("temp_client_pin", clientPin);
      localStorage.setItem("login_mode", "client"); 
      
      // On envoie vers le dispatcher (Login)
      router.push("/login"); 
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] mb-8" size={48} />
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37] animate-pulse">AMARU EXCELLENCE...</span>
      </div>
    );
  }

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 selection:bg-[#D4AF37]/30 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* SECTION HERO */}
      <div className="relative h-[85vh] md:h-screen flex flex-col items-center justify-center">
        <Hero />
        
        {/* BOUTON DÉCLENCHEUR */}
        <div className="absolute bottom-[10%] md:bottom-[15%] z-40">
           {!isSearchOpen && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-4 md:gap-6 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 md:px-8 md:py-4 rounded-full hover:border-[#D4AF37]/50 transition-all duration-500 shadow-2xl"
             >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-black group-hover:rotate-90 transition-transform duration-500">
                  <Search size={16} />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] md:text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.3em]">Recherche Privée</span>
                  <span className="block text-white font-serif italic text-sm md:text-base tracking-wide">Trouver votre villa</span>
                </div>
             </button>
           )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none" />
      </div>

      {/* MODAL DE RECHERCHE */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all duration-500 ${isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
        
        <div className={`relative w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] transition-transform duration-500 ${isSearchOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 bg-[#020617] text-[#D4AF37] rounded-full flex items-center justify-center hover:scale-110 transition-transform z-50 shadow-lg"
          >
            <X size={20} />
          </button>

          <div className="p-6 md:p-12 max-h-[85vh] overflow-y-auto">
            <div className="mb-8 border-b border-slate-100 pb-6 hidden md:block">
              <h3 className="text-[#020617] font-serif text-3xl italic">Filtres de Sélection</h3>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Personnalisez votre recherche immobilière</p>
            </div>
            <AdvancedSearch
              properties={allProperties}
              onSearch={handleSearch}
              activeFilters={filters}
            />
          </div>
        </div>
      </div>

      {/* SECTION RÉGIONS */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24 space-y-4">
            <h2 className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.6em]">Destinations d'Exception</h2>
            <div className="h-px w-24 bg-[#D4AF37] mx-auto opacity-50"></div>
          </div>
          <RegionGrid properties={allProperties} onRegionClick={handleRegionClick} />
        </div>
      </section>

      {/* SECTION ESPACE PROPRIÉTAIRE */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="bg-[#0F172A]/40 p-8 md:p-24 rounded-[2.5rem] md:rounded-[4rem] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-10%] right-[-5%] opacity-[0.03] pointer-events-none rotate-12">
            <ShieldCheck size={600} className="text-[#D4AF37]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
            <div className="space-y-6 md:space-y-10">
              <div className="space-y-4 text-center lg:text-left">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Propriétaires Amaru</span>
                <h2 className="text-4xl md:text-7xl font-serif text-white leading-[1.1] italic">Suivez votre vision <br /> <span className="text-[#D4AF37] not-italic font-sans font-light tracking-tighter text-3xl md:text-6xl uppercase">en temps réel.</span></h2>
              </div>
              <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed max-w-lg border-l-0 lg:border-l border-white/10 pl-0 lg:pl-8 italic text-center lg:text-left">Accédez à votre cockpit de construction privé, partout dans le monde.</p>
            </div>
            <div className="bg-[#020617]/80 p-8 md:p-12 rounded-[2rem] border border-[#D4AF37]/20 backdrop-blur-xl">
               <form onSubmit={handleClientLogin} className="space-y-8 text-center">
                  <User size={32} className="text-[#D4AF37] mx-auto mb-2 opacity-80" />
                  <div className="relative group">
                    <input 
                      type="password" placeholder="CODE PIN" value={clientPin}
                      onChange={(e) => setClientPin(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-4 text-center text-2xl md:text-3xl font-light tracking-[0.8em] text-white outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#D4AF37] text-black py-5 md:py-6 rounded-full font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-4">
                    Accéder au chantier <ArrowRight size={18} />
                  </button>
               </form>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION COLLECTION */}
      <section id="collection" className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <header className="mb-16 md:mb-24 text-center space-y-4">
            <h3 className="text-5xl md:text-8xl font-serif italic text-white leading-none">
              {filters.region ? filters.region : "Portfolio Privé"}
            </h3>
            <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.5em] flex items-center justify-center gap-4">
               <span className="w-4 h-px bg-[#D4AF37]/40"></span>
               {filteredProperties.length} Propriétés Sélectionnées
               <span className="w-4 h-px bg-[#D4AF37]/40"></span>
            </p>
          </header>
          
          <div className="w-full">
            <PropertyGrid activeFilters={filters} properties={propertiesToShow} />
          </div>

          {!hasActiveFilters && visibleCount < filteredProperties.length && (
            <div className="text-center mt-24">
              <button onClick={() => setVisibleCount((prev) => prev + 12)} className="px-16 py-6 md:px-20 md:py-8 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full uppercase text-[10px] tracking-[0.5em] font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-500">
                Explorer plus
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Inter:wght@300;400;700&display=swap');
        
        body { 
          background-color: #020617; 
          font-family: 'Inter', sans-serif; 
          scroll-behavior: smooth;
        }
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }

        ${isSearchOpen ? 'body { overflow: hidden; }' : ''}
      `}</style>
    </main>
  );
}