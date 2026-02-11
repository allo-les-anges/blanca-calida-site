"use client";

import React from 'react';
import Link from 'next/link';
import { Globe, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 flex justify-between items-center px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
      
      {/* LOGO avec lien retour Home */}
      <Link href="/" className="text-2xl font-serif tracking-widest uppercase text-white group-hover:text-brand-primary transition-colors">
        BLANCA <span className="text-brand-secondary italic font-light">CALIDA</span>
      </Link>
      
      {/* MENU CENTRAL */}
      <div className="hidden md:flex space-x-10 font-bold uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 transition-colors">
        <Link href="/" className="hover:text-brand-secondary transition">Accueil</Link>
        <a href="#" className="hover:text-brand-secondary transition">Vente</a>
        <a href="#" className="hover:text-brand-secondary transition">Neuf</a>
        <a href="#" className="hover:text-brand-secondary transition">Contact</a>
      </div>

      {/* ACTIONS DROITE */}
      <div className="flex items-center space-x-6 text-white group-hover:text-slate-900 transition-colors">
        <div className="flex items-center space-x-2 cursor-pointer group/lang">
          <Globe size={16} className="group-hover/lang:text-brand-secondary transition-colors" />
          <span className="text-[10px] font-bold tracking-widest uppercase">FR</span>
        </div>
        
        <button className="hidden md:block border border-white/30 group-hover:border-slate-200 px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all">
          Estimation
        </button>
      </div>
    </nav>
  );
}