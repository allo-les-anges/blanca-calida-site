"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en' | 'nl' | 'es' | 'pl' | 'ar';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Chargement dynamique des dictionnaires
const loadDictionary = async (lang: Language) => {
  try {
    // On suppose que les fichiers sont dans src/dictionaries/
    const dict = await import(`../dictionaries/${lang}.json`);
    return dict.default;
  } catch (error) {
    console.error(`Failed to load dictionary for ${lang}`, error);
    // Fallback sur français
    const fallback = await import(`../dictionaries/fr.json`);
    return fallback.default;
  }
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Language>('fr');
  const [dictionary, setDictionary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la langue sauvegardée (localStorage)
    const saved = localStorage.getItem('locale') as Language;
    if (saved && ['fr', 'en', 'nl', 'es', 'pl', 'ar'].includes(saved)) {
      setLocale(saved);
    } else {
      // Détection de la langue du navigateur (optionnel)
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en' || browserLang === 'nl' || browserLang === 'es' || browserLang === 'pl' || browserLang === 'ar') {
        setLocale(browserLang as Language);
      } else {
        setLocale('fr');
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const dict = await loadDictionary(locale);
      setDictionary(dict);
      setLoading(false);
      // Sauvegarder la langue
      localStorage.setItem('locale', locale);
      // Changer la direction du document pour l'arabe
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      // Optionnel : changer la langue de la balise html
      document.documentElement.lang = locale;
    };
    load();
  }, [locale]);

  const t = (key: string) => {
    if (!dictionary) return key;
    const keys = key.split('.');
    let value = dictionary;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Missing translation key: ${key}`);
        return key;
      }
    }
    return value;
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};