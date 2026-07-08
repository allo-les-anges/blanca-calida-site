"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bus,
  Camera,
  GraduationCap,
  Hospital,
  MapPin,
  ShoppingBag,
  Sparkles,
  Trees,
  Utensils,
  Waves,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildStreetViewUrl, estimatePoiMinutes, formatPoiDistance } from "./lifestyleTypes";
import type { LifestylePoi as LifestylePoiV7 } from "./CesiumLifestyleViewerV7";
import { normalizeGeoPoint } from "@/modules/lifestyle/viewer/coordinateUtils";

const LifestyleMapLibre = dynamic(() => import("./LifestyleMapLibre"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center gap-2 bg-[#0b1728] md:h-[360px]">
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
    </div>
  ),
});

const CesiumLifestyleViewer = dynamic(() => import("./CesiumLifestyleViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-[1.75rem] border border-white/12 bg-[#050b16] text-sm font-bold text-white/60 md:h-[620px]">
      Chargement de la vue immersive...
    </div>
  ),
});

const CesiumLifestyleViewerV6 = dynamic(() => import("./CesiumLifestyleViewerV6"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-[1.75rem] border border-white/12 bg-[#050b16] text-sm font-bold text-white/60 md:h-[620px]">
      Chargement de la vue immersive...
    </div>
  ),
});

const CesiumLifestyleViewerV7 = dynamic(() => import("./CesiumLifestyleViewerV7"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-[1.75rem] border border-white/12 bg-[#050b16] text-sm font-bold text-white/60 md:h-[620px]">
      Chargement Lifestyle Explorer V7...
    </div>
  ),
});

type LifestyleExplorerProps = {
  latitude?: number | null;
  longitude?: number | null;
  propertyTitle?: string;
  town?: string;
  region?: string;
  country?: string;
  price?: string;
  images?: string[];
  primaryColor?: string;
  isLight?: boolean;
  agencyId?: string;
  propertyId?: string;
  locale?: string;
  onClose?: () => void;
};

type LifestyleLayer = {
  id: string;
  label: string;
  icon: LucideIcon;
  query: string;
  color: string;
  poiCategory: LifestylePoiV7["category"];
  descriptionFilter?: string;
};

// query/poiCategory drive a real nearest-match lookup against fetched OSM POIs
// (see fetchNearbyPois below) -- no distance/angle here, those come from the
// actual matched POI's real coordinates, never a fixed per-property guess.
const LAYERS: LifestyleLayer[] = [
  { id: "beach", label: "Plages", query: "beach", icon: Waves, color: "#38bdf8", poiCategory: "beach" },
  { id: "restaurants", label: "Restaurants", query: "restaurant", icon: Utensils, color: "#f97316", poiCategory: "restaurant" },
  { id: "shops", label: "Commerces", query: "shops", icon: ShoppingBag, color: "#10b981", poiCategory: "shop" },
  { id: "schools", label: "Ecoles", query: "school", icon: GraduationCap, color: "#8b5cf6", poiCategory: "school" },
  { id: "hospitals", label: "Hopitaux", query: "hospital", icon: Hospital, color: "#ef4444", poiCategory: "health" },
  { id: "golf", label: "Golfs", query: "golf course", icon: Trees, color: "#22c55e", poiCategory: "sport", descriptionFilter: "Golf course" },
  { id: "transport", label: "Transports", query: "public transport", icon: Bus, color: "#06b6d4", poiCategory: "transport" },
];

const RADII = [2, 5, 10] as const;
const HERO_TIMELINE_IDS = ["beach", "restaurants", "golf"];

const LAYER_LABELS: Record<string, Record<string, string>> = {
  fr: { beach: "Plages", restaurants: "Restaurants", shops: "Commerces", schools: "Ecoles", hospitals: "Hopitaux", golf: "Golfs", transport: "Transports" },
  en: { beach: "Beaches", restaurants: "Restaurants", shops: "Shops", schools: "Schools", hospitals: "Hospitals", golf: "Golf courses", transport: "Transport" },
  es: { beach: "Playas", restaurants: "Restaurantes", shops: "Comercios", schools: "Colegios", hospitals: "Hospitales", golf: "Campos de golf", transport: "Transporte" },
  nl: { beach: "Stranden", restaurants: "Restaurants", shops: "Winkels", schools: "Scholen", hospitals: "Ziekenhuizen", golf: "Golfbanen", transport: "Vervoer" },
  pl: { beach: "Plaze", restaurants: "Restauracje", shops: "Sklepy", schools: "Szkoly", hospitals: "Szpitale", golf: "Pola golfowe", transport: "Transport" },
  ar: { beach: "الشواطئ", restaurants: "المطاعم", shops: "المحلات", schools: "المدارس", hospitals: "المستشفيات", golf: "ملاعب الغولف", transport: "المواصلات" },
};


function localizeLabel(map: Record<string, Record<string, string>>, locale: string | undefined, id: string, fallback: string) {
  const normalized = (locale || "fr").split("-")[0];
  return map[normalized]?.[id] || map.fr[id] || fallback;
}

const COPY = {
  fr: {
    badge: "Lifestyle Explorer",
    close: "Retour au site",
    eyebrowGeo: "Quartier geolocalise",
    eyebrowApprox: "Localisation approximative",
    title: "Explorer le quartier",
    intro: (property: string, location: string) => `${property} devient une lecture immersive et claire de son environnement autour de ${location}.`,
    launch: "Explorer en 3D",
    experienceReady: "Vue immersive prete. Les points d'interet et Street View sont disponibles autour du bien.",
    experienceLimited: "Vue immersive prete. Les points d'interet restent disponibles; Street View s'ouvrira dans Google Maps.",
    radius: "Rayon d'analyse",
    around: (radius: number) => `${radius} km autour du bien`,
    fallback: "Fallback quartier",
    price: "Prix sur demande",
    streetView: "Street View",
    premiumInsights: "Premium insights",
    nearestBeach: "Plage la plus proche",
    placesFound: "Lieux dans le rayon",
    closestService: "Service le plus proche",
    analysisRadius: "Rayon analyse",
    lifestyleLayers: "Couches lifestyle",
    intelligenceTitle: "Lecture de quartier",
    intelligenceDescription: "Une synthese visuelle pour comprendre rapidement les services, les temps d'acces et les lieux qui donnent de la valeur au bien.",
    intelligenceHint: "Donnees locales, POI et vues immersives reunies dans une experience claire pour vos clients.",
    closeStreetView: "Fermer Street View",
  },
  en: {
    badge: "Lifestyle Explorer",
    close: "Back to site",
    eyebrowGeo: "Geolocated neighbourhood",
    eyebrowApprox: "Approximate location",
    title: "Explore the neighbourhood",
    intro: (property: string, location: string) => `${property} becomes a clear immersive reading of its surroundings around ${location}.`,
    launch: "Explore in 3D",
    experienceReady: "Immersive view ready. Points of interest and Street View are available around the property.",
    experienceLimited: "Immersive view ready. Points of interest remain available; Street View opens in Google Maps.",
    radius: "Analysis radius",
    around: (radius: number) => `${radius} km around the property`,
    fallback: "Neighbourhood fallback",
    price: "Price on request",
    streetView: "Street View",
    premiumInsights: "Premium insights",
    nearestBeach: "Nearest beach",
    placesFound: "Places in radius",
    closestService: "Closest service",
    analysisRadius: "Analysis radius",
    lifestyleLayers: "Lifestyle layers",
    intelligenceTitle: "Neighbourhood intelligence",
    intelligenceDescription: "A visual summary of services, access times and places that shape the property's everyday value.",
    intelligenceHint: "Local data, POIs and immersive views are combined into a client-ready experience.",
    closeStreetView: "Close Street View",
  },
  es: {
    badge: "Lifestyle Explorer",
    close: "Volver al sitio",
    eyebrowGeo: "Barrio geolocalizado",
    eyebrowApprox: "Ubicacion aproximada",
    title: "Explorar el entorno",
    intro: (property: string, location: string) => `${property} se convierte en una lectura inmersiva y clara de su entorno alrededor de ${location}.`,
    launch: "Explorar en 3D",
    experienceReady: "Vista inmersiva lista. Los puntos de interes y Street View estan disponibles alrededor del inmueble.",
    experienceLimited: "Vista inmersiva lista. Los puntos de interes siguen disponibles; Street View se abre en Google Maps.",
    radius: "Radio de analisis",
    around: (radius: number) => `${radius} km alrededor del inmueble`,
    fallback: "Vista de entorno",
    price: "Precio a consultar",
    streetView: "Street View",
    premiumInsights: "Informacion premium",
    nearestBeach: "Playa mas cercana",
    placesFound: "Lugares en el radio",
    closestService: "Servicio mas cercano",
    analysisRadius: "Radio analizado",
    lifestyleLayers: "Capas lifestyle",
    intelligenceTitle: "Lectura del entorno",
    intelligenceDescription: "Una sintesis visual de servicios, tiempos de acceso y lugares que refuerzan el valor diario del inmueble.",
    intelligenceHint: "Datos locales, POI y vistas inmersivas reunidos en una experiencia clara para clientes.",
    closeStreetView: "Cerrar Street View",
  },
  nl: {
    badge: "Lifestyle Explorer",
    close: "Terug naar site",
    eyebrowGeo: "Geolokaliseerde buurt",
    eyebrowApprox: "Geschatte locatie",
    title: "Verken de buurt",
    intro: (property: string, location: string) => `${property} wordt een heldere immersieve lezing van de omgeving rond ${location}.`,
    launch: "Verken in 3D",
    experienceReady: "Immersieve weergave klaar. Interessepunten en Street View zijn beschikbaar rond het pand.",
    experienceLimited: "Immersieve weergave klaar. Interessepunten blijven beschikbaar; Street View opent in Google Maps.",
    radius: "Analyseradius",
    around: (radius: number) => `${radius} km rond het pand`,
    fallback: "Buurt fallback",
    price: "Prijs op aanvraag",
    streetView: "Street View",
    premiumInsights: "Premium inzichten",
    nearestBeach: "Dichtstbijzijnde strand",
    placesFound: "Plaatsen binnen radius",
    closestService: "Dichtstbijzijnde service",
    analysisRadius: "Analyse radius",
    lifestyleLayers: "Lifestyle-lagen",
    intelligenceTitle: "Buurtinzicht",
    intelligenceDescription: "Een visuele samenvatting van voorzieningen, reistijden en plekken die de dagelijkse waarde van het pand bepalen.",
    intelligenceHint: "Lokale data, POI's en immersieve beelden samengebracht in een heldere klantervaring.",
    closeStreetView: "Street View sluiten",
  },
  pl: {
    badge: "Lifestyle Explorer",
    close: "Powrot do strony",
    eyebrowGeo: "Okolica geolokalizowana",
    eyebrowApprox: "Lokalizacja przyblizona",
    title: "Poznaj okolice",
    intro: (property: string, location: string) => `${property} staje sie czytelnym, immersyjnym widokiem otoczenia wokol ${location}.`,
    launch: "Otworz 3D",
    experienceReady: "Widok immersyjny gotowy. Punkty zainteresowania i Street View sa dostepne wokol nieruchomosci.",
    experienceLimited: "Widok immersyjny gotowy. Punkty zainteresowania pozostaja dostepne; Street View otworzy sie w Google Maps.",
    radius: "Promien analizy",
    around: (radius: number) => `${radius} km wokol nieruchomosci`,
    fallback: "Widok okolicy",
    price: "Cena na zapytanie",
    streetView: "Street View",
    premiumInsights: "Statystyki premium",
    nearestBeach: "Najblizsza plaza",
    placesFound: "Miejsca w promieniu",
    closestService: "Najblizsza usluga",
    analysisRadius: "Promien analizy",
    lifestyleLayers: "Warstwy lifestyle",
    intelligenceTitle: "Analiza okolicy",
    intelligenceDescription: "Wizualne podsumowanie uslug, czasu dojscia i miejsc, ktore buduja codzienna wartosc nieruchomosci.",
    intelligenceHint: "Lokalne dane, POI i widoki immersyjne w jednej czytelnej prezentacji dla klienta.",
    closeStreetView: "Zamknij widok ulicy",
  },
  ar: {
    badge: "Lifestyle Explorer",
    close: "العودة إلى الموقع",
    eyebrowGeo: "حي محدد جغرافيا",
    eyebrowApprox: "موقع تقريبي",
    title: "استكشف الحي",
    intro: (property: string, location: string) => `${property} يصبح عرضا تفاعليا واضحا لمحيطه حول ${location}.`,
    launch: "استكشاف ثلاثي الأبعاد",
    experienceReady: "العرض التفاعلي جاهز. نقاط الاهتمام وStreet View متاحة حول العقار.",
    experienceLimited: "العرض التفاعلي جاهز. نقاط الاهتمام متاحة؛ يفتح Street View في خرائط Google.",
    radius: "نطاق التحليل",
    around: (radius: number) => `${radius} كم حول العقار`,
    fallback: "عرض الحي",
    price: "السعر عند الطلب",
    streetView: "عرض الشارع",
    premiumInsights: "احصائيات مميزة",
    nearestBeach: "اقرب شاطئ",
    placesFound: "اماكن ضمن النطاق",
    closestService: "اقرب خدمة",
    analysisRadius: "نطاق التحليل",
    lifestyleLayers: "طبقات نمط الحياة",
    intelligenceTitle: "قراءة الحي",
    intelligenceDescription: "ملخص بصري للخدمات وأوقات الوصول والأماكن التي تعزز قيمة العقار اليومية.",
    intelligenceHint: "بيانات محلية ونقاط اهتمام ومشاهد تفاعلية في تجربة واضحة للعملاء.",
    closeStreetView: "إغلاق عرض الشارع",
  },
} as const;

function getCopy(locale?: string) {
  const normalized = (locale || "fr").split("-")[0] as keyof typeof COPY;
  return COPY[normalized] || COPY.fr;
}

function searchUrl(latitude: number, longitude: number, query: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Real compass bearing (0deg = north, clockwise) from the property to a POI.
function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function positionFromAngle(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(radians) * radius}%`,
    top: `${50 + Math.sin(radians) * radius}%`,
  };
}


type RawLifestylePoi = Record<string, unknown>;

function normalizeApiPoisForV7(rawPois: unknown[]): LifestylePoiV7[] {
  return rawPois.flatMap((rawPoi, index) => {
    if (!rawPoi || typeof rawPoi !== "object") return [];
    const poi = rawPoi as RawLifestylePoi;
    const latitude = readNumber(poi.latitude ?? poi.lat);
    const longitude = readNumber(poi.longitude ?? poi.lng ?? poi.lon);
    if (latitude == null || longitude == null) return [];
    if (latitude === 0 && longitude === 0) return [];
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return [];

    const category = normalizeApiPoiCategory(poi.category);
    const distanceMeters = readNumber(poi.distanceMeters) ?? kmToMeters(readNumber(poi.distanceKm));
    const label = readString(poi.label) || readString(poi.name) || CATEGORY_META_FALLBACK[category] || "Point of interest";

    return [{
      id: readString(poi.id) || `api-${category}-${index}`,
      name: label,
      category,
      latitude,
      longitude,
      distanceMeters: distanceMeters ?? undefined,
      description: readString(poi.detail) || readString(poi.description) || undefined,
      source: readString(poi.source) === "openstreetmap" ? "openstreetmap" : "api",
    }];
  });
}

function normalizeApiPoiCategory(category: unknown): LifestylePoiV7["category"] {
  const value = String(category || "").toLowerCase();
  if (value === "beach" || value === "sea" || value === "marina") return "beach";
  if (value === "school" || value === "schools") return "school";
  if (value === "transport" || value === "airport") return "transport";
  if (value === "shops" || value === "shop" || value === "shopping") return "shop";
  if (value === "restaurant" || value === "restaurants") return "restaurant";
  if (value === "hospital" || value === "health") return "health";
  if (value === "golf" || value === "sport") return "sport";
  return "viewpoint";
}

const CATEGORY_META_FALLBACK: Record<LifestylePoiV7["category"], string> = {
  beach: "Beach",
  school: "School",
  transport: "Transport",
  shop: "Shopping",
  restaurant: "Restaurant",
  health: "Health",
  sport: "Sport",
  viewpoint: "Area insight",
};

function readNumber(value: unknown) {
  if (value == null || value === "") return null;
  const numberValue = Number(typeof value === "string" ? value.replace(",", ".") : value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function kmToMeters(value: number | null) {
  return value == null ? null : Math.round(value * 1000);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default function LifestyleExplorer({
  latitude,
  longitude,
  propertyTitle,
  town,
  region,
  country,
  price,
  images = [],
  primaryColor = "#D4AF37",
  agencyId,
  propertyId,
  locale = "fr",
  onClose,
}: LifestyleExplorerProps) {
  const [radiusKm, setRadiusKm] = useState<(typeof RADII)[number]>(5);
  const [showCesiumViewer, setShowCesiumViewer] = useState(false);
  const [nearbyPois, setNearbyPois] = useState<LifestylePoiV7[]>([]);
  const [nearbyPoisStatus, setNearbyPoisStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const requestedProvider = process.env.NEXT_PUBLIC_LIFESTYLE_3D_PROVIDER;
  const lifestyle3dVersion = process.env.NEXT_PUBLIC_LIFESTYLE_3D_VERSION;
  // NEXT_PUBLIC_LIFESTYLE_3D_VERSION is unset ("") on Vercel preview/production today.
  // V7 is the only actively maintained viewer, so it's the default for anything other
  // than an explicit "v6" — otherwise this silently falls through to the legacy base
  // CesiumLifestyleViewer, which nobody has fixed and still renders every POI on load.
  const useCesiumV6 = lifestyle3dVersion === "v6";
  const useCesiumV7 = !useCesiumV6;
  const isProductionRuntime = process.env.NODE_ENV === "production";
  const configuredProvider = (requestedProvider === "google-photorealistic-3d" && !isProductionRuntime
    ? "google-photorealistic-3d"
    : requestedProvider === "maptiler-3d"
      ? "maptiler-3d"
      : "cesium-architectural") as "cesium-architectural" | "google-photorealistic-3d" | "maptiler-3d";
  const configuredProviderV6 = configuredProvider === "google-photorealistic-3d" ? "google-photorealistic" : "cesium-architectural";
  const googleMapsKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_3D_TILE_KEY ||
    "";
  const hasStreetViewEmbedKey = Boolean(googleMapsKey);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const coordinates = useMemo(() => normalizeGeoPoint({ latitude, longitude }), [latitude, longitude]);
  const effectiveLatitude = coordinates.latitude;
  const effectiveLongitude = coordinates.longitude;
  const hasCoordinates = coordinates.valid && effectiveLatitude != null && effectiveLongitude != null;
  const heroImage = images.find(Boolean);
  const copy = getCopy(locale);
  const locationLabel = [town, region, country].filter(Boolean).join(", ") || copy.eyebrowApprox;
  const localizedLayers = useMemo(
    () => LAYERS.map((layer) => ({ ...layer, label: localizeLabel(LAYER_LABELS, locale, layer.id, layer.label) })),
    [locale],
  );
  // Real nearest-POI-per-category lookup, derived from fetchNearbyPois below.
  // Replaces the old fixed per-property angle/distance guesses -- each layer
  // only appears if a real, geocoded match was found within the fetch radius.
  const resolvedLayers = useMemo(() => {
    if (!hasCoordinates || nearbyPoisStatus !== "ready") return [];
    const lat = effectiveLatitude as number;
    const lng = effectiveLongitude as number;
    return localizedLayers.flatMap((layer) => {
      const candidates = nearbyPois.filter(
        (poi) => poi.category === layer.poiCategory && (!layer.descriptionFilter || poi.description === layer.descriptionFilter),
      );
      if (candidates.length === 0) return [];
      const nearest = candidates.reduce((best, poi) =>
        (poi.distanceMeters ?? Infinity) < (best.distanceMeters ?? Infinity) ? poi : best,
      );
      const distanceKm = (nearest.distanceMeters ?? haversineKm(lat, lng, nearest.latitude, nearest.longitude) * 1000) / 1000;
      const bearing = bearingDeg(lat, lng, nearest.latitude, nearest.longitude);
      return [{
        ...layer,
        distanceKm,
        minutes: estimatePoiMinutes(distanceKm, "walk") ?? estimatePoiMinutes(distanceKm, "drive") ?? 1,
        angle: bearing - 90, // convert compass bearing to positionFromAngle's screen-trig convention
        poi: nearest,
      }];
    });
  }, [effectiveLatitude, effectiveLongitude, hasCoordinates, localizedLayers, nearbyPois, nearbyPoisStatus]);

  const filteredLayers = useMemo(
    () => resolvedLayers.filter((layer) => layer.distanceKm <= radiusKm),
    [resolvedLayers, radiusKm],
  );

  const realInsights = useMemo(() => {
    const beach = filteredLayers.find((layer) => layer.id === "beach");
    const nearest = filteredLayers.reduce<(typeof filteredLayers)[number] | null>((best, layer) => {
      if (!best) return layer;
      return layer.distanceKm < best.distanceKm ? layer : best;
    }, null);

    return [
      {
        id: "nearestBeach",
        label: copy.nearestBeach,
        value: beach ? formatPoiDistance(beach.distanceKm) : "-",
        accent: "#38bdf8",
      },
      {
        id: "placesFound",
        label: copy.placesFound,
        value: String(filteredLayers.length),
        accent: "#10b981",
      },
      {
        id: "closestService",
        label: nearest ? nearest.label : copy.closestService,
        value: nearest ? `${nearest.minutes} min` : "-",
        accent: nearest?.color || "#6366f1",
      },
      {
        id: "analysisRadius",
        label: copy.analysisRadius,
        value: `${radiusKm} km`,
        accent: primaryColor,
      },
    ];
  }, [copy.analysisRadius, copy.closestService, copy.nearestBeach, copy.placesFound, filteredLayers, primaryColor, radiusKm]);

  const heroTimelineItems = useMemo(
    () => HERO_TIMELINE_IDS.flatMap((id) => resolvedLayers.filter((layer) => layer.id === id)),
    [resolvedLayers],
  );

  const mapPoints = useMemo(() => {
    return filteredLayers.map((layer) => ({
      id: layer.id,
      label: layer.label,
      color: layer.color,
      latitude: layer.poi.latitude,
      longitude: layer.poi.longitude,
      minutes: String(layer.minutes),
    }));
  }, [filteredLayers]);


  useEffect(() => {
    if (!hasCoordinates) return;

    const controller = new AbortController();
    const lat = effectiveLatitude as number;
    const lng = effectiveLongitude as number;

    async function fetchNearbyPois() {
      setNearbyPoisStatus("loading");
      try {
        const response = await fetch(`/api/lifestyle/pois?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&radius=10000`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`POI request failed: ${response.status}`);
        const payload = (await response.json()) as { pois?: unknown[] };
        if (controller.signal.aborted) return;
        setNearbyPois(normalizeApiPoisForV7(payload.pois || []));
        setNearbyPoisStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("[LifestyleExplorer] POI fetch failed; real POIs unavailable.", error);
        setNearbyPois([]);
        setNearbyPoisStatus("error");
      }
    }

    fetchNearbyPois();

    return () => controller.abort();
  }, [effectiveLatitude, effectiveLongitude, hasCoordinates]);

  async function launchPremium3D() {
    console.info("[LifestyleExplorer] Launch premium 3D", {
      configuredProvider,
      hasStreetViewEmbedKey,
      hasCoordinates,
    });
    setShowCesiumViewer(true);
    fetch("/api/lifestyle/3d-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agency_id: agencyId || null,
        property_id: propertyId || null,
        provider: configuredProvider,
        session_started_at: new Date().toISOString(),
      }),
    }).catch((error) => {
      console.warn("[LifestyleExplorer] 3D session tracking skipped", error);
    });
  }

  if (showCesiumViewer) {
    const viewer = useCesiumV7 ? (
      <CesiumLifestyleViewerV7
        latitude={effectiveLatitude}
        longitude={effectiveLongitude}
        title={propertyTitle}
        locationLabel={locationLabel}
        primaryColor={primaryColor}
        locale={locale}
        provider={configuredProviderV6}
        propertyImageUrl={heroImage}
        pois={nearbyPoisStatus === "ready" ? nearbyPois : []}
        allowDemoPois={nearbyPoisStatus === "error"}
        onClose={() => setShowCesiumViewer(false)}
      />
    ) : useCesiumV6 ? (
      <CesiumLifestyleViewerV6
        latitude={effectiveLatitude}
        longitude={effectiveLongitude}
        propertyTitle={propertyTitle}
        locationLabel={locationLabel}
        primaryColor={primaryColor}
        locale={locale}
        provider={configuredProviderV6}
        onClose={() => setShowCesiumViewer(false)}
      />
    ) : (
      <CesiumLifestyleViewer
        latitude={effectiveLatitude}
        longitude={effectiveLongitude}
        propertyTitle={propertyTitle}
        locationLabel={locationLabel}
        primaryColor={primaryColor}
        price={price}
        images={images}
        provider={configuredProvider}
        locale={locale}
        onClose={() => setShowCesiumViewer(false)}
      />
    );

    return typeof document !== "undefined" ? createPortal(viewer, document.body) : viewer;
  }

  const initialExplorer = (
    <div className="fixed inset-0 z-[2147483646] overflow-y-auto bg-[#f5f7fb] p-3 text-slate-950 md:p-6">
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-[2147483647] inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 text-xs font-medium text-slate-700 shadow-xl backdrop-blur transition hover:bg-white hover:text-slate-950"
        aria-label={copy.close}
      >
        <X size={16} />
        <span>{copy.close}</span>
      </button>

      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white text-slate-950 shadow-2xl md:min-h-[calc(100vh-3rem)]">
        <div className="relative isolate overflow-hidden">
          <div
            className="absolute inset-0 opacity-100"
            style={{
              backgroundImage: heroImage
                ? `linear-gradient(90deg, rgba(255,255,255,0.97), rgba(255,255,255,0.88), rgba(255,255,255,0.58)), url(${heroImage})`
                : "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.18), transparent 32%), radial-gradient(circle at 72% 24%, rgba(45,212,191,0.16), transparent 28%), linear-gradient(135deg, #ffffff, #eef3f8)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

          <div className="relative grid gap-6 p-5 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[360px] flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur">
                  <Sparkles size={14} style={{ color: primaryColor }} />
                  {copy.badge}
                </div>
              </div>

              <div className="max-w-2xl py-10">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{hasCoordinates ? copy.eyebrowGeo : copy.eyebrowApprox}</p>
                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-normal text-slate-950 md:text-4xl">
                  {copy.title}
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                  {copy.intro(propertyTitle || "Ce bien", locationLabel)}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={launchPremium3D}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg transition hover:-translate-y-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Camera size={16} />
                    {copy.launch}
                  </button>
                  <p className="max-w-sm text-xs leading-5 text-slate-500">
                    {hasStreetViewEmbedKey ? copy.experienceReady : copy.experienceLimited}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroTimelineItems.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.id} className="rounded-2xl border border-slate-200 bg-white/82 p-4 shadow-sm backdrop-blur-md">
                      <Icon size={18} style={{ color: primaryColor }} />
                      <p className="mt-3 text-xl font-medium text-slate-950">{layer.minutes} min</p>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{layer.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[460px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-xl backdrop-blur-md">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(45,212,191,0.14),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.75),transparent)]" />
              <div className="relative h-full min-h-[430px] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                <div className="absolute inset-6 rounded-full border border-slate-200" />
                <div className="absolute inset-16 rounded-full border border-slate-200" />
                <div className="absolute inset-28 rounded-full border border-slate-200" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/70 shadow-[0_0_80px_rgba(212,175,55,0.22)] backdrop-blur">
                  <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor }}>
                    <MapPin size={22} className="text-white" />
                  </div>
                </div>

                {filteredLayers.map((layer, index) => {
                  const Icon = layer.icon;
                  const position = positionFromAngle(layer.angle, radiusKm === 2 ? 28 : radiusKm === 5 ? 36 : 42);
                  return (
                    <a
                      key={layer.id}
                      href={searchUrl(layer.poi.latitude, layer.poi.longitude, layer.poi.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white/88 px-3 py-2 text-slate-700 shadow-lg backdrop-blur-md transition hover:scale-105"
                      style={{ ...position, animation: `floatPoi 5s ease-in-out ${index * 0.18}s infinite` }}
                    >
                      <span className="flex items-center gap-2 whitespace-nowrap text-xs font-medium">
                        <Icon size={14} style={{ color: layer.color }} />
                        {layer.label}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-500">{layer.minutes} min - {formatPoiDistance(layer.distanceKm)}</span>
                    </a>
                  );
                })}

                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/86 p-3 shadow-lg backdrop-blur">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{copy.radius}</p>
                    <p className="text-sm font-medium text-slate-900">{copy.around(radiusKm)}</p>
                  </div>
                  <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1">
                    {RADII.map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setRadiusKm(radius)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${radiusKm === radius ? "text-white" : "text-slate-500 hover:text-slate-950"}`}
                        style={radiusKm === radius ? { backgroundColor: primaryColor } : undefined}
                      >
                        {radius} km
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 pt-0 md:p-8 md:pt-0 lg:grid-cols-[1fr_0.75fr]">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{copy.fallback}</p>
                <p className="mt-1 text-lg font-medium text-slate-950">{locationLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                {hasCoordinates && hasStreetViewEmbedKey && (
                  <button
                    type="button"
                    onClick={() => setStreetViewOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Camera size={13} />
                    {copy.streetView}
                  </button>
                )}
                {hasCoordinates && !hasStreetViewEmbedKey && (
                  <a
                    href={buildStreetViewUrl(effectiveLatitude as number, effectiveLongitude as number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Camera size={13} />
                    {copy.streetView}
                  </a>
                )}
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{price || copy.price}</div>
              </div>
            </div>
            <LifestyleMapLibre
              latitude={effectiveLatitude as number}
              longitude={effectiveLongitude as number}
              radiusKm={radiusKm}
              points={mapPoints}
              primaryColor={primaryColor}
              locationLabel={locationLabel}
              locale={locale}
              onMarkerClick={hasStreetViewEmbedKey ? () => setStreetViewOpen(true) : undefined}
            />
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{copy.premiumInsights}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {realInsights.map((insight) => (
                  <div key={insight.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-lg font-medium" style={{ color: insight.accent }}>{insight.value}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">{insight.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{copy.lifestyleLayers}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {resolvedLayers.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <Icon size={16} style={{ color: layer.color }} />
                      <p className="mt-2 text-sm font-medium text-slate-800">{layer.label}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">{layer.minutes} min - {formatPoiDistance(layer.distanceKm)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{copy.intelligenceTitle}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {copy.intelligenceDescription}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500">
                <Sparkles size={15} style={{ color: primaryColor }} />
                {copy.intelligenceHint}
              </div>
            </div>
          </div>
        </div>
      </div>

      {streetViewOpen && hasCoordinates && hasStreetViewEmbedKey && (
        <div className="fixed inset-0 z-[2147483647] flex flex-col bg-black">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/55 via-black/22 to-transparent" />
          <div className="absolute inset-x-4 top-4 z-20 flex items-start justify-between gap-4">
            <div className="pointer-events-none flex min-w-0 items-center gap-3 rounded-2xl border border-white/25 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
              <Image src="/amaru-navbar-logo.png" alt="Amaru Homes" width={190} height={40} className="h-9 w-auto max-w-[176px] object-contain" priority={false} />
              <span className="hidden h-7 w-px bg-slate-200 sm:block" />
              <span className="hidden min-w-0 sm:block">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{copy.streetView}</span>
                <span className="block max-w-[240px] truncate text-sm font-medium text-slate-800">{locationLabel}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStreetViewOpen(false)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/62 px-4 text-xs font-medium text-white shadow-2xl backdrop-blur-xl transition hover:bg-black/82"
              aria-label={copy.closeStreetView}
            >
              <X size={16} />
              <span>{copy.closeStreetView}</span>
            </button>
          </div>
          <iframe
            title={copy.streetView}
            src={`https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(googleMapsKey || "")}&location=${effectiveLatitude},${effectiveLongitude}&heading=0&pitch=0&fov=90`}
            className="h-full w-full border-0 [filter:saturate(1.22)_contrast(1.06)_brightness(1.02)]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <style jsx>{`
        @keyframes floatPoi {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
      `}</style>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(initialExplorer, document.body) : initialExplorer;
}

