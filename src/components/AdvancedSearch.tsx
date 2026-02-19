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
  properties = [],
  activeFilters,
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  // Synchronisation avec les filtres parents
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // 1. Génération des Villes
  const towns = useMemo(() => {
    return [...new Set(properties.map((p) => p.town))].filter(Boolean).sort();
  }, [properties]);

  // 2. Génération des Types
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

  // 3. Génération des Développements
  const developments = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];
    const names = properties
      .map((p) => p.development_name)
      .filter((name): name is string => Boolean(name) && typeof name === 'string');
    return Array.from(new Set(names)).sort();
  }, [properties]);

  // 4. Liste des prix
  const priceOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i <= 40; i++) {
      options.push(150000 + i * 50000);
    }
    return options;
  }, []);

  // --- LOGIQUE DE RECHERCHE SÉCURISÉE ---
  const handleSearchClick = () => {
    console.log("🔍 FILTRE ENVOYÉ AU PARENT :", localFilters);
    onSearch(localFilters);
  };

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
    console.log("♻️ RESET DES FILTRES");
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
      <div className="bg-white shadow-xl p-10 border border-gray-100 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          
          {/* DESTINATION */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Destination</label>
            <select
              value={localFilters.town || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, town: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition cursor-pointer"
            >
              <option value="">Toutes les villes</option>
              {towns.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* TYPE */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Type</label>
            <select
              value={localFilters.type || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition cursor-pointer"
            >
              <option value="">Tous les types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* DÉVELOPPEMENT */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Développement</label>
            <select
              value={localFilters.development || ""}
              onChange={(e) => {
                const val = e.target.value;
                console.log("🎯 DÉVELOPPEMENT SÉLECTIONNÉ :", val);
                setLocalFilters({ ...localFilters, development: val });
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition cursor-pointer"
            >
              <option value="">Tous les projets</option>
              {developments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* CHAMBRES */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Chambres</label>
            <select
              value={localFilters.beds || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, beds: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition cursor-pointer"
            >
              <option value="">Indifférent</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>

          {/* PRIX MIN */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Prix min</label>
            <select
              value={localFilters.minPrice || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition cursor-pointer"
            >
              <option value="">Indifférent</option>
              {priceOptions.map((p) => (
                <option key={p} value={p}>{p.toLocaleString("fr-FR")} €</option>
              ))}
            </select>
          </div>

          {/* PRIX MAX */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Prix max</label>
            <select
              value={localFilters.maxPrice || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-slate-300 transition cursor-pointer"
            >
              <option value="">Indifférent</option>
              {priceOptions.map((p) => (
                <option key={p} value={p}>{p.toLocaleString("fr-FR")} €</option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center border-t border-gray-50 pt-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold hover:text-gray-600 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button
            onClick={handleSearchClick}
            className="bg-slate-900 text-white px-12 py-4 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-slate-800 transition-all flex items-center gap-3 rounded-lg shadow-lg shadow-slate-200"
          >
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}