"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

export default function MerciPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        {/* Icône de succès animée */}
        <div className="mb-10 flex justify-center">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
        </div>

        {/* Texte principal */}
        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
          Demande Reçue
        </h1>
        <p className="text-slate-500 text-lg mb-12 leading-relaxed">
          Votre demande de <span className="text-emerald-600 font-bold uppercase text-sm tracking-widest">Cashback</span> a bien été transmise. 
          Gillian reviendra vers vous sous 24 heures pour vous présenter les détails de votre avantage.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-800 transition-all"
          >
            <Home size={16} /> Retour à l'accueil
          </Link>
          <Link 
            href="/proprietes" 
            className="flex items-center justify-center gap-3 bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-100 transition-all"
          >
            Voir d'autres biens <ArrowRight size={16} />
          </Link>
        </div>

        {/* Petit rappel de marque */}
        <div className="mt-20 pt-10 border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">
            Luxury Estates — L'immobilier Redéfini
          </p>
        </div>
      </div>
    </div>
  );
}