"use client";

import React, { useMemo } from 'react';
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
  "alicante": "Costa Blanca", "benidorm": "Costa Blanca", "altea": "Costa Blanca",
  "calpe": "Costa Blanca", "denia": "Costa Blanca", "javea": "Costa Blanca",
  "xabia": "Costa Blanca", "moraira": "Costa Blanca", "torrevieja": "Costa Blanca",
  "orihuela": "Costa Blanca", "orihuela costa": "Costa Blanca", "guardamar": "Costa Blanca",
  "santa pola": "Costa Blanca", "finestrat": "Costa Blanca", "villajoyosa": "Costa Blanca",
  "polop": "Costa Blanca", "elche": "Costa Blanca", "el campello": "Costa Blanca",
  "busot": "Costa Blanca", "cumbre del sol": "Costa Blanca",
  "marbella": "Costa del Sol", "estepona": "Costa del Sol", "mijas": "Costa del Sol",
  "fuengirola": "Costa del Sol", "benalmadena": "Costa del Sol", "torremolinos": "Costa del Sol",
  "malaga": "Costa del Sol", "nerja": "Costa del Sol", "casares": "Costa del Sol",
  "manilva": "Costa del Sol", "sotogrande": "Costa del Sol", "san pedro de alcantara": "Costa del Sol",
  "benahavis": "Costa del Sol", "cancelada": "Costa del Sol",
  "murcia": "Costa Calida", "cartagena": "Costa Calida", "los alcazares": "Costa Calida",
  "san javier": "Costa Calida", "san pedro del pinatar": "Costa Calida", "mazarron": "Costa Calida",
  "aguilas": "Costa Calida", "la manga": "Costa Calida", "sucina": "Costa Calida",
  "bano y mendigo": "Costa Calida",
  "almeria": "Costa Almeria", "roquetas de mar": "Costa Almeria", "mojacar": "Costa Almeria",
  "vera": "Costa Almeria", "san juan de los terreros": "Costa Almeria", "pulpi": "Costa Almeria",
  "cuevas del almanzora": "Costa Almeria"
};

const REGIONS_DISPLAY = [
  { name: "Costa Blanca", image: "/images/regions/1.jpg", size: "md:col-span-2 md:row-span-1" },
  { name: "Costa del Sol", image: "/images/regions/2.jpg", size: "md:col-span-1 md:row-span-2" },
  { name: "Costa Calida", image: "/images/regions/3.jpg", size: "md:col-span-1 md:row-span-1" },
  { name: "Costa Almeria", image: "/images/regions/4.jpg", size: "md:col-span-1 md:row-span-1" }
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
    <section className="max-w-[1400px] mx-auto px-6 py-24 bg-white dark:bg-[#0A0A0A]">
      {/* En-tête minimaliste */}
      <div className="mb-20">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-4">
          Destinations d'exception
        </h2>
        <p className="text-4xl md:text-6xl font-serif italic text-slate-900 dark:text-white leading-tight">
          Explorez nos régions <br /> les plus prisées.
        </p>
      </div>

      {/* Grille Asymétrique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
        {REGIONS_DISPLAY.map((region, index) => {
          const count = regionCounts[region.name] || 0;
          
          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onRegionClick(region.name)}
              className={`${region.size} group relative overflow-hidden cursor-pointer`}
            >
              {/* Image avec zoom progressif */}
              <div className="absolute inset-0">
                <img 
                  src={region.image} 
                  alt={region.name} 
                  className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-110" 
                />
                {/* Overlay dégradé subtil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
              </div>

              {/* Contenu textuel */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="overflow-hidden">
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-2"
                  >
                    {count} Propriétés disponibles
                  </motion.p>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-serif italic text-white mb-6 transform group-hover:-translate-y-2 transition-transform duration-700">
                  {region.name}
                </h3>

                {/* Bouton fantôme qui apparaît au survol */}
                <div className="h-px bg-white/30 w-0 group-hover:w-full transition-all duration-1000 ease-in-out" />
                <span className="mt-4 text-[8px] uppercase tracking-[0.4em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                  Découvrir la collection
                </span>
              </div>

              {/* Bordure de finition fine */}
              <div className="absolute inset-0 border border-white/5 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}