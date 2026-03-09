"use client";

import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Property {
  id: string;
  town?: string;
  ville?: string;
  region?: string;
}

interface RegionGridProps {
  properties: Property[];
  onRegionClick: (regionName: string) => void;
}

const CITY_TO_REGION_MAP: Record<string, string> = {
  // COSTA BLANCA
  "alicante": "Costa Blanca", "benidorm": "Costa Blanca", "altea": "Costa Blanca",
  "calpe": "Costa Blanca", "denia": "Costa Blanca", "javea": "Costa Blanca",
  "xabia": "Costa Blanca", "moraira": "Costa Blanca", "torrevieja": "Costa Blanca",
  "orihuela": "Costa Blanca", "orihuela costa": "Costa Blanca", "guardamar": "Costa Blanca",
  "santa pola": "Costa Blanca", "finestrat": "Costa Blanca", "villajoyosa": "Costa Blanca",
  "polop": "Costa Blanca", "elche": "Costa Blanca", "el campello": "Costa Blanca",
  "busot": "Costa Blanca", "cumbre del sol": "Costa Blanca",
  // COSTA DEL SOL
  "marbella": "Costa del Sol", "estepona": "Costa del Sol", "mijas": "Costa del Sol",
  "fuengirola": "Costa del Sol", "benalmadena": "Costa del Sol", "torremolinos": "Costa del Sol",
  "malaga": "Costa del Sol", "nerja": "Costa del Sol", "casares": "Costa del Sol",
  "manilva": "Costa del Sol", "sotogrande": "Costa del Sol", "san pedro de alcantara": "Costa del Sol",
  "benahavis": "Costa del Sol", "cancelada": "Costa del Sol",
  // COSTA CALIDA
  "murcia": "Costa Calida", "cartagena": "Costa Calida", "los alcazares": "Costa Calida",
  "san javier": "Costa Calida", "san pedro del pinatar": "Costa Calida", "mazarron": "Costa Calida",
  "aguilas": "Costa Calida", "la manga": "Costa Calida", "sucina": "Costa Calida",
  "bano y mendigo": "Costa Calida",
  // COSTA ALMERIA
  "almeria": "Costa Almeria", "roquetas de mar": "Costa Almeria", "mojacar": "Costa Almeria",
  "vera": "Costa Almeria", "san juan de los terreros": "Costa Almeria", "pulpi": "Costa Almeria",
  "cuevas del almanzora": "Costa Almeria"
};

const REGIONS_DISPLAY = [
  { name: "Costa Blanca", image: "/images/regions/1.jpg" },
  { name: "Costa del Sol", image: "/images/regions/2.jpg" },
  { name: "Costa Calida", image: "/images/regions/3.jpg" },
  { name: "Costa Almeria", image: "/images/regions/4.jpg" }
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Costa Blanca": 0, "Costa del Sol": 0, "Costa Calida": 0, "Costa Almeria": 0
    };

    if (!properties || properties.length === 0) return counts;

    properties.forEach(p => {
      const rawCity = (p.town || p.ville || "").toLowerCase().trim();
      const regionFound = CITY_TO_REGION_MAP[rawCity];
      
      if (regionFound) {
        counts[regionFound]++;
      } else {
        const rawRegion = p.region?.trim();
        if (rawRegion && counts[rawRegion] !== undefined) {
          counts[rawRegion]++;
        }
      }
    });

    return counts;
  }, [properties]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
      {REGIONS_DISPLAY.map((region, index) => {
        const count = regionCounts[region.name] || 0;
        
        return (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            onClick={() => onRegionClick(region.name)}
            className="group relative h-[520px] rounded-[3rem] overflow-hidden cursor-pointer bg-slate-900 shadow-2xl transition-all duration-700 hover:shadow-[#D4AF37]/20"
          >
            {/* Image avec opacité réduite */}
            <div className="absolute inset-0">
              <img 
                src={region.image} 
                alt={region.name} 
                className="w-full h-full object-cover transition-transform duration-1000 scale-105 group-hover:scale-110 opacity-50 group-hover:opacity-40" 
              />
              {/* Overlay dégradé noir pour assurer que le texte blanc soit toujours lisible */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
            </div>

            {/* Contenu */}
            <div className="absolute inset-0 z-10 p-10 flex flex-col items-center text-center">
              {/* Badge "Propriétés" : Toujours blanc/glass car sur fond sombre */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-xl">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
                  {count} Propriétés
                </span>
              </div>

              <div className="flex-grow" />

              <div className="space-y-6">
                {/* Nom de la région : Toujours blanc pur */}
                <h3 className="text-4xl md:text-5xl font-serif italic text-white leading-tight drop-shadow-2xl">
                  {region.name}
                </h3>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-px bg-[#D4AF37]/50" />
                  <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] opacity-90 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    Explorer <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bordure subtile de survol */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-[#D4AF37]/30 rounded-[3rem] transition-colors duration-700" />
          </motion.div>
        );
      })}
    </div>
  );
}