"use client";

import React, { useState, useEffect } from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

// Ajout de isLight dans l'interface des Props
export default function PropertyCard({ property, isLight = false }: { property: any, isLight?: boolean }) {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
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

  // Construction de l'URL avec propagation du mode Light
  const detailUrl = `/property/${property.id_externe || property.id}${isLight ? '?pack=light' : ''}`;

  return (
    <Link 
      href={detailUrl} 
      className="group flex flex-col w-full transition-all duration-500"
    >
      {/* IMAGE & BADGES */}
      <div className="relative h-[380px] overflow-hidden rounded-none border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900">
        <img 
          src={property.images?.[0] || "/placeholder-house.jpg"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 rounded-none"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[70%]">
          {/* En mode Light, on met le badge en noir pour plus de sobriété */}
          <span className={`${isLight ? 'bg-black text-white' : 'bg-[#D4AF37] text-black'} text-[9px] font-black px-4 py-2 rounded-none uppercase tracking-widest shadow-lg transition-colors`}>
            {translate('propertyCard.ref', { ref: property.ref || property.id_externe })}
          </span>
          <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[8px] font-bold px-4 py-2 rounded-none uppercase tracking-[0.2em]">
            {property.type ? property.type : t('propertyCard.exclusivity')}
          </span>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <button className="bg-white/10 backdrop-blur-md p-3 rounded-none border border-white/20 text-white hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
            <Heart size={18} strokeWidth={1.5} />
          </button>
          <div className={`${isLight ? 'bg-black text-white' : 'bg-[#D4AF37] text-black'} p-3 rounded-none shadow-xl transform group-hover:translate-x-1 transition-all`}>
            <ChevronRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* INFOS TITRE & PRIX */}
      <div className="py-8 px-2">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 
            className="font-serif text-2xl text-slate-900 dark:text-white italic leading-tight flex-grow line-clamp-1"
            style={{ color: (mounted && resolvedTheme === 'dark') ? '#ffffff' : undefined }}
          >
            {property.titre || property.type || t('propertyCard.fallbackTitle')}
          </h3>
          
          <span className={`text-xl font-bold ${isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} whitespace-nowrap pt-1 transition-colors`}>
            {priceFormatted} €
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200 text-[10px] tracking-[0.3em] uppercase font-bold">
          <span className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'}>●</span>
          {property.town} <span className="opacity-30">|</span> {property.region || 'Costa Blanca'}
        </div>
      </div>

      {/* ICONES TECHNIQUES */}
      <div className="grid grid-cols-3 gap-y-6 pt-6 border-t border-slate-100 dark:border-white/10">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            <Maximize size={14} className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} />
          </div>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100">{property.surface_built || '0'} m²</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            <Bed size={14} className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} />
          </div>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100">{property.beds || '0'} {t('propertyCard.beds')}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            <Bath size={14} className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} />
          </div>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100">{property.baths || '0'} {t('propertyCard.baths')}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            <Waves size={14} className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} />
          </div>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100 uppercase">
            {property.pool === "Oui" ? t('propertyCard.pool') : t('propertyCard.noPool')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            <Map size={14} className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} />
          </div>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100 truncate">
            {property.surface_plot || '0'} m² {t('propertyCard.land')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            <Car size={14} className={isLight ? 'text-black dark:text-white' : 'text-[#D4AF37]'} />
          </div>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100">{t('propertyCard.garage')}</span>
        </div>
      </div>
    </Link>
  );
}