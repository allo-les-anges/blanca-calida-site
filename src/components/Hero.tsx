"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/contexts/I18nContext";

export default function Hero() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // FORCE LA DÉTECTION DU MODE LIGHT
  const packParam = searchParams.get('pack');
  const isLight = packParam === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-package') === 'light');

  if (!mounted) return null;

  return (
    <section className={`relative h-screen w-full overflow-hidden flex items-center justify-center ${isLight ? 'bg-white' : 'bg-black'}`}>
      
      {/* BACKGROUND CONDITIONNEL */}
      {isLight ? (
        <div className="absolute inset-0 w-full h-full bg-white">
          <Image 
            src="/hero_light.png"
            alt="Villa Light"
            fill
            priority
            className="object-cover transition-opacity duration-700"
            quality={90}
          />
        </div>
      ) : (
        <video 
          autoPlay muted loop playsInline 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}

      {/* CONTENU (Masqué en mode Light pour laisser place à la SearchBar existante) */}
      <div className="relative z-20 text-center px-4">
        {!isLight && (
          <>
            <h1 className="text-white font-serif mb-6 text-4xl md:text-8xl leading-tight">
              {t('home.heroTitleLine1')}<br />
              {t('home.heroTitleLine2')}
            </h1>
            <p className="text-white/80 tracking-[0.4em] font-light text-xs uppercase">
              {t('home.heroSubtitle')}
            </p>
          </>
        )}
      </div>

      {/* Décoration latérale discrète pour le mode Light */}
      {isLight && (
        <div className="absolute right-12 bottom-0 opacity-20">
          <div className="w-[1px] h-32 bg-slate-900" />
        </div>
      )}
    </section>
  );
}