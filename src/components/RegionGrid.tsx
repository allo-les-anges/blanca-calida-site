"use client";

import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

interface Property {
  region?: string;
  [key: string]: any;
}

interface RegionGridProps {
  properties: Property[];
  onRegionClick: (regionName: string) => void;
}

const REGIONS_CONFIG = [
  {
    name: "Costa Blanca Nord",
    image: "https://images.unsplash.com/photo-1583795121081-4e8822455fd0?auto=format&fit=crop&q=80&w=800",
    description: "Montagnes et criques cristallines"
  },
  {
    name: "Costa Blanca Sud",
    image: "https://images.unsplash.com/photo-1544918877-460635b6d13e?auto=format&fit=crop&q=80&w=800",
    description: "Plages de sable fin et golfs"
  },
  {
    name: "Costa Calida",
    image: "https://images.unsplash.com/photo-1516483642144-7f1007ca0b95?auto=format&fit=crop&q=80&w=800",
    description: "Lagunes et nature sauvage"
  },
  {
    name: "Valencia",
    image: "https://images.unsplash.com/photo-1558642084-fd07fae52827?auto=format&fit=crop&q=80&w=800",
    description: "Culture, art et modernité"
  }
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  // Fonction pour compter les propriétés par région
  const getCount = (regionName: string) => {
    return properties.filter(p => p.region === regionName).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {REGIONS_CONFIG.map((region) => (
        <div
          key={region.name}
          onClick={() => onRegionClick(region.name)}
          className="group relative h-[450px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 bg-[#0F172A]/40 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-700 shadow-2xl"
        >
          {/* IMAGE DE FOND AVEC ZOOM AU HOVER */}
          <div className="absolute inset-0 z-0">
            <img
              src={region.image}
              alt={region.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Overlay dégradé pour la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          </div>

          {/* CONTENU TEXTE */}
          <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
            <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              
              {/* Badge compteur */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                  {getCount(region.name)} Propriétés
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                  {region.name}
                </h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  {region.description}
                </p>
              </div>

              {/* Bouton Explorer */}
              <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em] pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                Explorer <ChevronRight size={14} className="text-emerald-500" />
              </div>
            </div>
          </div>

          {/* EFFET DE LUMIÈRE AU SURVOL (Glow) */}
          <div className="absolute -inset-full top-0 z-20 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shine_1.5s_ease-in-out]" />
        </div>
      ))}

      <style jsx>{`
        @keyframes shine {
          100% {
            left: 200%;
          }
        }
      `}</style>
    </div>
  );
}