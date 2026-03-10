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

  const styles = {
    containerBg: isDark ? '#0F172A' : '#F8FAFC', 
    borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)',
    fullTextColor: isDark ? '#FFFFFF' : '#0F172A',
    outlineStroke: isDark ? '#334155' : '#CBD5E1', 
    separatorColor: '#D4AF37'
  };

  return (
    <div 
      className="relative w-full overflow-hidden py-6 border-y transition-colors duration-500" // Réduit de py-14 à py-6
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
            duration: 50, // Légèrement plus lent pour compenser la taille réduite
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedTexts.map((text, idx) => (
            <div key={idx} className="flex items-center gap-10">
              <span 
                className={`text-2xl md:text-4xl font-black uppercase tracking-tighter transition-all duration-700 ${ // Réduit de 7xl à 4xl
                  idx % 2 === 0 ? "" : "text-transparent"
                }`}
                style={{
                  color: idx % 2 === 0 ? styles.fullTextColor : 'transparent',
                  WebkitTextStroke: idx % 2 !== 0 ? `1px ${styles.outlineStroke}` : 'none'
                }}
              >
                {text}
              </span>
              
              <div 
                className="h-6 md:h-8 w-[1px] opacity-30" // Réduit la hauteur du séparateur
                style={{ backgroundColor: styles.separatorColor }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}