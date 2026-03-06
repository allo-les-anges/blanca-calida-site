"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

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
    image: "https://images.unsplash.com/photo-1512100356132-db73a5ad4413?auto=format&fit=crop&q=80&w=1000",
    description: "Dénia, Javea, Moraira"
  },
  {
    name: "Costa Blanca Sud",
    image: "https://images.unsplash.com/photo-1544918877-460635b6d13e?auto=format&fit=crop&q=80&w=1000",
    description: "Alicante, Torrevieja, Orihuela"
  },
  {
    name: "Costa Calida",
    image: "https://images.unsplash.com/photo-1516483642144-7f1007ca0b95?auto=format&fit=crop&q=80&w=1000",
    description: "Murcie, La Manga, Mar Menor"
  },
  {
    name: "Valencia",
    image: "https://images.unsplash.com/photo-1558642084-fd07fae52827?auto=format&fit=crop&q=80&w=1000",
    description: "Valence Ville & Environs"
  }
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  const getCount = (regionName: string) => {
    return properties.filter(p => 
      p.region?.toLowerCase().trim() === regionName.toLowerCase().trim()
    ).length;
  };

  // On définit la couleur OR pour réutilisation
  const GOLD_COLOR = "#D4AF37"; // Or classique
  const GOLD_GLOW = "rgba(212, 175, 55, 0.5)";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {REGIONS_CONFIG.map((region) => {
        const count = getCount(region.name);
        
        return (
          <div
            key={region.name}
            onClick={() => onRegionClick(region.name)}
            className="group relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 bg-[#0F172A]/40 backdrop-blur-sm hover:border-[#D4AF37]/50 transition-all duration-700 shadow-2xl"
          >
            <div className="absolute inset-0 z-0">
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
              <div className="space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                
                {/* COMPTEUR AVEC THÈME OR */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 backdrop-blur-md border border-[#D4AF37]/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]" />
                  <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.25em]">
                    {count} {count > 1 ? 'Propriétés' : 'Propriété'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                    {region.name.split(' ').map((word, i) => (
                      <span key={i} className={i >= 2 ? "text-[#D4AF37]" : ""}>{word} </span>
                    ))}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    {region.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em] pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                  Explorer la sélection <ChevronRight size={14} className="text-[#D4AF37] shadow-gold-glow" />
                </div>
              </div>
            </div>

            {/* REFLET OR */}
            <div className="absolute -inset-full top-0 z-20 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent group-hover:animate-[shine_1.2s_ease-in-out]" />
          </div>
        );
      })}

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .shadow-gold-glow {
          filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.8));
        }
      `}</style>
    </div>
  );
}