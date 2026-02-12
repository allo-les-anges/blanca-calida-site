"use client";
// 1. AJOUT de useMemo ici
import React, { useState, useEffect, useMemo } from 'react'; 
import { RotateCcw, Search } from 'lucide-react';

export default function AdvancedSearch({ onSearch, properties = [], activeFilters }: any) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // Génération de la liste des villes
  const towns = useMemo(() => {
    return Array.from(new Set(properties.map((p: any) => p.town)))
      .filter(Boolean)
      .sort();
  }, [properties]);

  // Génération de la liste des types (Villa, Appartement, etc.)
  const types = useMemo(() => {
    return Array.from(new Set(properties.map((p: any) => 
      p.type || p.property_type || p.category 
    )))
    .filter(Boolean)
    .sort();
  }, [properties]);

  // Ce log va te dire exactement ce que le XML contient
  console.log("Ma première propriété :", properties[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
      <div className="bg-white shadow-2xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          
          {/* SELECT DESTINATION */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Destination</label>
            <select 
              value={localFilters.town}
              onChange={(e) => setLocalFilters({...localFilters, town: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none"
            >
              <option value="">Toutes les villes ({towns.length})</option>
              {towns.map((town: any) => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>

          {/* SELECT TYPE DE BIEN - Voici ce qu'il faut faire : */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Type de bien</label>
            <select 
              value={localFilters.type}
              // Quand on change l'option, on met à jour le filtre local
              onChange={(e) => setLocalFilters({...localFilters, type: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none"
            >
              <option value="">Tous les types ({types.length})</option>
              {/* On boucle sur la variable 'types' générée plus haut */}
              {types.map((type: any) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* ... Garde tes autres champs (Chambres, Prix, Réf) ... */}
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={() => onSearch({ town: '', type: '', beds: '', minPrice: '', maxPrice: '', reference: '' })}
            className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold"
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button 
            onClick={() => {
              console.log("🚀 CLIC RECHERCHE", localFilters);
              onSearch(localFilters);
            }} 
            className="bg-slate-900 text-white px-16 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-brand-primary transition-all flex items-center gap-3"
          >
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}