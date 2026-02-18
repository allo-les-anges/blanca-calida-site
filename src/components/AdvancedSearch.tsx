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
      <div className="bg-white shadow-2xl p-8 border border-gray-100">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">

          {/* DESTINATION */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              Destination
            </label>
            <select
              value={localFilters.town}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, town: e.target.value })
              }
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
            >
              <option value="">Toutes les villes</option>
              {towns.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              Type
            </label>
            <select
              value={localFilters.type}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, type: e.target.value })
              }
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
            >
              <option value="">Tous les types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* DÉVELOPPEMENT */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              Développement
            </label>
            <select
              value={localFilters.development}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, development: e.target.value })
              }
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
            >
              <option value="">Tous les développements</option>
              {developments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* CHAMBRES */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              Chambres
            </label>
            <select
              value={localFilters.beds}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, beds: e.target.value })
              }
              className="bg-transparent text-xs uppercase font-medium outline-none cursor-pointer"
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
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              Prix min
            </label>
            <input
              type="number"
              value={localFilters.minPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, minPrice: e.target.value })
              }
              className="bg-transparent text-xs uppercase font-medium outline-none"
            />
          </div>

          {/* PRIX MAX */}
          <div className="flex flex-col border-b border-gray-200 pb-2">
            <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">
              Prix max
            </label>
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, maxPrice: e.target.value })
              }
              className="bg-transparent text-xs uppercase font-medium outline-none"
            />
          </div>
        </div>

        {/* DISPONIBLE UNIQUEMENT */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={localFilters.availableOnly}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                availableOnly: e.target.checked,
              })
            }
          />
          <label className="text-xs uppercase font-medium text-gray-600">
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
            className="bg-slate-900 text-white px-16 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-slate-800 transition-all flex items-center gap-3"
          >
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}
