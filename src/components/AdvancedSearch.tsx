"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search, Map, Home, Euro, Hash, Bed, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties: any[];
  activeFilters: any;
  onClose?: () => void; // Ajout d'une prop optionnelle pour fermer la modale
}

export default function AdvancedSearch({
  onSearch,
  properties = [],
  activeFilters,
  onClose,
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const router = useRouter();

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // --- LOGIQUE DE DONNÉES ---
  const regions = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria"];
  
  const types = useMemo(() => {
    const translation: { [key: string]: string } = {
      villa: "Villa", apartment: "Appartement", penthouse: "Penthouse", bungalow: "Bungalow", townhouse: "Maison de ville"
    };
    return [...new Set(properties.map((p) => p.type))]
      .filter((t) => t && t.toLowerCase() !== "property")
      .map((t) => ({ id: t.toLowerCase(), label: translation[t.toLowerCase()] || t }));
  }, [properties]);

  // --- ACTIONS ---
  const handleSearchClick = () => {
    onSearch(localFilters);
    if (onClose) onClose(); // Ferme la modale après la recherche
  };

  const reset = () => {
    const empty = { 
      region: "", town: "", type: "", beds: "", 
      minPrice: "100000", maxPrice: "5000000", reference: "" 
    };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-[50]">
      <style jsx>{`
        .custom-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 5px;
          outline: none;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #D4AF37;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>

      {/* Bouton Fermer (Visible si utilisé dans une modale) */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-16 right-4 w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:bg-[#D4AF37] transition-all z-[60]"
        >
          <X size={24} />
        </button>
      )}

      {/* Container Principal */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-slate-100 p-3 relative">
        
        {/* Barre de préhension (Design Mobile) */}
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mt-2 mb-4 lg:hidden" />

        {/* LIGNE 1 : RÉFÉRENCE SEULE */}
        <div className="border-b border-slate-50">
          <div className="p-6 lg:p-8">
            <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-[#D4AF37] mb-2">
              <Hash size={12} /> Référence Propriété
            </label>
            <input 
              type="text"
              placeholder="Ex: REF-1234"
              value={localFilters.reference || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, reference: e.target.value })}
              className="w-full bg-transparent text-lg font-serif italic outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* LIGNE 2 : CRITÈRES (Région, Type, Min, Max, Lits) */}
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
            
            {/* RÉGION */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
                <Map size={12} /> Région
              </label>
              <select 
                value={localFilters.region || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
                className="w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none uppercase"
              >
                <option value="">Espagne (Toutes)</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* TYPE */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
                <Home size={12} /> Type
              </label>
              <select 
                value={localFilters.type || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                className="w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none uppercase"
              >
                <option value="">Indifférent</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* PRIX MIN */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400">Min</label>
                <span className="text-[11px] font-bold text-slate-900">
                  {parseInt(localFilters.minPrice || "100000").toLocaleString()} €
                </span>
              </div>
              <input 
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={localFilters.minPrice || "100000"}
                onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                className="custom-slider"
              />
            </div>

            {/* PRIX MAX */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400">Max</label>
                <span className="text-[11px] font-bold text-slate-900">
                  {parseInt(localFilters.maxPrice || "5000000").toLocaleString()} €
                </span>
              </div>
              <input 
                type="range"
                min="200000"
                max="5000000"
                step="50000"
                value={localFilters.maxPrice || "25000000"}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                className="custom-slider"
              />
            </div>

            {/* CHAMBRES */}
            <div className="p-6">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-3">
                <Bed size={12} /> Chambres
              </label>
              <div className="flex gap-1">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, beds: n.toString() })}
                    className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${
                      localFilters.beds === n.toString() 
                      ? "bg-slate-900 text-[#D4AF37]" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* BOUTON RECHERCHE */}
          <div className="p-4 flex items-center justify-center">
            <button 
              onClick={handleSearchClick}
              className="w-full lg:w-20 h-16 lg:h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center hover:bg-[#D4AF37] hover:text-black hover:scale-105 transition-all duration-300 shadow-xl group"
            >
              <Search size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-6 flex justify-between items-center px-8">
        <p className="text-[10px] text-slate-400 font-medium italic">
          {properties.length} propriétés trouvées
        </p>
        <button 
          onClick={reset}
          className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 tracking-[0.2em] transition-colors"
        >
          <RotateCcw size={12} /> Réinitialiser
        </button>
      </div>
    </div>
  );
}