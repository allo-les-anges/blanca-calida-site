"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Navbar() {
  
  useEffect(() => {
    // Initialisation du script Google Translate
    const addScript = document.createElement('script');
    addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
    document.body.appendChild(addScript);
    
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'fr',
        includedLanguages: 'en,es,de,nl,pl,fr',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      }, 'google_translate_element');
    };
  }, []);

  return (
    <nav className="fixed w-full z-50 flex justify-between items-center px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
      
      {/* LOGO */}
      <Link href="/" className="flex items-center">
        <img 
          src="https://res.cloudinary.com/drn6w4nab/image/upload/v1770539678/website-logo-footer_2x_1_iq0njc.png" 
          alt="Blanca Calida Logo" 
          className="h-5 md:h-7 w-auto object-contain transition-all duration-500 group-hover:brightness-0"
        />
      </Link>
      
      {/* MENU CENTRAL */}
      <div className="hidden md:flex space-x-8 uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 transition-colors">
        <Link href="/proprietes" className="hover:text-brand-secondary transition">Propriétés</Link>
        <Link href="/confidentiel" className="hover:text-brand-secondary transition">Confidentiel</Link>
        <Link href="/investissement" className="hover:text-brand-secondary transition">Investissement</Link>
        
        <div className="flex items-center cursor-pointer hover:text-brand-secondary transition">
          SERVICES <span className="ml-2 text-[8px] opacity-70">▼</span>
        </div>
        <div className="flex items-center cursor-pointer hover:text-brand-secondary transition">
          À PROPOS <span className="ml-2 text-[8px] opacity-70">▼</span>
        </div>
        
        <Link href="/contact" className="hover:text-brand-secondary transition">Contact</Link>
      </div>

      {/* ACTIONS DROITE */}
      <div className="flex items-center space-x-6 text-white group-hover:text-slate-900 transition-colors">
        
        {/* CONTENEUR TRADUCTION */}
        <div className="flex items-center space-x-2 group/lang relative">
          <Globe size={14} className="group-hover/lang:text-brand-secondary transition-colors text-white/70 group-hover:text-slate-400" />
          <div id="google_translate_element" className="opacity-80 hover:opacity-100 transition-opacity"></div>
        </div>
        
        <button
          suppressHydrationWarning
          className="hidden md:block border border-white/30 group-hover:border-slate-200 px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all"
        >
          Estimation
        </button>
      </div>
    </nav>
  );
}