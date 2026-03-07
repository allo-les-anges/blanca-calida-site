"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; // Importation nécessaire
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, Search,
  Home, MapPin, Euro, BedDouble, Bath
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import ThemeToggle from "./ThemeToggle";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); 
  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [clientPin, setClientPin] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);

  const langMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Cashback-Info", href: "/cashback-info" },
    { name: "Contact", href: "/contact" },
  ];

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" },
  ];

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

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
      `}</style>

      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-white dark:bg-[#020617] shadow-xl border-b border-slate-100 dark:border-white/5" : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-10 flex justify-between items-center">
          
          {/* LOGO REMPLACÉ PAR L'IMAGE */}
          <Link href="/" className="z-[110] flex items-center group transition-transform hover:scale-105">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Data Home Logo" 
                width={175} // Largeur adaptée proportionnellement
                height={40} // Hauteur adaptée pour la navbar
                className="object-contain h-auto w-auto max-h-[45px] md:max-h-[50px]"
                priority
              />
            </div>
          </Link>

          {/* LIENS NAV */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.25em] transition-all duration-300 relative group ${
                  pathname === link.href ? "text-[#D4AF37]" : "text-slate-600 dark:text-white/70 hover:text-[#D4AF37]"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full ${pathname === link.href ? 'w-full' : ''}`} />
              </Link>
            ))}
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center space-x-2 md:space-x-4 z-[110]">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="relative hidden xl:block" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-slate-900 dark:text-white hover:text-[#D4AF37] transition-colors">
                <Globe size={14} className="text-[#D4AF37]" /> <span>{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-4 bg-white dark:bg-[#020617] border border-slate-100 dark:border-white/10 rounded-xl p-2 min-w-[140px] shadow-2xl">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-[#D4AF37] transition-colors">
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="p-2.5 md:p-3 bg-slate-100 dark:bg-white/10 rounded-full text-[#D4AF37] border border-slate-200 dark:border-white/10 hover:bg-[#D4AF37] hover:text-white transition-all"
            >
              <Search size={18} />
            </button>

            <button onClick={() => setIsLoginModalOpen(true)} className="hidden sm:flex items-center space-x-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest px-4 lg:px-6 py-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-slate-900 dark:text-white hover:bg-[#D4AF37] hover:text-black transition-all">
              <User size={14} /> <span className="hidden lg:inline">Accès Client</span>
            </button>

            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-900 dark:text-white p-2">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL RECHERCHE */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          <div className="relative bg-[#F8FAFC] dark:bg-[#0f172a] w-full sm:max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh]">
            <div className="bg-white dark:bg-[#1e293b] px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif italic text-slate-900 dark:text-white">Recherche</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">Trouvez votre villa idéale</p>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 pb-32">
               <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                     <Euro size={14} className="text-[#D4AF37]"/> Budget Max
                  </label>
                  <span className="text-lg font-serif italic text-slate-900 dark:text-white">{maxPrice.toLocaleString()} €</span>
                </div>
                <input type="range" min="100000" max="5000000" step="50000" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white dark:bg-[#1e293b] border-t border-slate-100 dark:border-white/5 flex gap-3">
              <button onClick={() => setIsSearchModalOpen(false)} className="flex-1 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-xl">Afficher les résultats</button>
            </div>
          </div>
        </div>
      )}

      {/* MENU MOBILE */}
      <div className={`fixed inset-0 z-[200] transition-transform duration-500 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-white dark:bg-[#020617]" />
        <div className="relative h-full flex flex-col p-8">
           <div className="flex justify-between items-center mb-12">
             {/* Logo en haut du menu mobile également */}
             <Image src="/logo.jpeg" alt="Logo" width={120} height={28} className="object-contain dark:brightness-200" />
             <button onClick={() => setIsMobileMenuOpen(false)}><X size={28} /></button>
           </div>
           <nav className="flex flex-col space-y-8 text-2xl font-serif italic">
             {navLinks.map(link => (
               <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                 {link.name}
               </Link>
             ))}
           </nav>
        </div>
      </div>

      {/* MODAL LOGIN PIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-6">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative border border-slate-100 dark:border-white/5 text-center">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6"><X size={20}/></button>
            <h2 className="text-xl font-serif italic mb-8">Accès Privé</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="PIN" 
                className="w-full bg-slate-50 dark:bg-black/40 border p-4 rounded-xl text-center text-2xl tracking-widest font-black text-[#D4AF37]" 
              />
              <button type="submit" className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-bold uppercase text-[10px]">Valider</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}