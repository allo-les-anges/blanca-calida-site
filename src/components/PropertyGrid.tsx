"use client";

import React from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  
  // Formatage du prix : 1.690.000 €
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE').format(price) + ' €';
  };

  // Détermination des badges dynamiques
  const isNearBeach = property.distance_beach && parseInt(property.distance_beach) <= 2000;
  const hasPool = property.pool === "Oui" || property.pool === "1";

  return (
    <div className="group flex flex-col bg-white transition-all duration-500">
      
      {/* 1. SECTION IMAGE & BADGES (DESIGN LUXE) */}
      <div className="relative h-[420px] overflow-hidden shadow-sm rounded-sm">
        <img 
          src={property.images?.[0] || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Badges (Labels comme sur la photo) */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[85%]">
          <span className="bg-[#C1A87D] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            REF: {property.ref || property.id_externe}
          </span>
          
          {isNearBeach && (
            <span className="bg-[#7D917D] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              PROCHE MER
            </span>
          )}
          
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
             VUE DÉGAGÉE
          </span>
        </div>

        {/* Boutons Action */}
        <div className="absolute bottom-6 right-6 flex gap-3">
           <button className="bg-white/90 p-2.5 rounded-full hover:bg-white transition-all shadow-md group/heart">
              <Heart size={18} className="text-slate-400 group-hover/heart:text-red-500 transition-colors" />
           </button>
           <button className="bg-[#C1A87D] p-2.5 rounded-full text-white hover:bg-[#A68E62] transition-all shadow-md">
              <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* 2. INFOS : TITRE ET PRIX */}
      <div className="pt-8 pb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-[26px] text-slate-900 leading-tight">
            {property.type || "Villa"} <span className="text-slate-300 font-sans text-lg ml-1">· {property.town}</span>
          </h3>
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(property.price || property.prix)}
          </span>
        </div>
        <p className="text-slate-400 text-[10px] tracking-[0.3em] uppercase font-bold">
          {property.town} · {property.region || "Costa Blanca"}
        </p>
      </div>

      {/* 3. FOOTER : ICONES TECHNIQUES (CORRESPONDANCE IMAGE) */}
      <div className="border-t border-slate-100 pt-8 flex justify-between items-center text-slate-500 px-1">
        <div className="flex flex-col items-center gap-2">
          <Maximize size={22} strokeWidth={1} className="text-slate-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">{property.surface_built || '0'} m²</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Map size={22} strokeWidth={1} className="text-slate-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">{property.surface_plot || '0'} m²</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Bed size={22} strokeWidth={1} className="text-slate-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">{property.beds || '0'}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Bath size={22} strokeWidth={1} className="text-slate-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">{property.baths || '0'}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Waves size={22} strokeWidth={1} className="text-slate-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">{hasPool ? "OUI" : "NON"}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Car size={22} strokeWidth={1} className="text-slate-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">PRIVÉ</span>
        </div>
      </div>

    </div>
  );
}