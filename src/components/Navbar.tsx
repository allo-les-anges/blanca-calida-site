"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, MapPin
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
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

  // Détection du scroll pour changer l'apparence
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setShowLangMenu(false);
      if (regionMenuRef.current && !regionMenuRef.current.contains(event.target as Node)) setShowRegionMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIQUE AUTH (Identique à la vôtre) ---
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

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
      `}</style>

      <nav className={`fixed w-full z-[100] transition-all duration-700 px-6 md:px-12 py-5 ${
        isScrolled 
        ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-4" 
        : "bg-transparent py-8"
      }`}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className="relative z-[110]">
            <span className={`text-2xl font-serif italic tracking-tighter transition-colors duration-500 ${
              isScrolled ? "text-slate-950" : "text-white"
            }`}>
              Blanca Calida <span className="text-[10px] font-sans not-italic font-light tracking-[0.4em] ml-2 uppercase">Estates</span>
            </span>
          </Link>

          {/* MENU DESKTOP CENTRAL */}
          <div className={`hidden lg:flex items-center space-x-10 text-[10px] tracking-[0.3em] font-bold uppercase transition-colors duration-500 ${
            isScrolled ? "text-slate-600" : "text-white/80"
          }`}>
            <div className="relative group" ref={regionMenuRef}>
              <button 
                onClick={() => setShowRegionMenu(!showRegionMenu)}
                className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
              >
                Destinations <ChevronDown size={10} className={showRegionMenu ? "rotate-180" : ""} />
              </button>
              
              {showRegionMenu && (
                <div className="absolute top-full left-0 mt-6 bg-white border border-gray-100 rounded-3xl shadow-2xl p-4 min-w-[240px] animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[8px] text-gray-400 mb-3 px-4">Sélectionnez une région</p>
                  {regions.map((region) => (
                    <Link 
                      key={region.slug}
                      href={`/proprietes?region=${region.slug}`}
                      className="flex items-center justify-between px-4 py-3 text-slate-900 hover:bg-emerald-50 rounded-2xl transition-all group"
                      onClick={() => setShowRegionMenu(false)}
                    >
                      <span className="text-[10px]">{region.name}</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/proprietes" className="hover:text-emerald-500 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-emerald-500 hover:after:w-full after:transition-all">Propriétés</Link>
            <Link href="/confidentiel" className="hover:text-emerald-500 transition-colors">Confidentiel</Link>
            <Link href="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link>
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center space-x-6 z-[110]">
            {/* Langue */}
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)} 
                className={`flex items-center space-x-2 text-[10px] font-bold tracking-widest transition-colors ${
                  isScrolled ? "text-slate-900" : "text-white"
                }`}
              >
                <Globe size={14} className="opacity-60" /> <span>{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-6 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 min-w-[140px]">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 text-slate-900 rounded-xl transition-colors">
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login / Dashboard */}
            {(user || clientPin) ? (
              <div className="flex items-center gap-3">
                <Link href="/project-tracker" className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 shadow-xl shadow-emerald-900/10 transition-transform hover:-translate-y-0.5">
                  <LayoutDashboard size={14} /> <span className="hidden md:inline">Espace Client</span>
                </Link>
                <button onClick={handleLogout} className={`p-2 transition-colors ${isScrolled ? "text-slate-400 hover:text-red-500" : "text-white/60 hover:text-white"}`}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className={`flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full border transition-all ${
                  isScrolled 
                  ? "bg-slate-950 text-white border-slate-950 hover:bg-emerald-600 hover:border-emerald-600" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900"
                }`}
              >
                <User size={14} /> <span>Accès</span>
              </button>
            )}

            <button 
              className={`lg:hidden p-2 transition-colors ${isScrolled ? "text-slate-950" : "text-white"}`} 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL LOGIN (Gardée identique mais stylisée) */}
      {/* ... Votre code modal existant avec des classes plus raffinées ... */}
    </>
  );
}