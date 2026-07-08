"use client";

import { Car, ExternalLink, Footprints, Home, Phone, Star, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LifestylePoi } from "./lifestyleTypes";
import { estimatePoiMinutes, formatPoiDistance, poiSourceLabel, getLifestyleCopy } from "./lifestyleTypes";

type POIDetailsProps = {
  poi: LifestylePoi | null;
  primaryColor: string;
  locale?: string;
  onFocusPoi: (poi: LifestylePoi) => void;
  onReturnToProperty: () => void;
};

export default function POIDetails({ poi, primaryColor, locale, onFocusPoi, onReturnToProperty }: POIDetailsProps) {
  if (!poi) return null;

  const copy = getLifestyleCopy(locale);
  const walkMinutes = estimatePoiMinutes(poi.distanceKm, "walk");
  const driveMinutes = estimatePoiMinutes(poi.distanceKm, "drive");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.coordinates.latitude},${poi.coordinates.longitude}`)}`;

  return (
    <section className="absolute right-20 top-[28%] z-30 hidden w-[300px] rounded-2xl border border-white/10 bg-slate-950/72 p-4 text-white shadow-2xl backdrop-blur-xl xl:block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/42">{poiSourceLabel(poi.source)}</p>
          <h3 className="mt-1 text-base font-medium leading-tight">{poi.label}</h3>
          <p className="mt-1 text-xs leading-5 text-white/54">{poi.address || poi.detail}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/72">{formatPoiDistance(poi.distanceKm)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <InfoPill icon={Footprints} label={copy.walking} value={walkMinutes ? `${walkMinutes} min` : "--"} />
        <InfoPill icon={Car} label={copy.driving} value={driveMinutes ? `${driveMinutes} min` : "--"} />
        <InfoPill icon={Phone} label={copy.phone} value={poi.phone || "--"} />
        <InfoPill icon={Star} label={copy.rating} value={poi.rating ? `${poi.rating}/5` : "--"} />
      </div>

      {typeof poi.reviews === "number" && (
        <p className="mt-3 text-xs text-white/54">{copy.reviewsAvailable(poi.reviews)}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onFocusPoi(poi)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg transition hover:-translate-y-0.5"
          style={{ backgroundColor: primaryColor }}
        >
          <Timer size={14} />
          {copy.viewOnMap}
        </button>
        <button
          type="button"
          onClick={onReturnToProperty}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white/76 transition hover:bg-white/15 hover:text-white"
        >
          <Home size={14} />
          {copy.returnToProperty}
        </button>
      </div>

      <div className="mt-2 grid gap-2">
        {poi.website && (
          <a
            href={poi.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white/76 transition hover:bg-white/15 hover:text-white"
          >
            <ExternalLink size={14} />
            {copy.website}
          </a>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white/76 transition hover:bg-white/15 hover:text-white"
        >
          <ExternalLink size={14} />
          {copy.openInGoogleMaps}
        </a>
      </div>
    </section>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <div className="flex items-center gap-2 text-white/42">
        <Icon size={14} />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
    </div>
  );
}

