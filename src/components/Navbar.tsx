"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, Search,
  Home, MapPin, Euro, BedDouble, Bath, Building2, CheckCircle2
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  // --- ÉTATS ---
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

  const langMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  // --- DONNÉES FILTRES ---
  const regions = ["Costa Blanca", "Costa Calida", "Costa Almeria", "Costa del Sol"];
  const propertyTypes = ["Villa", "Appartement", "Penthouse", "Terrain", "Commerce"];
  const features = ["Piscine", "Vue Mer", "Garage", "Jardin", "Neuf", "Solarium"];

  // --- LOGIQUE AUTH & SCROLL ---
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
  }, [pathname]);

  // --- ACTIONS ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("client_access_pin");
    setClientPin(null);
    setUser(null);
    router.push('/');
  };

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
  const showStickyCashback = !isHomePage && pathname !== "/cashback-info";

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
        input[type='range']::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; background: #D4AF37; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer;
        }
      `}</style>

      {showStickyCashback && (
        <a href="/contact-cashback" className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-[#D4AF37] text-black px-3 py-6 rounded-l-2xl shadow-2xl transition-all flex flex-col items-center gap-3 border-l border-white/10" style={{ writingMode: 'vertical-rl' }}>
          <Gift size={18} className="rotate-90 mb-2" />
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Cashback</span>
        </a>
      )}

      {/* NAVBAR PRINCIPALE */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-[#020617] shadow-xl border-b border-white/5" : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          
          <Link href="/" className="z-[110] flex flex-col items-start group">
            <span className="text-3xl font-serif italic tracking-tighter text-white">Amaru</span>
            <span className="text-[#D4AF37] font-sans text-[10px] tracking-[0.4em] uppercase font-light -mt-1">Excellence</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-10 uppercase text-[10px] tracking-[0.4em] font-bold text-white/80">
            <div className="relative group py-4" ref={regionMenuRef}>
              <button onMouseEnter={() => setShowRegionMenu(true)} className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors">
                Destinations <ChevronDown size={10} className={showRegionMenu ? "rotate-180" : ""} />
              </button>
              {showRegionMenu && (
                <div onMouseLeave={() => setShowRegionMenu(false)} className="absolute top-full left-0 mt-0 bg-[#020617] border border-white/10 rounded-xl p-4 min-w-[200px]">
                  {regions.map((reg) => (
                    <Link key={reg} href={`/search?region=${reg}`} className="block py-3 text-slate-400 hover:text-[#D4AF37] border-b border-white/5 last:border-0 transition-colors uppercase tracking-[0.2em] text-[9px]">
                      {reg}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/proprietes" className="hover:text-[#D4AF37] transition-colors">Propriétés</Link>
            <Link href="/confidentiel" className="hover:text-[#D4AF37] transition-colors">Confidentiel</Link>
          </div>

          <div className="flex items-center space-x-6 z-[110]">
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-white">
                <Globe size={14} className="text-[#D4AF37]" /> <span>{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-4 bg-[#020617] border border-white/10 rounded-xl p-2 min-w-[140px]">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 text-slate-300 hover:text-[#D4AF37] transition-colors">
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setIsSearchModalOpen(true)} className="lg:hidden p-3 bg-white/10 rounded-full text-[#D4AF37] border border-white/10">
              <Search size={20} />
            </button>

            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2">
              <Menu size={28} />
            </button>

            {(user || clientPin) ? (
              <Link href="/project-tracker" className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl bg-[#009664] text-white shadow-lg shadow-[#009664]/20">
                <LayoutDashboard size={14} /> <span>Mon Projet</span>
              </Link>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black transition-all">
                <User size={14} /> <span>Accès Client</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- RECHERCHE BOTTOM SHEET (LE STYLE MODERNE CORRIGÉ) --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-xl sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh]">
            
            {/* Header Fixe avec bouton X bien dégagé */}
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h3 className="text-xl font-serif italic text-slate-900">Recherche Avancée</h3>
                <span className="text-[#D4AF37] text-[8px] uppercase tracking-[0.3em] font-black">Trouvez votre résidence d'exception</span>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="w-12 h-12 bg-[#020617] text-[#D4AF37] rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl">
                <X size={24} />
              </button>
            </div>

            {/* Corps Scrollable avec TOUS les filtres */}
            <div className="p-8 overflow-y-auto space-y-10 pb-32">
              
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Référence Propriété</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                  <input type="text" placeholder="Ex: REF-1234" className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] text-slate-900 font-medium" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Programme / Développement</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                  <input type="text" placeholder="Nom du projet..." className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] text-slate-900 font-medium" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Région (Espagne)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                  <select className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl outline-none appearance-none text-slate-900 font-medium">
                    <option>Espagne (Toutes)</option>
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Type de bien</label>
                <div className="grid grid-cols-2 gap-3">
                  {propertyTypes.map(type => (
                    <button key={type} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all">
                      <Home size={16} className="text-[#D4AF37]" />
                      <span className="text-xs font-bold text-slate-700">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Budget Max</label>
                  <span className="text-[#D4AF37] font-serif italic text-lg tracking-tighter">2.500.000 €</span>
                </div>
                <input type="range" min="100000" max="10000000" step="100000" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Chambres</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1">
                    {[1, 2, 3, '4+'].map(n => <button key={n} className="flex-1 py-3 text-xs font-bold rounded-xl hover:bg-slate-50">{n}</button>)}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Salles de bain</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1">
                    {[1, 2, '3+'].map(n => <button key={n} className="flex-1 py-3 text-xs font-bold rounded-xl hover:bg-slate-50">{n}</button>)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Prestations</label>
                <div className="flex flex-wrap gap-2">
                  {features.map(f => (
                    <button key={f} className="px-4 py-2 rounded-full border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">+ {f}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border-t border-slate-100 shrink-0">
              <button className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3">
                <Search size={18} /> Afficher les résultats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MENU MOBILE LATÉRAL --- */}
      <div className={`fixed inset-0 z-[200] transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-[#020617] backdrop-blur-2xl" />
        <div className="relative h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex flex-col">
              <span className="text-2xl font-serif italic text-white">Amaru</span>
              <span className="text-[#D4AF37] text-[8px] tracking-[0.4em] uppercase">Excellence</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-white"><X size={28} /></button>
          </div>
          <nav className="flex flex-col space-y-8 text-3xl font-serif italic text-white mb-10">
            <Link href="/">Accueil</Link>
            <Link href="/proprietes">Propriétés</Link>
            <Link href="/confidentiel">Confidentiel</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="mt-auto space-y-4">
            <button onClick={() => {setIsMobileMenuOpen(false); setIsLoginModalOpen(true);}} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
              <User size={16} /> Accès Client
            </button>
            <div className="flex justify-center gap-6 pt-4 border-t border-white/5">
              {languages.map(l => (
                <button key={l.code} onClick={() => changeLanguage(l.code)} className={`text-[10px] font-bold ${currentLang === l.code.toUpperCase() ? 'text-[#D4AF37]' : 'text-slate-500'}`}>{l.code.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL LOGIN PIN --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-6">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[3rem] p-12 shadow-2xl relative border border-white/5 animate-in zoom-in duration-300">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24}/></button>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20"><Lock size={28}/></div>
              <h2 className="text-2xl font-serif text-white italic">Accès Privé</h2>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="PIN" className="w-full bg-black/40 border border-white/10 px-6 py-5 rounded-2xl outline-none text-center text-2xl tracking-[0.5em] font-black text-[#D4AF37] focus:border-[#D4AF37]/50" required />
              <button type="submit" disabled={authLoading} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3">
                {authLoading ? "Validation..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}