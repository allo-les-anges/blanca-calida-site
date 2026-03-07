"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Property {
  town?: string; // Utilisation de la colonne 'town' du CSV
  [key: string]: any;
}

interface RegionGridProps {
  properties: Property[];
  onRegionClick: (regionName: string) => void;
}

// CONFIGURATION PRÉCISE PAR VILLE (Basée sur votre CSV)
const REGIONS_CONFIG = [
  {
    name: "Costa Blanca Nord",
    image: "/images/regions/1.jpg",
    description: "Dénia, Javea, Moraira, Altea",
    // Liste des villes exactes pour cette catégorie
    towns: ["Dénia", "Javea", "Xàbia", "Moraira", "Altea", "Calpe", "Benidorm", "Finestrat", "Villajoyosa"]
  },
  {
    name: "Costa Blanca Sud",
    image: "/images/regions/2.jpg",
    description: "Alicante, Torrevieja, Orihuela Costa",
    towns: ["Alicante", "Torrevieja", "Orihuela Costa", "Santa Pola", "Guardamar del Segura", "Pilar de la Horadada", "San Miguel de Salinas"]
  },
  {
    name: "Costa Calida",
    image: "/images/regions/3.jpg",
    description: "Murcie, La Manga, Mar Menor",
    towns: ["Murcia", "Murcie", "Cartagena", "San Pedro del Pinatar", "Los Alcázares", "La Manga", "Águilas"]
  },
  {
    name: "Valencia",
    image: "/images/regions/4.jpg",
    description: "Valence Ville & Environs",
    towns: ["Valencia", "Valence", "Sagunto", "Canet d'En Berenguer", "Gandia"]
  }
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  // SYSTÈME DE COMPTAGE BASÉ SUR LA COLONNE 'TOWN'
  const getCount = (townList: string[]) => {
    if (!properties || !Array.isArray(properties)) return 0;

    return properties.filter(p => {
      if (!p.town) return false;
      const villaTown = p.town.trim().toLowerCase();
      // On vérifie si la ville de la villa est dans notre liste de villes pour cette région
      return townList.some(t => t.toLowerCase() === villaTown);
    }).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
      {REGIONS_CONFIG.map((region, index) => {
        const count = getCount(region.towns);
        
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
            {/* IMAGE DE FOND */}
            <div className="absolute inset-0 z-0">
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-700" />
            </div>

            {/* CONTENU ALIGNÉ PRÉCISÉMENT */}
            <div className="absolute inset-0 z-10 p-10 flex flex-col items-center">
              
              {/* BADGE COMPTEUR (En haut, centré) */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
                  {count} {count > 1 ? 'Propriétés' : 'Propriété'}
                </span>
              </div>

              {/* ESPACEUR FLEXIBLE */}
              <div className="flex-grow" />

              {/* BLOC TEXTE (Hauteur fixe pour alignement parfait entre vignettes) */}
              <div className="w-full flex flex-col items-center text-center">
                
                {/* TITRE SERIF (Même hauteur pour toutes les vignettes) */}
                <div className="h-24 flex items-center justify-center mb-2">
                  <h3 className="text-3xl md:text-4xl font-serif italic text-white leading-tight">
                    {region.name}
                  </h3>
                </div>

                {/* ÉLÉMENTS AU SURVOL (Description + Call to Action) */}
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

            {/* EFFET SHINE (BRILLANCE LUXE) */}
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