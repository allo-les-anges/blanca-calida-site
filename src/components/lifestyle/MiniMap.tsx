"use client";

import { Home, MapPin } from "lucide-react";
import type { LifestylePoi } from "./lifestyleTypes";
import { formatPoiDistance, getLifestyleCopy } from "./lifestyleTypes";

type MiniMapProps = {
  propertyLabel: string;
  selectedPoi: LifestylePoi | null;
  primaryColor: string;
  locale?: string;
};

export default function MiniMap({ propertyLabel, selectedPoi, primaryColor, locale }: MiniMapProps) {
  const copy = getLifestyleCopy(locale);
  return (
    <div className="absolute bottom-24 right-20 z-30 hidden w-56 rounded-2xl border border-white/10 bg-slate-950/72 p-3 text-white shadow-2xl backdrop-blur-xl xl:block">
      <div className="relative h-32 overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,200,0.20),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(8,47,73,0.78))]">
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: primaryColor }} />
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[34px] items-center gap-1 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] text-white">
          <Home size={11} />
          {copy.propertyFallback}
        </div>
        {selectedPoi && (
          <>
            <div className="absolute left-1/2 top-1/2 h-px w-20 origin-left bg-slate-400/70" style={{ transform: "rotate(-28deg)" }} />
            <div className="absolute right-8 top-8 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-md">
              <MapPin size={14} style={{ color: selectedPoi.color }} />
            </div>
          </>
        )}
      </div>
      <p className="mt-3 truncate text-xs font-medium text-white/86">{propertyLabel}</p>
      {selectedPoi ? (
        <p className="mt-1 text-xs text-white/52">
          {selectedPoi.label} · {formatPoiDistance(selectedPoi.distanceKm)}
        </p>
      ) : (
        <p className="mt-1 text-xs text-white/52">{copy.selectPoiHint}</p>
      )}
    </div>
  );
}

