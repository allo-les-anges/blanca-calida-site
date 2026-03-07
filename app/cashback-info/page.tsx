"use client";

import React from 'react';
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

export default function CashbackInfo() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Fil d'ariane / Retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#D4AF37] transition-colors mb-12 uppercase text-[10px] tracking-[0.3em] font-bold"
        >
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>

        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-8 leading-tight">
            Le Programme <br />
            <span className="italic text-[#D4AF37]">Cashback Privilège</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Nous réinventons l'immobilier de luxe en transformant une partie de la transaction en un avantage exclusif. 
            Investissez sereinement, récupérez de la valeur dès la remise des clés.
          </p>
        </div>

        {/* --- SECTION EXEMPLE CONCRET --- */}
        <div className="relative overflow-hidden bg-[#0F172A] rounded-[3rem] p-8 md:p-16 mb-20 shadow-2xl">
          {/* Effet de lueur dorée en arrière-plan */}
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
            <p className="text-[9px] text-slate-500 mt-10 italic uppercase tracking-widest text-center">
              *Calculé sur la base de 1% du prix de vente. Selon éligibilité de la propriété.
            </p>
          </div>
        </div>

        {/* --- GRILLE D'AVANTAGES --- */}
        <div className="grid md:grid-cols-3 gap-16 mb-24">
          <div className="group space-y-6">
            <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 shadow-sm">
              <Banknote size={28} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold uppercase text-[11px] tracking-[0.2em] text-slate-900">Versement Direct</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Un virement bancaire pour couvrir vos frais de notaire ou optimiser votre trésorerie personnelle.</p>
          </div>
          
          <div className="group space-y-6">
            <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 shadow-sm">
              <Sofa size={28} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold uppercase text-[11px] tracking-[0.2em] text-slate-900">Art de Vivre</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Financez l'aménagement de votre nouvelle demeure : mobilier de designer, décoration ou paysagisme.</p>
          </div>

          <div className="group space-y-6">
            <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 shadow-sm">
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold uppercase text-[11px] tracking-[0.2em] text-slate-900">Sérénité Juridique</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Un processus rigoureusement encadré, transparent et validé par nos experts conseils.</p>
          </div>
        </div>

        {/* Section FAQ / Info */}
        <div className="border-t border-slate-100 pt-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-serif italic mb-10 text-slate-900 text-left">L'exclusivité data_home</h2>
              <div className="space-y-8 text-slate-500 text-lg leading-relaxed">
                <p>
                  Le programme <span className="text-slate-900 font-medium">Cashback</span> est une offre signée **Amaru Properties**. Il s'active dès que vous réservez une villa éligible via notre plateforme digitale.
                </p>
                <p>
                  Vous conservez la liberté absolue de choisir la destination de ce capital : qu'il s'agisse de réduire votre apport ou de transformer votre intérieur en chef-d'œuvre, nous orchestrons le versement selon vos besoins.
                </p>
              </div>

              {/* BOUTON RETOUR HOME PAGE */}
              <div className="mt-16">
                <Link 
                    href="/" 
                    className="group inline-flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl shadow-slate-900/20"
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