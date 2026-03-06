"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search, Map, Home, Euro, Hash, Bed, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // --- UTILITAIRE : slugify ---
  const slugify = (text: string) =>
    text
      ?.toString()
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  // --- LOGIQUE DE DONNÉES ---
  const regions = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria"];
  
  const developments = useMemo(() => {
    if (!properties) return [];
    return [...new Set(properties.map((p) => p.development_name))]
      .filter((name): name is string => Boolean(name))
      .sort();
  }, [properties]);

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
    if (localFilters.development && !localFilters.reference) {
      const slug = slugify(localFilters.development);
      router.push(`/developpement/${slug}`);
    } else {
      onSearch(localFilters);
    }
  };

  const reset = () => {
    const empty = { 
      region: "", town: "", type: "", beds: "", 
      minPrice: "100000", maxPrice: "5000000", reference: "", development: "" 
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
          width: 16px;
          height: 16px;
          background: #D4AF37;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>

      {/* Container Principal */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-slate-100 p-3">
        
        {/* LIGNE 1 : RÉFÉRENCE & DÉVELOPPEMENT */}
        <div className="flex flex-col lg:flex-row border-b border-slate-50">
          <div className="flex-1 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-50">
            <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-[#D4AF37] mb-2">
              <Hash size={12} /> Référence Propriété
            </label>
            <input 
              type="text"
              placeholder="Ex: REF-1234"
              value={localFilters.reference || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, reference: e.target.value })}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
            />
          </div>
          <div className="flex-1 p-6 lg:p-8">
            <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
              <Building2 size={12} /> Nom du Programme
            </label>
            <select 
              value={localFilters.development || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, development: e.target.value })}
              className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer appearance-none"
            >
              <option value="">Tous les projets</option>
              {developments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* LIGNE 2 : CRITÈRES */}
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
                <option value="">Espagne</option>
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
                <option value="">Tous les types</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* SLIDER PRIX MIN */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400">
                  <Euro size={12} /> Min
                </label>
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

            {/* SLIDER PRIX MAX */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400">
                  <Euro size={12} /> Max
                </label>
                <span className="text-[11px] font-bold text-slate-900">
                  {parseInt(localFilters.maxPrice || "5000000").toLocaleString()} €
                </span>
              </div>
              <input 
                type="range"
                min="200000"
                max="5000000"
                step="50000"
                value={localFilters.maxPrice || "5000000"}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                className="custom-slider"
              />
            </div>

            {/* CHAMBRES (BOUTONS) */}
            <div className="p-6">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-3">
                <Bed size={12} /> Chambres
              </label>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, beds: n.toString() })}
                    className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${
                      localFilters.beds === n.toString() 
                      ? "bg-slate-900 text-[#D4AF37] shadow-lg" 
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

      {/* FOOTER BARRE RECHERCHE */}
      <div className="mt-6 flex justify-between items-center px-8">
        <p className="text-[10px] text-slate-400 font-medium italic">
          {properties.length} propriétés disponibles
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