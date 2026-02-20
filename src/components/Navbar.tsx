"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe, ChevronDown, Menu, X, ArrowRight, User } from "lucide-react";

export default function Navbar() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("FR");
  const langMenuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "FR", label: "Français" },
    { code: "EN", label: "English" },
    { code: "ES", label: "Español" },
    { code: "NL", label: "Nederlands" },
  ];

  // --- MOCK ACTIONS ---
  const handleCashbackClick = () => {
    alert("Redirection vers le formulaire Zoho CRM pour le Cashback...");
    // window.open('TON_LIEN_ZOHO_FORM', '_blank');
  };

  const handleLoginClick = () => {
    alert("Ouverture du portail Project Tracker (Accès Client)...");
    // window.location.href = '/dashboard-client';
  };

  // Fermer le menu langue si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <>
      <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center z-[110]">
          <span className="text-white text-lg font-serif italic tracking-wide transition-all duration-500 group-hover:text-slate-900">
            Luxury Estates
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex space-x-8 uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 transition-colors font-bold">
          <Link href="/proprietes" className="hover:text-slate-900 transition">Propriétés</Link>
          <Link href="/confidentiel" className="hover:text-slate-900 transition">Confidentiel</Link>
          <Link href="/investissement" className="hover:text-slate-900 transition">Investissement</Link>
          <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
        </div>

        {/* ACTIONS DROITE */}
        <div className="flex items-center space-x-3 md:space-x-6 text-white group-hover:text-slate-900 transition-colors z-[110]">
          
          {/* SÉLECTEUR DE LANGUE */}
          <div className="relative hidden md:block" ref={langMenuRef}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest outline-none bg-black/10 group-hover:bg-slate-50 px-3 py-2 rounded-full transition-colors"
            >
              <Globe size={14} className="text-white/70 group-hover:text-slate-400" />
              <span>{currentLang}</span>
              <ChevronDown size={10} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl py-2 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGIN CLIENT (PROJECT TRACKER) */}
          <button 
            onClick={handleLoginClick}
            className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest border border-white/20 group-hover:border-slate-200 px-4 py-2 rounded-full hover:bg-slate-100 transition-all"
          >
            <User size={14} />
            <span>Login</span>
          </button>

          {/* BOUTON CASHBACK */}
          <button 
            onClick={handleCashbackClick}
            className="hidden sm:block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-full"
          >
            Cashback
          </button>

          {/* Hamburger Mobile */}
          <button 
            className="lg:hidden p-2 text-white group-hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MENU MOBILE */}
      <div className={`fixed inset-0 bg-white z-[999] transition-all duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-50">
           <span className="text-slate-900 text-lg font-serif italic">Menu</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900">
            <X size={32} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-80px)] px-10 pt-10 pb-10 justify-between">
          <div className="flex flex-col space-y-7">
            {["Propriétés", "Confidentiel", "Investissement", "Contact"].map((item) => (
              <Link key={item} href="#" className="text-3xl font-serif text-slate-900 flex items-center justify-between">
                {item} <ArrowRight className="text-emerald-500 opacity-50" size={24} />
              </Link>
            ))}
          </div>

          <div className="flex flex-col space-y-4">
            {/* Login Mobile */}
            <button 
              onClick={handleLoginClick}
              className="w-full border border-slate-200 text-slate-900 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center space-x-2"
            >
              <User size={16} />
              <span>Accès Client (Project Tracker)</span>
            </button>
            {/* Cashback Mobile */}
            <button 
              onClick={handleCashbackClick}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest"
            >
              Obtenir mon Cashback
            </button>
          </div>
        </div>
      </div>
    </>
  );
}