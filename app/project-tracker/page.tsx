"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Clock, FileText, Link as LinkIcon, Camera } from 'lucide-react';

// INITIALISATION SUPABASE AVEC PROTECTION TYPESCRIPT
// Le "!" confirme à TypeScript que ces variables existent dans Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProjectTracker() {
  // On utilise <any> ici pour que TypeScript ne bloque pas sur la structure de l'objet chantier
  const [chantier, setChantier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChantierData() {
      try {
        // On récupère la ligne du client
        const { data, error } = await supabase
          .from('suivi_chantier')
          .select('*')
          .single();

        if (data) setChantier(data);
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChantierData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement de votre projet...</div>;
  if (!chantier) return <div className="min-h-screen flex items-center justify-center">Aucune donnée trouvée. Vérifiez votre table Supabase.</div>;

  // CALCULS DYNAMIQUES
  const etape = chantier.etape_actuelle || 0; 
  const totalEtapes = 12;
  const progressionPourcent = Math.round((etape / totalEtapes) * 100);

  // LOGIQUE DES JALONS
  const milestones = [
    { title: "Signature du contrat", date: "12 Jan 2026", status: etape >= 1 ? "completed" : "pending" },
    { title: "Fondations & Terrassement", date: "05 Feb 2026", status: etape >= 2 ? "completed" : (etape === 1 ? "current" : "pending") },
    { title: "Élévation des murs", date: etape >= 3 ? "Terminé" : "En cours", status: etape >= 3 ? "completed" : (etape === 2 ? "current" : "pending") },
    { title: "Toiture & Étanchéité", date: "Prévu Mars 2026", status: etape >= 4 ? "completed" : (etape === 3 ? "current" : "pending") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER DYNAMIQUE */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em]">Réf: VILLA-MARBELLA-22</span>
              <h1 className="text-3xl font-serif text-slate-900 mt-2">{chantier.nom_client}</h1>
              <p className="text-slate-500 text-sm mt-1">Marbella, Costa del Sol, Espagne</p>
            </div>
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-center shadow-lg">
              <p className="text-[10px] uppercase tracking-widest opacity-70">Avancement Global</p>
              <p className="text-3xl font-bold">{progressionPourcent}%</p>
            </div>
          </div>
          
          {/* BARRE DE PROGRESSION DYNAMIQUE */}
          <div className="w-full bg-slate-100 h-3 rounded-full mt-8 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${progressionPourcent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* TIMELINE */}
            <section className="space-y-6">
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
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* GALERIE PHOTO */}
            <section className="space-y-6">
              <h2 className="text-xl font-serif text-slate-900 flex items-center gap-2">
                <Camera size={20} className="text-emerald-600" />
                Dernière Photo du Chantier
              </h2>
              <div className="group relative overflow-hidden rounded-2xl aspect-video bg-slate-200 border border-slate-200">
                <img 
                  src={chantier.lien_photo || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop"} 
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-700" 
                  alt="Avancement du chantier"
                />
              </div>
            </section>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={16} className="text-emerald-400" />
                Garantie Blockchain
              </h3>
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] opacity-60 uppercase">Cashback Sécurisé</p>
                <p className="text-xl font-bold mt-1">€ 7,500.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}