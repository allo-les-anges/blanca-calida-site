"use client";

import React from 'react';
import { motion } from 'framer-motion';

const BANNER_TEXTS = [
  "Portfolio Exclusif",
  "Service Conciergerie",
  "Ventes Privées",
  "Expertise Locale",
  "Investissements Sur-mesure",
  "Gestion Locative Prestige"
];

export default function ScrollingBanner() {
  // On triple la liste pour assurer un défilement infini sans trou visuel
  const duplicatedTexts = [...BANNER_TEXTS, ...BANNER_TEXTS, ...BANNER_TEXTS];

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-[#0A0A0A] py-12 border-y border-slate-100 dark:border-white/5">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-16 items-center"
          animate={{
            x: [0, -1000], // Ajustez selon la longueur du texte
          }}
          transition={{
            duration: 30, // Plus le chiffre est élevé, plus c'est lent/luxueux
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedTexts.map((text, idx) => (
            <div key={idx} className="flex items-center gap-16">
              <span className="text-2xl md:text-4xl font-serif italic text-slate-900 dark:text-white uppercase tracking-wider">
                {text}
              </span>
              {/* Le petit point doré séparateur style Mallorca Select */}
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}