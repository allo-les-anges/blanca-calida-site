"use client";

import React from 'react';
import { CheckCircle2, Clock, FileText, Link as LinkIcon, Camera } from 'lucide-react';

export default function ProjectTrackerMockup() {
  const milestones = [
    { title: "Signature du contrat", date: "12 Jan 2026", status: "completed" },
    { title: "Fondations & Terrassement", date: "05 Feb 2026", status: "completed" },
    { title: "Élévation des murs", date: "En cours", status: "current" },
    { title: "Toiture & Étanchéité", date: "Prévu Mars 2026", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER DU PROJET */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em]">Réf: VILLA-MARBELLA-22</span>
              <h1 className="text-3xl font-serif text-slate-900 mt-2">Villa Serenity - Lot 14</h1>
              <p className="text-slate-500 text-sm mt-1">Marbella, Costa del Sol, Espagne</p>
            </div>
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-70">Avancement Global</p>
              <p className="text-3xl font-bold">65%</p>
            </div>
          </div>
          
          {/* BARRE DE PROGRESSION */}
          <div className="w-full bg-slate-100 h-3 rounded-full mt-8 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[65%] transition-all duration-1000"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TIMELINE (Gillian va adorer ce côté visuel) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-serif text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-emerald-600" />
              Suivi du Chantier
            </h2>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              {milestones.map((step, idx) => (
                <div key={idx} className="flex gap-4 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="text-emerald-500" size={24} />
                    ) : step.status === 'current' ? (
                      <div className="w-6 h-6 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200"></div>
                    )}
                    {idx !== milestones.length - 1 && <div className="w-0.5 h-12 bg-slate-100 mt-2"></div>}
                  </div>
                  <div>
                    <p className={`font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{step.date}</p>
                    {step.status === 'current' && (
                      <button className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                        <Camera size={14} /> Voir les dernières photos
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR : BLOCKCHAIN & DOCUMENTS */}
          <div className="space-y-8">
            {/* WIDGET BLOCKCHAIN */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={16} className="text-emerald-400" />
                Garantie Blockchain
              </h3>
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] opacity-60 uppercase">Cashback Sécurisé (USDC)</p>
                <p className="text-xl font-bold mt-1">€ 7,500.00</p>
                <div className="mt-4 flex items-center gap-2 text-[9px] text-emerald-400 bg-emerald-400/10 p-2 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  Smart Contract: Locked on Polygon
                </div>
              </div>
            </div>

            {/* DOCUMENTS VAULT */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={16} /> Documents
              </h3>
              <div className="space-y-3">
                {['Titre_de_propriété.pdf', 'Plans_Architecte.zip', 'Facture_Acompte_01.pdf'].map((doc, i) => (
                  <div key={i} className="p-3 border border-slate-50 rounded-xl hover:bg-slate-50 cursor-pointer transition flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 truncate">{doc}</span>
                    <FileText size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}