"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";
import { useSearchParams } from "next/navigation";

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
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const isLight = searchParams.get('pack') === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Costa Blanca": 0, "Costa del Sol": 0, "Costa Calida": 0, "Costa Almeria": 0
    };
    if (!properties || properties.length === 0) return counts;
    properties.forEach(p => {
      const rawCity = (p.town || p.ville || "").toLowerCase().trim();
      const regionFound = CITY_TO_REGION_MAP[rawCity];
      if (regionFound) counts[regionFound]++;
      else {
        const rawRegion = p.region?.trim();
        if (rawRegion && counts[rawRegion] !== undefined) counts[rawRegion]++;
      }
    });
    return counts;
  }, [properties]);

  if (!mounted) return null;

  const isDarkVisual = resolvedTheme === "dark" && !isLight;

  return (
    <section 
      className="max-w-[1600px] mx-auto px-6 py-20 transition-colors duration-500"
      style={{ backgroundColor: isDarkVisual ? '#0A0A0A' : '#FFFFFF' }}
    >
      
      {/* HEADER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
              {t('home.regionGrid.ourDestinations')}
            </span>
            <h2 
              className="text-4xl md:text-6xl font-serif italic leading-tight"
              style={{ color: isDarkVisual ? '#FFFFFF' : '#0f172a' }}
            >
              {t('home.regionGrid.exceptionalPlaces')}
            </h2>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xs border-l pl-6 pb-1"
          style={{ borderColor: isDarkVisual ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
        >
          <p 
            className="text-xs font-light leading-relaxed italic"
            style={{ color: isDarkVisual ? '#CBD5E1' : '#64748b' }}
          >
            {t('home.regionGrid.description')}
          </p>
        </motion.div>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
        {REGIONS_DISPLAY.map((region, index) => {
          const count = regionCounts[region.name] || 0;
          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, scale: 0.99 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              onClick={() => onRegionClick(region.name)}
              className={`${region.size} group relative overflow-hidden cursor-pointer bg-slate-900 rounded-none`}
            >
              <div className="absolute inset-0">
                <img 
                  src={region.image} 
                  alt={region.name} 
                  className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end items-start text-white">
                <motion.div className="space-y-2 w-full">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    {count} {t('home.regionGrid.properties')}
                  </p>
                  <h3 className="text-2xl md:text-4xl font-serif italic leading-none text-white">
                    {region.name}
                  </h3>
                  <div className="relative pt-4">
                    <div className="absolute top-0 left-0 w-8 h-[1px] bg-white/40 group-hover:w-full transition-all duration-700" />
                    <div className="flex items-center justify-between pt-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-[8px] uppercase tracking-[0.4em] font-light text-white">
                        {t('home.regionGrid.discover')}
                      </span>
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