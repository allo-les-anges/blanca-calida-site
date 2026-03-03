"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, RefreshCw, Briefcase } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'amaru-auth-v7',
      autoRefreshToken: true,
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async (user: any) => {
    try {
      // 1. Récupérer le profil de l'utilisateur (Iris, Gillian ou Gaëtan)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userAgency = profile?.company_name || "Non assigné";
      
      setAgencyProfile({
        ...profile,
        company_name: userAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
      });

      // 2. Récupérer tous les projets et filtrer
      const { data: allProjects } = await supabase.from('suivi_chantier').select('*');
      
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        // On filtre par la nouvelle colonne company_name de suivi_chantier
        setProjets((allProjects || []).filter(p => p.company_name === userAgency));
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) loadAllData(session.user);
    });

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) loadAllData(session.user);
      else setTimeout(() => setLoading(false), 5000);
    };
    check();
    return () => subscription.unsubscribe();
  }, [loadAllData]);

  if (!isMounted) return null;

  if (loading && !agencyProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
        <p className="text-[10px] uppercase tracking-widest font-bold">Chargement Amaru...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-serif italic text-emerald-500">
              {agencyProfile?.prenom ? `Bonjour ${agencyProfile.prenom}` : "Bienvenue"}
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">
              Espace {agencyProfile?.company_name}
            </p>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
            className="border border-red-500/30 text-red-500 text-[10px] font-bold uppercase px-6 py-2 rounded-full hover:bg-red-500/10 transition-all"
          >
            Déconnexion
          </button>
        </header>

        <div className="grid gap-6">
          {projets.length > 0 ? (
            projets.map(p => (
              <div key={p.id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{p.nom_villa || "Villa Amaru"}</h3>
                    <p className="text-xs text-slate-500 uppercase font-medium mt-1">Client: {p.client_nom} {p.client_prenom}</p>
                  </div>
                </div>
                <Link 
                  href={`/admin/projet/${p.id}`}
                  className="w-full md:w-auto bg-emerald-500 text-black px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform text-center"
                >
                  Accéder au suivi
                </Link>
              </div>
            ))
          ) : (
            <div className="p-20 text-center border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
              <p className="text-slate-500 italic text-sm">Aucun projet en cours pour votre agence.</p>
              <button onClick={() => window.location.reload()} className="mt-6 flex items-center gap-2 mx-auto text-emerald-500 text-[10px] font-bold uppercase">
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}