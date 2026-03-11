"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, Menu, X, Search, User, Euro 
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";
import GoogleTranslate from "./GoogleTranslate";

const DataHomeLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text x="10" y="28" fontFamily="sans-serif" fontSize="22" fontWeight="300" fill="currentColor" letterSpacing="-0.02em">data home</text>
  </svg>
);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  const { resolvedTheme } = useTheme();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); 
  const [passwordInput, setPasswordInput] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from('suivi_chantier').select('pin_code').eq('pin_code', passwordInput).maybeSingle();
    if (data) {
      localStorage.setItem("client_access_pin", data.pin_code);
      setIsLoginModalOpen(false);
      router.push('/project-tracker');
    } else {
      alert("Code PIN incorrect.");
    }
  };

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Cashback-Info", href: "/cashback-info" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-white/90 dark:bg-[#020617]/90 backdrop-blur-md shadow-xl border-b border-slate-100 dark:border-white/5" : "bg-transparent"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-10 flex justify-between items-center">
          
          <Link href="/" className="z-[110] flex items-center group">
            <DataHomeLogo className="h-10 w-auto text-slate-900 dark:text-white transition-colors group-hover:text-[#D4AF37]" />
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${pathname === link.href ? "text-[#D4AF37]" : "text-slate-600 dark:text-white/70 hover:text-[#D4AF37]"}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full ${pathname === link.href ? 'w-full' : ''}`} />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 z-[110]">
            <ThemeToggle />

            {/* SÉLECTEUR DE LANGUE GOOGLE (DESKTOP) */}
            <div className="hidden xl:block">
              <GoogleTranslate />
            </div>

            <button onClick={() => setIsSearchModalOpen(true)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-full text-[#D4AF37] border border-slate-200 dark:border-white/10 hover:bg-[#D4AF37] hover:text-white transition-all">
              <Search size={18} />
            </button>

            <button onClick={() => setIsLoginModalOpen(true)} className="hidden sm:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-slate-900 dark:text-white hover:bg-[#D4AF37] hover:text-black transition-all">
              <User size={14} /> <span className="hidden lg:inline">Accès Client</span>
            </button>

            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-900 dark:text-white p-2">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[500] md:hidden">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#020617] shadow-2xl p-8 flex flex-col border-l border-white/5">
            <div className="flex justify-between items-center mb-12">
              <DataHomeLogo className="h-8 w-auto text-slate-900 dark:text-white" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900 dark:text-white">
                <X size={32} />
              </button>
            </div>

            <nav className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif italic text-slate-900 dark:text-white hover:text-[#D4AF37] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                className="text-left text-2xl font-serif italic text-slate-900 dark:text-white hover:text-[#D4AF37]"
              >
                Accès Client
              </button>
            </nav>

            {/* SÉLECTEUR DE LANGUE MOBILE */}
            <div className="mt-auto pt-10 border-t border-slate-100 dark:border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Globe size={14} className="text-[#D4AF37]"/> Langue
              </p>
              <GoogleTranslate />
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECHERCHE */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif italic text-slate-900 dark:text-white">Recherche</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">Trouvez votre villa idéale</p>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-full flex items-center justify-center hover:bg-[#D4AF37]"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2"><Euro size={14} className="text-[#D4AF37]"/> Budget Max</label>
                  <span className="text-lg font-serif italic text-slate-900 dark:text-white">{maxPrice.toLocaleString()} €</span>
                </div>
                <input type="range" min="100000" max="5000000" step="50000" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none accent-[#D4AF37]" />
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">Afficher les résultats</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-6">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative border border-white/10 text-center">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-[#D4AF37]"><X size={20}/></button>
            <h2 className="text-xl font-serif italic mb-8 text-slate-900 dark:text-white">Accès Privé</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="PIN" 
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-center text-2xl tracking-widest font-black text-[#D4AF37] focus:border-[#D4AF37] outline-none" 
              />
              <button type="submit" className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Valider</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}