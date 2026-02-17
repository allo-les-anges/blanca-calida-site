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

  const getKindFromTitle = (p: any) => {
    if (!p?.title) return "";
    return p.title.split(" ")[0];
  };

  const towns = useMemo(() => {
    return [...new Set(properties.map((p) => p.town))].filter(Boolean).sort();
  }, [properties]);

  const types = useMemo(() => {
    return [...new Set(properties.map((p) => getKindFromTitle(p)))]
      .filter(Boolean)
      .sort();
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">

          {/* DESTINATION */}
          <div>
            <label>Destination</label>
            <select
              value={localFilters.town}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, town: e.target.value })
              }
            >
              <option value="">Toutes les villes</option>
              {towns.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div>
            <label>Type</label>
            <select
              value={localFilters.type}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, type: e.target.value })
              }
            >
              <option value="">Tous les types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* DÉVELOPPEMENT */}
          <div>
            <label>Développement</label>
            <select
              value={localFilters.development}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, development: e.target.value })
              }
            >
              <option value="">Tous les développements</option>
              {developments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* CHAMBRES */}
          <div>
            <label>Chambres</label>
            <select
              value={localFilters.beds}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, beds: e.target.value })
              }
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
          <div>
            <label>Prix min</label>
            <input
              type="number"
              value={localFilters.minPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, minPrice: e.target.value })
              }
            />
          </div>

          {/* PRIX MAX */}
          <div>
            <label>Prix max</label>
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, maxPrice: e.target.value })
              }
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
          <label>Disponible uniquement</label>
        </div>

        <div className="flex justify-between">
          <button onClick={reset}>
            <RotateCcw size={12} /> Reset
          </button>

          <button onClick={() => onSearch(localFilters)}>
            <Search size={14} /> Lancer la recherche
          </button>
        </div>
      </div>
    </div>
  );
}

