"use client";

import { Building2, Car, Hospital, Sailboat, School, ShoppingCart, Trees, Umbrella, Utensils, Waves } from "lucide-react";
import type { ComponentType } from "react";
import type { LifestylePoi, LifestylePoiGroup } from "./lifestyleTypes";
import { estimatePoiMinutes, formatPoiDistance } from "./lifestyleTypes";

type POISidebarProps = {
  groups: LifestylePoiGroup[];
  pois: LifestylePoi[];
  activeGroupId: LifestylePoiGroup["id"];
  selectedPoiId?: string | null;
  realPoiCount: number;
  demoFallback: boolean;
  onGroupChange: (groupId: LifestylePoiGroup["id"]) => void;
  onSelectPoi: (poi: LifestylePoi) => void;
};

const CATEGORY_LABELS: Record<string, { label: string; icon: ComponentType<{ size?: number; className?: string }> }> = {
  beach: { label: "Beaches", icon: Umbrella },
  sea: { label: "Sea", icon: Waves },
  restaurant: { label: "Restaurants", icon: Utensils },
  hospital: { label: "Hospitals", icon: Hospital },
  school: { label: "Schools", icon: School },
  golf: { label: "Golf", icon: Trees },
  shops: { label: "Shopping", icon: ShoppingCart },
  airport: { label: "Transport", icon: Car },
  transport: { label: "Transport", icon: Car },
  marina: { label: "Marina", icon: Sailboat },
  center: { label: "Centre-ville", icon: Building2 },
};

export default function POISidebar({
  groups,
  pois,
  activeGroupId,
  selectedPoiId,
  realPoiCount,
  demoFallback,
  onGroupChange,
  onSelectPoi,
}: POISidebarProps) {
  const activeGroup = groups.find((group) => group.id === activeGroupId) || groups[0];
  const groupedPois = activeGroup.categories
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category]?.label || category,
      Icon: CATEGORY_LABELS[category]?.icon || Building2,
      pois: pois.filter((poi) => poi.category === category).slice(0, 8),
    }))
    .filter((group) => group.pois.length > 0);

  return (
    <aside className="absolute inset-y-0 left-0 z-40 hidden w-[365px] overflow-hidden border-r border-white/10 bg-slate-950/82 text-white shadow-2xl backdrop-blur-xl lg:block">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-medium tracking-normal">Lifestyle Explorer</p>
            <p className="mt-0.5 text-xs leading-5 text-white/58">
              {realPoiCount > 0 ? `${realPoiCount} points reels autour du bien.` : demoFallback ? "Mode demo actif si aucune donnee reelle." : "Aucun POI reel disponible."}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-1">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onGroupChange(group.id)}
              className={`rounded-lg px-3 py-2 text-xs transition ${
                activeGroupId === group.id
                  ? "bg-cyan-500/70 text-white shadow-lg"
                  : "text-white/64 hover:bg-white/10 hover:text-white"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-4 pb-5 pt-3">
        {groupedPois.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 text-xs leading-5 text-white/52">
            Aucun point d&apos;interet trouve dans cette categorie autour de ce bien.
          </div>
        )}

        {groupedPois.map(({ category, label, Icon, pois: categoryPois }) => (
          <section key={category} className="border-b border-white/10 py-4 last:border-b-0">
            <div className="mb-3 flex items-center justify-between gap-2 text-sm text-white">
              <span className="flex items-center gap-2"><Icon size={15} className="text-cyan-200" />{label}</span>
              <span className="text-xs text-white/42">{categoryPois.length}</span>
            </div>
            <div className="grid gap-1.5">
              {categoryPois.map((poi) => {
                const selected = selectedPoiId === poi.id;
                const walkMinutes = estimatePoiMinutes(poi.distanceKm, "walk");
                return (
                  <button
                    key={poi.id}
                    type="button"
                    onClick={() => onSelectPoi(poi)}
                    className={`group rounded-lg border px-2.5 py-2 text-left transition ${
                      selected
                        ? "border-cyan-300/30 bg-cyan-400/16 text-white shadow-xl"
                        : "border-transparent bg-transparent text-white/82 hover:border-white/10 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{poi.label}</span>
                        <span className={`mt-0.5 block truncate text-[11px] ${selected ? "text-white/56" : "text-white/42"}`}>{poi.address || poi.detail}</span>
                      </span>
                      <span className={`shrink-0 text-xs ${selected ? "text-white/80" : "text-white/58"}`}>{formatPoiDistance(poi.distanceKm)}</span>
                    </span>
                    <span className={`mt-1 block text-[10px] ${selected ? "text-white/58" : "text-white/36"}`}>
                      {walkMinutes ? `${walkMinutes} min a pied` : "Temps estime indisponible"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
