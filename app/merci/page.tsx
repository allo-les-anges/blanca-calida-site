"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";

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
          Nous reviendrons vers vous sous 24 heures pour vous présenter les détails de votre avantage.
        </p>

        {/* Action Unique */}
        <div className="flex justify-center">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg"
          >
            <Home size={16} /> Retour à l'accueil
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