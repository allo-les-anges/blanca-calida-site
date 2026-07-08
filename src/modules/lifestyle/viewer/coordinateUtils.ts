import type { LifestylePoiCategory } from "@/components/lifestyle/lifestyleTypes";

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type CoordinateNormalizationResult = {
  valid: boolean;
  latitude: number | null;
  longitude: number | null;
  reason?: string;
  swapped?: boolean;
};

export type PoiCoordinateValidation = {
  valid: boolean;
  coordinates?: GeoCoordinates;
  distanceKm?: number;
  reason?: string;
  swapped?: boolean;
};

export function normalizeGeoPoint(input: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  reference?: GeoCoordinates;
}): CoordinateNormalizationResult {
  const rawLatitude = toFiniteCoordinate(input.latitude);
  const rawLongitude = toFiniteCoordinate(input.longitude);

  if (rawLatitude == null || rawLongitude == null) {
    return { valid: false, latitude: null, longitude: null, reason: "Latitude ou longitude absente/non numerique." };
  }

  if (rawLatitude === 0 && rawLongitude === 0) {
    return { valid: false, latitude: null, longitude: null, reason: "Coordonnees 0,0 refusees." };
  }

  const directValid = isValidLatLng(rawLatitude, rawLongitude);
  const swappedValid = isValidLatLng(rawLongitude, rawLatitude);

  if (
    directValid &&
    swappedValid &&
    !looksLikeSpain(rawLatitude, rawLongitude) &&
    looksLikeSpain(rawLongitude, rawLatitude)
  ) {
    return {
      valid: true,
      latitude: rawLongitude,
      longitude: rawLatitude,
      swapped: true,
      reason: "Latitude/longitude inversees et corrigees par zone geographique.",
    };
  }

  if (directValid && swappedValid && input.reference) {
    const directDistance = distanceKmBetween(input.reference.latitude, input.reference.longitude, rawLatitude, rawLongitude);
    const swappedDistance = distanceKmBetween(input.reference.latitude, input.reference.longitude, rawLongitude, rawLatitude);
    if (swappedDistance + 0.5 < directDistance && looksLikeSpain(rawLongitude, rawLatitude)) {
      return {
        valid: true,
        latitude: rawLongitude,
        longitude: rawLatitude,
        swapped: true,
        reason: "Latitude/longitude inversees et corrigees par distance au bien.",
      };
    }
  }

  if (directValid) {
    return { valid: true, latitude: rawLatitude, longitude: rawLongitude };
  }

  if (swappedValid && looksLikeSpain(rawLongitude, rawLatitude)) {
    return {
      valid: true,
      latitude: rawLongitude,
      longitude: rawLatitude,
      swapped: true,
      reason: "Latitude/longitude inversees et corrigees.",
    };
  }

  return {
    valid: false,
    latitude: null,
    longitude: null,
    reason: `Coordonnees hors limites: latitude=${rawLatitude}, longitude=${rawLongitude}.`,
  };
}

export function normalizeGeoCoordinates(input: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  reference?: GeoCoordinates;
}): CoordinateNormalizationResult {
  return normalizeGeoPoint(input);
}

export function validatePoiCoordinates(input: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  category: LifestylePoiCategory;
  property: GeoCoordinates;
}): PoiCoordinateValidation {
  const normalized = normalizeGeoPoint({
    latitude: input.latitude,
    longitude: input.longitude,
    reference: input.property,
  });

  if (!normalized.valid || normalized.latitude == null || normalized.longitude == null) {
    return {
      valid: false,
      reason: normalized.reason || "Coordonnees POI invalides.",
      swapped: normalized.swapped,
    };
  }

  if (!looksLikeSpain(normalized.latitude, normalized.longitude)) {
    return {
      valid: false,
      reason: "POI hors zone Espagne.",
      swapped: normalized.swapped,
    };
  }

  const distanceKm = distanceKmBetween(
    input.property.latitude,
    input.property.longitude,
    normalized.latitude,
    normalized.longitude,
  );
  const maxDistanceKm = maxPoiDistanceKm(input.category);
  if (distanceKm > maxDistanceKm) {
    return {
      valid: false,
      reason: `POI trop eloigne (${distanceKm.toFixed(1)} km > ${maxDistanceKm} km).`,
      swapped: normalized.swapped,
      distanceKm,
    };
  }

  return {
    valid: true,
    coordinates: {
      latitude: normalized.latitude,
      longitude: normalized.longitude,
    },
    distanceKm,
    swapped: normalized.swapped,
  };
}

export function toCesiumPosition(
  Cesium: { Cartesian3: { fromDegrees: (longitude: number, latitude: number, height?: number) => unknown } },
  coordinates: GeoCoordinates,
  height = 30,
) {
  return Cesium.Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, height);
}

export function distanceKmBetween(latA: number, lonA: number, latB: number, lonB: number) {
  const radius = 6371;
  const deltaLat = ((latB - latA) * Math.PI) / 180;
  const deltaLon = ((lonB - lonA) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos((latA * Math.PI) / 180) *
      Math.cos((latB * Math.PI) / 180) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function maxPoiDistanceKm(category: LifestylePoiCategory) {
  if (category === "airport") return 80;
  if (category === "beach" || category === "sea" || category === "marina") return 20;
  return 10;
}

function toFiniteCoordinate(value: number | string | null | undefined) {
  if (value == null || value === "") return null;
  const normalizedValue = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const numberValue = Number(normalizedValue);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function isValidLatLng(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function looksLikeSpain(latitude: number, longitude: number) {
  return latitude >= 27 && latitude <= 44.5 && longitude >= -19 && longitude <= 5;
}
