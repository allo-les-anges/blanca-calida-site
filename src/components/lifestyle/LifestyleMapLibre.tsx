"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { buildStreetViewUrl, getLifestyleCopy } from "./lifestyleTypes";

type LifestylePoint = {
  id: string;
  label: string;
  color: string;
  latitude: number;
  longitude: number;
  minutes: string;
};

type LifestyleMapLibreProps = {
  latitude?: number | null;
  longitude?: number | null;
  radiusKm: number;
  points: LifestylePoint[];
  primaryColor: string;
  locationLabel: string;
  locale?: string;
  onMarkerClick?: () => void;
};

function destinationPoint(latitude: number, longitude: number, angle: number, distanceKm: number) {
  const radius = 6371;
  const bearing = (angle * Math.PI) / 180;
  const lat1 = (latitude * Math.PI) / 180;
  const lon1 = (longitude * Math.PI) / 180;
  const angularDistance = distanceKm / radius;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

function circlePolygon(latitude: number, longitude: number, radiusKm: number) {
  const coordinates = Array.from({ length: 73 }, (_, index) => {
    const angle = (index / 72) * 360;
    return destinationPoint(latitude, longitude, angle, radiusKm);
  });

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "Polygon" as const,
          coordinates: [coordinates],
        },
      },
    ],
  };
}

export default function LifestyleMapLibre({
  latitude,
  longitude,
  radiusKm,
  points,
  primaryColor,
  locationLabel,
  locale,
  onMarkerClick,
}: LifestyleMapLibreProps) {
  const copy = getLifestyleCopy(locale);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<Array<{ remove: () => void }>>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";

  const radiusGeoJson = useMemo(() => {
    if (!hasCoordinates) return null;
    return circlePolygon(latitude, longitude, radiusKm);
  }, [hasCoordinates, latitude, longitude, radiusKm]);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      if (!containerRef.current || !hasCoordinates) {
        setStatus("fallback");
        return;
      }

      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;

        const map = new maplibre.Map({
          container: containerRef.current,
          center: [longitude, latitude],
          zoom: radiusKm === 2 ? 13.5 : radiusKm === 5 ? 12.5 : 11.2,
          attributionControl: false,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "osm",
                type: "raster",
                source: "osm",
                paint: {
                  "raster-saturation": -0.18,
                  "raster-contrast": 0.08,
                  "raster-brightness-min": 0.12,
                  "raster-brightness-max": 0.82,
                },
              },
            ],
          },
        });

        mapRef.current = map;
        map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          if (cancelled) return;
          map.addSource("lifestyle-radius", {
            type: "geojson",
            data: circlePolygon(latitude, longitude, radiusKm),
          });
          map.addLayer({
            id: "lifestyle-radius-fill",
            type: "fill",
            source: "lifestyle-radius",
            paint: {
              "fill-color": primaryColor,
              "fill-opacity": 0.12,
            },
          });
          map.addLayer({
            id: "lifestyle-radius-line",
            type: "line",
            source: "lifestyle-radius",
            paint: {
              "line-color": primaryColor,
              "line-width": 2,
              "line-opacity": 0.75,
            },
          });
          setStatus("ready");
        });
      } catch (error) {
        console.warn("[LifestyleExplorer] MapLibre unavailable, using fallback", error);
        setStatus("fallback");
      }
    }

    loadMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      const map = mapRef.current as { remove?: () => void } | null;
      map?.remove?.();
      mapRef.current = null;
    };
  }, [hasCoordinates, latitude, longitude, primaryColor, radiusKm]);

  useEffect(() => {
    const map = mapRef.current as {
      getSource?: (id: string) => { setData?: (data: unknown) => void } | undefined;
      flyTo?: (options: { center: [number, number]; zoom: number; duration: number }) => void;
    } | null;

    if (!map || !hasCoordinates || !radiusGeoJson) return;
    map.getSource?.("lifestyle-radius")?.setData?.(radiusGeoJson);
    map.flyTo?.({
      center: [longitude, latitude],
      zoom: radiusKm === 2 ? 13.5 : radiusKm === 5 ? 12.5 : 11.2,
      duration: 700,
    });
  }, [hasCoordinates, latitude, longitude, radiusGeoJson, radiusKm]);

  useEffect(() => {
    let cancelled = false;

    async function renderMarkers() {
      const map = mapRef.current as unknown;
      if (!map || status !== "ready" || !hasCoordinates) return;

      const maplibre = await import("maplibre-gl");
      if (cancelled) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const propertyMarker = document.createElement("div");
      propertyMarker.className = "h-10 w-10 rounded-full border-2 border-white shadow-2xl cursor-pointer";
      propertyMarker.style.background = primaryColor;
      propertyMarker.style.boxShadow = `0 0 32px ${primaryColor}`;
      propertyMarker.title = "Ouvrir Google Street View";
      propertyMarker.addEventListener("click", (event) => {
        event.stopPropagation();
        if (onMarkerClick) {
          onMarkerClick();
        } else {
          window.open(buildStreetViewUrl(latitude, longitude), "_blank", "noopener,noreferrer");
        }
      });
      markersRef.current.push(new maplibre.Marker({ element: propertyMarker }).setLngLat([longitude, latitude]).addTo(map as never));

      points.forEach((point) => {
        const marker = document.createElement("div");
        marker.className = "rounded-full border border-white/80 px-2 py-1 text-[10px] font-black text-white shadow-xl backdrop-blur";
        marker.style.background = point.color;
        marker.textContent = point.label;
        markersRef.current.push(new maplibre.Marker({ element: marker }).setLngLat([point.longitude, point.latitude]).addTo(map as never));
      });
    }

    renderMarkers();

    return () => {
      cancelled = true;
    };
  }, [hasCoordinates, latitude, longitude, points, primaryColor, status, onMarkerClick]);

  if (!hasCoordinates || status === "fallback") {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center bg-[#0b1728] px-6 text-center md:h-[360px]">
        <MapPin size={34} style={{ color: primaryColor }} />
        <p className="mt-4 text-lg font-black">{copy.approximateLocation}</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
          {hasCoordinates ? copy.mapLibreUnavailable : copy.preciseCoordsUnavailable}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[300px] overflow-hidden bg-[#0b1728] md:h-[360px]">
      <div ref={containerRef} className="h-full w-full" aria-label={`${copy.areaMap} ${locationLabel}`} />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b1728]/80 text-sm font-bold text-white/70">
          {copy.loadingMapLibre}
        </div>
      )}
      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{copy.areaMap}</p>
        <p className="mt-1 text-sm font-bold">{copy.kmAroundProperty(radiusKm)}</p>
      </div>
    </div>
  );
}
