"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';

// Utilisation d'un client avec une clé de stockage isolée
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'amaru-legacy-auth', 
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (user: any) => {
    try {
      // 1. Profil (Harmonisé sur company_name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const currentAgency = profile?.company_name || "Agence Amaru";
      setAgencyProfile({
        ...profile,
        company_name: currentAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
      });

      // 2. Projets
      const { data: allProjects } = await supabase.from('suivi_chantier').select('*');
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      setProjets(isSuperAdmin ? (allProjects || []) : (allProjects || []).filter(p => p.company_name === currentAgency));
    } catch (err) {
      setError("Erreur de chargement des données.");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // ÉCOUTEUR UNIQUE : On ne fait rien d'autre que d'attendre l'user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("⚡ EVENEMENT AUTH :", event);
      if (session) {
        loadDashboardData(session.user);
      }
    });

    // Vérification manuelle forcée
    const forceCheck = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) loadDashboardData(session.user);
    };

    forceCheck();
    return () => subscription.unsubscribe();
  }, [loadDashboardData]);

  if (!isMounted) return null;

  if (!agencyProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-10">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Session en cours de validation...</p>
        <div className="mt-8 flex gap-4">
            <button onClick={() => window.location.href = '/login'} className="text-[10px] border border-slate-700 px-4 py-2 rounded-full opacity-50">RETOUR LOGIN</button>
            <button onClick={() => window.location.reload()} className="text-[10px] bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full font-bold">RECHARGER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">
      <div className="max-w-4xl mx-auto bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800">
        <div className="flex justify-between items-start mb-10">
            <h1 className="text-2xl font-serif italic text-emerald-500">Espace {agencyProfile.company_name}</h1>
            <button onClick={() => { supabase.auth.signOut(); window.location.href='/login'; }} className="text-red-400 text-[10px] font-bold">DÉCONNEXION</button>
        </div>
        
        <div className="space-y-4">
          {projets.map(p => (
            <div key={p.id} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="font-bold">{p.nom_projet}</span>
              <Link href={`/admin/projet/${p.id}`} className="text-emerald-500 text-xs font-bold">ACCÉDER →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}