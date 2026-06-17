"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bath,
  Bed,
  Building2,
  Hash,
  Home,
  Map,
  MapPin,
  Maximize,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Waves,
  X,
} from "lucide-react";

const DEFAULT_MIN_PRICE = "";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties: any[];
  activeFilters: any;
  onClose?: () => void;
  isLight?: boolean;
}

function normalizeLocation(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    : "";
}

function normalizePrice(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const digitsOnly = value.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

function formatPrice(value: unknown) {
  const price = normalizePrice(value);
  return price ? price.toLocaleString("fr-FR") : "";
}

export default function AdvancedSearch({
  onSearch,
  properties = [],
  activeFilters,
  onClose,
  isLight = false,
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const safeProps = useMemo(() => (Array.isArray(properties) ? properties : []), [properties]);

  const regions = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria", "Portugal"];

  const towns = useMemo(() => {
    const selectedRegion = localFilters.region || "";
    return Array.from(
      new Set(
        safeProps
          .filter((property) => !selectedRegion || property.region === selectedRegion)
          .map((property) => String(property.town || property.ville || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [safeProps, localFilters.region]);

  const types = useMemo(() => {
    const translation: Record<string, string> = {
      villa: "Villa",
      apartment: "Appartement",
      penthouse: "Penthouse",
      bungalow: "Bungalow",
      townhouse: "Maison de ville",
    };

    return Array.from(new Set(safeProps.map((property) => String(property.type || "").trim())))
      .filter((type) => type && type.toLowerCase() !== "property")
      .sort((a, b) => a.localeCompare(b))
      .map((type) => ({ id: type.toLowerCase(), label: translation[type.toLowerCase()] || type }));
  }, [safeProps]);

  const availableCount = useMemo(() => {
    return safeProps.filter((property) => {
      const matchRegion = !localFilters.region || property.region === localFilters.region;
      const matchTown = !localFilters.town || normalizeLocation(property.town || property.ville) === normalizeLocation(localFilters.town);
      const matchType = !localFilters.type || String(property.type || "").toLowerCase().includes(String(localFilters.type).toLowerCase());
      const matchBeds = !localFilters.beds || Number(property.beds) >= Number(localFilters.beds);
      const matchBaths = !localFilters.baths || Number(property.baths) >= Number(localFilters.baths);
      const matchSurface = !localFilters.surfaceMin || Number(property.surface_built || property.surface_area?.built || 0) >= Number(localFilters.surfaceMin);
      const matchPool = !localFilters.pool || property.pool === "Oui" || property.pool === true || property.pool === "1";
      const price = normalizePrice(property.price || property.prix);
      const matchMin = !localFilters.minPrice || price >= Number(localFilters.minPrice);
      const matchMax = !localFilters.maxPrice || price <= Number(localFilters.maxPrice);
      const matchRef = !localFilters.reference || String(property.ref || "").toLowerCase().includes(String(localFilters.reference).toLowerCase().trim());
      return matchRegion && matchTown && matchType && matchBeds && matchBaths && matchSurface && matchPool && matchMin && matchMax && matchRef;
    }).length;
  }, [safeProps, localFilters]);

  const updatePriceFilter = (key: "minPrice" | "maxPrice", value: string) => {
    setLocalFilters({ ...localFilters, [key]: value.replace(/[^\d]/g, "") });
  };

  const updateFilter = (key: string, value: string | boolean) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const handleSearchClick = () => {
    const cleanedFilters = {
      ...localFilters,
      reference: localFilters.reference?.trim().toLowerCase() || "",
      region: localFilters.region || "",
      town: localFilters.town || "",
      type: localFilters.type || "",
      beds: localFilters.beds || "",
      baths: localFilters.baths || "",
      surfaceMin: localFilters.surfaceMin || "",
      pool: Boolean(localFilters.pool),
      minPrice: localFilters.minPrice || "",
      maxPrice: localFilters.maxPrice || "",
    };

    onSearch(cleanedFilters);
    if (onClose) onClose();
  };

  const reset = () => {
    const empty = {
      region: "",
      town: "",
      type: "",
      beds: "",
      baths: "",
      surfaceMin: "",
      pool: false,
      minPrice: DEFAULT_MIN_PRICE,
      maxPrice: "",
      reference: "",
    };
    setLocalFilters(empty);
    onSearch(empty);
  };

  const shellBg = isLight ? "bg-[#FAFAFA]" : "bg-[#010101]";
  const panelBg = isLight ? "bg-white" : "bg-[#171716]";
  const cardBg = isLight ? "bg-[#F2EFEA]/70" : "bg-white/[0.035]";
  const textColor = isLight ? "text-[#171716]" : "text-[#FAFAFA]";
  const mutedText = isLight ? "text-[#8A6A4F]" : "text-[#D8C9B6]";
  const softText = isLight ? "text-[#171716]/55" : "text-[#FAFAFA]/55";
  const borderColor = isLight ? "border-[#D8C9B6]/45" : "border-white/10";
  const fieldBg = isLight ? "bg-white/80" : "bg-[#010101]/50";
  const inputText = isLight ? "text-[#171716] placeholder:text-[#171716]/35" : "text-[#FAFAFA] placeholder:text-[#D8C9B6]/45";
  const optionBg = isLight ? "bg-white text-[#171716]" : "bg-[#171716] text-white";
  const activeChip = "bg-[#D8C9B6] text-[#010101] border-[#D8C9B6]";
  const inactiveChip = isLight
    ? "bg-white text-[#171716]/70 border-[#D8C9B6]/45 hover:border-[#D8C9B6] hover:text-[#171716]"
    : "bg-white/[0.04] text-[#FAFAFA]/75 border-white/10 hover:border-[#D8C9B6]/70 hover:text-white";

  return (
    <div className="relative z-[100] mx-auto max-w-7xl px-4">
      <style jsx>{`
        .amaru-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #d8c9b6, color-mix(in srgb, #d8c9b6 25%, transparent));
          outline: none;
        }
        .amaru-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #d8c9b6;
          cursor: pointer;
          border: 2px solid ${isLight ? "#FAFAFA" : "#010101"};
          box-shadow: 0 0 0 6px color-mix(in srgb, #d8c9b6 14%, transparent);
        }
      `}</style>

      {onClose && (
        <button
          onClick={onClose}
          className={`absolute -right-1 -top-5 z-[110] flex h-12 w-12 items-center justify-center border transition-all hover:bg-[#D8C9B6] hover:text-[#010101] md:right-2 ${panelBg} ${textColor} ${borderColor}`}
          aria-label="Fermer la recherche"
        >
          <X size={22} />
        </button>
      )}

      <div className={`border ${borderColor} ${shellBg} p-4 shadow-2xl md:p-6`}>
        <header className={`mb-5 border ${borderColor} ${panelBg} px-6 py-6 md:px-8`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">
                <SlidersHorizontal size={14} />
                Recherche privee
              </p>
              <h2 className={`font-serif text-3xl italic leading-none md:text-5xl ${textColor}`}>
                Affiner votre selection
              </h2>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <p className={`max-w-xl text-sm leading-6 ${softText}`}>
                Definissez vos criteres pour reveler les biens les plus adaptes a votre projet.
              </p>
              <span className={`w-fit border px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] ${borderColor} ${mutedText}`}>
                {availableCount} biens disponibles
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Destination" icon={<Map size={14} />} mutedText={mutedText} borderColor={borderColor} bg={cardBg}>
              <select
                value={localFilters.region || ""}
                onChange={(event) => updateFilter("region", event.target.value)}
                className={`w-full bg-transparent text-sm font-black uppercase outline-none ${textColor}`}
              >
                <option value="" className={optionBg}>Toutes destinations</option>
                {regions.map((region) => (
                  <option key={region} value={region} className={optionBg}>{region}</option>
                ))}
              </select>
            </Field>

            <Field label="Ville" icon={<MapPin size={14} />} mutedText={mutedText} borderColor={borderColor} bg={cardBg}>
              <select
                value={localFilters.town || ""}
                onChange={(event) => updateFilter("town", event.target.value)}
                className={`w-full bg-transparent text-sm font-black uppercase outline-none ${textColor}`}
              >
                <option value="" className={optionBg}>Toutes les villes</option>
                {towns.map((town) => (
                  <option key={town} value={town} className={optionBg}>{town}</option>
                ))}
              </select>
            </Field>

            <Field label="Type de bien" icon={<Home size={14} />} mutedText={mutedText} borderColor={borderColor} bg={cardBg}>
              <select
                value={localFilters.type || ""}
                onChange={(event) => updateFilter("type", event.target.value)}
                className={`w-full bg-transparent text-sm font-black uppercase outline-none ${textColor}`}
              >
                <option value="" className={optionBg}>Indifferent</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id} className={optionBg}>{type.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Reference" icon={<Hash size={14} />} mutedText={mutedText} borderColor={borderColor} bg={cardBg}>
              <input
                type="text"
                placeholder="Ex: REF-1234"
                value={localFilters.reference || ""}
                onChange={(event) => updateFilter("reference", event.target.value)}
                className={`w-full bg-transparent font-serif text-lg italic outline-none ${inputText}`}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={handleSearchClick}
            className="group flex min-h-[108px] items-center justify-center gap-4 bg-[#D8C9B6] px-8 py-6 text-[#010101] transition-all hover:bg-[#FAFAFA] lg:flex-col"
          >
            <Search size={30} strokeWidth={1.8} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Afficher</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={`border ${borderColor} ${panelBg} p-5`}>
            <div className="mb-5 flex items-center justify-between">
              <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${mutedText}`}>Budget</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${softText}`}>
                {formatPrice(localFilters.minPrice) || "0"} € - {formatPrice(localFilters.maxPrice) || "75 000 000"} €
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <PriceInput
                label="Min"
                value={localFilters.minPrice || ""}
                placeholder="0"
                inputText={inputText}
                mutedText={mutedText}
                fieldBg={fieldBg}
                borderColor={borderColor}
                onChange={(value) => updatePriceFilter("minPrice", value)}
              />
              <PriceInput
                label="Max"
                value={localFilters.maxPrice || ""}
                placeholder="75000000"
                inputText={inputText}
                mutedText={mutedText}
                fieldBg={fieldBg}
                borderColor={borderColor}
                onChange={(value) => updatePriceFilter("maxPrice", value)}
              />
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <input
                type="range"
                min="0"
                max="75000000"
                step="50000"
                value={localFilters.minPrice || "0"}
                onChange={(event) => updateFilter("minPrice", event.target.value)}
                className="amaru-slider"
              />
              <input
                type="range"
                min="200000"
                max="75000000"
                step="50000"
                value={localFilters.maxPrice || "75000000"}
                onChange={(event) => updateFilter("maxPrice", event.target.value)}
                className="amaru-slider"
              />
            </div>
          </div>

          <div className={`border ${borderColor} ${panelBg} p-5`}>
            <div className="mb-5 flex items-center justify-between">
              <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${mutedText}`}>Pieces & confort</p>
              <button
                type="button"
                onClick={() => setShowAdvanced((value) => !value)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${mutedText}`}
              >
                {showAdvanced ? "Masquer" : "Plus de criteres"}
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <ChipGroup
                label="Chambres"
                icon={<Bed size={14} />}
                value={localFilters.beds || ""}
                options={["2", "3", "4", "5"]}
                suffix="+"
                onChange={(value) => updateFilter("beds", value)}
                mutedText={mutedText}
                activeChip={activeChip}
                inactiveChip={inactiveChip}
              />
              <ChipGroup
                label="Salles de bain"
                icon={<Bath size={14} />}
                value={localFilters.baths || ""}
                options={["2", "3", "4", "5"]}
                suffix="+"
                onChange={(value) => updateFilter("baths", value)}
                mutedText={mutedText}
                activeChip={activeChip}
                inactiveChip={inactiveChip}
              />
            </div>
          </div>
        </div>

        {showAdvanced && (
          <div className={`mt-4 grid grid-cols-1 gap-4 border ${borderColor} ${panelBg} p-5 md:grid-cols-3`}>
            <Field label="Surface construite min." icon={<Maximize size={14} />} mutedText={mutedText} borderColor={borderColor} bg={cardBg}>
              <select
                value={localFilters.surfaceMin || ""}
                onChange={(event) => updateFilter("surfaceMin", event.target.value)}
                className={`w-full bg-transparent text-sm font-black uppercase outline-none ${textColor}`}
              >
                <option value="" className={optionBg}>Indifferent</option>
                {[80, 120, 160, 200, 300, 500].map((surface) => (
                  <option key={surface} value={String(surface)} className={optionBg}>{surface} m²+</option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              onClick={() => updateFilter("pool", !localFilters.pool)}
              className={`flex min-h-[88px] items-center justify-between border p-5 text-left transition-all ${localFilters.pool ? activeChip : inactiveChip}`}
            >
              <span>
                <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em]">
                  <Waves size={14} /> Piscine
                </span>
                <span className="font-serif text-xl italic">{localFilters.pool ? "Requise" : "Indifferente"}</span>
              </span>
            </button>

            <Field label="Programme neuf" icon={<Building2 size={14} />} mutedText={mutedText} borderColor={borderColor} bg={cardBg}>
              <select
                value={localFilters.development || ""}
                onChange={(event) => updateFilter("development", event.target.value)}
                className={`w-full bg-transparent text-sm font-black uppercase outline-none ${textColor}`}
              >
                <option value="" className={optionBg}>Tous les programmes</option>
                {Array.from(new Set(safeProps.map((property) => String(property.development_name || "").trim()).filter(Boolean)))
                  .sort((a, b) => a.localeCompare(b))
                  .slice(0, 40)
                  .map((development) => (
                    <option key={development} value={development} className={optionBg}>{development}</option>
                  ))}
              </select>
            </Field>
          </div>
        )}

        <footer className="mt-5 flex flex-col gap-4 px-1 md:flex-row md:items-center md:justify-between">
          <p className={`text-[10px] font-medium italic ${softText}`}>
            Collection Amaru - selection exclusive
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedText}`}>
              {[localFilters.region, localFilters.town, localFilters.type, localFilters.beds ? `${localFilters.beds}+ chambres` : ""]
                .filter(Boolean)
                .join(" / ") || "Tous les biens"}
            </span>
            <button
              type="button"
              onClick={reset}
              className={`flex items-center gap-2 border px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${borderColor} ${softText} hover:border-[#D8C9B6] hover:text-[#D8C9B6]`}
            >
              <RotateCcw size={13} /> Reinitialiser
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  mutedText,
  borderColor,
  bg,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  mutedText: string;
  borderColor: string;
  bg: string;
}) {
  return (
    <div className={`min-h-[108px] border ${borderColor} ${bg} p-5`}>
      <label className={`mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] ${mutedText}`}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function PriceInput({
  label,
  value,
  placeholder,
  inputText,
  mutedText,
  fieldBg,
  borderColor,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  inputText: string;
  mutedText: string;
  fieldBg: string;
  borderColor: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={`flex items-center gap-3 border ${borderColor} ${fieldBg} px-4 py-3`}>
      <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${mutedText}`}>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent text-right text-sm font-black outline-none ${inputText}`}
      />
      <span className={`text-xs font-black ${mutedText}`}>€</span>
    </div>
  );
}

function ChipGroup({
  label,
  icon,
  value,
  options,
  suffix,
  onChange,
  mutedText,
  activeChip,
  inactiveChip,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  suffix?: string;
  onChange: (value: string) => void;
  mutedText: string;
  activeChip: string;
  inactiveChip: string;
}) {
  return (
    <div>
      <p className={`mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] ${mutedText}`}>
        {icon} {label}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(value === option ? "" : option)}
            className={`border px-3 py-3 text-[11px] font-black transition-all ${value === option ? activeChip : inactiveChip}`}
          >
            {option}{suffix}
          </button>
        ))}
      </div>
    </div>
  );
}
