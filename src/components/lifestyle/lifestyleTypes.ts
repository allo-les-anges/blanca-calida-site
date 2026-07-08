"use client";

import type { LucideIcon } from "lucide-react";

export type LifestylePoiCategory =
  | "beach"
  | "sea"
  | "golf"
  | "restaurant"
  | "school"
  | "hospital"
  | "shops"
  | "airport"
  | "center"
  | "transport"
  | "marina";

export type LifestylePoi = {
  id: string;
  category: LifestylePoiCategory;
  label: string;
  detail: string;
  icon: LucideIcon;
  bearing: number;
  distanceKm: number;
  color: string;
  labelOffsetX: number;
  labelOffsetY: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  source?: "google_places" | "openstreetmap" | "demo";
};

export type LifestylePoiGroup = {
  id: "area" | "amenities" | "transport" | "schools";
  label: string;
  description: string;
  categories: LifestylePoiCategory[];
};

export function formatPoiDistance(distanceKm: number) {
  if (!Number.isFinite(distanceKm)) return "Non determinee";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

export function estimatePoiMinutes(distanceKm: number, mode: "walk" | "drive" = "walk") {
  if (!Number.isFinite(distanceKm)) return null;
  const kmh = mode === "walk" ? 4.8 : 28;
  return Math.max(1, Math.round((distanceKm / kmh) * 60));
}

export function poiSourceLabel(source?: LifestylePoi["source"]) {
  if (source === "google_places") return "Google Places";
  if (source === "openstreetmap") return "OpenStreetMap";
  if (source === "demo") return "Demo";
  return "OpenStreetMap";
}

// Ouvre Google Maps directement en mode Street View sur ce point, sans cle API
// (voir https://developers.google.com/maps/documentation/urls/get-started#street-view-action).
export function buildStreetViewUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
}

export type LifestyleLocale = "fr" | "en" | "es" | "nl" | "pl" | "ar";

const INTL_LOCALE: Record<LifestyleLocale, string> = {
  fr: "fr-FR", en: "en-US", es: "es-ES", nl: "nl-NL", pl: "pl-PL", ar: "ar-SA",
};

const LIFESTYLE_UI_COPY: Record<LifestyleLocale, {
  walking: string;
  driving: string;
  phone: string;
  rating: string;
  reviewsAvailable: (count: number) => string;
  viewOnMap: string;
  returnToProperty: string;
  website: string;
  openInGoogleMaps: string;
  propertyFallback: string;
  selectPoiHint: string;
  loadingMapLibre: string;
  approximateLocation: string;
  mapLibreUnavailable: string;
  preciseCoordsUnavailable: string;
  areaMap: string;
  kmAroundProperty: (radiusKm: number) => string;
}> = {
  fr: {
    walking: "A pied", driving: "Voiture", phone: "Telephone", rating: "Note",
    reviewsAvailable: (count) => `${count.toLocaleString(INTL_LOCALE.fr)} avis disponibles.`,
    viewOnMap: "Voir sur la carte", returnToProperty: "Retour au bien", website: "Site web",
    openInGoogleMaps: "Ouvrir dans Google Maps", propertyFallback: "Bien",
    selectPoiHint: "Selectionnez un POI pour voir la liaison.",
    loadingMapLibre: "Chargement de la carte...", approximateLocation: "Localisation approximative",
    mapLibreUnavailable: "La carte detaillee n'a pas pu etre chargee. L'experience conserve l'apercu lifestyle du quartier.",
    preciseCoordsUnavailable: "Les coordonnees precises ne sont pas disponibles. L'experience affiche donc un apercu lifestyle base sur la ville ou la zone du bien.",
    areaMap: "Carte du quartier",
    kmAroundProperty: (radiusKm) => `${radiusKm} km autour du bien`,
  },
  en: {
    walking: "Walking", driving: "Driving", phone: "Phone", rating: "Rating",
    reviewsAvailable: (count) => `${count.toLocaleString(INTL_LOCALE.en)} reviews available.`,
    viewOnMap: "View on map", returnToProperty: "Back to property", website: "Website",
    openInGoogleMaps: "Open in Google Maps", propertyFallback: "Property",
    selectPoiHint: "Select a point of interest to see the link.",
    loadingMapLibre: "Loading area map...", approximateLocation: "Approximate location",
    mapLibreUnavailable: "The detailed map could not be loaded. The neighbourhood lifestyle preview remains available.",
    preciseCoordsUnavailable: "Precise coordinates are not available. The experience shows a lifestyle preview based on the property's town or area.",
    areaMap: "Area map",
    kmAroundProperty: (radiusKm) => `${radiusKm} km around the property`,
  },
  es: {
    walking: "A pie", driving: "En coche", phone: "Telefono", rating: "Valoracion",
    reviewsAvailable: (count) => `${count.toLocaleString(INTL_LOCALE.es)} resenas disponibles.`,
    viewOnMap: "Ver en el mapa", returnToProperty: "Volver al inmueble", website: "Sitio web",
    openInGoogleMaps: "Abrir en Google Maps", propertyFallback: "Inmueble",
    selectPoiHint: "Seleccione un punto de interes para ver el enlace.",
    loadingMapLibre: "Cargando mapa del entorno...", approximateLocation: "Ubicacion aproximada",
    mapLibreUnavailable: "No se pudo cargar el mapa detallado. La vista lifestyle del entorno sigue disponible.",
    preciseCoordsUnavailable: "Las coordenadas exactas no estan disponibles. La experiencia muestra una vista lifestyle basada en la ciudad o zona del inmueble.",
    areaMap: "Mapa del entorno",
    kmAroundProperty: (radiusKm) => `${radiusKm} km alrededor del inmueble`,
  },
  nl: {
    walking: "Te voet", driving: "Met de auto", phone: "Telefoon", rating: "Beoordeling",
    reviewsAvailable: (count) => `${count.toLocaleString(INTL_LOCALE.nl)} recensies beschikbaar.`,
    viewOnMap: "Bekijk op kaart", returnToProperty: "Terug naar pand", website: "Website",
    openInGoogleMaps: "Openen in Google Maps", propertyFallback: "Pand",
    selectPoiHint: "Selecteer een interessepunt om de link te zien.",
    loadingMapLibre: "Buurtkaart laden...", approximateLocation: "Geschatte locatie",
    mapLibreUnavailable: "De gedetailleerde kaart kon niet worden geladen. De lifestyle-preview van de buurt blijft beschikbaar.",
    preciseCoordsUnavailable: "Exacte coordinaten zijn niet beschikbaar. De ervaring toont een lifestyle-preview op basis van de stad of buurt van het pand.",
    areaMap: "Buurtkaart",
    kmAroundProperty: (radiusKm) => `${radiusKm} km rond het pand`,
  },
  pl: {
    walking: "Pieszo", driving: "Samochodem", phone: "Telefon", rating: "Ocena",
    reviewsAvailable: (count) => `${count.toLocaleString(INTL_LOCALE.pl)} dostepnych opinii.`,
    viewOnMap: "Zobacz na mapie", returnToProperty: "Powrot do nieruchomosci", website: "Strona internetowa",
    openInGoogleMaps: "Otworz w Google Maps", propertyFallback: "Nieruchomosc",
    selectPoiHint: "Wybierz punkt zainteresowania, aby zobaczyc polaczenie.",
    loadingMapLibre: "Ladowanie mapy okolicy...", approximateLocation: "Lokalizacja przyblizona",
    mapLibreUnavailable: "Nie udalo sie wczytac szczegolowej mapy. Podglad lifestyle okolicy pozostaje dostepny.",
    preciseCoordsUnavailable: "Dokladne wspolrzedne sa niedostepne. Widok lifestyle jest oparty na miejscowosci lub okolicy nieruchomosci.",
    areaMap: "Mapa okolicy",
    kmAroundProperty: (radiusKm) => `${radiusKm} km wokol nieruchomosci`,
  },
  ar: {
    walking: "سيرا على الأقدام", driving: "بالسيارة", phone: "الهاتف", rating: "التقييم",
    reviewsAvailable: (count) => `${count.toLocaleString(INTL_LOCALE.ar)} تقييم متاح.`,
    viewOnMap: "عرض على الخريطة", returnToProperty: "العودة إلى العقار", website: "الموقع الإلكتروني",
    openInGoogleMaps: "افتح في خرائط جوجل", propertyFallback: "عقار",
    selectPoiHint: "اختر نقطة اهتمام لرؤية الرابط.",
    loadingMapLibre: "تحميل خريطة المنطقة...", approximateLocation: "موقع تقريبي",
    mapLibreUnavailable: "تعذر تحميل الخريطة التفصيلية. تبقى معاينة نمط الحياة في الحي متاحة.",
    preciseCoordsUnavailable: "الإحداثيات الدقيقة غير متوفرة. تعرض التجربة معاينة نمط حياة استنادا إلى مدينة أو منطقة العقار.",
    areaMap: "خريطة المنطقة",
    kmAroundProperty: (radiusKm) => `${radiusKm} كم حول العقار`,
  },
};

export function getLifestyleCopy(locale?: string) {
  const normalized = (locale || "fr").split("-")[0] as LifestyleLocale;
  return LIFESTYLE_UI_COPY[normalized] || LIFESTYLE_UI_COPY.fr;
}

