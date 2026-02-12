import React, { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
}

export default function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState({
    town: '',
    type: '',
    beds: '',
    minPrice: '',
    maxPrice: '',
    reference: '',
    isNew: false
  });

  const handleReset = () => {
    const empty = { town: '', type: '', beds: '', minPrice: '', maxPrice: '', reference: '', isNew: false };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-30">
      <div className="bg-[#d1bfa7]/90 backdrop-blur-md shadow-2xl p-6 rounded-sm">
        
        {/* LIGNE 1 : SELECTEURS */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-0 divide-x divide-white/20 mb-6 border-b border-white/20 pb-6">
          <div className="px-4">
            <label className="block text-[10px] uppercase tracking-tighter text-white/60 mb-1 font-bold">Côte</label>
            <select className="w-full bg-transparent text-white outline-none cursor-pointer">
              <option className="text-slate-800">Costa Blanca</option>
            </select>
          </div>
          <div className="px-4">
            <label className="block text-[10px] uppercase tracking-tighter text-white/60 mb-1 font-bold">Ville</label>
            <select 
              value={localFilters.town}
              onChange={(e) => setLocalFilters({...localFilters, town: e.target.value})}
              className="w-full bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="" className="text-slate-800">Ville</option>
              <option value="Javea" className="text-slate-800">Javea</option>
              <option value="Moraira" className="text-slate-800">Moraira</option>
            </select>
          </div>
          <div className="px-4">
            <label className="block text-[10px] uppercase tracking-tighter text-white/60 mb-1 font-bold">Type</label>
            <select 
              value={localFilters.type}
              onChange={(e) => setLocalFilters({...localFilters, type: e.target.value})}
              className="w-full bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="" className="text-slate-800">Type de bien</option>
              <option value="Villa" className="text-slate-800">Villa</option>
              <option value="Appartement" className="text-slate-800">Appartement</option>
            </select>
          </div>
          <div className="px-4">
            <label className="block text-[10px] uppercase tracking-tighter text-white/60 mb-1 font-bold">Chambres</label>
            <select 
              value={localFilters.beds}
              onChange={(e) => setLocalFilters({...localFilters, beds: e.target.value})}
              className="w-full bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="" className="text-slate-800">Chambres</option>
              <option value="2" className="text-slate-800">2+</option>
              <option value="4" className="text-slate-800">4+</option>
            </select>
          </div>
          <div className="px-4">
            <label className="block text-[10px] uppercase tracking-tighter text-white/60 mb-1 font-bold">Prix Min</label>
            <select 
              value={localFilters.minPrice}
              onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value})}
              className="w-full bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="" className="text-slate-800">Prix min</option>
              <option value="500000" className="text-slate-800">500 000 €</option>
            </select>
          </div>
          <div className="px-4">
            <label className="block text-[10px] uppercase tracking-tighter text-white/60 mb-1 font-bold">Prix Max</label>
            <select 
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
              className="w-full bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="" className="text-slate-800">Prix max</option>
              <option value="2000000" className="text-slate-800">2 000 000 €</option>
            </select>
          </div>
        </div>

        {/* LIGNE 2 : OPTIONS & RÉFÉRENCE */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 border-2 border-white flex items-center justify-center transition-colors ${localFilters.isNew ? 'bg-white' : ''}`}>
                {localFilters.isNew && <div className="w-2 h-2 bg-[#d1bfa7]" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={localFilters.isNew}
                onChange={() => setLocalFilters({...localFilters, isNew: !localFilters.isNew})}
              />
              <span className="text-white text-[11px] uppercase tracking-widest font-bold">Nouvelle construction</span>
            </label>

            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-white text-[11px] uppercase tracking-widest font-bold hover:opacity-70 transition"
            >
              <RotateCcw size={14} /> Réinitialiser le filtre
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <input 
                type="text"
                placeholder="Référence..."
                value={localFilters.reference}
                onChange={(e) => setLocalFilters({...localFilters, reference: e.target.value})}
                className="w-full bg-white/20 border border-white/30 text-white placeholder:text-white/60 px-4 py-3 outline-none focus:bg-white/30 transition text-sm font-serif italic"
              />
            </div>
            <button 
              onClick={() => onSearch(localFilters)}
              className="bg-white text-slate-800 px-10 py-3 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-slate-800 hover:text-white transition-all duration-500 flex items-center gap-2"
            >
              <Search size={14} /> Rechercher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}