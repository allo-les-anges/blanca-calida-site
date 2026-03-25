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

  // Détection du mode via l'attribut HTML injecté par le layout ou l'URL
  const isLight = searchParams.get('pack') === 'light' || 
                 (typeof document !== 'undefined' && document.documentElement.getAttribute('data-package') === 'light');

  if (!mounted) return null;

  return (
    <section className={`relative h-screen w-full overflow-hidden flex items-center justify-center ${isLight ? 'bg-white' : 'bg-black'}`}>
      
      {/* ARRIÈRE-PLAN OPTIMISÉ */}
      {isLight ? (
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/hero_light.png"
            alt="Villa de luxe"
            fill
            priority // Charge l'image immédiatement (essentiel pour la vitesse)
            className="object-cover transition-transform duration-[30s] scale-105"
            quality={90}
          />
        </div>
      ) : (
        /* La vidéo de 2.5Mo n'est même pas présente dans le DOM en mode Light */
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}

      {/* CONTENU CENTRAL */}
      <div className="relative z-20 text-center px-4 max-w-6xl">
        {/* On n'affiche le titre principal que pour le mode GOLD */}
        {!isLight && (
          <>
            <h1 className="text-white font-serif mb-6 tracking-tight leading-[1.05] text-4xl md:text-8xl">
              {t('home.heroTitleLine1')}<br />
              {t('home.heroTitleLine2')}
            </h1>
            <p className="text-white/80 tracking-[0.4em] font-light text-[10px] md:text-xs uppercase">
              {t('home.heroSubtitle')}
            </p>
          </>
        )}

        {/* NOTE : En mode LIGHT, on laisse le centre vide ici. 
            La SearchBar (loupe dorée) est gérée par votre composant externe 
            déjà présent sur la page.
        */}
      </div>

      {/* Décoration minimaliste pour le mode Light */}
      {isLight && (
        <div className="absolute right-24 bottom-0 opacity-10">
          <div className="w-[1px] h-48 bg-slate-900" />
        </div>
      )}
    </section>
  );
}