"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, Search,
  Home, MapPin, Euro, BedDouble, Bath, Maximize, CheckCircle2
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); 
  const [isScrolled, setIsScrolled] = useState(false);

  // --- CONFIGURATION FILTRES ---
  const regions = ["Costa Blanca", "Costa Calida", "Costa Almeria", "Costa del Sol"];
  const propertyTypes = ["Villa", "Appartement", "Penthouse", "Terrain"];
  const features = ["Piscine", "Vue Mer", "Garage", "Jardin", "Neuf"];

  // --- EFFETS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
  }, [pathname]);

  return (
    <>
      <style jsx global>{`
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #D4AF37;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* NAVBAR PRINCIPALE */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-[#020617] shadow-xl border-b border-white/5" : "bg-transparent backdrop-blur-md"
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
          </div>
        </div>
      </nav>

      {/* --- MODAL RECHERCHE AVANCÉE (BOTTOM SHEET) --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          
          <div className="relative bg-[#F8FAFC] w-full sm:max-w-xl sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[95vh]">
            
            {/* Header Fixe */}
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-serif italic text-slate-900">Filtres de Recherche</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black">Sélection Exclusive</p>
              </div>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="w-12 h-12 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu Scrollable */}
            <div className="p-8 overflow-y-auto space-y-10 pb-32">
              
              {/* 1. RÉFÉRENCE */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Référence Propriété</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                  <input type="text" placeholder="Ex: AM-2024" className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] text-slate-900 font-medium" />
                </div>
              </div>

              {/* 2. RÉGION & LOCALISATION */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Localisation</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                  <select className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none appearance-none text-slate-900 font-medium">
                    <option>Toutes les côtes</option>
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* 3. TYPE DE BIEN (Grid) */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Type de bien</label>
                <div className="grid grid-cols-2 gap-3">
                  {propertyTypes.map(type => (
                    <button key={type} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group">
                      <Home size={16} className="text-[#D4AF37]" />
                      <span className="text-xs font-bold text-slate-700">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. BUDGET MAX (Slider stylisé) */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Budget Maximum</label>
                  <span className="text-[#D4AF37] font-serif italic text-lg tracking-tighter">1.250.000 €</span>
                </div>
                <input type="range" min="200000" max="5000000" step="50000" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              </div>

              {/* 5. CHAMBRES & SDB (Counter Style) */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Chambres</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1">
                    {[1, 2, 3, '4+'].map(n => (
                      <button key={n} className="flex-1 py-3 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors text-slate-600">{n}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Salles de bain</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1">
                    {[1, 2, '3+'].map(n => (
                      <button key={n} className="flex-1 py-3 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors text-slate-600">{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. CARACTÉRISTIQUES (Chips) */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Prestations</label>
                <div className="flex flex-wrap gap-2">
                  {features.map(f => (
                    <button key={f} className="px-4 py-2 rounded-full border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                      + {f}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Fixe */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-slate-100 shrink-0">
              <button className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#D4AF37] hover:text-black transition-all shadow-2xl shadow-[#D4AF37]/20 flex items-center justify-center gap-3">
                <Search size={16} /> Afficher les villas
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
          <nav className="flex flex-col space-y-8 text-3xl font-serif italic text-white">
            <Link href="/">Accueil</Link>
            <Link href="/proprietes">Propriétés</Link>
            <Link href="/confidentiel">Confidentiel</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </>
  );
}