"use client";

import React, { useState, useEffect } from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

export default function PropertyCard({ property, isLight = false }: { property: any, isLight?: boolean }) {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const priceFormatted = new Intl.NumberFormat('de-DE').format(property.price || property.prix || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translate = (key: string, params?: Record<string, string>) => {
    let text = t(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text;
  };

  const detailUrl = `/property/${property.id_externe || property.id}${isLight ? '?pack=light' : ''}`;

  const getTranslatedPropertyType = (raw?: string) => {
    const type = String(raw || "").toLowerCase();
    const propertyTypes = t("propertyTypes");
    if (propertyTypes && typeof propertyTypes === "object") {
      if (type.includes("apartment") || type.includes("apart")) return propertyTypes.apartment || raw;
      if (type.includes("penthouse")) return propertyTypes.penthouse || raw;
      if (type.includes("bungalow")) return propertyTypes.bungalow || raw;
      if (type.includes("townhouse")) return propertyTypes.townhouse || raw;
      if (type.includes("villa")) return propertyTypes.villa || raw;
    }
    return raw || t('propertyCard.exclusivity');
  };

  const displayTitle = property.titre || (locale === "ka" ? getTranslatedPropertyType(property.type) : property.type) || t('propertyCard.fallbackTitle');

  if (!mounted) return null;

  const showDark = resolvedTheme === 'dark' && !isLight;
  const useLightChrome = isLight || !showDark;

  return (
    <Link 
      href={detailUrl} 
      className="property-card group flex flex-col w-full transition-all duration-500"
    >
      {/* IMAGE & BADGES */}
      <div 
        className="relative h-[380px] overflow-hidden rounded-none border transition-colors duration-500"
        style={{ 
          backgroundColor: showDark ? '#171716' : '#F2EFEA',
          borderColor: showDark ? 'color-mix(in srgb, #FAFAFA 5%, transparent)' : '#D8C9B6'
        }}
      >
        <img 
          src={property.images?.[0] || "/placeholder-house.jpg"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 rounded-none"
        />
        
        {/* Overlay dégradé plus prononcé pour la lisibilité */}
        <div className={`absolute inset-0 bg-gradient-to-t ${showDark ? 'from-black/80' : 'from-black/55'} via-transparent to-transparent opacity-90`} />

        {/* BADGES GAUCHE */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[70%] z-10">
          <span className={`${useLightChrome ? 'bg-black text-white' : 'bg-[#D8C9B6] text-black'} text-[9px] font-black px-4 py-2 rounded-none uppercase tracking-widest shadow-xl border ${useLightChrome ? 'border-white/10' : 'border-black/5'}`}>
            {translate('propertyCard.ref', { ref: property.ref || property.id_externe })}
          </span>
          
          <span className="bg-black/60 backdrop-blur-md text-white border border-white/30 text-[8px] font-bold px-4 py-2 rounded-none uppercase tracking-[0.2em]">
            {getTranslatedPropertyType(property.type)}
          </span>
        </div>

        {/* BOUTONS DROITE */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <button className="bg-black/40 backdrop-blur-md p-3 rounded-none border border-white/20 text-white hover:bg-[#D8C9B6] hover:text-black transition-all">
            <Heart size={18} strokeWidth={1.5} />
          </button>
          <div className={`${useLightChrome ? 'bg-black text-white' : 'bg-[#D8C9B6] text-black'} p-3 rounded-none shadow-xl transform group-hover:translate-x-1 transition-all border ${useLightChrome ? 'border-white/10' : 'border-black/5'}`}>
            <ChevronRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* INFOS TITRE & PRIX */}
      <div className="py-8 px-2">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 
            className="font-serif text-2xl italic leading-tight flex-grow line-clamp-1 transition-colors"
            style={{ color: showDark ? '#FAFAFA' : '#171716' }}
          >
            {displayTitle}
          </h3>
          
          <span className={`text-xl font-bold ${useLightChrome ? 'text-black' : 'text-[#D8C9B6]'} whitespace-nowrap pt-1`}>
            {priceFormatted} €
          </span>
        </div>

        <div 
          className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold transition-colors"
          style={{ color: showDark ? '#D8C9B6' : '#171716' }}
        >
          <span className={useLightChrome ? 'text-black' : 'text-[#D8C9B6]'}>●</span>
          {property.town} <span className="opacity-30">|</span> {property.region || 'Costa Blanca'}
        </div>
      </div>

      {/* ICONES TECHNIQUES */}
      <div 
        className="grid grid-cols-3 gap-y-6 pt-6 border-t transition-colors"
        style={{ borderColor: showDark ? 'color-mix(in srgb, #FAFAFA 10%, transparent)' : '#F2EFEA' }}
      >
        {[
          { icon: Maximize, value: `${property.surface_built || '0'} m²` },
          { icon: Bed, value: `${property.beds || '0'} ${t('propertyCard.beds')}` },
          { icon: Bath, value: `${property.baths || '0'} ${t('propertyCard.baths')}` },
          { icon: Waves, value: property.pool === "Oui" ? t('propertyCard.pool') : t('propertyCard.noPool') },
          { icon: Map, value: `${property.surface_plot || '0'} m² ${t('propertyCard.land')}` },
          { icon: Car, value: t('propertyCard.garage') }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 flex items-center justify-center border transition-colors"
              style={{ 
                backgroundColor: showDark ? 'color-mix(in srgb, #FAFAFA 5%, transparent)' : '#F2EFEA',
                borderColor: showDark ? 'color-mix(in srgb, #FAFAFA 10%, transparent)' : '#D8C9B6'
              }}
            >
              <item.icon size={14} className={useLightChrome ? 'text-black' : 'text-[#D8C9B6]'} />
            </div>
            <span 
              className="text-[11px] font-medium transition-colors"
              style={{ color: showDark ? '#F2EFEA' : '#171716' }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
