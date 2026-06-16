"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Loader2, ArrowRight, X, Mail
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import ScrollingBanner from "@/components/ScrollingBanner";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import IntroGate from "@/components/IntroGate";

type Property = any;
const DEFAULT_MIN_PRICE = "20000";
const AGENCY_CONFIG_SLUG = process.env.NEXT_PUBLIC_AGENCY_SLUG || "amaru-homes";
const CITY_TO_REGION_MAP: Record<string, string> = {
  alicante: "Costa Blanca", benidorm: "Costa Blanca", altea: "Costa Blanca",
  calpe: "Costa Blanca", denia: "Costa Blanca", javea: "Costa Blanca",
  xabia: "Costa Blanca", moraira: "Costa Blanca", torrevieja: "Costa Blanca",
  orihuela: "Costa Blanca", "orihuela costa": "Costa Blanca", guardamar: "Costa Blanca",
  "santa pola": "Costa Blanca", finestrat: "Costa Blanca", villajoyosa: "Costa Blanca",
  polop: "Costa Blanca", elche: "Costa Blanca", "el campello": "Costa Blanca",
  busot: "Costa Blanca", "cumbre del sol": "Costa Blanca",
  marbella: "Costa del Sol", estepona: "Costa del Sol", mijas: "Costa del Sol",
  fuengirola: "Costa del Sol", benalmadena: "Costa del Sol", torremolinos: "Costa del Sol",
  malaga: "Costa del Sol", nerja: "Costa del Sol", casares: "Costa del Sol",
  manilva: "Costa del Sol", sotogrande: "Costa del Sol", "san pedro de alcantara": "Costa del Sol",
  benahavis: "Costa del Sol", cancelada: "Costa del Sol", "san roque": "Costa del Sol",
  murcia: "Costa Calida", cartagena: "Costa Calida", "los alcazares": "Costa Calida",
  "san javier": "Costa Calida", "san pedro del pinatar": "Costa Calida", mazarron: "Costa Calida",
  aguilas: "Costa Calida", "la manga": "Costa Calida", sucina: "Costa Calida",
  "bano y mendigo": "Costa Calida",
  almeria: "Costa Almeria", "roquetas de mar": "Costa Almeria", mojacar: "Costa Almeria",
  vera: "Costa Almeria", "san juan de los terreros": "Costa Almeria", pulpi: "Costa Almeria",
  "cuevas del almanzora": "Costa Almeria"
};
const PROVINCE_TO_REGION_MAP: Record<string, string> = {
  alicante: "Costa Blanca",
  malaga: "Costa del Sol",
  cadiz: "Costa del Sol",
  murcia: "Costa Calida",
  almeria: "Costa Almeria"
};

function normalizeLocation(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    : "";
}

function getPropertyRegion(property: Property) {
  const directRegion = property.region?.trim();
  if (directRegion) return directRegion;

  const city = normalizeLocation(property.town || property.ville);
  const province = normalizeLocation(property.province);
  return CITY_TO_REGION_MAP[city] || PROVINCE_TO_REGION_MAP[province] || "";
}

function parsePropertyPrice(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;

  const digitsOnly = value.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

function getConfiguredMinPrice(config: any) {
  const rawMinPrice = config?.filter_config?.minPropertyPrice;
  const minPrice = Number(rawMinPrice);
  if (!Number.isFinite(minPrice) || minPrice <= 0) return DEFAULT_MIN_PRICE;
  return String(Math.max(minPrice, Number(DEFAULT_MIN_PRICE)));
}

function getConfiguredFeaturedPropertyIds(config: any) {
  const ids = config?.filter_config?.featuredPropertyIds;
  return Array.isArray(ids)
    ? ids.map((id) => String(id || "").trim()).filter(Boolean).slice(0, 6)
    : [];
}

function getPropertyExternalId(property: Property) {
  return String(property?.id_externe || property?.ref || property?.id || "").trim();
}

function mergeProperties(primary: Property[], secondary: Property[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((property) => {
    const key = getPropertyExternalId(property);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const COUNTRY_CATALOGS = [
  {
    id: "spain",
    image: "/images/countries/spain.jpg",
    type: "scroll",
  },
  {
    id: "portugal",
    image: "/images/countries/portugal.jpg",
    type: "portfolio",
    region: "Portugal",
  },
  {
    id: "georgia",
    image: "/images/countries/georgia.jpg",
    type: "disabled",
  },
];

const COUNTRY_COPY = {
  fr: {
    eyebrow: "Catalogues internationaux",
    title: "Choisissez votre destination",
    description: "Retrouvez les pays pour lesquels Amaru Homes dispose d'un catalogue immobilier, actif ou en cours de preparation.",
    spain: ["Espagne", "Catalogue actif", "Costa Blanca, Costa del Sol, Costa Calida et Costa Almeria.", "Explorer les regions"],
    portugal: ["Portugal", "Catalogue actif", "Biens synchronises depuis le catalogue Portugal.", "Voir les biens"],
    georgia: ["Georgie", "Bientot disponible", "Catalogue en attente du flux XML pour activer la destination.", "Bientot disponible"],
  },
  en: {
    eyebrow: "International catalogues",
    title: "Choose your destination",
    description: "Browse the countries where Amaru Homes has an active or upcoming property catalogue.",
    spain: ["Spain", "Active catalogue", "Costa Blanca, Costa del Sol, Costa Calida and Costa Almeria.", "Explore regions"],
    portugal: ["Portugal", "Active catalogue", "Properties synchronized from the Portugal catalogue.", "View properties"],
    georgia: ["Georgia", "Coming soon", "Catalogue pending XML feed activation.", "Coming soon"],
  },
  es: {
    eyebrow: "Catalogos internacionales",
    title: "Elija su destino",
    description: "Consulte los paises donde Amaru Homes tiene un catalogo inmobiliario activo o en preparacion.",
    spain: ["Espana", "Catalogo activo", "Costa Blanca, Costa del Sol, Costa Calida y Costa Almeria.", "Explorar regiones"],
    portugal: ["Portugal", "Catalogo activo", "Propiedades sincronizadas desde el catalogo de Portugal.", "Ver propiedades"],
    georgia: ["Georgia", "Proximamente", "Catalogo pendiente de activacion del feed XML.", "Proximamente"],
  },
  nl: {
    eyebrow: "Internationale catalogi",
    title: "Kies uw bestemming",
    description: "Bekijk de landen waarvoor Amaru Homes een actieve of aankomende vastgoedcatalogus heeft.",
    spain: ["Spanje", "Actieve catalogus", "Costa Blanca, Costa del Sol, Costa Calida en Costa Almeria.", "Regio's bekijken"],
    portugal: ["Portugal", "Actieve catalogus", "Woningen gesynchroniseerd vanuit de Portugal-catalogus.", "Woningen bekijken"],
    georgia: ["Georgie", "Binnenkort", "Catalogus wacht op activering van de XML-feed.", "Binnenkort"],
  },
  pl: {
    eyebrow: "Katalogi miedzynarodowe",
    title: "Wybierz kierunek",
    description: "Zobacz kraje, dla ktorych Amaru Homes ma aktywny lub przygotowywany katalog nieruchomosci.",
    spain: ["Hiszpania", "Aktywny katalog", "Costa Blanca, Costa del Sol, Costa Calida i Costa Almeria.", "Odkryj regiony"],
    portugal: ["Portugalia", "Aktywny katalog", "Nieruchomosci zsynchronizowane z katalogu Portugalii.", "Zobacz nieruchomosci"],
    georgia: ["Gruzja", "Wkrotce", "Katalog czeka na aktywacje feedu XML.", "Wkrotce"],
  },
  ar: {
    eyebrow: "كتالوجات دولية",
    title: "اختر وجهتك",
    description: "استكشف البلدان التي لدى Amaru Homes كتالوج عقاري نشط أو قيد التحضير لها.",
    spain: ["إسبانيا", "كتالوج نشط", "كوستا بلانكا وكوستا ديل سول وكوستا كاليدا وكوستا ألميريا.", "استكشف المناطق"],
    portugal: ["البرتغال", "كتالوج نشط", "عقارات تمت مزامنتها من كتالوج البرتغال.", "عرض العقارات"],
    georgia: ["جورجيا", "قريبا", "الكتالوج بانتظار تفعيل ملف XML.", "قريبا"],
  },
  ka: {
    eyebrow: "საერთაშორისო კატალოგები",
    title: "აირჩიეთ მიმართულება",
    description: "იხილეთ ქვეყნები, სადაც Amaru Homes-ს აქვს აქტიური ან მოსამზადებელი უძრავი ქონების კატალოგი.",
    spain: ["ესპანეთი", "აქტიური კატალოგი", "Costa Blanca, Costa del Sol, Costa Calida და Costa Almeria.", "რეგიონების ნახვა"],
    portugal: ["პორტუგალია", "აქტიური კატალოგი", "პორტუგალიის კატალოგიდან სინქრონიზებული ობიექტები.", "ობიექტების ნახვა"],
    georgia: ["საქართველო", "მალე", "კატალოგი ელოდება XML feed-ის აქტივაციას.", "მალე"],
  },
} as const;

const PORTUGAL_AREAS = [
  {
    id: "algarve",
    name: "Algarve",
    image: "/images/countries/portugal-algarve.jpg",
    towns: ["Portimao", "Portimão", "Tavira", "Quarteira", "Vilamoura", "Lagos", "Loule", "Loulé", "Altura", "Castro Marim", "Carvoeiro", "Parchal", "Lagoa"],
    description: "Littoral sud, golf, marinas et appartements de vacances.",
  },
  {
    id: "lisbon",
    name: "Lisbonne & Cascais",
    image: "/images/countries/portugal-lisbon-cascais.jpg",
    towns: ["Lisboa", "Cascais", "Oeiras", "Algés", "Alges", "Loures", "Moscavide", "Montijo"],
    description: "Capitale, front de mer et adresses urbaines premium.",
  },
  {
    id: "porto",
    name: "Porto & Nord",
    image: "/images/countries/portugal-porto-north.jpg",
    towns: ["Porto", "Gondomar", "São Pedro da Cova", "Sao Pedro da Cova", "Vila Nova de Gaia", "Maia", "Moreira", "Senhora da Hora", "Matosinhos"],
    description: "Metropole nord, rendement urbain et proximite ocean.",
  },
  {
    id: "silver-coast",
    name: "Silver Coast",
    image: "/images/countries/portugal-silver-coast.jpg",
    towns: ["Nadadouro", "Óbidos", "Obidos", "Caldas da Rainha"],
    description: "Cote Atlantique, lagunes, villages et residences recentes.",
  },
  {
    id: "madeira",
    name: "Madere",
    image: "/images/countries/portugal-madeira.jpg",
    towns: ["Funchal"],
    description: "Ile, climat doux et biens avec fort attrait lifestyle.",
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParamsOrigin = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { t, locale } = useTranslation();
  
  const [mounted, setMounted] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState(12);
  const [portfolioMinPrice, setPortfolioMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [featuredPropertyIds, setFeaturedPropertyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- LOGIQUE DE DÉTECTION DU PACK ---
  // On vérifie l'URL et l'attribut HTML injecté par le serveur
  const isLight = searchParamsOrigin.get('pack') === 'light' || 
                  (typeof document !== 'undefined' && document.documentElement.getAttribute('data-package') === 'light');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "unset";
  }, [isSearchOpen]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const configRes = await fetch(`/api/config?slug=${AGENCY_CONFIG_SLUG}`);
        const config = configRes.ok ? await configRes.json() : null;
        const configuredMinPrice = getConfiguredMinPrice(config);
        const configuredFeaturedIds = getConfiguredFeaturedPropertyIds(config);
        setPortfolioMinPrice(configuredMinPrice);
        setFeaturedPropertyIds(configuredFeaturedIds);

        const propertyQuery = new URLSearchParams({
          limit: "200",
          lang: locale,
          minPrice: configuredMinPrice,
        });
        const regionQuery = new URLSearchParams({
          regionCounts: "true",
          minPrice: configuredMinPrice,
        });
        const featuredQuery = new URLSearchParams({
          limit: "5",
          lang: locale,
          featuredIds: configuredFeaturedIds.join(","),
        });
        const featuredRequest = configuredFeaturedIds.length > 0
          ? fetch(`/api/properties?${featuredQuery.toString()}`)
          : Promise.resolve(null);

        const [propertiesRes, regionCountsRes, featuredRes] = await Promise.all([
          fetch(`/api/properties?${propertyQuery.toString()}`),
          fetch(`/api/properties?${regionQuery.toString()}`),
          featuredRequest,
        ]);
        const data = await propertiesRes.json();
        const countsData = await regionCountsRes.json();
        const featuredData = featuredRes?.ok ? await featuredRes.json() : [];
        
        // CORRECTION : On s'assure que data est bien un tableau pour éviter "filter is not a function"
        if (data && Array.isArray(data)) {
          setAllProperties(Array.isArray(featuredData) ? mergeProperties(featuredData, data) : data);
        } else {
          console.error("Format de données invalide reçu de l'API");
          setAllProperties(Array.isArray(featuredData) ? featuredData : []);
        }
        if (countsData && !Array.isArray(countsData)) {
          setRegionCounts(countsData);
        }
      } catch (err) {
        console.error("Erreur API:", err);
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locale]);

  const [filters, setFilters] = useState({
    type: "", town: "", region: "", beds: "",
    minPrice: DEFAULT_MIN_PRICE, maxPrice: "", reference: "", development: "", portugalArea: "", availableOnly: false,
  });
  const filterQueryString = searchParamsOrigin.toString();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      minPrice: prev.minPrice && Number(prev.minPrice) > Number(portfolioMinPrice) ? prev.minPrice : portfolioMinPrice,
    }));
  }, [portfolioMinPrice]);

  useEffect(() => {
    const region = searchParamsOrigin.get("region") || "";
    const town = searchParamsOrigin.get("town") || "";
    if (!region && !town) return;

    setFilters({
      type: "",
      town,
      region,
      beds: "",
      minPrice: portfolioMinPrice,
      maxPrice: "",
      reference: "",
      development: "",
      portugalArea: "",
      availableOnly: false,
    });
    setVisibleCount(12);
  }, [filterQueryString, portfolioMinPrice, searchParamsOrigin]);

  // CORRECTION : Sécurisation du filter
  const filteredProperties = useMemo(() => {
    const baseProps = Array.isArray(allProperties) ? allProperties : [];
    
    return baseProps.filter((p) => {
      if (!p) return false;
      const matchDev = !filters.development || p.development_name?.toLowerCase().trim() === filters.development.toLowerCase().trim();
      const matchTown = !filters.town || normalizeLocation(p.town || p.ville) === normalizeLocation(filters.town);
      const matchRegion = !filters.region || getPropertyRegion(p) === filters.region;
      const selectedPortugalArea = PORTUGAL_AREAS.find((area) => area.id === filters.portugalArea);
      const matchPortugalArea = !selectedPortugalArea || selectedPortugalArea.towns.some((town) => normalizeLocation(town) === normalizeLocation(p.town || p.ville));
      const matchType = !filters.type || p.type?.toLowerCase().includes(filters.type.toLowerCase());
      const matchBeds = !filters.beds || Number(p.beds) >= Number(filters.beds);
      const price = parsePropertyPrice(p.price);
      const effectiveMinPrice = filters.minPrice || portfolioMinPrice;
      const matchMin = !effectiveMinPrice || price >= Number(effectiveMinPrice);
      const matchMax = !filters.maxPrice || price <= Number(filters.maxPrice);
      const matchRef = !filters.reference || p.ref?.toLowerCase().includes(filters.reference.toLowerCase());
      return matchDev && matchTown && matchRegion && matchPortugalArea && matchType && matchBeds && matchMin && matchMax && matchRef;
    });
  }, [allProperties, filters, portfolioMinPrice]);

  const monthlySelection = useMemo(() => {
    if (featuredPropertyIds.length === 0) return [];

    const featuredRank = new Map(featuredPropertyIds.map((id, index) => [id, index]));
    return allProperties
      .filter((property) => featuredRank.has(getPropertyExternalId(property)))
      .sort((a, b) => {
        const rankA = featuredRank.get(getPropertyExternalId(a)) ?? Number.MAX_SAFE_INTEGER;
        const rankB = featuredRank.get(getPropertyExternalId(b)) ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB;
      });
  }, [allProperties, featuredPropertyIds]);

  const monthlySelectionIds = useMemo(
    () => new Set(monthlySelection.map((property) => getPropertyExternalId(property))),
    [monthlySelection]
  );

  const portfolioProperties = useMemo(
    () => filteredProperties.filter((property) => !monthlySelectionIds.has(getPropertyExternalId(property))),
    [filteredProperties, monthlySelectionIds]
  );

  const portugalAreaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PORTUGAL_AREAS.forEach((area) => {
      counts[area.id] = allProperties.filter((property) =>
        property?.region === "Portugal" &&
        area.towns.some((town) => normalizeLocation(town) === normalizeLocation(property.town || property.ville))
      ).length;
    });
    return counts;
  }, [allProperties]);

  const propertiesToShow = portfolioProperties.slice(0, visibleCount);
  const hasMoreProperties = portfolioProperties.length > propertiesToShow.length;

  const handleSearch = async (newFilters: any, scrollTargetId = "collection") => {
    const nextFilters = { ...filters, ...newFilters };
    const query = new URLSearchParams({
      limit: "200",
      lang: locale,
    });

    query.set("minPrice", nextFilters.minPrice || portfolioMinPrice);
    if (nextFilters.maxPrice) query.set("maxPrice", nextFilters.maxPrice);
    if (nextFilters.region) query.set("region", nextFilters.region);
    if (nextFilters.town) query.set("town", nextFilters.town);
    if (nextFilters.type) query.set("type", nextFilters.type);
    if (nextFilters.beds) query.set("beds", nextFilters.beds);
    if (nextFilters.reference) query.set("reference", nextFilters.reference);

    try {
      const response = await fetch(`/api/properties?${query.toString()}`);
      const data = await response.json();
      setAllProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur recherche:", error);
      setAllProperties([]);
    }

    setFilters(nextFilters);
    setVisibleCount(12);
    setIsSearchOpen(false);
    const section = document.getElementById(scrollTargetId);
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleRegionClick = (regionName: string) => {
    setFilters({ type: "", town: "", region: regionName, beds: "", minPrice: portfolioMinPrice, maxPrice: "", reference: "", development: "", portugalArea: "", availableOnly: false });
    setVisibleCount(12);
    const section = document.getElementById("collection");
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSpainCatalogClick = () => {
    if (filters.region === "Portugal") {
      handleSearch({
        type: "",
        town: "",
        region: "",
        beds: "",
        minPrice: portfolioMinPrice,
        maxPrice: "",
        reference: "",
        development: "",
        portugalArea: "",
        availableOnly: false,
      }, "spain-regions");
      return;
    }

    const section = document.getElementById("spain-regions");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleCountryCatalogClick = (country: (typeof COUNTRY_CATALOGS)[number]) => {
    if (country.type === "portfolio" && country.region) {
      handleSearch({
        type: "",
        town: "",
        region: country.region,
        beds: "",
        minPrice: portfolioMinPrice,
        maxPrice: "",
        reference: "",
        development: "",
        portugalArea: "",
        availableOnly: false,
      }, "portugal-regions");
      return;
    }

    handleSpainCatalogClick();
  };

  const handlePortugalAreaClick = (areaId: string) => {
    setFilters((prev) => ({
      ...prev,
      region: "Portugal",
      town: "",
      portugalArea: areaId,
    }));
    setVisibleCount(12);
    const section = document.getElementById("collection");
    if (section) setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
  };

  if (!mounted) return null;

  // Couleurs dynamiques : le mode jour dépend du thème, pas seulement du pack light.
  const isDarkVisual = resolvedTheme === "dark" && !isLight;
  const bgColor = isDarkVisual ? 'bg-[#010101]' : 'bg-[#FAFAFA]';
  const textColor = isDarkVisual ? 'text-[#FAFAFA]' : 'text-[#171716]';
  const mutedText = isDarkVisual ? 'text-[#F2EFEA]' : 'text-[#171716]';
  const countryCopy = COUNTRY_COPY[locale as keyof typeof COUNTRY_COPY] || COUNTRY_COPY.en;

  if (loading) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${bgColor}`}>
        <Loader2 className="animate-spin text-[#D8C9B6] mb-8" size={48} />
        <span className={`text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse ${isDarkVisual ? 'text-[#D8C9B6]' : 'text-[#171716]'}`}>
          {t('home.loading.amaruExcellence')}
        </span>
      </div>
    );
  }

  return (
    <main className={`min-h-screen selection:bg-[#D8C9B6]/30 font-sans overflow-x-hidden transition-colors duration-500 ${bgColor}`}>
      <Navbar />
      
      {/* SECTION HERO */}
      <div className={`relative h-[80vh] flex flex-col items-center justify-center transition-colors duration-500 ${bgColor}`}>
        <Hero />
        <div className="absolute bottom-[12%] z-40">
           {!isSearchOpen && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-5 transition-all duration-700"
             >
                <div className={`w-10 h-10 border border-[#D8C9B6]/30 ${isDarkVisual ? 'bg-transparent text-[#D8C9B6]' : 'bg-[#010101] text-[#FAFAFA]'} rounded-full flex items-center justify-center group-hover:bg-[#D8C9B6] group-hover:text-[#010101] transition-all duration-500`}>
                  <Search size={16} strokeWidth={1.5} />
                </div>
                <span className={`text-[11px] md:text-[13px] font-light uppercase tracking-[0.6em] transition-colors duration-500 ${textColor}`}>
                  {t('home.findVilla')}
                </span>
             </button>
           )}
        </div>
        <div className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t ${isDarkVisual ? 'from-[#010101]' : 'from-[#FAFAFA]'} to-transparent pointer-events-none transition-colors duration-500`} />
      </div>

      <ScrollingBanner />

      {/* CATALOGUES PAYS */}
      <section className={`py-16 md:py-20 transition-colors duration-500 ${bgColor}`}>
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="text-[#D8C9B6] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
                {countryCopy.eyebrow}
              </span>
              <h2 className={`text-4xl md:text-6xl font-serif italic leading-tight ${textColor}`}>
                {countryCopy.title}
              </h2>
            </div>
            <p
              className={`max-w-sm border-l pl-6 text-xs font-light italic leading-relaxed ${mutedText}`}
              style={{ borderColor: isDarkVisual ? 'color-mix(in srgb, #FAFAFA 10%, transparent)' : '#D8C9B6' }}
            >
              {countryCopy.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[420px]">
            {COUNTRY_CATALOGS.map((country, index) => {
              const [countryName, countryStatus, countryDescription, countryAction] = countryCopy[country.id as keyof typeof countryCopy] as readonly string[];
              const content = (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={country.image}
                      alt={countryName}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-[4s] ease-out group-hover:scale-105 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-85" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D8C9B6]">
                        {countryStatus}
                      </p>
                      <h3 className="font-serif text-4xl italic leading-none text-white">
                        {countryName}
                      </h3>
                      <p className="max-w-sm text-xs leading-6 text-white/75">
                        {countryDescription}
                      </p>
                      <div className="relative pt-4">
                        <div className="absolute left-0 top-0 h-px w-8 bg-white/40 transition-all duration-700 group-hover:w-full" />
                        <span className="block pt-3 text-[8px] font-light uppercase tracking-[0.4em] text-white">
                          {countryAction}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                </>
              );

              if (country.type === "disabled") {
                return (
                  <div
                    key={country.id}
                    className="group relative min-h-[360px] overflow-hidden bg-slate-900 opacity-80 md:min-h-0"
                    aria-disabled="true"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {content}
                  </div>
                );
              }

              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => handleCountryCatalogClick(country)}
                  className="group relative min-h-[360px] overflow-hidden bg-slate-900 text-left md:min-h-0"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRILLE DES RÉGIONS */}
      {filters.region === "Portugal" && (
        <section id="portugal-regions" className={`py-12 transition-colors duration-500 ${bgColor}`}>
          <div className="max-w-[1600px] mx-auto px-6 py-12">
            <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <span className="text-[#D8C9B6] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
                  Portugal
                </span>
                <h2 className={`text-4xl md:text-6xl font-serif italic leading-tight ${textColor}`}>
                  Regions du Portugal
                </h2>
              </div>
              <p
                className={`max-w-sm border-l pl-6 text-xs font-light italic leading-relaxed ${mutedText}`}
                style={{ borderColor: isDarkVisual ? 'color-mix(in srgb, #FAFAFA 10%, transparent)' : '#D8C9B6' }}
              >
                Explorez les zones actuellement disponibles dans le catalogue Portugal synchronise.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[360px]">
              {PORTUGAL_AREAS.map((area, index) => {
                const count = portugalAreaCounts[area.id] || 0;
                const isSelected = filters.portugalArea === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => handlePortugalAreaClick(area.id)}
                    className={`group relative min-h-[320px] overflow-hidden bg-slate-900 text-left md:min-h-0 ${index === 0 ? "md:col-span-2" : ""}`}
                  >
                    <div className="absolute inset-0">
                      <img
                        src={area.image}
                        alt={area.name}
                        className="h-full w-full object-cover opacity-90 transition-transform duration-[4s] ease-out group-hover:scale-105 group-hover:opacity-80"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent ${isSelected ? "opacity-95" : "opacity-80"}`} />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D8C9B6]">
                          {count} biens
                        </p>
                        <h3 className="font-serif text-3xl italic leading-none text-white md:text-4xl">
                          {area.name}
                        </h3>
                        <p className="max-w-sm text-xs leading-6 text-white/75">
                          {area.description}
                        </p>
                        <div className="relative pt-4">
                          <div className="absolute left-0 top-0 h-px w-8 bg-white/40 transition-all duration-700 group-hover:w-full" />
                          <span className="block pt-3 text-[8px] font-light uppercase tracking-[0.4em] text-white">
                            Voir les biens
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`absolute inset-0 border pointer-events-none ${isSelected ? "border-[#D8C9B6]" : "border-white/5"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {filters.region !== "Portugal" && (
        <section id="spain-regions" className={`py-12 transition-colors duration-500 ${bgColor}`}>
          <RegionGrid properties={allProperties} regionCounts={regionCounts} onRegionClick={handleRegionClick} />
        </section>
      )}

      {/* SECTION ESPACE PROPRIÉTAIRE (Masquée en mode Light) */}
      {!isLight && (
        <section className={`max-w-[1600px] mx-auto px-4 sm:px-6 py-10 sm:py-12 ${bgColor}`}>
          <div
            className="relative overflow-hidden border p-6 sm:p-8 md:p-12 transition-colors duration-500"
            style={{
              backgroundColor: isDarkVisual ? '#171716' : '#F2EFEA',
              borderColor: '#D8C9B6',
            }}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(320px,480px)] lg:gap-12 lg:items-center">
              <div className="space-y-5 sm:space-y-6">
                <span className="block text-[#D8C9B6] text-[10px] font-bold uppercase tracking-[0.35em] sm:tracking-[0.4em]">{t('home.ownerSection.badge')}</span>
                <h2 className={`text-4xl sm:text-5xl md:text-6xl font-serif italic leading-[1.02] ${textColor}`}>
                  {t('home.ownerSection.title')} <br />
                  <span className="text-[#D8C9B6] not-italic font-sans font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase">{t('home.ownerSection.subtitle')}</span>
                </h2>
                <p className={`max-w-xl text-sm sm:text-base leading-7 ${mutedText}`}>
                  {t('home.ownerSection.description')}
                </p>
              </div>

              <div
                className="w-full border p-6 sm:p-8 md:p-10 shadow-xl transition-colors duration-500"
                style={{
                  backgroundColor: isDarkVisual ? '#010101' : '#FAFAFA',
                  borderColor: '#D8C9B6',
                }}
              >
                <form className="space-y-7">
                  <input
                    type="password"
                    placeholder={t('home.ownerSection.pinPlaceholder')}
                    className={`w-full bg-transparent border-b py-4 text-center text-xl sm:text-2xl font-black tracking-[0.35em] sm:tracking-[0.55em] outline-none transition-all focus:border-[#D8C9B6] ${textColor}`}
                    style={{ borderColor: isDarkVisual ? 'color-mix(in srgb, #FAFAFA 15%, transparent)' : '#D8C9B6' }}
                  />
                  <button type="submit" className="w-full bg-[#D8C9B6] text-[#010101] py-5 px-5 font-bold text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.3em] hover:bg-[#171716] hover:text-[#FAFAFA] transition-all flex items-center justify-center gap-4">
                    {t('home.ownerSection.accessButton')} <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {monthlySelection.length > 0 && (
        <section id="monthly-selection" className={`relative overflow-hidden border-y border-[#D8C9B6]/25 py-16 md:py-20 transition-colors duration-500 ${isDarkVisual ? "bg-[#171716]" : "bg-[#F2EFEA]"}`}>
          <div className="max-w-7xl mx-auto px-6">
            <header className="mb-12 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#D8C9B6]">
                  Amaru Homes
                </p>
                <h2 className={`font-serif text-4xl italic leading-tight md:text-6xl ${textColor}`}>
                  Notre sélection du mois
                </h2>
              </div>
              <p className={`max-w-2xl text-sm leading-7 lg:justify-self-end ${mutedText}`}>
                Une sélection courte de biens mis en avant par l'équipe Amaru pour leur emplacement, leur potentiel et leur qualité de vie.
              </p>
            </header>

            <PropertyGrid
              activeFilters={{ type: "", town: "", region: "", beds: "", minPrice: "", maxPrice: "", reference: "" }}
              properties={monthlySelection}
              isLight={isLight}
            />
          </div>
        </section>
      )}

      {/* SECTION COLLECTION */}
      <section id="collection" className={`py-12 relative transition-colors duration-500 ${bgColor}`}>
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12 text-center space-y-4">
            <h3 className={`text-4xl md:text-6xl font-serif italic leading-none ${textColor}`}>
              {filters.region ? filters.region : t('home.collection.title')}
            </h3>
            <p className="text-[#D8C9B6] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4">
               <span className="w-4 h-px bg-[#D8C9B6]/40"></span>
               {filteredProperties.length} {t('home.collection.propertiesSelected')}
               <span className="w-4 h-px bg-[#D8C9B6]/40"></span>
            </p>
          </header>
          {/* On passe isLight au Grid pour les vignettes */}
          <PropertyGrid activeFilters={filters} properties={propertiesToShow} isLight={isLight} />
          {hasMoreProperties && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 12)}
                className="border border-[#D8C9B6] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8C9B6] transition-all hover:bg-[#D8C9B6] hover:text-[#010101]"
              >
                {t('home.collection.showMore')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SECTION LEAD MAGNET (Spécifique Mode Light) */}
      {isLight && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-black text-white p-12 md:p-20 text-center space-y-8">
            <Mail className="mx-auto text-[#D8C9B6]" size={40} />
            <h2 className="text-3xl md:text-5xl font-serif italic">Recevez notre sélection Off-Market</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm uppercase tracking-widest">Inscrivez-vous pour accéder aux propriétés avant leur publication officielle.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto pt-4">
              <input type="email" placeholder="VOTRE EMAIL" className="bg-transparent border border-white/20 px-6 py-4 outline-none focus:border-[#D8C9B6] flex-1 text-[10px] tracking-widest text-white" />
              <button className="bg-[#D8C9B6] text-black px-8 py-4 font-bold text-[10px] tracking-widest uppercase hover:bg-white transition-all">S'inscrire</button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE RECHERCHE */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isSearchOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
        <div className={`relative w-full max-w-5xl overflow-hidden shadow-2xl transition-all duration-500 ${isSearchOpen ? 'scale-100' : 'scale-95'} ${bgColor}`}>
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-5 right-5 w-10 h-10 bg-black text-[#D8C9B6] flex items-center justify-center hover:bg-[#D8C9B6] hover:text-black z-50 transition-all"><X size={20} /></button>
          <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto">
            <AdvancedSearch properties={allProperties} onSearch={handleSearch} activeFilters={filters} isLight={isLight} />
          </div>
        </div>
      </div>

      <Footer isLight={!isDarkVisual} />
    </main>
  );
}

export default function Home() {
  return (
    <>
      <IntroGate />
      <Suspense fallback={<div className="h-screen bg-[#010101] flex items-center justify-center"><Loader2 className="animate-spin text-[#D8C9B6]" size={48} /></div>}>
        <HomeContent />
      </Suspense>
    </>
  );
}
