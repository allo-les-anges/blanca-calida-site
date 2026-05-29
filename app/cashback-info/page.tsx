"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Sofa, 
  Banknote, 
  CheckCircle2, 
  Home, 
  Gavel,
  Scale
} from 'lucide-react';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

export default function CashbackInfo() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const themeStyles = {
    title: { color: isDark ? '#FAFAFA' : '#171716' },
    text: { color: isDark ? '#D8C9B6' : '#171716' },
    heading: { color: isDark ? '#D8C9B6' : '#171716' },
    iconColor: isDark ? '#FAFAFA' : '#171716'
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#010101] transition-colors duration-500">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Fil d'ariane */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#D8C9B6] transition-colors mb-12 uppercase text-[10px] tracking-[0.3em] font-bold"
          >
            <ArrowLeft size={14} /> {t('cashback.back')}
          </Link>

          <div className="mb-16">
            <h1 
              className="text-5xl md:text-7xl font-serif mb-8 leading-tight"
              style={themeStyles.title}
            >
              {t('cashback.title')} <br />
              <span className="italic text-[#D8C9B6]">{t('cashback.subtitle')}</span>
            </h1>
            <p 
              className="text-xl max-w-2xl leading-relaxed"
              style={themeStyles.text}
            >
              {t('cashback.description')}
            </p>
          </div>

          {/* SECTION EXEMPLE CONCRET */}
          <div className="relative overflow-hidden bg-[#171716] rounded-[3rem] p-8 md:p-16 mb-20 shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D8C9B6] opacity-10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="max-w-md">
                  <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D8C9B6] mb-3">{t('cashback.flexibility')}</h2>
                  <p className="text-3xl font-serif italic text-white leading-tight">{t('cashback.flexibilityText')}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-6 py-8 rounded-[2rem] border border-[#D8C9B6]/30 min-w-[240px]">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#D8C9B6] block mb-4 text-center">{t('cashback.example')}</span>
                  <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl md:text-3xl font-light text-white tabular-nums whitespace-nowrap">
                           {t('cashback.exampleAmount')}<span className="text-[#D8C9B6] ml-1">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{t('cashback.orEquipment')}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-10">
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="bg-[#D8C9B6]/10 p-2 rounded-full">
                      <CheckCircle2 className="text-[#D8C9B6]" size={20} />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{t(`cashback.points.${idx}`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GRILLE D'AVANTAGES */}
          <div className="grid md:grid-cols-3 gap-16 mb-24">
            {['cash', 'furniture', 'services'].map((key, idx) => (
              <div key={idx} className="group space-y-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#D8C9B6] transition-all duration-500 shadow-sm">
                  {key === 'cash' && <Banknote size={28} strokeWidth={1.5} color={themeStyles.iconColor} className="group-hover:stroke-white transition-colors" />}
                  {key === 'furniture' && <Sofa size={28} strokeWidth={1.5} color={themeStyles.iconColor} className="group-hover:stroke-white transition-colors" />}
                  {key === 'services' && <Scale size={28} strokeWidth={1.5} color={themeStyles.iconColor} className="group-hover:stroke-white transition-colors" />}
                </div>
                <h3 className="font-bold uppercase text-[11px] tracking-[0.2em]" style={themeStyles.title}>{t(`cashback.options.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed" style={themeStyles.text}>{t(`cashback.options.${key}.desc`)}</p>
              </div>
            ))}
          </div>

          {/* Section FAQ / Info */}
          <div className="border-t border-slate-100 dark:border-white/10 pt-20">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-serif italic mb-10 text-left" style={themeStyles.title}>{t('cashback.activation')}</h2>
                <div className="space-y-8 text-lg leading-relaxed">
                  <p style={themeStyles.text}>
                    {t('cashback.activationText')}
                  </p>
                  <p style={themeStyles.text}>
                    {t('cashback.activationDetail')}
                  </p>
                </div>

                <div className="mt-16">
                  <Link 
                      href="/" 
                      className="group inline-flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-6 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-[#D8C9B6] transition-all duration-500 shadow-2xl"
                  >
                      <Home size={18} className="group-hover:scale-110 transition-transform" />
                      {t('cashback.backHome')}
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}