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
  
  // SYSTÈME DE COMPTAGE
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
            className="group relative h-[550px] rounded-[3rem] overflow-hidden cursor-pointer bg-slate-900 shadow-2xl transition-all duration-700 hover:shadow-[#D4AF37]/10"
          >
            {/* IMAGE AVEC OVERLAY LUXE */}
            <div className="absolute inset-0 z-0">
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 group-hover:rotate-1"
              />
              {/* Gradient plus profond et élégant */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700" />
            </div>

            {/* CONTENU HARMONISÉ PAGE CONTACT */}
            <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end">
              <div className="space-y-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                
                {/* COMPTEUR STYLE BADGE LUXE */}
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full w-fit">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
                    {count} {count > 1 ? 'Propriétés' : 'Propriété'}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* TITRE EN SERIF ITALIC (COMME LA PAGE CONTACT) */}
                  <h3 className="text-4xl font-serif italic text-white leading-tight">
                    {region.name}
                  </h3>
                  
                  {/* DESCRIPTION ÉPURÉE */}
                  <p className="text-[#D4AF37] text-[11px] font-medium uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                    {region.description}
                  </p>
                </div>

                {/* CALL TO ACTION RAFFINÉ */}
                <div className="flex items-center gap-3 text-white/80 text-[10px] font-bold uppercase tracking-[0.4em] pt-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                  <span className="border-b border-[#D4AF37]/50 pb-1">Découvrir</span>
                  <ChevronRight size={14} className="text-[#D4AF37]" />
                </div>
              </div>
            </div>

            {/* EFFET DE BALAYAGE LUMINEUX (SHINE) DISCRET */}
            <div className="absolute -inset-full top-0 z-20 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shine_1.5s_ease-in-out]" />
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