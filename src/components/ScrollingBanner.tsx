"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from "next-themes";

const BANNER_TEXTS = [
  "Portfolio Exclusif",
  "Conciergerie Privée",
  "Ventes Off-Market",
  "Expertise Architecturale",
  "Investissements",
  "Gestion Prestige"
];

export default function ScrollingBanner() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const duplicatedTexts = [...BANNER_TEXTS, ...BANNER_TEXTS, ...BANNER_TEXTS, ...BANNER_TEXTS];

  // Couleurs dynamiques selon le mode
  const styles = {
    containerBg: isDark ? '#020617' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
    fullTextColor: isDark ? '#FFFFFF' : '#0F172A',
    outlineStroke: isDark ? '#334155' : '#CBD5E1', // Gris moyen en light pour être visible sans être lourd
    separatorColor: '#D4AF37'
  };

  return (
    <div 
      className="relative w-full overflow-hidden py-10 border-y transition-colors duration-500"
      style={{ 
        backgroundColor: styles.containerBg,
        borderColor: styles.borderColor
      }}
    >
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-12 items-center"
          animate={{
            x: [0, -2000],
          }}
          transition={{
            duration: 35,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedTexts.map((text, idx) => (
            <div key={idx} className="flex items-center gap-12">
              <span 
                className={`text-4xl md:text-7xl font-black uppercase tracking-tighter transition-all duration-700 ${
                  idx % 2 === 0 ? "" : "text-transparent"
                }`}
                style={{
                  color: idx % 2 === 0 ? styles.fullTextColor : 'transparent',
                  WebkitTextStroke: idx % 2 !== 0 ? `1px ${styles.outlineStroke}` : 'none'
                }}
              >
                {text}
              </span>
              
              {/* Séparateur minimaliste */}
              <div 
                className="h-8 md:h-12 w-[1px] opacity-50" 
                style={{ backgroundColor: styles.separatorColor }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}