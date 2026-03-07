"use client";

import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Property {
  town?: string; // On cible la colonne 'town' du CSV
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
    description: "Dénia, Javea, Moraira, Altea, Calpe",
    // Liste exhaustive basée sur les occurrences du CSV
    towns: ["Dénia", "Javea", "Xàbia", "Moraira", "Altea", "Calpe", "Benidorm", "Finestrat", "Villajoyosa", "Polop", "La Nucia", "Benitachell", "Cumbre del Sol"]
  },
  {
    name: "Costa Blanca Sud",
    image: "/images/regions/2.jpg",
    description: "Alicante, Torrevieja, Orihuela Costa",
    towns: ["Alicante", "Torrevieja", "Orihuela Costa", "Santa Pola", "Guardamar del Segura", "Pilar de la Horadada", "San Miguel de Salinas", "Rojales", "Ciudad Quesada", "Algorfa"]
  },
  {
    name: "Costa Calida",
    image: "/images/regions/3.jpg",
    description: "Murcie, La Manga, Mar Menor",
    towns: ["Murcia", "Murcie", "Cartagena", "San Pedro del Pinatar", "Los Alcázares", "La Manga", "Águilas", "Lo Pagán", "Santiago de la Ribera"]
  },
  {
    name: "Valencia",
    image: "/images/regions/4.jpg",
    description: "Valence Ville & Environs",
    towns: ["Valencia", "Valence", "Sagunto", "Canet d'En Berenguer", "Gandia", "Cullera", "Oliva"]
  }
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  // Utilisation de useMemo pour scanner les 2500+ villas une seule fois par rendu
  // Cela garantit que l'on parcourt TOUT le tableau 'properties'
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    REGIONS_CONFIG.forEach(region => {
      const lowerCaseTowns = region.towns.map(t => t.toLowerCase());
      
      // On filtre sur l'intégralité du tableau fourni
      const match = properties.filter(p => {
        if (!p.town) return false;
        return lowerCaseTowns.includes(p.town.trim().toLowerCase());
      });
      
      counts[region.name] = match.length;
    });

    return counts;
  }, [properties]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
      {REGIONS_CONFIG.map((region, index) => {
        const count = regionCounts[region.name] || 0;
        
        return (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onRegionClick(region.name)}
            className="group relative h-[520px] rounded-[3rem] overflow-hidden cursor-pointer bg-slate-900 shadow-2xl transition-all duration-700"
          >
            {/* IMAGE ET OVERLAY */}
            <div className="absolute inset-0 z-0">
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-700" />
            </div>

            {/* CONTENU ALIGNÉ */}
            <div className="absolute inset-0 z-10 p-10 flex flex-col items-center">
              
              {/* BADGE COMPTEUR */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-xl">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
                  {count} {count > 1 ? 'Propriétés' : 'Propriété'}
                </span>
              </div>

              <div className="flex-grow" />

              <div className="w-full flex flex-col items-center text-center">
                
                {/* TITRE SERIF ITALIC - ALIGNEMENT FIXE */}
                <div className="h-24 flex items-center justify-center mb-2">
                  <h3 className="text-3xl md:text-4xl font-serif italic text-white leading-tight">
                    {region.name}
                  </h3>
                </div>

                {/* HOVER CONTENT */}
                <div className="h-0 opacity-0 group-hover:h-24 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                  <p className="text-[#D4AF37] text-[11px] font-medium uppercase tracking-[0.2em] mb-6 max-w-[200px] mx-auto leading-relaxed">
                    {region.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 text-white text-[9px] font-bold uppercase tracking-[0.4em] border-t border-white/10 pt-4 w-fit mx-auto">
                    Explorer <ChevronRight size={14} className="text-[#D4AF37]" />
                  </div>
                </div>
                
              </div>
            </div>

            {/* EFFET SHINE */}
            <div className="absolute -inset-full top-0 z-20 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shine_1.6s_ease-in-out]" />
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