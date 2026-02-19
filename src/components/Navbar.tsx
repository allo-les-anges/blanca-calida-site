"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ChevronDown, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("FR");

  const languages = [
    { code: "FR", label: "Français" },
    { code: "EN", label: "English" },
    { code: "ES", label: "Español" },
    { code: "NL", label: "Nederlands" },
  ];

  // Bloquer le scroll quand le menu mobile est ouvert pour une expérience propre
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const changeLanguage = (langCode: string) => {
    const googleCode = langCode.toLowerCase();
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;

    if (googleSelect) {
      googleSelect.value = googleCode;
      googleSelect.dispatchEvent(new Event('change'));
      setCurrentLang(langCode);
      setShowLangMenu(false);
      setIsMobileMenuOpen(false);
    } else {
      window.location.hash = `#googtrans(fr|${googleCode})`;
      window.location.reload();
    }
  };

  return (
    <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
      
      {/* Point d'ancrage Google Translate (caché) */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* LOGO */}
      <Link href="/" className="flex items-center z-[110]">
        <span className="text-white text-lg font-serif italic tracking-wide transition-all duration-500 group-hover:text-slate-900">
          Luxury Estates
        </span>
      </Link>

      {/* MENU DESKTOP (Masqué sur Mobile) */}
      <div className="hidden md:flex space-x-8 uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 transition-colors font-bold">
        <Link href="/proprietes" className="hover:text-slate-900 transition">Propriétés</Link>
        <Link href="/confidentiel" className="hover:text-slate-900 transition">Confidentiel</Link>
        <Link href="/investissement" className="hover:text-slate-900 transition">Investissement</Link>
        <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
      </div>

      {/* ACTIONS DROITE */}
      <div className="flex items-center space-x-4 md:space-x-8 text-white group-hover:text-slate-900 transition-colors z-[110]">
        
        {/* Sélecteur de langue (Desktop) */}
        <div className="relative hidden md:block">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest outline-none bg-black/10 group-hover:bg-slate-50 px-3 py-2 rounded-full transition-colors"
          >
            <Globe size={14} className="text-white/70 group-hover:text-slate-400" />
            <span>{currentLang}</span>
            <ChevronDown size={10} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-4 py-2 w-36 bg-white shadow-2xl rounded-2xl text-slate-900 border border-slate-50 animate-in fade-in zoom-in duration-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`block w-full text-left px-5 py-3 text-[10px] hover:bg-slate-50 uppercase font-bold transition-colors ${currentLang === lang.code ? 'text-emerald-600' : 'text-slate-500'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton Hamburger Mobile */}
        <button 
          className="md:hidden p-2 -mr-2 outline-none text-white group-hover:text-slate-900"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={28} />
        </button>

        {/* Bouton Estimation Desktop */}
        <button className="hidden md:block border border-white/30 group-hover:border-slate-200 px-8 py-3 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all text-white group-hover:text-slate-900 rounded-full">
          Estimation
        </button>
      </div>

      {/* OVERLAY MENU MOBILE COMPLET */}
      <div className={`fixed inset-0 bg-white z-[150] transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        
        {/* Header : Titre + Fermeture */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-50">
           <span className="text-slate-900 text-lg font-serif italic">Menu</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900">
            <X size={32} />
          </button>
        </div>

        {/* Contenu du menu avec Scroll interne */}
        <div className="flex flex-col h-[calc(100%-80px)] px-10 pt-8 pb-10 justify-between overflow-y-auto">
          
          {/* 1. Navigation */}
          <div className="flex flex-col space-y-6">
            <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold mb-2">Navigation</p>
            {[
              { name: "Propriétés", href: "/proprietes" },
              { name: "Confidentiel", href: "/confidentiel" },
              { name: "Investissement", href: "/investissement" },
              { name: "Contact", href: "/contact" }
            ].map((item, idx) => (
              <Link 
                key={item.name}
                onClick={() => setIsMobileMenuOpen(false)} 
                href={item.href} 
                className={`text-3xl font-serif text-slate-900 flex items-center justify-between transition-all duration-700 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {item.name}
                <ArrowRight className="text-emerald-500 opacity-50" size={24} />
              </Link>
            ))}
          </div>

          {/* 2. Langues & Action */}
          <div className="flex flex-col space-y-8 mt-10">
            
            <div className="border-t border-slate-100 pt-8">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Langue</p>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`text-[11px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl border transition-colors ${currentLang === lang.code ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-transform">
              Obtenir une estimation
            </button>

            <div className="text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase pb-2">
              Costa Blanca • Espagne
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}