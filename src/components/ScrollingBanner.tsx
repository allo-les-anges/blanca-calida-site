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

  return (
    <div 
      className="relative w-full overflow-hidden py-10 border-y transition-colors duration-500"
      style={{ 
        backgroundColor: isDark ? '#020617' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)'
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
              {/* Texte Alterné : Plein vs Outline pour un style galerie d'art */}
              <span 
                className={`text-4xl md:text-7xl font-black uppercase tracking-tighter transition-all duration-700 ${
                  idx % 2 === 0 
                    ? "text-slate-900 dark:text-white" 
                    : "text-transparent stroke-text"
                }`}
                style={{
                  WebkitTextStroke: idx % 2 !== 0 ? `1px ${isDark ? '#334155' : '#e2e8f0'}` : 'none'
                }}
              >
                {text}
              </span>
              
              {/* Séparateur minimaliste (Barre verticale fine) */}
              <div className="h-8 md:h-12 w-[1px] bg-[#D4AF37] opacity-50" />
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .stroke-text {
          paint-order: stroke fill;
        }
      `}</style>
    </div>
  );
}