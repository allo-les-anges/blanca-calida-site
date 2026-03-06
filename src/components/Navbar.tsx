"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, Search,
  Home, MapPin, Euro, BedDouble, Bath
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  // --- STATES ---
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); 
  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [clientPin, setClientPin] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // État pour le slider de prix
  const [maxPrice, setMaxPrice] = useState(2500000);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  const regions = [
    { name: "Costa Blanca", slug: "costa-blanca" },
    { name: "Costa Calida", slug: "costa-calida" },
    { name: "Costa Almeria", slug: "costa-almeria" },
    { name: "Costa del Sol", slug: "costa-del-sol" },
  ];

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" },
  ];

  // --- EFFETS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    checkUser();
    const savedPin = localStorage.getItem("client_access_pin");
    if (savedPin) setClientPin(savedPin);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
    setIsLoginModalOpen(false);
  }, [pathname]);

  // Fonction de traduction
  const changeLanguage = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(langCode.toUpperCase());
      setShowLangMenu(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('pin_code').eq('pin_code', passwordInput).maybeSingle();
    if (data) {
      localStorage.setItem("client_access_pin", data.pin_code);
      setClientPin(data.pin_code);
      setIsLoginModalOpen(false);
      setPasswordInput("");
      router.push('/project-tracker');
    } else {
      alert("Code PIN incorrect.");
    }
    setAuthLoading(false);
  };

  const isHomePage = pathname === "/";
  const isCashbackPage = pathname === "/cashback-info";
  const showStickyCashback = !isHomePage && !isCashbackPage;

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
        
        /* Personnalisation du slider */
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          background: #D4AF37;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          cursor: pointer;
        }
      `}</style>

      {/* NAVBAR PRINCIPALE */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-[#020617] shadow-xl border-b border-white/5" : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          
          <Link href="/" className="z-[110] flex flex-col items-start group">
            <span className="text-3xl font-serif italic tracking-tighter text-white">Amaru</span>
            <span className="text-[#D4AF37] font-sans text-[10px] tracking-[0.4em] uppercase font-light -mt-1">Excellence</span>
          </Link>

          <div className="flex items-center space-x-4 z-[110]">
            {/* Langues Desktop */}
            <div className="relative hidden md:block mr-4" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-white">
                <Globe size={14} className="text-[#D4AF37]" /> <span>{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-4 bg-[#020617] border border-white/10 rounded-xl p-2 min-w-[140px] shadow-2xl">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 text-slate-300 hover:text-[#D4AF37] transition-colors">
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="lg:hidden p-3 bg-white/10 rounded-full text-[#D4AF37] border border-white/10"
            >
              <Search size={20} />
            </button>

            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2">
              <Menu size={28} />
            </button>

            <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black transition-all">
              <User size={14} /> <span>Accès Client</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MODAL RECHERCHE AVANCÉE (STYLE BOTTOM SHEET) --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          
          <div className="relative bg-[#F8FAFC] w-full sm:max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh]">
            
            {/* Header Fixe */}
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif italic text-slate-900">Recherche</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">Trouvez votre villa idéale</p>
              </div>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="w-10 h-10 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu Scrollable */}
            <div className="p-8 overflow-y-auto space-y-8 pb-32">
              
              {/* Filtre : Référence */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                   <ShieldCheck size={14} className="text-[#D4AF37]"/> Référence
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: REF-1234" 
                  className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-slate-900 font-medium" 
                />
              </div>

              {/* Filtre : Région */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                   <MapPin size={14} className="text-[#D4AF37]"/> Région
                </label>
                <select className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none appearance-none text-slate-900 font-medium cursor-pointer">
                  <option>Espagne (Toutes)</option>
                  {regions.map(r => <option key={r.slug}>{r.name}</option>)}
                </select>
              </div>

              {/* Filtre : Type */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                   <Home size={14} className="text-[#D4AF37]"/> Type de propriété
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Villa', 'Appartement', 'Terrain', 'Penthouse'].map(type => (
                    <button key={type} className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* NOUVEAU Filtre : Chambres */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                   <BedDouble size={14} className="text-[#D4AF37]"/> Nombre de chambres
                </label>
                <div className="flex bg-white border border-slate-200 rounded-2xl p-1 gap-1">
                  {[1, 2, 3, 4, '5+'].map(n => (
                    <button key={n} className="flex-1 py-3 text-xs font-bold rounded-xl hover:bg-slate-900 hover:text-[#D4AF37] transition-all">
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre : Budget (SLIDER RÉALISTE) */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                    <Euro size={14} className="text-[#D4AF37]"/> Budget Max
                  </label>
                  <span className="text-lg font-serif italic text-slate-900">
                    {maxPrice.toLocaleString()} €
                  </span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="5000000" 
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]" 
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>100k€</span>
                  <span>5M€ +</span>
                </div>
              </div>

            </div>

            {/* Footer Fixe */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl"
              >
                Afficher les résultats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MENU MOBILE --- */}
      <div className={`fixed inset-0 z-[200] transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-[#020617] backdrop-blur-2xl" />
        <div className="relative h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex flex-col">
              <span className="text-2xl font-serif italic text-white">Amaru</span>
              <span className="text-[#D4AF37] text-[8px] tracking-[0.4em] uppercase">Excellence</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white w-10 h-10 flex items-center justify-center bg-white/10 rounded-full"><X size={24} /></button>
          </div>
          <nav className="flex flex-col space-y-8 text-2xl font-serif italic text-white">
            <Link href="/">Accueil</Link>
            <Link href="/proprietes">Propriétés</Link>
            <Link href="/confidentiel">Confidentiel</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          {/* Sélection Langue Mobile */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
            {languages.map(l => (
              <button 
                key={l.code} 
                onClick={() => changeLanguage(l.code)}
                className={`text-[10px] font-bold uppercase tracking-widest ${currentLang === l.code.toUpperCase() ? 'text-[#D4AF37]' : 'text-white/40'}`}
              >
                {l.code}
              </button>
            ))}
          </div>

          <div className="mt-auto pb-10">
            <button onClick={() => {setIsMobileMenuOpen(false); setIsLoginModalOpen(true);}} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
              <User size={16} /> Accès Client
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL LOGIN (PIN) --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-6">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative border border-white/5">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
            <div className="text-center mb-8">
              <h2 className="text-xl font-serif text-white italic">Accès Privé</h2>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="Votre Code PIN" 
                className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-xl outline-none text-center text-xl tracking-[0.3em] font-black text-[#D4AF37] focus:border-[#D4AF37]/50" 
                required 
              />
              <button type="submit" disabled={authLoading} className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all">
                {authLoading ? "Validation..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}