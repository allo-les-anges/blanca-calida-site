"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ChevronDown, Menu, X } from "lucide-react"; // Ajout de Menu et X pour le mobile

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

  const changeLanguage = (langCode: string) => {
    const googleCode = langCode.toLowerCase();
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;

    if (googleSelect) {
      googleSelect.value = googleCode;
      googleSelect.dispatchEvent(new Event('change'));
      setCurrentLang(langCode);
      setShowLangMenu(false);
      setIsMobileMenuOpen(false); // Ferme aussi le menu mobile si ouvert
    } else {
      window.location.hash = `#googtrans(fr|${googleCode})`;
      window.location.reload();
    }
  };

  return (
    <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
      
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* LOGO */}
      <Link href="/" className="flex items-center z-[110]">
        <span className="text-white text-lg font-semibold tracking-wide transition-all duration-500 group-hover:text-slate-900">
          Your Page
        </span>
      </Link>

      {/* MENU CENTRAL (Caché sur mobile, visible sur Desktop) */}
      <div className="hidden md:flex space-x-8 uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 transition-colors">
        <Link href="/proprietes" className="hover:text-slate-900 transition">Propriétés</Link>
        <Link href="/confidentiel" className="hover:text-slate-900 transition">Confidentiel</Link>
        <Link href="/investissement" className="hover:text-slate-900 transition">Investissement</Link>
        <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
      </div>

      {/* ACTIONS DROITE */}
      <div className="flex items-center space-x-4 md:space-x-6 text-white group-hover:text-slate-900 transition-colors z-[110]">
        
        {/* Sélecteur de langue - Visible partout */}
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 md:space-x-2 text-[10px] font-bold uppercase tracking-widest outline-none"
          >
            <Globe size={14} className="text-white/70 group-hover:text-slate-400" />
            <span>{currentLang}</span>
            <ChevronDown size={10} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowLangMenu(false)}></div>
              <div className="absolute right-0 mt-4 py-2 w-32 bg-white shadow-2xl border border-gray-100 rounded-lg text-slate-900">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`block w-full text-left px-4 py-2 text-[10px] hover:bg-slate-50 uppercase font-bold transition-colors ${currentLang === lang.code ? 'text-emerald-600' : ''}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bouton Mobile Menu (Hamburger) */}
        <button 
          className="md:hidden text-white group-hover:text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Bouton Estimation (Desktop uniquement) */}
        <button className="hidden md:block border border-white/30 group-hover:border-slate-200 px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all text-white group-hover:text-slate-900">
          Estimation
        </button>
      </div>

      {/* OVERLAY MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[105] flex flex-col items-center justify-center space-y-8 text-slate-900">
           <Link onClick={() => setIsMobileMenuOpen(false)} href="/proprietes" className="text-sm uppercase tracking-widest font-bold">Propriétés</Link>
           <Link onClick={() => setIsMobileMenuOpen(false)} href="/confidentiel" className="text-sm uppercase tracking-widest font-bold">Confidentiel</Link>
           <Link onClick={() => setIsMobileMenuOpen(false)} href="/investissement" className="text-sm uppercase tracking-widest font-bold">Investissement</Link>
           <Link onClick={() => setIsMobileMenuOpen(false)} href="/contact" className="text-sm uppercase tracking-widest font-bold">Contact</Link>
           <button className="mt-4 border border-slate-200 px-10 py-4 text-[10px] font-bold uppercase tracking-widest">Estimation</button>
        </div>
      )}
    </nav>
  );
}