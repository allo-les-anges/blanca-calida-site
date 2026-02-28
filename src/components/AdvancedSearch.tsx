"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search, MapPin, Home, Euro, BedDouble } from "lucide-react";

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

  // 1. Liste des Régions (Fixe selon demande)
  const regions = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria"];

  // 2. Génération des Villes (Dynamique)
  const towns = useMemo(() => {
    return [...new Set(properties.map((p) => p.town))].filter(Boolean).sort();
  }, [properties]);

  // 3. Génération des Types
  const types = useMemo(() => {
    const translation: { [key: string]: string } = {
      villa: "Villa",
      detached: "Maison Individuelle",
      apartment: "Appartement",
      penthouse: "Penthouse",
      bungalow: "Bungalow",
      townhouse: "Maison de ville",
    };

    return [...new Set(properties.map((p) => p.type))]
      .filter((t) => t && t.toLowerCase() !== "property")
      .map((t) => {
        const val = t.toLowerCase();
        return translation[val] || val.charAt(0).toUpperCase() + val.slice(1);
      })
      .sort();
  }, [properties]);

  const priceOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i <= 30; i++) {
      options.push(200000 + i * 100000); // Tranches plus larges pour le luxe
    }
    return options;
  }, []);

  const handleSearchClick = () => {
    onSearch(localFilters);
  };

  const reset = () => {
    const empty = {
      region: "",
      town: "",
      type: "",
      beds: "",
      minPrice: "",
      maxPrice: "",
    };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-[40]">
      <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 lg:p-12 rounded-[2rem] border border-white">
        
        {/* GRILLE DE RECHERCHE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 mb-12">
          
          {/* RÉGION */}
          <div className="flex flex-col group">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
              <MapPin size={12} className="text-slate-300" /> Région
            </label>
            <select
              value={localFilters.region || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
              className="bg-transparent border-b border-slate-200 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none uppercase tracking-wider"
            >
              <option value="">Toute l'Espagne</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* DESTINATION (VILLE) */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
              <MapPin size={12} className="text-slate-300" /> Ville
            </label>
            <select
              value={localFilters.town || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, town: e.target.value })}
              className="bg-transparent border-b border-slate-200 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none uppercase tracking-wider"
            >
              <option value="">Toutes les villes</option>
              {towns.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* TYPE */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
              <Home size={12} className="text-slate-300" /> Type de bien
            </label>
            <select
              value={localFilters.type || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              className="bg-transparent border-b border-slate-200 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none uppercase tracking-wider"
            >
              <option value="">Tous les types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* PRIX MIN */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
              <Euro size={12} className="text-slate-300" /> Budget Minimum
            </label>
            <select
              value={localFilters.minPrice || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
              className="bg-transparent border-b border-slate-200 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none"
            >
              <option value="">Indifférent</option>
              {priceOptions.map((p) => (
                <option key={p} value={p}>{p.toLocaleString("fr-FR")} €</option>
              ))}
            </select>
          </div>

          {/* PRIX MAX */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
              <Euro size={12} className="text-slate-300" /> Budget Maximum
            </label>
            <select
              value={localFilters.maxPrice || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
              className="bg-transparent border-b border-slate-200 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none"
            >
              <option value="">Indifférent</option>
              {priceOptions.map((p) => (
                <option key={p} value={p}>{p.toLocaleString("fr-FR")} €</option>
              ))}
            </select>
          </div>

          {/* CHAMBRES */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2">
              <BedDouble size={12} className="text-slate-300" /> Chambres
            </label>
            <select
              value={localFilters.beds || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, beds: e.target.value })}
              className="bg-transparent border-b border-slate-200 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none"
            >
              <option value="">Nombre de chambres</option>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+ Chambres</option>)}
            </select>
          </div>

        </div>

        {/* BARRE D'ACTIONS INFÉRIEURE */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-50">
          <button
            onClick={reset}
            className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-bold hover:text-slate-900 transition-all tracking-[0.2em]"
          >
            <RotateCcw size={14} strokeWidth={2.5} /> Réinitialiser
          </button>

          <button
            onClick={handleSearchClick}
            className="w-full sm:w-auto bg-slate-950 text-white px-14 py-5 uppercase text-[11px] tracking-[0.4em] font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-4 rounded-full shadow-2xl shadow-slate-300 active:scale-95"
          >
            <Search size={16} strokeWidth={2.5} /> Voir les propriétés
          </button>
        </div>

      </div>
    </div>
  );
}