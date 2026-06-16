"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search, Map, Home, Hash, Bed, X } from "lucide-react";

const DEFAULT_MIN_PRICE = "";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties: any[];
  activeFilters: any;
  onClose?: () => void;
  isLight?: boolean; // AJOUTÉ : Pour corriger l'erreur de build TypeScript
}

export default function AdvancedSearch({
  onSearch,
  properties = [],
  activeFilters,
  onClose,
  isLight = false, // AJOUTÉ : Récupération de la prop
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const updatePriceFilter = (key: "minPrice" | "maxPrice", value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, "");
    setLocalFilters({ ...localFilters, [key]: digitsOnly });
  };

  // --- LOGIQUE DE DONNÉES ---
  const regions = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria", "Portugal"];
  
  const types = useMemo(() => {
    const translation: { [key: string]: string } = {
      villa: "Villa", apartment: "Appartement", penthouse: "Penthouse", bungalow: "Bungalow", townhouse: "Maison de ville"
    };
    const safeProps = Array.isArray(properties) ? properties : [];
    return [...new Set(safeProps.map((p) => p.type))]
      .filter((t) => t && t.toLowerCase() !== "property")
      .map((t) => ({ id: t.toLowerCase(), label: translation[t.toLowerCase()] || t }));
  }, [properties]);

  // --- ACTIONS ---
  const handleSearchClick = () => {
    const cleanedFilters = {
      ...localFilters,
      reference: localFilters.reference?.trim().toLowerCase() || "",
      region: localFilters.region || "",
      type: localFilters.type || "",
      beds: localFilters.beds || "",
      minPrice: localFilters.minPrice || "",
      maxPrice: localFilters.maxPrice || ""
    };
    onSearch(cleanedFilters);
    if (onClose) onClose();
  };

  const reset = () => {
    const empty = { 
      region: "", town: "", type: "", beds: "", 
      minPrice: DEFAULT_MIN_PRICE, maxPrice: "", reference: ""
    };
    setLocalFilters(empty);
    onSearch(empty);
  };

  // --- STYLES DYNAMIQUES ---
  const cardBg = isLight ? "bg-white" : "bg-[#030303]";
  const textColor = isLight ? "text-slate-900" : "text-white";
  const mutedText = isLight ? "text-slate-500" : "text-[#D8C9B6]";
  const inputText = isLight ? "text-slate-900 placeholder:text-slate-300" : "text-white placeholder:text-[#D8C9B6]/70";
  const borderColor = isLight ? "border-slate-100" : "border-white/20";
  const fieldBorder = isLight ? "border-slate-100" : "border-white/20";
  const optionBg = isLight ? "bg-white text-slate-900" : "bg-[#030303] text-white";

  return (
    <div className="max-w-7xl mx-auto px-4 relative z-[100]">
      <style jsx>{`
        .custom-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: ${isLight ? '#D8C9B6' : '#D8C9B6'};
          border-radius: 5px;
          outline: none;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #D8C9B6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px color-mix(in srgb, #D8C9B6 40%, transparent);
        }
      `}</style>

      {/* Bouton Fermer */}
      {onClose && (
        <button 
          onClick={onClose}
          className={`absolute -top-6 -right-2 md:right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-[#D8C9B6] hover:text-white transition-all z-[110] border ${
            isLight ? "bg-white text-slate-900 border-slate-200" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
          }`}
        >
          <X size={24} />
        </button>
      )}

      {/* Container Principal */}
      <div className={`${cardBg} rounded-[2.5rem] shadow-2xl border ${borderColor} p-3 relative`}>
        
        <div className={`w-12 h-1.5 rounded-full mx-auto mt-2 mb-4 lg:hidden ${isLight ? 'bg-slate-100' : 'bg-slate-100 dark:bg-slate-800'}`} />

        {/* LIGNE 1 : RÉFÉRENCE */}
        <div className={`border-b ${fieldBorder}`}>
          <div className="p-6 lg:p-8">
            <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-[#D8C9B6] mb-2">
              <Hash size={12} /> Référence Propriété
            </label>
            <input 
              type="text"
              placeholder="Ex: REF-1234"
              value={localFilters.reference || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, reference: e.target.value })}
              className={`w-full bg-transparent text-lg font-serif italic outline-none ${inputText}`}
            />
          </div>
        </div>

        {/* LIGNE 2 : CRITÈRES */}
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
            
            {/* RÉGION */}
            <div className={`p-6 border-b md:border-b-0 md:border-r ${fieldBorder}`}>
              <label className={`flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] mb-2 ${mutedText}`}>
                <Map size={12} /> Région
              </label>
              <select 
                value={localFilters.region || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
                className={`w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none uppercase ${textColor}`}
              >
                <option value="" className={optionBg}>Toutes destinations</option>
                {regions.map(r => <option key={r} value={r} className={optionBg}>{r}</option>)}
              </select>
            </div>

            {/* TYPE */}
            <div className={`p-6 border-b md:border-b-0 md:border-r ${fieldBorder}`}>
              <label className={`flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] mb-2 ${mutedText}`}>
                <Home size={12} /> Type
              </label>
              <select 
                value={localFilters.type || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                className={`w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none uppercase ${textColor}`}
              >
                <option value="" className={optionBg}>Indifférent</option>
                {types.map(t => <option key={t.id} value={t.id} className={optionBg}>{t.label}</option>)}
              </select>
            </div>

            {/* PRIX MIN */}
            <div className={`p-6 border-b md:border-b-0 md:border-r ${fieldBorder}`}>
              <div className="flex justify-between items-center mb-3 gap-3">
                <label className={`text-[9px] uppercase font-black tracking-[0.2em] ${mutedText}`}>Min</label>
                <div className={`flex items-center gap-1 rounded-xl border px-3 py-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/15 bg-white/5'}`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={localFilters.minPrice || ""}
                    onChange={(e) => updatePriceFilter("minPrice", e.target.value)}
                    placeholder="0"
                    className={`w-20 bg-transparent text-right text-[11px] font-bold outline-none ${inputText}`}
                  />
                  <span className={`text-[11px] font-bold ${mutedText}`}>€</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="75000000"
                step="50000"
                value={localFilters.minPrice || "0"}
                onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                className="custom-slider"
              />
            </div>

            {/* PRIX MAX */}
            <div className={`p-6 border-b md:border-b-0 md:border-r ${fieldBorder}`}>
              <div className="flex justify-between items-center mb-3 gap-3">
                <label className={`text-[9px] uppercase font-black tracking-[0.2em] ${mutedText}`}>Max</label>
                <div className={`flex items-center gap-1 rounded-xl border px-3 py-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/15 bg-white/5'}`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={localFilters.maxPrice || ""}
                    onChange={(e) => updatePriceFilter("maxPrice", e.target.value)}
                    placeholder="75000000"
                    className={`w-20 bg-transparent text-right text-[11px] font-bold outline-none ${inputText}`}
                  />
                  <span className={`text-[11px] font-bold ${mutedText}`}>€</span>
                </div>
              </div>
              <input
                type="range"
                min="200000"
                max="75000000"
                step="50000"
                value={localFilters.maxPrice || "75000000"}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                className="custom-slider"
              />
            </div>

            {/* CHAMBRES */}
            <div className="p-6">
              <label className={`flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] mb-3 ${mutedText}`}>
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
                      ? "bg-[#D8C9B6] text-white" 
                      : `${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-500' : 'bg-white/5 hover:bg-white/10 text-white'}`
                    }`}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* BOUTON RECHERCHE */}
          <div className={`p-4 flex items-center justify-center rounded-r-[2.5rem] ${isLight ? 'bg-slate-50/50' : 'lg:bg-slate-50/30 dark:lg:bg-slate-800/30'}`}>
            <button 
              onClick={handleSearchClick}
              className={`w-full lg:w-20 h-16 lg:h-20 rounded-3xl flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-xl ${
                isLight ? "bg-black text-white" : "bg-slate-950 dark:bg-[#D8C9B6] text-white dark:text-slate-900"
              }`}
            >
              <Search size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex justify-between items-center px-8">
        <p className={`text-[10px] font-medium italic ${isLight ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
          Collection Amaru • Sélection Exclusive
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
