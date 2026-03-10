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
    <section className="max-w-[1600px] mx-auto px-6 py-24 bg-white dark:bg-[#0A0A0A]">
      <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.6em] mb-6 block">
              Nos Destinations
            </span>
            <h2 className="text-5xl md:text-8xl font-serif italic text-slate-900 dark:text-white leading-[1.1]">
              Destinations <br /> d'Exception
            </h2>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xs border-l border-slate-200 dark:border-white/10 pl-8 pb-2"
        >
          <p className="text-slate-500 dark:text-white text-sm font-light leading-relaxed italic">
            "Une sélection rigoureuse des enclaves les plus prestigieuses du littoral espagnol."
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px] md:auto-rows-[480px]">
        {REGIONS_DISPLAY.map((region, index) => {
          const count = regionCounts[region.name] || 0;
          
          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
              onClick={() => onRegionClick(region.name)}
              className={`${region.size} group relative overflow-hidden cursor-pointer bg-slate-900 rounded-sm`}
            >
              <div className="absolute inset-0">
                <img 
                  src={region.image} 
                  alt={region.name} 
                  className="w-full h-full object-cover transition-transform duration-[5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-80 transition-opacity" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              <div className="absolute inset-0 p-12 flex flex-col justify-end items-start text-white">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="space-y-4 w-full"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
                    {count} Propriétés
                  </p>
                  
                  <h3 className="text-3xl md:text-5xl font-serif italic leading-none text-white">
                    {region.name}
                  </h3>
                  
                  <div className="relative pt-6">
                    <div className="absolute top-0 left-0 w-12 h-[1px] bg-white/60 group-hover:w-full transition-all duration-1000 ease-in-out" />
                    <div className="flex items-center justify-between pt-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
                      <span className="text-[9px] uppercase tracking-[0.5em] font-light text-white">
                        Explorer le portfolio
                      </span>
                      <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute inset-0 border border-white/5 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}