import React from 'react';

export default function AdvancedSearch() {
  return (
    <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
      <div className="bg-white shadow-2xl p-2 md:p-4 flex flex-col md:flex-row items-center gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        
        {/* Ville */}
        <div className="w-full md:w-1/4 px-4 py-3">
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Localisation</label>
          <select className="w-full bg-transparent font-serif outline-none text-slate-800">
            <option>Toutes les villes</option>
            <option>Javea</option>
            <option>Moraira</option>
          </select>
        </div>

        {/* Chambres */}
        <div className="w-full md:w-1/4 px-4 py-3">
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Chambres</label>
          <select className="w-full bg-transparent font-serif outline-none text-slate-800">
            <option>Min. 1</option>
            <option>2+</option>
            <option>4+</option>
          </select>
        </div>

        {/* Référence */}
        <div className="w-full md:w-1/4 px-4 py-3">
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Référence interne</label>
          <input 
            type="text" 
            placeholder="Ex: BC-102" 
            className="w-full bg-transparent font-serif outline-none text-slate-800 placeholder:text-gray-300"
          />
        </div>

        {/* Bouton */}
        <div className="w-full md:w-1/4 p-2">
          <button className="w-full bg-slate-900 text-white py-4 px-6 uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary transition-colors duration-300">
            Rechercher
          </button>
        </div>

      </div>
    </div>
  );
}