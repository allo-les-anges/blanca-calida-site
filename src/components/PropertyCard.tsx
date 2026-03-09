"use client";

import React from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

// Nous simplifions le typage pour éviter l'erreur RegionGridProps lors du build
export default function PropertyCard({ property }: { property: any }) {
  // Formatage propre : 3.725.000 €
  const priceFormatted = new Intl.NumberFormat('de-DE').format(property.price || property.prix || 0);

  return (
    <Link 
      href={`/property/${property.id_externe || property.id}`} 
      className="group flex flex-col w-full max-w-[400px] transition-all duration-500"
    >
      {/* --- IMAGE & BADGES --- */}
      <div className="relative h-[420px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900">
        <img 
          src={property.images?.[0] || "/placeholder-house.jpg"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Overlay dégradé pour la lecture des badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Badges stylisés */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[70%]">
          <span className="bg-[#D4AF37] text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            REF: {property.ref || property.id_externe}
          </span>
          <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[8px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
            {property.type || 'EXCLUSIVITÉ'}
          </span>
        </div>

        {/* Boutons flottants d'action */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <button className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
            <Heart size={18} strokeWidth={1.5} />
          </button>
          <div className="bg-[#D4AF37] p-3 rounded-full text-black shadow-xl transform group-hover:translate-x-1 transition-transform">
            <ChevronRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* --- INFOS : TITRE ET PRIX --- */}
      <div className="py-8 px-2">
        <div className="flex justify-between items-start gap-4 mb-3">
          {/* CORRECTION : h3 utilise 'dark:text-white' pour être blanc sur fond sombre */}
          <h3 className="font-serif text-2xl text-slate-900 dark:text-white italic leading-tight flex-grow line-clamp-1">
            {property.titre || property.type || 'Villa de Prestige'}
          </h3>
          
          {/* Prix : Toujours Or */}
          <span className="text-xl font-bold text-[#D4AF37] whitespace-nowrap pt-1">
            {priceFormatted} €
          </span>
        </div>

        {/* CORRECTION : Localisation passe de 'text-slate-500' à 'dark:text-slate-400' (gris clair) */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] tracking-[0.3em] uppercase font-bold">
          <span className="text-[#D4AF37]">●</span>
          {property.town} <span className="opacity-30">|</span> {property.region || 'Costa Blanca'}
        </div>
      </div>

      {/* --- ICONES TECHNIQUES : ADAPTATIVES --- */}
      <div className="grid grid-cols-3 gap-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
        
        {/* Surface */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Maximize size={14} className="text-[#D4AF37]" />
          </div>
          {/* CORRECTION : Les spans de texte utilisent 'dark:text-slate-200' (gris très clair) */}
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{property.surface_built || '0'} m²</span>
        </div>
        
        {/* Chambres */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Bed size={14} className="text-[#D4AF37]" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{property.beds || '0'} lits</span>
        </div>

        {/* Salles de bain */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Bath size={14} className="text-[#D4AF37]" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{property.baths || '0'} sdb</span>
        </div>

        {/* Piscine */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Waves size={14} className="text-[#D4AF37]" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 uppercase">
            {property.pool === "Oui" ? "Piscine" : "Sans"}
          </span>
        </div>

        {/* Terrain */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Map size={14} className="text-[#D4AF37]" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
            {property.surface_plot || '0'} m² terrain
          </span>
        </div>

        {/* Garage */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Car size={14} className="text-[#D4AF37]" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">Garage</span>
        </div>
        
      </div>
    </Link>
  );
}