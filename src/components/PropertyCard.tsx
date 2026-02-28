"use client";

import React from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Formatage propre : 3.725.000 € (sans retour à la ligne)
  const priceFormatted = new Intl.NumberFormat('de-DE').format(property.price || property.prix || 0);

  return (
    <Link 
      href={`/property/${property.id_externe || property.id}`} 
      className="group flex flex-col bg-white overflow-hidden"
    >
      {/* --- IMAGE & BADGES --- */}
      <div className="relative h-[380px] overflow-hidden rounded-sm shadow-sm">
        <img 
          src={property.images?.[0] || "/placeholder-house.jpg"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges stylisés comme sur l'image */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
          <span className="bg-[#C1A87D] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            REF: {property.ref || property.id_externe}
          </span>
          {property.distance_beach && parseInt(property.distance_beach) < 2000 && (
            <span className="bg-[#7D917D] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              PROCHE MER
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            VUE DÉGAGÉE
          </span>
        </div>

        {/* Boutons flottants */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors group/heart">
            <Heart size={16} className="text-slate-400 group-hover/heart:text-red-500" />
          </button>
          <div className="bg-[#C1A87D] p-2 rounded-full text-white shadow-md">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {/* --- INFOS : TITRE ET PRIX --- */}
      <div className="py-6">
        <div className="flex justify-between items-baseline gap-4 mb-1">
          <h3 className="font-serif text-2xl text-slate-900 truncate uppercase tracking-tight">
            {property.type || 'Property'} <span className="text-slate-300 font-sans text-base">· {property.town}</span>
          </h3>
          {/* whitespace-nowrap empêche le symbole € de passer à la ligne */}
          <span className="text-xl font-bold text-slate-900 whitespace-nowrap">
            {priceFormatted} €
          </span>
        </div>
        <p className="text-slate-400 text-[10px] tracking-[0.2em] uppercase font-bold">
          {property.town} · {property.region || 'Costa Blanca'}
        </p>
      </div>

      {/* --- ICONES TECHNIQUES (Plus fines et élégantes) --- */}
      <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-slate-500">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <Maximize size={20} strokeWidth={1.2} className="text-slate-400" />
          <span className="text-[10px] font-semibold">{property.surface_built || '0'} m²</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 border-x border-slate-50">
          <Map size={20} strokeWidth={1.2} className="text-slate-400" />
          <span className="text-[10px] font-semibold">{property.surface_plot || '0'} m²</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <Bed size={20} strokeWidth={1.2} className="text-slate-400" />
          <span className="text-[10px] font-semibold">{property.beds || '0'}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 border-x border-slate-50">
          <Bath size={20} strokeWidth={1.2} className="text-slate-400" />
          <span className="text-[10px] font-semibold">{property.baths || '0'}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <Waves size={20} strokeWidth={1.2} className="text-slate-400" />
          <span className="text-[10px] font-semibold uppercase">{property.pool === "Oui" ? "Oui" : "Non"}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 border-l border-slate-50">
          <Car size={20} strokeWidth={1.2} className="text-slate-400" />
          <span className="text-[10px] font-semibold uppercase">Privé</span>
        </div>
      </div>
    </Link>
  );
}