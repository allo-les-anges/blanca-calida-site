"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    image: "/images/regions/1.jpg",
    description: "Dénia, Javea, Moraira",
    match: ["blanca"] 
  },
  {
    name: "Costa Blanca Sud",
    image: "/images/regions/2.jpg",
    description: "Alicante, Torrevieja, Orihuela",
    match: ["blanca"]
  },
  {
    name: "Costa Calida",
    image: "/images/regions/3.jpg",
    description: "Murcie, La Manga, Mar Menor",
    match: ["calida", "murcia", "murcie"]
  },
  {
    name: "Valencia",
    image: "/images/regions/4.jpg",
    description: "Valence Ville & Environs",
    match: ["valencia", "valence"]
  }
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  const getCount = (matchKeywords: string[]) => {
    if (!properties || !Array.isArray(properties)) return 0;
    return properties.filter(p => {
      if (!p.region) return false;
      const regionData = p.region.toLowerCase();
      return matchKeywords.some(keyword => regionData.includes(keyword));
    }).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {REGIONS_CONFIG.map((region, index) => {
        const count = getCount(region.match);
        
        return (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onRegionClick(region.name)}
            className="group relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer bg-slate-900 shadow-2xl transition-all duration-700"
          >
            {/* IMAGE DE FOND */}
            <div className="absolute inset-0 z-0">
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-90" />
            </div>

            {/* CONTENU ALIGNÉ */}
            <div className="absolute inset-0 z-10 p-8 flex flex-col">
              
              {/* 1. BADGE (En haut) */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                    {count} {count > 1 ? 'Propriétés' : 'Propriété'}
                  </span>
                </div>
              </div>

              {/* 2. ESPACE FLEXIBLE pour pousser le texte en bas */}
              <div className="flex-grow" />

              {/* 3. BLOC TEXTE ALIGNÉ (Hauteur fixe pour uniformité) */}
              <div className="flex flex-col items-center text-center space-y-4">
                
                {/* Conteneur de titre avec hauteur fixe pour forcer l'alignement */}
                <div className="h-[80px] flex items-center justify-center">
                  <h3 className="text-3xl md:text-4xl font-serif italic text-white leading-tight">
                    {region.name}
                  </h3>
                </div>

                {/* Description et Action (apparaissent au hover) */}
                <div className="overflow-hidden h-0 group-hover:h-20 transition-all duration-500 ease-in-out">
                    <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        {region.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-white text-[9px] font-black uppercase tracking-[0.3em]">
                        Explorer <ChevronRight size={14} className="text-[#D4AF37]" />
                    </div>
                </div>
                
              </div>
            </div>

            {/* EFFET DE BRILLANCE AU SURVOL */}
            <div className="absolute -inset-full top-0 z-20 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shine_1.5s_ease-in-out]" />
          </motion.div>
        );
      })}

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
}