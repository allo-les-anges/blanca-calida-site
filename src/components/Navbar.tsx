"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck 
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
  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [clientPin, setClientPin] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURATION ---
  const ADMIN_EMAIL = "votre-email@exemple.com"; 
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
  const isCashbackPage = pathname === "/cashback-info";
  const showStickyCashback = !isHomePage && !isCashbackPage;

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
      `}</style>

      {showStickyCashback && (
        <a href="/contact-cashback" className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-emerald-600 text-white px-3 py-6 rounded-l-2xl shadow-2xl hover:bg-emerald-700 transition-all flex flex-col items-center gap-3 group border-l border-white/10" style={{ writingMode: 'vertical-rl' }}>
          <Gift size={18} className="rotate-90 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Réclamer mon Cashback</span>
        </a>
      )}

      {/* NAVBAR PRINCIPALE - HAUTEUR FIXE h-24 POUR ALIGNEMENT PARFAIT */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled 
        ? "bg-white shadow-sm border-b border-gray-100" 
        : "bg-black/20 backdrop-blur-md"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          
          {/* 1. LOGO (Aligné verticalement au centre de h-24) */}
          <Link href="/" className="z-[110]">
            <span className={`text-xl font-serif italic tracking-wide transition-colors duration-500 ${
              isScrolled ? "text-slate-900" : "text-white"
            }`}>
              Luxury Estates
            </span>
          </Link>

          {/* 2. MENU DESKTOP (Aligné au centre de h-24) */}
          <div className={`hidden lg:flex items-center space-x-10 uppercase text-[10px] tracking-[0.4em] font-bold transition-colors duration-500 ${
            isScrolled ? "text-slate-600" : "text-white/90"
          }`}>
            {/* Dropdown Régions */}
            <div className="relative group py-4" ref={regionMenuRef}>
              <button 
                onMouseEnter={() => setShowRegionMenu(true)}
                className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
              >
                Destinations <ChevronDown size={10} className={showRegionMenu ? "rotate-180" : ""} />
              </button>
              
              {showRegionMenu && (
                <div 
                  onMouseLeave={() => setShowRegionMenu(false)}
                  className="absolute top-full left-0 mt-0 bg-white border border-gray-100 rounded-xl shadow-2xl p-4 min-w-[200px] animate-in fade-in slide-in-from-top-2"
                >
                  {regions.map((reg) => (
                    <Link key={reg.slug} href={`/search?region=${reg.name}`} className="block py-3 text-slate-900 hover:text-emerald-600 border-b border-gray-50 last:border-0 transition-colors">
                      {reg.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/proprietes" className="hover:text-emerald-500 transition-colors">Propriétés</Link>
            <Link href="/confidentiel" className="hover:text-emerald-500 transition-colors">Confidentiel</Link>
            <Link href="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link>
          </div>

          {/* 3. ACTIONS DROITE (Aligné au centre de h-24) */}
          <div className="flex items-center space-x-6 z-[110]">
            {/* Langue */}
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)} 
                className={`flex items-center space-x-2 text-[10px] font-bold tracking-widest ${
                  isScrolled ? "text-slate-900" : "text-white"
                }`}
              >
                <Globe size={14} /> <span>{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-4 bg-white border border-gray-100 rounded-xl shadow-xl p-2 min-w-[140px]">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 text-slate-900 rounded-lg">
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accès Client */}
            {(user || clientPin) ? (
              <div className="flex items-center gap-4">
                <Link href="/project-tracker" className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white px-5 py-3 rounded-full hover:bg-emerald-700 shadow-lg">
                  <LayoutDashboard size={14} /> <span>Mon Projet</span>
                </Link>
                <button onClick={handleLogout} className={`p-2 ${isScrolled ? "text-slate-400 hover:text-red-500" : "text-white/60 hover:text-white"}`}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border transition-all ${
                  isScrolled 
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900"
                }`}
              >
                <User size={14} /> <span>Accès Client</span>
              </button>
            )}

            <button className={`lg:hidden ${isScrolled ? "text-slate-900" : "text-white"}`} onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"><Lock size={28}/></div>
              <h2 className="text-2xl font-serif text-slate-900 italic lowercase">project tracker</h2>
              <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Entrez votre code confidentiel</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="Votre Code PIN" 
                className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50 outline-none text-center text-xl tracking-[0.5em] font-black text-slate-900 focus:border-emerald-500 transition-all" 
                required 
              />
              <button type="submit" disabled={authLoading} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                {authLoading ? "Validation..." : "Accéder à ma villa"}
                {!authLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}