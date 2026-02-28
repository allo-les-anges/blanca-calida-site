"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search, Map, Home, Euro, Hash, Bed } from "lucide-react";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties: any[];
  activeFilters: any;
}

export default function AdvancedSearch({
  onSearch,
  properties = [],
  activeFilters,
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // Données pour les menus
  const regions = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria"];
  
  const priceOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i <= 20; i++) opts.push(200000 + i * 150000);
    return opts;
  }, []);

  const types = useMemo(() => {
    const translation: { [key: string]: string } = {
      villa: "Villa", apartment: "Appartement", penthouse: "Penthouse", bungalow: "Bungalow"
    };
    return [...new Set(properties.map((p) => p.type))]
      .filter((t) => t && t.toLowerCase() !== "property")
      .map((t) => ({ id: t.toLowerCase(), label: translation[t.toLowerCase()] || t }));
  }, [properties]);

  const handleSearchClick = () => {
    onSearch(localFilters);
  };

  const reset = () => {
    const empty = { region: "", type: "", beds: "", minPrice: "", maxPrice: "", reference: "" };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-[50]">
      {/* Container Principal Style "Luxe" */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-slate-100 p-2">
        
        <div className="flex flex-col lg:flex-row items-stretch">
          
          {/* SECTION 1 : RÉFÉRENCE (Rapide et Stylisée) */}
          <div className="flex-[0.8] border-b lg:border-b-0 lg:border-r border-slate-50 p-6 lg:p-8">
            <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-emerald-600 mb-3">
              <Hash size={12} /> ID Propriété
            </label>
            <input 
              type="text"
              placeholder="Ex: REF-2024..."
              value={localFilters.reference || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, reference: e.target.value })}
              className="w-full bg-transparent text-sm font-medium placeholder:text-slate-300 outline-none focus:ring-0"
            />
          </div>

          {/* SECTION 2 : CRITÈRES PRINCIPAUX */}
          <div className="flex-[3] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 p-2">
            
            {/* Région */}
            <div className="p-6 lg:p-8 border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-3">
                <Map size={12} /> Secteur
              </label>
              <select 
                value={localFilters.region || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
                className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none"
              >
                <option value="">Toute l'Espagne</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="p-6 lg:p-8 border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-3">
                <Home size={12} /> Type
              </label>
              <select 
                value={localFilters.type || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none"
              >
                <option value="">Tous types</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Chambres */}
            <div className="p-6 lg:p-8 border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-3">
                <Bed size={12} /> Chambres
              </label>
              <select 
                value={localFilters.beds || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, beds: e.target.value })}
                className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none"
              >
                <option value="">Indifférent</option>
                {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+ chambres</option>)}
              </select>
            </div>

            {/* Budget */}
            <div className="p-6 lg:p-8">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-3">
                <Euro size={12} /> Budget Max
              </label>
              <select 
                value={localFilters.maxPrice || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none"
              >
                <option value="">Sans limite</option>
                {priceOptions.map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
              </select>
            </div>

          </div>

          {/* BOUTON RECHERCHE */}
          <div className="p-4 flex items-center justify-center">
            <button 
              onClick={handleSearchClick}
              className="w-full lg:w-20 h-16 lg:h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center hover:bg-emerald-600 hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-200"
            >
              <Search size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>

      {/* RESET LINK */}
      <div className="mt-6 flex justify-center">
        <button 
          onClick={reset}
          className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-900 tracking-[0.2em] transition-colors"
        >
          <RotateCcw size={12} /> Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}