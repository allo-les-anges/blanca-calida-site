"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Bath, Bed, Building2, MapPin, Maximize, Search } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import AmaruLoader from "@/components/AmaruLoader";
import { useTranslation } from "@/contexts/I18nContext";

type Status = "loading" | "ready" | "error";
const PAGE_SIZE = 12;

interface UnitOption {
  beds: number;
  baths: number;
  surface: number;
  minPrice: number;
  count: number;
}

interface DevelopmentSummary {
  devId: string;
  slug: string;
  name: string;
  town: string;
  region: string;
  unitCount: number;
  minPrice: number;
  maxPrice: number;
  options: UnitOption[];
  images: string[];
  isNew: boolean;
  lat: number | null;
  lng: number | null;
  types: string[];
  hasPool: boolean;
  minDistanceBeach: number | null;
  minDistanceGolf: number | null;
  delivery_date: string | null;
  start_date: string | null;
}

function formatPrice(value: number) {
  if (!value) return "Sur demande";
  return `${value.toLocaleString("fr-FR")} EUR`;
}

function imageFor(development: DevelopmentSummary) {
  return development.images[0] || fallbackImageFor(development);
}

function fallbackImageFor(development: DevelopmentSummary) {
  const region = `${development.region} ${development.town}`.toLowerCase();
  if (region.includes("portugal")) return "/images/countries/portugal-lisbon-cascais.jpg";
  if (region.includes("sol") || region.includes("malaga") || region.includes("málaga")) return "/images/regions/2.jpg";
  if (region.includes("blanca") || region.includes("alicante")) return "/images/regions/1.jpg";
  if (region.includes("calida") || region.includes("murcia")) return "/images/regions/3.jpg";
  if (region.includes("almer")) return "/images/regions/4.jpg";
  return "/images/countries/spain.jpg";
}

function optionLabel(development: DevelopmentSummary) {
  const beds = Array.from(new Set(development.options.map((option) => option.beds).filter(Boolean))).sort((a, b) => a - b);
  if (beds.length === 0) return "Typologies sur demande";
  if (beds.length === 1) return `${beds[0]} chambre${beds[0] > 1 ? "s" : ""}`;
  return `${beds[0]} a ${beds[beds.length - 1]} chambres`;
}

function bathroomLabel(development: DevelopmentSummary) {
  const baths = Array.from(new Set(development.options.map((option) => option.baths).filter(Boolean))).sort((a, b) => a - b);
  if (baths.length === 0) return "Bains sur demande";
  if (baths.length === 1) return `${baths[0]} bain${baths[0] > 1 ? "s" : ""}`;
  return `${baths[0]} a ${baths[baths.length - 1]} bains`;
}

function surfaceLabel(development: DevelopmentSummary) {
  const surfaces = Array.from(new Set(development.options.map((option) => option.surface).filter(Boolean))).sort((a, b) => a - b);
  if (surfaces.length === 0) return "Surface sur demande";
  if (surfaces.length === 1) return `${surfaces[0].toLocaleString("fr-FR")} m2`;
  return `${surfaces[0].toLocaleString("fr-FR")} a ${surfaces[surfaces.length - 1].toLocaleString("fr-FR")} m2`;
}

function localizedCopy(locale: string) {
  const isFr = locale === "fr";
  return {
    eyebrow: isFr ? "Programmes neufs" : "New developments",
    title: isFr ? "Developpements selectionnes" : "Selected developments",
    intro: isFr
      ? "Une lecture claire des programmes disponibles, avec disponibilites, prix d'appel et emplacement pour comparer les opportunites en un regard."
      : "A clear view of available developments, with availability, entry price and location so you can compare opportunities at a glance.",
    search: isFr ? "Rechercher un programme, une ville, une region..." : "Search by development, city, region...",
    allRegions: isFr ? "Toutes les regions" : "All regions",
    active: isFr ? "catalogue actif" : "active catalogue",
    units: isFr ? "unites" : "units",
    from: isFr ? "A partir de" : "From",
    view: isFr ? "Voir le programme" : "View development",
    noResults: isFr ? "Aucun programme ne correspond a ces filtres." : "No development matches these filters.",
    reset: isFr ? "Reinitialiser" : "Reset",
    previous: isFr ? "Precedent" : "Previous",
    next: isFr ? "Suivant" : "Next",
    page: isFr ? "Page" : "Page",
    loading: isFr ? "Chargement des programmes" : "Loading developments",
    pool: isFr ? "Piscine" : "Pool",
  };
}

export default function DevelopmentsPage() {
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const { locale } = useTranslation();
  const copy = localizedCopy(locale);

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [developments, setDevelopments] = useState<DevelopmentSummary[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const isLight = searchParams.get("pack") === "light";
  const isDarkVisual = resolvedTheme === "dark" && !isLight;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDevelopments() {
      try {
        setStatus("loading");
        const query = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });
        if (search.trim()) query.set("search", search.trim());
        if (region) query.set("region", region);

        const response = await fetch(`/api/developments?${query.toString()}`);
        const data = await response.json();
        if (!cancelled) {
          setDevelopments(Array.isArray(data.developments) ? data.developments : []);
          setRegions(Array.isArray(data.regions) ? data.regions : []);
          setPage(Number(data.page || page));
          setTotal(Number(data.total || 0));
          setTotalPages(Number(data.totalPages || 1));
          setStatus("ready");
        }
      } catch (error) {
        console.error("Erreur chargement developpements:", error);
        if (!cancelled) setStatus("error");
      }
    }

    loadDevelopments();
    return () => {
      cancelled = true;
    };
  }, [page, region, search]);

  const bgColor = isDarkVisual ? "bg-[#010101]" : "bg-[#FAFAFA]";
  const panelColor = isDarkVisual ? "bg-[#171716]" : "bg-[#F2EFEA]";
  const textColor = isDarkVisual ? "text-[#FAFAFA]" : "text-[#171716]";
  const mutedText = isDarkVisual ? "text-[#F2EFEA]" : "text-[#171716]";

  if (!mounted) {
    return <main className="min-h-screen bg-[#010101]" />;
  }

  return (
    <main className={`min-h-screen transition-colors duration-500 ${bgColor} ${textColor}`}>
      <Navbar />

      <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="absolute inset-0">
          <img
            src="/images/countries/portugal-lisbon-cascais.jpg"
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className={`absolute inset-0 ${isDarkVisual ? "bg-[#010101]/80" : "bg-[#FAFAFA]/85"}`} />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1600px] gap-10 px-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="max-w-4xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.45em] text-[#D8C9B6]">
              {copy.eyebrow}
            </p>
            <h1 className="font-serif text-5xl italic leading-[0.95] md:text-7xl lg:text-8xl">
              {copy.title}
            </h1>
          </div>

          <p
            className={`border-l pl-6 text-sm font-light leading-7 ${mutedText}`}
            style={{ borderColor: isDarkVisual ? "color-mix(in srgb, #FAFAFA 12%, transparent)" : "#D8C9B6" }}
          >
            {copy.intro}
          </p>
        </div>
      </section>

      <section className={`border-y border-[#D8C9B6]/25 py-6 ${panelColor}`}>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8C9B6]" size={16} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={copy.search}
              className={`w-full border bg-transparent py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-[0.18em] outline-none transition-colors placeholder:text-current placeholder:opacity-35 focus:border-[#D8C9B6] ${textColor}`}
              style={{ borderColor: isDarkVisual ? "color-mix(in srgb, #FAFAFA 10%, transparent)" : "#D8C9B6" }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setRegion("");
                setPage(1);
              }}
              className={`border px-4 py-3 text-[9px] font-black uppercase tracking-[0.24em] transition-colors ${!region ? "bg-[#D8C9B6] text-[#010101]" : ""}`}
              style={{ borderColor: "#D8C9B6" }}
            >
              {copy.allRegions}
            </button>
            {regions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRegion(item);
                  setPage(1);
                }}
                className={`border px-4 py-3 text-[9px] font-black uppercase tracking-[0.24em] transition-colors ${region === item ? "bg-[#D8C9B6] text-[#010101]" : ""}`}
                style={{ borderColor: "#D8C9B6" }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-14 md:py-20">
        {status === "loading" && (
          <AmaruLoader className="min-h-[320px]" isLight={!isDarkVisual} label={copy.loading} />
        )}

        {status === "error" && (
          <div className={`border border-[#D8C9B6]/30 p-10 text-center ${panelColor}`}>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D8C9B6]">
              Impossible de charger les programmes.
            </p>
          </div>
        )}

        {status === "ready" && developments.length === 0 && (
          <div className={`border border-[#D8C9B6]/30 p-10 text-center ${panelColor}`}>
            <p className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-[#D8C9B6]">
              {copy.noResults}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRegion("");
                setPage(1);
              }}
              className="border border-[#D8C9B6] px-6 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#D8C9B6]"
            >
              {copy.reset}
            </button>
          </div>
        )}

        {status === "ready" && developments.length > 0 && (
          <>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D8C9B6]">
              {total.toLocaleString("fr-FR")} programmes
            </p>
            <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${mutedText}`}>
              {copy.page} {page} / {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {developments.map((development) => (
              <article
                key={development.slug}
                className={`group overflow-hidden border transition-all duration-500 hover:-translate-y-1 ${panelColor}`}
                style={{ borderColor: isDarkVisual ? "color-mix(in srgb, #FAFAFA 8%, transparent)" : "#D8C9B6" }}
              >
                <Link href={`/developpement/${development.slug}`} className="block">
                  <div
                    className="relative aspect-[4/3] overflow-hidden bg-[#171716] bg-cover bg-center"
                    style={{ backgroundImage: `url(${fallbackImageFor(development)})` }}
                  >
                    <img
                      src={imageFor(development)}
                      alt={development.name}
                      onError={(event) => {
                        event.currentTarget.src = fallbackImageFor(development);
                      }}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-[4s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <div className="absolute left-5 top-5 flex gap-2">
                      {development.isNew && (
                        <span className="bg-[#D8C9B6] px-3 py-2 text-[8px] font-black uppercase tracking-[0.25em] text-[#010101]">
                          {copy.active}
                        </span>
                      )}
                      {development.hasPool && (
                        <span className="bg-black/55 px-3 py-2 text-[8px] font-black uppercase tracking-[0.25em] text-white backdrop-blur">
                          {copy.pool}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-[#D8C9B6]">
                        <MapPin size={13} /> {[development.town, development.region].filter(Boolean).join(" / ")}
                      </p>
                      <h2 className="font-serif text-3xl italic leading-none md:text-4xl">
                        {development.name}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6 p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-[8px] font-black uppercase tracking-[0.25em] text-[#D8C9B6]">
                          {copy.from}
                        </p>
                        <p className={`font-serif text-2xl italic ${textColor}`}>{formatPrice(development.minPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="mb-1 text-[8px] font-black uppercase tracking-[0.25em] text-[#D8C9B6]">
                          {copy.units}
                        </p>
                        <p className={`font-serif text-2xl italic ${textColor}`}>{development.unitCount}</p>
                      </div>
                    </div>

                    <div
                      className={`grid grid-cols-3 gap-3 border-y py-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] ${mutedText}`}
                      style={{ borderColor: isDarkVisual ? "color-mix(in srgb, #FAFAFA 8%, transparent)" : "color-mix(in srgb, #D8C9B6 55%, transparent)" }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Bed size={14} className="text-[#D8C9B6]" /> {optionLabel(development)}
                      </span>
                      <span className="flex items-center justify-center gap-2">
                        <Bath size={14} className="text-[#D8C9B6]" /> {bathroomLabel(development)}
                      </span>
                      <span className="flex items-center justify-center gap-2">
                        <Maximize size={14} className="text-[#D8C9B6]" /> {surfaceLabel(development)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#D8C9B6]">
                        <Building2 size={14} /> {development.types.slice(0, 2).join(" / ") || "Programme"}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#D8C9B6] transition-transform group-hover:translate-x-1">
                        {copy.view} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                className="border border-[#D8C9B6] px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-[#D8C9B6] transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-[#D8C9B6] hover:text-[#010101]"
              >
                {copy.previous}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                className="border border-[#D8C9B6] px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-[#D8C9B6] transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-[#D8C9B6] hover:text-[#010101]"
              >
                {copy.next}
              </button>
            </div>
          )}
          </>
        )}
      </section>

      <Footer isLight={!isDarkVisual} />
    </main>
  );
}
