"use client";

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; 
import { CheckCircle2, Clock, Camera, Wallet, Loader2, Home } from 'lucide-react';

export default function ProjectTracker() {
  // Initialisation moderne de Supabase pour le client (SSR Friendly)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [chantier, setChantier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChantierData() {
      try {
        // 1. Récupérer l'utilisateur connecté via la session
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 2. Récupérer SON projet spécifique lié à son user_id
          const { data, error } = await supabase
            .from('suivi_chantier')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            setChantier(data);
          }
        }
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChantierData();
  }, [supabase]);

  // Écran de chargement
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      <p className="text-slate-500 font-serif italic">Chargement de votre espace sécurisé...</p>
    </div>
  );

  // Écran si aucune donnée n'est trouvée
  if (!chantier) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-slate-50">
      <Home className="text-slate-300 mb-6" size={48} />
      <h2 className="text-2xl font-serif text-slate-800 mb-2">Espace Propriétaire</h2>
      <p className="text-slate-500 max-w-sm">
        Aucun projet n'est actuellement lié à votre compte. Veuillez contacter votre conseiller Blanca Calida.
      </p>
    </div>
  );

  // Calculs dynamiques basés sur ta table (étape 0 à 12)
  const etape = chantier.etape_actuelle || 0; 
  const progressionPourcent = Math.round((etape / 12) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* EN-TÊTE DU PROJET */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.3em]">
                Dossier Propriétaire : {chantier.nom_client}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mt-2 lowercase italic">
                {chantier.nom_villa}
              </h1>
              <p className="text-slate-500 text-sm mt-3 flex items-center gap-2">
                <Clock size={14} /> Livraison prévue : {chantier.key_date || "À confirmer"}
              </p>
            </div>
            <div className="bg-slate-900 text-white px-10 py-6 rounded-[2rem] text-center shadow-2xl border border-slate-800">
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Avancement Global</p>
              <p className="text-4xl font-serif">{progressionPourcent}%</p>
            </div>
          </div>
          
          {/* BARRE DE PROGRESSION */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-12 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressionPourcent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* ÉTAT DES TRAVAUX (Timeline simplifiée) */}
            <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-serif text-slate-900 mb-8 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-500" />
                Journal de bord
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 h-12 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="font-bold text-slate-900">Étape actuelle : {etape} / 12</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Votre villa est en cours de construction. Prochaine mise à jour après validation technique.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* DERNIÈRE PHOTO */}
            <section className="space-y-6">
              <h2 className="text-xl font-serif text-slate-900 flex items-center gap-2">
                <Camera size={20} className="text-emerald-600" />
                Dernière Photo du Terrain
              </h2>
              <div className="group relative overflow-hidden rounded-[2.5rem] aspect-video bg-slate-200 border border-slate-100 shadow-inner">
                <img 
                  src={chantier.lien_photo || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop"} 
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-700" 
                  alt="Avancement du chantier"
                />
              </div>
            </section>
          </div>

          {/* COLONNE DROITE (FINANCES) */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <Wallet size={40} className="absolute -right-2 -top-2 opacity-10 rotate-12" />
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                Garantie Cashback
              </h3>
              <div className="p-6 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-[10px] opacity-70 uppercase tracking-tighter">Montant accumulé</p>
                <p className="text-4xl font-serif mt-2">
                  {Number(chantier.montant_cashback || 0).toLocaleString('fr-FR')} €
                </p>
              </div>
              <p className="text-[10px] mt-6 opacity-60 leading-relaxed italic">
                * Fonds sécurisés sur la blockchain Solana, débloqués à la remise des clés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}