"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, User, 
  Lock, Gift, LayoutDashboard, ShieldCheck, Search,
  Home, MapPin, Euro, BedDouble, Bath, Building2
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
  
  // État pour le slider de prix
  const [maxPrice, setMaxPrice] = useState(2500000);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURATION ---
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

  const propertyTypes = ["Villa", "Appartement", "Terrain", "Penthouse"];
  const features = ["Piscine", "Vue Mer", "Garage", "Neuf"];

  // --- LOGIQUE ---
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
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
        
        /* Style du Slider Gold */
        .price-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 10px;
          outline: none;
        }
        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #D4AF37;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>

      {showStickyCashback && (
        <a href="/contact-cashback" className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-[#D4AF37] text-black px-3 py-6 rounded-l-2xl shadow-2xl transition-all flex flex-col items-center gap-3 border-l border-white/10" style={{ writingMode: 'vertical-rl' }}>
          <Gift size={18} className="rotate-90 mb-2" />
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Cashback</span>
        </a>
      )}

      {/* NAVBAR */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-[#020617] shadow-xl border-b border-white/5" : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          <Link href="/" className="z-[110] flex flex-col items-start group">
            <span className="text-3xl font-serif italic tracking-tighter text-white">Amaru</span>
            <span className="text-[#D4AF37] font-sans text-[10px] tracking-[0.4em] uppercase font-light -mt-1">Excellence</span>
          </Link>

          <div className="flex items-center space-x-6 z-[110]">
            <button onClick={() => setIsSearchModalOpen(true)} className="p-3 bg-white/10 rounded-full text-[#D4AF37] border border-white/10 hover:bg-white/20 transition-all">
              <Search size={22} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2">
              <Menu size={28} />
            </button>
            <div className="hidden lg:flex items-center space-x-4">
               {(user || clientPin) ? (
                 <Link href="/project-tracker" className="px-6 py-3 rounded-xl bg-[#009664] text-white text-[10px] font-bold uppercase tracking-widest">Mon Projet</Link>
               ) : (
                 <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-3 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Accès Client</button>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MODAL RECHERCHE BOTTOM SHEET (VERSION COMPLÈTE AVEC SLIDER) --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          
          <div className="relative bg-[#F8FAFC] w-full sm:max-w-xl sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh]">
            
            {/* Header avec Barre de préhension */}
            <div className="bg-white px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full sm:hidden" />
              <div>
                <h3 className="text-2xl font-serif italic text-slate-900">Recherche</h3>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-black">Critères d'exception</p>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="w-12 h-12 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center hover:bg-slate-900 hover:text-[#D4AF37] transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Corps Scrollable */}
            <div className="p-8 overflow-y-auto space-y-10 pb-32">
              
              {/* 1. Identification (Ref / Nom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#D4AF37]"/> Référence
                  </label>
                  <input type="text" placeholder="REF-000" className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none focus:border-[#D4AF37] text-slate-900 font-medium" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                    <Building2 size={14} className="text-[#D4AF37]"/> Programme
                  </label>
                  <input type="text" placeholder="Nom du projet" className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none focus:border-[#D4AF37] text-slate-900 font-medium" />
                </div>
              </div>

              {/* 2. Région */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                  <MapPin size={14} className="text-[#D4AF37]"/> Secteur Géographique
                </label>
                <select className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl outline-none appearance-none text-slate-900 font-medium cursor-pointer">
                  <option>Espagne (Toutes les régions)</option>
                  {regions.map(r => <option key={r.slug}>{r.name}</option>)}
                </select>
              </div>

              {/* 3. Types */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                   <Home size={14} className="text-[#D4AF37]"/> Type de propriété
                </label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map(type => (
                    <button key={type} className="py-3 px-5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-900 hover:text-[#D4AF37] hover:border-slate-900 transition-all">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. LE SLIDER DE PRIX (RETOUR) */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                    <Euro size={14} className="text-[#D4AF37]"/> Budget Maximum
                  </label>
                  <span className="text-xl font-serif italic text-slate-900 tracking-tighter">
                    {maxPrice.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="5000000" 
                  step="50000" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="price-slider" 
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase">
                  <span>100k€</span>
                  <span>5M€ +</span>
                </div>
              </div>

              {/* 5. Configuration (Lits / Bains) */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                    <BedDouble size={14} className="text-[#D4AF37]"/> Chambres
                  </label>
                  <div className="flex bg-white border border-slate-200 rounded-2xl p-1">
                    {[1, 2, 3, '4+'].map(n => (
                      <button key={n} className="flex-1 py-3 text-[11px] font-black rounded-xl hover:bg-slate-50 transition-colors">{n}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                    <Bath size={14} className="text-[#D4AF37]"/> Salles de bain
                  </label>
                  <div className="flex bg-white border border-slate-200 rounded-2xl p-1">
                    {[1, 2, '3+'].map(n => (
                      <button key={n} className="flex-1 py-3 text-[11px] font-black rounded-xl hover:bg-slate-50 transition-colors">{n}</button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Fixe */}
            <div className="bg-white p-6 border-t border-slate-100 shrink-0">
              <button className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl">
                <Search size={18} /> Afficher les résultats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENU MOBILE LATÉRAL */}
      <div className={`fixed inset-0 z-[200] transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-[#020617] backdrop-blur-2xl" />
        <div className="relative h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <span className="text-2xl font-serif italic text-white">Amaru</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-white"><X size={28} /></button>
          </div>
          <nav className="flex flex-col space-y-8 text-3xl font-serif italic text-white">
            <Link href="/proprietes">Propriétés</Link>
            <Link href="/confidentiel">Confidentiel</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </>
  );
}