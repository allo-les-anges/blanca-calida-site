"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Gift, 
  ShieldCheck, 
  ArrowLeft, 
  Sofa, 
  Banknote, 
  CheckCircle2, 
  Home, 
  Sparkles,
  Gem
} from 'lucide-react';
import { useTheme } from "next-themes";

export default function CashbackInfo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  // Configuration des couleurs forcées pour une lisibilité garantie
  const themeStyles = {
    title: { color: isDark ? '#FFFFFF' : '#0f172a' },
    text: { color: isDark ? '#CBD5E1' : '#64748b' }, // Slate-300 en dark, Slate-500 en light
    heading: { color: isDark ? '#D4AF37' : '#0f172a' }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Fil d'ariane */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#D4AF37] transition-colors mb-12 uppercase text-[10px] tracking-[0.3em] font-bold"
        >
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>

        <div className="mb-16">
          <h1 
            className="text-5xl md:text-7xl font-serif mb-8 leading-tight"
            style={themeStyles.title}
          >
            Le Programme <br />
            <span className="italic text-[#D4AF37]">Cashback Privilège</span>
          </h1>
          <p 
            className="text-xl max-w-2xl leading-relaxed"
            style={themeStyles.text}
          >
            Nous réinventons l'immobilier de luxe en transformant une partie de la transaction en un avantage exclusif. 
            Investissez sereinement, récupérez de la valeur dès la remise des clés.
          </p>
        </div>

        {/* --- SECTION EXEMPLE CONCRET --- */}
        <div className="relative overflow-hidden bg-[#0F172A] rounded-[3rem] p-8 md:p-16 mb-20 shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37] mb-3">Simulation Exceptionnelle</h2>
                <p className="text-3xl font-serif italic text-white">Villa de prestige à 1 500 000 €</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-[#D4AF37]/30">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] block mb-2 text-center">Votre Avantage Amaru</span>
                <span className="text-4xl font-light text-white tabular-nums">15 000 €<span className="text-[#D4AF37] ml-1">*</span></span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-10">
              <div className="flex items-start gap-4">
                <div className="bg-[#D4AF37]/10 p-2 rounded-full">
                  <CheckCircle2 className="text-[#D4AF37]" size={20} />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">Disponible immédiatement après la signature de l'acte authentique chez le notaire.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#D4AF37]/10 p-2 rounded-full">
                  <CheckCircle2 className="text-[#D4AF37]" size={20} />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">Une totale transparence : aucun frais caché ni démarche administrative complexe.</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRILLE D'AVANTAGES --- */}
        <div className="grid md:grid-cols-3 gap-16 mb-24">
          {[
            { icon: Banknote, title: "Versement Direct", desc: "Un virement bancaire pour couvrir vos frais de notaire ou optimiser votre trésorerie." },
            { icon: Sofa, title: "Art de Vivre", desc: "Financez l'aménagement de votre nouvelle demeure : mobilier de designer ou décoration." },
            { icon: ShieldCheck, title: "Sérénité Juridique", desc: "Un processus rigoureusement encadré, transparent et validé par nos experts." }
          ].map((item, idx) => (
            <div key={idx} className="group space-y-6">
              <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 shadow-sm">
                <item.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-bold uppercase text-[11px] tracking-[0.2em]" style={themeStyles.title}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={themeStyles.text}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Section FAQ / Info */}
        <div className="border-t border-slate-100 dark:border-white/10 pt-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-serif italic mb-10 text-left" style={themeStyles.title}>L'exclusivité Amaru</h2>
              <div className="space-y-8 text-lg leading-relaxed">
                <p style={themeStyles.text}>
                  Le programme <span style={themeStyles.heading} className="font-medium">Cashback</span> est une offre signée **Amaru Properties**. Il s'active dès que vous réservez une villa éligible via notre plateforme digitale.
                </p>
                <p style={themeStyles.text}>
                  Vous conservez la liberté absolue de choisir la destination de ce capital : qu'il s'agisse de réduire votre apport ou de transformer votre intérieur.
                </p>
              </div>

              {/* BOUTON RETOUR */}
              <div className="mt-16">
                <Link 
                    href="/" 
                    className="group inline-flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-6 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl"
                >
                    <Home size={18} className="group-hover:scale-110 transition-transform" />
                    Retour à l'accueil
                </Link>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}