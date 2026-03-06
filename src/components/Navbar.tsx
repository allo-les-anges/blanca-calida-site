"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, Search,
  Home, MapPin, Euro, BedDouble, Bath, Sparkles, Hash
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
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("client_access_pin");
    setClientPin(null);
    setUser(null);
    router.push('/');
  };

  const isHomePage = pathname === "/";
  const isCashbackPage = pathname === "/cashback-info";
  const showStickyCashback = !isHomePage && !isCashbackPage;

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
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

      {/* --- MODAL RECHERCHE AVANCÉE COMPLÈTE --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          
          <div className="relative bg-[#FDFDFD] w-full sm:max-w-xl sm:rounded-[3rem] rounded-t-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[94vh]">
            
            {/* HEADER FIXE (Bouton Fermer Isolé) */}
            <div className="bg-white px-8 py-7 border-b border-slate-100 flex justify-between items-center z-20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-serif italic text-slate-900 leading-none">Recherche Immobilière</h3>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-1">Filtres de sélection Prestige</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="w-12 h-12 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            {/* CORPS SCROLLABLE (TOUS LES FILTRES) */}
            <div className="p-8 overflow-y-auto space-y-10 pb-36">
              
              {/* 1. RÉFÉRENCE (Recherche Directe) */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                   <Hash size={14} className="text-[#D4AF37]"/> Référence du bien
                </label>
                <input 
                  type="text" 
                  placeholder="EX: AM-402" 
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-2xl outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-inner" 
                />
              </div>

              {/* 2. RÉGION (Destinations) */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                   <MapPin size={14} className="text-[#D4AF37]"/> Localisation
                </label>
                <div className="grid grid-cols-1 gap-3">
                   <select className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-2xl outline-none appearance-none text-slate-900 font-semibold cursor-pointer shadow-inner">
                      <option>Toutes les Destinations</option>
                      {regions.map(r => <option key={r.slug}>{r.name}</option>)}
                   </select>
                </div>
              </div>

              {/* 3. TYPE DE BIEN (Grid visuelle) */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                   <Home size={14} className="text-[#D4AF37]"/> Type de propriété
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Villa', 'Appartement', 'Penthouse', 'Terrain'].map(type => (
                    <button key={type} className="py-4 px-4 rounded-2xl border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. CHAMBRES & SALLES DE BAIN */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                    <BedDouble size={14} className="text-[#D4AF37]"/> Chambres
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl outline-none text-slate-900 font-bold shadow-inner">
                    <option>1+</option><option>2+</option><option>3+</option><option>4+</option><option>5+</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                    <Bath size={14} className="text-[#D4AF37]"/> S. de bain
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl outline-none text-slate-900 font-bold shadow-inner">
                    <option>1+</option><option>2+</option><option>3+</option><option>4+</option>
                  </select>
                </div>
              </div>

              {/* 5. BUDGET (Range stylisé) */}
              <div className="space-y-5 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                   <Euro size={14} className="text-[#D4AF37]"/> Budget Maximum
                </label>
                <input 
                  type="range" min="200000" max="10000000" step="100000"
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]" 
                />
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-slate-400">200.000 €</span>
                   <span className="text-sm font-black text-slate-900">1.500.000 €</span>
                   <span className="text-[10px] font-bold text-slate-400">10M € +</span>
                </div>
              </div>

              {/* 6. ÉTAT DU BIEN */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 flex items-center gap-2">
                   <Sparkles size={14} className="text-[#D4AF37]"/> État de construction
                </label>
                <div className="flex gap-3">
                   {['Neuf', 'Seconde Main'].map(status => (
                     <button key={status} className="flex-1 py-4 rounded-2xl border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all">
                       {status}
                     </button>
                   ))}
                </div>
              </div>

            </div>

            {/* BOUTON DE VALIDATION FIXÉ EN BAS */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-slate-100 flex gap-4 z-20">
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="w-full bg-slate-950 text-white py-6 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#D4AF37] hover:text-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
              >
                Lancer la recherche <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MENU MOBILE LATÉRAL (RÉPARÉ) --- */}
      <div className={`fixed inset-0 z-[200] transition-transform duration-700 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-[#020617]/98 backdrop-blur-2xl" />
        <div className="relative h-full flex flex-col p-10">
          <div className="flex justify-between items-center mb-20">
            <div className="flex flex-col">
              <span className="text-3xl font-serif italic text-white leading-none">Amaru</span>
              <span className="text-[#D4AF37] text-[9px] tracking-[0.5em] uppercase font-light mt-1">Excellence</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={28} /></button>
          </div>
          <nav className="flex flex-col space-y-10 text-3xl font-serif italic text-white/90">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">Accueil</Link>
            <Link href="/proprietes" className="hover:text-[#D4AF37] transition-colors">Propriétés</Link>
            <Link href="/confidentiel" className="hover:text-[#D4AF37] transition-colors">Espace Confidentiel</Link>
            <Link href="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link>
          </nav>
          <div className="mt-auto">
            <button onClick={() => {setIsMobileMenuOpen(false); setIsLoginModalOpen(true);}} className="w-full bg-[#D4AF37] text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-lg shadow-[#D4AF37]/20">
              <User size={18} /> Accès Client
            </button>
          </div>
        </div>
      </div>
    </>
  );
}