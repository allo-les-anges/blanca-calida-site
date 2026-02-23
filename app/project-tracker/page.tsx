"use client";

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // Version correcte pour Next.js
import { CheckCircle2, Clock, Camera, Wallet, Loader2 } from 'lucide-react';

export default function ProjectTracker() {
  const supabase = createClientComponentClient();
  const [chantier, setChantier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChantierData() {
      try {
        // 1. On récupère l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 2. On récupère SON projet lié à son ID
          const { data, error } = await supabase
            .from('suivi_chantier')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) setChantier(data);
        }
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChantierData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center italic text-slate-400">
      <Loader2 className="animate-spin mb-4 text-emerald-500" />
      Chargement de votre espace sécurisé...
    </div>
  );

  if (!chantier) return (
    <div className="min-h-screen flex items-center justify-center p-10 text-center">
      <p className="font-serif text-slate-500">Aucun projet n'est encore lié à votre compte client.</p>
    </div>
  );

  // CALCULS DYNAMIQUES (Sur ta nouvelle base 0-12)
  const etape = chantier.etape_actuelle || 0; 
  const progressionPourcent = Math.round((etape / 12) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER RÉPARÉ */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em]">Dossier Propriétaire</span>
              <h1 className="text-4xl font-serif text-slate-900 mt-2">{chantier.nom_villa}</h1>
              <p className="text-slate-500 text-sm mt-1 italic">Bienvenue, {chantier.nom_client}</p>
            </div>
            <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] text-center shadow-xl">
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Avancement</p>
              <p className="text-4xl font-serif">{progressionPourcent}%</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-2 rounded-full mt-10 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${progressionPourcent}%` }}
            ></div>
          </div>
        </div>

        {/* Le reste de ta mise en page (Timeline, etc.) reste identique... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* ... contenu de ta grille ... */}
             <div className="lg:col-span-2">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-2"><Clock size={20}/> État des travaux</h2>
                <div className="bg-white p-8 rounded-3xl border border-slate-100">
                    <p className="text-slate-600">Nous sommes actuellement à l'étape {etape} sur 12.</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-lg">
                    <Wallet className="mb-4" />
                    <p className="text-[10px] uppercase opacity-70 tracking-widest">Cashback Accumulé</p>
                    <p className="text-3xl font-serif mt-2">{Number(chantier.montant_cashback).toLocaleString()} €</p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}