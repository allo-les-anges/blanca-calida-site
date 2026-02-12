"use client";
import React, { useState, useEffect, useMemo } from 'react'; 
import { RotateCcw, Search } from 'lucide-react';

export default function AdvancedSearch({ onSearch, properties = [], activeFilters }: any) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  // Synchronisation des filtres avec le parent
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // 1. GÉNÉRATION DE LA LISTE DES VILLES (Basé sur le champ <town> du XML)
  const towns = useMemo(() => {
    if (!properties) return [];
    return Array.from(new Set(properties.map((p: any) => p.town)))
      .filter(Boolean)
      .sort();
  }, [properties]);

  // GÉNÉRATION DE LA LISTE DES TYPES (MÉTHODE FORCE BRUTE)
  const types = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    const foundTypes = new Set<string>();

    properties.forEach((p: any) => {
      // On récupère toutes les valeurs texte du bien
      const allValues = Object.values(p).map(v => String(v).toLowerCase());
      
      // On cherche si l'un des mots clés est présent dans n'importe quel champ
      if (allValues.some(v => v.includes('villa'))) foundTypes.add("Villa");
      if (allValues.some(v => v.includes('appartement') || v.includes('apartment'))) foundTypes.add("Appartement");
      if (allValues.some(v => v.includes('terrain') || v.includes('plot'))) foundTypes.add("Terrain");
      if (allValues.some(v => v.includes('finca') || v.includes('maison'))) foundTypes.add("Maison de campagne");
    });

    return Array.from(foundTypes).sort();
  }, [properties]);

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
      <div className="bg-white shadow-2xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          
          {/* DESTINATION */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Destination</label>
            <select 
              value={localFilters.town || ""}
              onChange={(e) => setLocalFilters({...localFilters, town: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
            >
              <option value="">Toutes les villes ({towns.length})</option>
              {towns.map((town: any) => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>

          {/* TYPE DE BIEN */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Type de bien</label>
            <select 
              value={localFilters.type || ""}
              onChange={(e) => setLocalFilters({...localFilters, type: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
            >
              <option value="">Tous les types ({types.length})</option>
              {types.map((type: any) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* CHAMBRES */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Chambres</label>
            <select 
              value={localFilters.beds || ""}
              onChange={(e) => setLocalFilters({...localFilters, beds: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
            >
              <option value="">Indifférent</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n.toString()}>{n}+ Chambres</option>
              ))}
            </select>
          </div>

          {/* PRIX MIN */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Prix Min</label>
            <select 
              value={localFilters.minPrice || ""}
              onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none"
            >
              <option value="">0 €</option>
              {[100000, 200000, 300000, 500000, 750000, 1000000].map(p => (
                <option key={p} value={p.toString()}>{p.toLocaleString()} €</option>
              ))}
            </select>
          </div>

          {/* PRIX MAX */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Prix Max</label>
            <select 
              value={localFilters.maxPrice || ""}
              onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none"
            >
              <option value="">Illimité</option>
              {[200000, 400000, 600000, 800000, 1000000, 2000000].map(p => (
                <option key={p} value={p.toString()}>{p.toLocaleString()} €</option>
              ))}
            </select>
          </div>

          {/* RÉFÉRENCE */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">Référence</label>
            <input 
              type="text"
              placeholder="EX: BC-102"
              value={localFilters.reference || ""}
              onChange={(e) => setLocalFilters({...localFilters, reference: e.target.value})}
              className="bg-transparent text-xs uppercase font-medium outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button 
            type="button"
            onClick={() => onSearch({ town: '', type: '', beds: '', minPrice: '', maxPrice: '', reference: '' })}
            className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold hover:text-gray-600 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button 
            type="button"
            onClick={() => onSearch(localFilters)} 
            className="bg-slate-900 text-white px-16 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-slate-800 transition-all flex items-center gap-3"
          >
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}