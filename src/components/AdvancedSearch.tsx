import React from 'react';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
}

export default function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
      <div className="bg-white shadow-2xl p-2 md:p-4 flex flex-col md:flex-row items-center gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        
        {/* Exemple simple pour Ville */}
        <div className="w-full md:w-1/4 px-4 py-3">
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Localisation</label>
          <select 
            onChange={(e) => onSearch({ town: e.target.value })}
            className="w-full bg-transparent font-serif outline-none text-slate-800"
          >
            <option value="">Toutes les villes</option>
            <option value="Javea">Javea</option>
            <option value="Moraira">Moraira</option>
          </select>
        </div>

        {/* ... Autres champs (Chambres, Référence) ... */}

        <div className="w-full md:w-1/4 p-2">
          <button 
            onClick={() => onSearch({})} // Déclenche la recherche
            className="w-full bg-slate-900 text-white py-4 px-6 uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary transition-colors duration-300"
          >
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
}