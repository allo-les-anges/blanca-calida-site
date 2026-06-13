"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en' | 'nl' | 'es' | 'pl' | 'ar' | 'ka';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => any; // ← retour any pour accepter tableaux et objets
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const loadDictionary = async (lang: Language) => {
  try {
    const dict = await import(`../dictionaries/${lang}.json`);
    return dict.default;
  } catch (error) {
    console.error(`Failed to load dictionary for ${lang}`, error);
    const fallback = await import(`../dictionaries/fr.json`);
    return fallback.default;
  }
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Language>('fr');
  const [dictionary, setDictionary] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Language;
    if (saved && ['fr', 'en', 'nl', 'es', 'pl', 'ar', 'ka'].includes(saved)) {
      setLocale(saved);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en' || browserLang === 'nl' || browserLang === 'es' || browserLang === 'pl' || browserLang === 'ar' || browserLang === 'ka') {
        setLocale(browserLang as Language);
      } else {
        setLocale('fr');
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const dict = await loadDictionary(locale);
      setDictionary(dict);
      localStorage.setItem('locale', locale);
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    };
    load();
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>) => {
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
    if (typeof value === 'string' && params) {
      // Remplacer les paramètres uniquement si c'est une chaîne
      return value.replace(/\{(\w+)\}/g, (_, p) => params[p]?.toString() || `{${p}}`);
    }
    return value; // peut être string, objet, tableau...
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
