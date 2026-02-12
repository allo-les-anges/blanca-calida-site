"use client";
import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import { RotateCcw, Search } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties: any[];
  activeFilters?: any; // Ajout pour recevoir les filtres de la page parente
}

export default function AdvancedSearch({ onSearch, properties, activeFilters }: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState({
    town: '',
    type: '',
    beds: '',
    minPrice: '',
    maxPrice: '',
    reference: ''
  });

  // NOUVEAU : Met à jour le formulaire si on clique sur une région ou un type ailleurs sur la page
  useEffect(() => {
    if (activeFilters) {
      setLocalFilters(prev => ({ ...prev, ...activeFilters }));
    }
  }, [activeFilters]);

  // Extraction dynamique des données
  const towns = Array.from(new Set(properties.map(p => p.town))).filter(Boolean).sort();
  const types = Array.from(new Set(properties.map(p => p.type))).filter(Boolean).sort();

  const handleReset = () => {
    const empty = { town: '', type: '', beds: '', minPrice: '', maxPrice: '', reference: '' };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
      <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 md:p-8 rounded-none border border-gray-100">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          
          {/* Destination / Ville */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Destination</label>
            <select 
              value={localFilters.town}
              onChange={(e) => setLocalFilters({...localFilters, town: e.target.value})}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-medium uppercase tracking-wider"
            >
              <option value="">Toutes les villes</option>
              {towns.map(town => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>

          {/* Type de bien */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Type de bien</label>
            <select 
              value={localFilters.type}
              onChange={(e) => setLocalFilters({...localFilters, type: e.target.value})}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-medium uppercase tracking-wider"
            >
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Chambres */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Chambres</label>
            <select 
              value={localFilters.beds}
              onChange={(e) => setLocalFilters({...localFilters, beds: e.target.value})}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-medium uppercase tracking-wider"
            >
              <option value="">Indifférent</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Prix Min */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Prix Min</label>
            <select 
              value={localFilters.minPrice}
              onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value})}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-medium uppercase tracking-wider"
            >
              <option value="">0 €</option>
              <option value="500000">500k €</option>
              <option value="1000000">1M €</option>
              <option value="2000000">2M €</option>
            </select>
          </div>

          {/* Prix Max */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Prix Max</label>
            <select 
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-medium uppercase tracking-wider"
            >
              <option value="">Illimité</option>
              <option value="1500000">1.5M €</option>
              <option value="3000000">3M €</option>
              <option value="5000000">5M €</option>
              <option value="10000000">10M €</option>
            </select>
          </div>

          {/* Référence */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Référence</label>
            <input 
              type="text"
              placeholder="EX: BC-102"
              value={localFilters.reference}
              onChange={(e) => setLocalFilters({...localFilters, reference: e.target.value})}
              className="bg-transparent text-slate-800 outline-none text-xs font-medium uppercase tracking-wider placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-slate-900 transition-colors"
          >
            <RotateCcw size={12} /> Reset filters
          </button>

          <button 
            onClick={() => onSearch(localFilters)}
            className="w-full sm:w-auto bg-slate-900 text-white px-16 py-4 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-brand-primary transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}