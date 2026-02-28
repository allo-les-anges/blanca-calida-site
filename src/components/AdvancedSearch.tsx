"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Search, Map, Home, Euro, Hash, Bed, Building2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Importez le router

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
  const router = useRouter(); // Initialisez le router

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // --- UTILITAIRE : slugify (doit être identique à celui de la page [devId]) ---
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
  
  const priceOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i <= 20; i++) opts.push(100000 + i * 100000);
    return opts;
  }, []);

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

  // --- ACTIONS MODIFIÉES ---
  const handleSearchClick = () => {
    // CONDITION DE REDIRECTION :
    // Si un développement est sélectionné ET que c'est le seul critère majeur
    if (localFilters.development && !localFilters.reference) {
      const slug = slugify(localFilters.development);
      router.push(`/developpement/${slug}`);
    } else {
      // Sinon, on exécute la recherche filtrée classique sur la page actuelle
      onSearch(localFilters);
    }
  };

  const reset = () => {
    const empty = { 
      region: "", town: "", type: "", beds: "", 
      minPrice: "", maxPrice: "", reference: "", development: "" 
    };
    setLocalFilters(empty);
    onSearch(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-[50]">
      {/* Container Principal */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-slate-100 p-3">
        
        {/* LIGNE 1 : RÉFÉRENCE & DÉVELOPPEMENT */}
        <div className="flex flex-col lg:flex-row border-b border-slate-50">
          <div className="flex-1 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-50">
            <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-emerald-600 mb-2">
              <Hash size={12} /> Référence Supabase
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
              <Building2 size={12} /> Nom du Programme / Développement
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

        {/* LIGNE 2 : CRITÈRES (Région, Type, Prix, Chambres) */}
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
            
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

            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
                <Home size={12} /> Type
              </label>
              <select 
                value={localFilters.type || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                className="w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none uppercase"
              >
                <option value="">Tous</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
                <Euro size={12} /> Prix Min
              </label>
              <select 
                value={localFilters.minPrice || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                className="w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none"
              >
                <option value="">Indifférent</option>
                {priceOptions.map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
              </select>
            </div>

            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-50">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
                <Euro size={12} /> Prix Max
              </label>
              <select 
                value={localFilters.maxPrice || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                className="w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none"
              >
                <option value="">Sans limite</option>
                {priceOptions.map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
              </select>
            </div>

            <div className="p-6">
              <label className="flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">
                <Bed size={12} /> Chambres
              </label>
              <select 
                value={localFilters.beds || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, beds: e.target.value })}
                className="w-full bg-transparent text-[13px] font-bold outline-none cursor-pointer appearance-none"
              >
                <option value="">2+</option>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>

          </div>

          {/* BOUTON RECHERCHE */}
          <div className="p-4 flex items-center justify-center">
            <button 
              onClick={handleSearchClick}
              className="w-full lg:w-20 h-16 lg:h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center hover:bg-emerald-600 hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-200 group"
            >
              <Search size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* FOOTER BARRE RECHERCHE */}
      <div className="mt-6 flex justify-between items-center px-8">
        <p className="text-[10px] text-slate-400 font-medium italic">
          {properties.length} propriétés disponibles en direct de Supabase
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