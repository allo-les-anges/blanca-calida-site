"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

const BANNER_KEYS = [
  "scrollingBanner.portfolioExclusif",
  "scrollingBanner.conciergeriePrivee",
  "scrollingBanner.ventesOffMarket",
  "scrollingBanner.expertiseArchitecturale",
  "scrollingBanner.investissements",
  "scrollingBanner.gestionPrestige"
];

export default function ScrollingBanner() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const duplicatedTexts = [...BANNER_KEYS, ...BANNER_KEYS, ...BANNER_KEYS, ...BANNER_KEYS];

  const styles = {
    containerBg: isDark ? '#0F172A' : '#F8FAFC', 
    borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)',
    fullTextColor: isDark ? '#FFFFFF' : '#0F172A',
    outlineStroke: isDark ? '#334155' : '#CBD5E1', 
    separatorColor: '#D4AF37'
  };

  return (
    <div 
      className="relative w-full overflow-hidden py-6 border-y transition-colors duration-500"
      style={{ 
        backgroundColor: styles.containerBg,
        borderColor: styles.borderColor
      }}
    >
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-inherit to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-inherit to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-10 items-center"
          animate={{
            x: [0, -2000],
          }}
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedTexts.map((key, idx) => (
            <div key={idx} className="flex items-center gap-10">
              <span 
                className={`text-2xl md:text-4xl font-black uppercase tracking-tighter transition-all duration-700 ${
                  idx % 2 === 0 ? "" : "text-transparent"
                }`}
                style={{
                  color: idx % 2 === 0 ? styles.fullTextColor : 'transparent',
                  WebkitTextStroke: idx % 2 !== 0 ? `1px ${styles.outlineStroke}` : 'none'
                }}
              >
                {t(key)}
              </span>
              
              <div 
                className="h-6 md:h-8 w-[1px] opacity-30"
                style={{ backgroundColor: styles.separatorColor }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}