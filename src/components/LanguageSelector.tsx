"use client";

import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

// Liste des langues supportées
const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
  { code: 'es', label: 'ES' },
  { code: 'ar', label: 'AR' },
  { code: 'pl', label: 'PL' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
      >
        <Globe className="w-4 h-4 text-[#D4AF37]" />
        <span>{currentLang.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu en cliquant ailleurs */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute right-0 z-20 w-24 mt-2 origin-top-right bg-white border rounded-md shadow-lg dark:bg-[#0f172a] dark:border-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code);
                    setIsOpen(false);
                    // Ici, vous pourrez ajouter la logique pour changer les textes
                  }}
                  className={`block w-full px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    currentLang === lang.code ? 'text-[#D4AF37] font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}