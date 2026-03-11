"use client";

import { useTranslation } from "@/contexts/I18nContext";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <video 
        key="hero-video-fixed" 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-4xl md:text-7xl font-serif mb-6 tracking-tight leading-tight">
          {t('home.heroTitleLine1')}<br />{t('home.heroTitleLine2')}
        </h1>
        <p className="text-white/80 text-sm md:text-base uppercase tracking-[0.4em] font-light">
          {t('home.heroSubtitle')}
        </p>
      </div>
    </section>
  );
}