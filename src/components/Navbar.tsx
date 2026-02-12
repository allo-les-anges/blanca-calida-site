"use client";

import React from 'react';
import Link from 'next/link';
import { Globe, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 flex justify-between items-center px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
      
      {/* LOGO avec lien retour Home */}
      <Link href="/" className="flex items-center">
  <img 
    src="https://res.cloudinary.com/drn6w4nab/image/upload/v1770539678/website-logo-footer_2x_1_iq0njc.png" 
    alt="Blanca Calida Logo" 
    className="h-5 md:h-7 w-auto object-contain transition-all duration-500 group-hover:brightness-0"
  />
</Link>
      
      {/* MENU CENTRAL */}
      <div className="hidden md:flex space-x-8 font-serif uppercase text-[11px] tracking-[0.2em] text-white/90 group-hover:text-slate-800 transition-colors">
  <Link href="/proprietes" className="hover:text-brand-secondary transition">Propriétés</Link>
  <Link href="/confidentiel" className="hover:text-brand-secondary transition">Confidentiel</Link>
  <Link href="/investissement" className="hover:text-brand-secondary transition">Investissement</Link>
  <div className="flex items-center cursor-pointer hover:text-brand-secondary transition">
    SERVICES <span className="ml-1 text-[8px]">▼</span>
  </div>
  <div className="flex items-center cursor-pointer hover:text-brand-secondary transition">
    À PROPOS <span className="ml-1 text-[8px]">▼</span>
  </div>
  <Link href="/contact" className="hover:text-brand-secondary transition">Contact</Link>
</div>

      {/* ACTIONS DROITE */}
      <div className="flex items-center space-x-6 text-white group-hover:text-slate-900 transition-colors">
        <div className="flex items-center space-x-2 cursor-pointer group/lang">
          <Globe size={16} className="group-hover/lang:text-brand-secondary transition-colors" />
          <span className="text-[10px] font-bold tracking-widest uppercase">FR</span>
        </div>
        
        <button
  suppressHydrationWarning // <--- AJOUTE ÇA ICI
  className="hidden md:block border border-white/30 group-hover:border-slate-200 px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all"
>
  Estimation
</button>
      </div>
    </nav>
  );
}