"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search } from "lucide-react";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties: any[];
  activeFilters: any;
}

export default function AdvancedSearch({
  onSearch,
  properties,
  activeFilters,
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const towns = useMemo(() => {
    return [...new Set(properties.map((p) => p.town))].filter(Boolean).sort();
  }, [properties]);

  const types = useMemo(() => {
    return [...new Set(properties.map((p) => p.type))].filter(Boolean).sort();
  }, [properties]);

  const developments = useMemo(() => {
    return [...new Set(properties.map((p) => p.development_name))]
      .filter(Boolean)
      .sort();
  }, [properties]);

  const reset = () => {
    const empty = {
      town: "",
      type: "",
      beds: "",
      minPrice: "",
      maxPrice: "",
      reference: "",
      development: "",
      availableOnly: false,
    };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
      <div className="bg-white shadow-xl p-10 border border-gray-100 rounded-2xl">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-10">

          {/* FIELD TEMPLATE */}
          {/** Tous les champs suivent le même style premium */}

          {/* DESTINATION */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">
              Destination
            </label>
            <select
              value={localFilters.town}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, town: e.target.value })
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition"
            >
              <option value="">Toutes les villes</option>
              {towns.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">
              Type
            </label>
            <select
              value={localFilters.type}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, type: e.target.value })
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition"
            >
              <option value="">Tous les types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* DÉVELOPPEMENT */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">
              Développement
            </label>
            <select
              value={localFilters.development}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, development: e.target.value })
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition"
            >
              <option value="">Tous les développements</option>
              {developments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* CHAMBRES */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">
              Chambres
            </label>
            <select
              value={localFilters.beds}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, beds: e.target.value })
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition"
            >
              <option value="">Indifférent</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>

          {/* PRIX MIN */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">
              Prix min
            </label>
            <input
              type="number"
              value={localFilters.minPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, minPrice: e.target.value })
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition"
            />
          </div>

          {/* PRIX MAX */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">
              Prix max
            </label>
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, maxPrice: e.target.value })
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition"
            />
          </div>
        </div>

        {/* DISPONIBLE UNIQUEMENT */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            checked={localFilters.availableOnly}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                availableOnly: e.target.checked,
              })
            }
            className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-400"
          />
          <label className="text-xs uppercase font-medium text-gray-600 tracking-widest">
            Disponible uniquement
          </label>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold hover:text-gray-600 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button
            onClick={() => onSearch(localFilters)}
            className="bg-slate-900 text-white px-16 py-4 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-slate-800 transition-all flex items-center gap-3 rounded-lg"
          >
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}
