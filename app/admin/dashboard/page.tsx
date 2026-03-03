"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'amaru-auth-v6',
      autoRefreshToken: true,
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [loadingStep, setLoadingStep] = useState("Vérification de l'identité...");

  const loadAllData = useCallback(async (user: any) => {
    try {
      setLoadingStep("Lecture du profil...");
      
      // 1. Récupération du profil (On récupère la company_name ici)
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

      setLoadingStep("Chargement des chantiers...");
      
      // 2. Récupération des projets
      const { data: allProjects, error: projError } = await supabase
        .from('suivi_chantier')
        .select('*');
      
      if (projError) throw projError;

      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        // FILTRAGE : On compare la company_name du profil avec celle (à ajouter) du projet
        const filtered = (allProjects || []).filter(p => 
          p.company_name === userAgency
        );
        setProjets(filtered);
      }
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setLoadingStep("Erreur de synchronisation.");
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
    };
    check();
    return () => subscription.unsubscribe();
  }, [loadAllData]);

  if (!isMounted) return null;

  if (!agencyProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={50} />
        <h2 className="text-lg font-bold mb-2">{loadingStep}</h2>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full text-[10px] font-bold uppercase border border-white/10">
          <RefreshCw size={12} /> Réinitialiser
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
            <div>
                <h1 className="text-3xl font-serif italic text-emerald-500">Dashboard</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                    Agence : {agencyProfile.company_name}
                </p>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }} className="text-red-500 text-[10px] font-bold uppercase border border-red-400/20 px-4 py-2 rounded-full">Déconnexion</button>
        </header>

        <div className="grid gap-4">
            {projets.length > 0 ? projets.map(p => (
                <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-emerald-500 transition-all">
                    <div>
                        <h3 className="font-bold text-lg">{p.nom_villa || "Projet sans nom"}</h3>
                        <p className="text-[10px] text-slate-500 uppercase">Client : {p.client_nom} {p.client_prenom}</p>
                    </div>
                    <Link href={`/admin/projet/${p.id}`} className="bg-emerald-500 text-black px-6 py-2 rounded-full text-[10px] font-black uppercase">
                        Voir le suivi
                    </Link>
                </div>
            )) : (
                <div className="p-20 text-center border border-dashed border-slate-800 rounded-3xl">
                    <AlertCircle className="mx-auto text-slate-800 mb-4" size={32} />
                    <p className="text-slate-500 italic">Aucun projet trouvé. Vérifiez que la colonne 'company_name' est bien remplie dans la table suivi_chantier.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}