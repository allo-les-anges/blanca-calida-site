"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, LayoutDashboard, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Utilisation d'un stockage local très agressif
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'amaru-dashboard-session', // Clé isolée
      autoRefreshToken: true,
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);

  const loadDashboardData = useCallback(async (user: any) => {
    console.log("💾 Tentative de récupération des données pour :", user.email);
    try {
      // 1. Profil (Uniquement company_name)
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
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        setProjets((allProjects || []).filter(p => p.company_name === currentAgency));
      }
    } catch (err) {
      console.error("❌ Erreur de chargement des données :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // On écoute uniquement les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("⚡ ÉVÉNEMENT CAPTÉ PAR LE DASHBOARD :", event);
      
      if (session) {
        console.log("✅ Session confirmée pour :", session.user.email);
        loadDashboardData(session.user);
      } else {
        console.log("⚠️ Aucune session détectée pour le moment.");
        // ON NE REDIRIGE PLUS AUTOMATIQUEMENT ICI.
      }
    });

    // Vérification initiale manuelle
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) loadDashboardData(session.user);
    };

    checkAuth();
    return () => subscription.unsubscribe();
  }, [loadDashboardData]);

  if (!isMounted) return null;

  // L'écran ne s'affiche que si on a réussi à charger le profil
  if (!agencyProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
        <Loader2 className="text-emerald-500 animate-spin" size={50} />
        <div className="text-center">
          <p className="text-white font-bold uppercase tracking-widest text-xs">Authentification en cours...</p>
          <p className="text-slate-500 text-[10px] mt-2 italic">Si cet écran reste figé, vérifiez vos cookies.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="text-slate-500 text-[10px] underline uppercase"
        >
          Retour au login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-serif italic text-emerald-500">Bonjour {agencyProfile.prenom}</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">
              Gestionnaire : <span className="text-emerald-400">{agencyProfile.company_name}</span>
            </p>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-2 rounded-full text-xs font-bold uppercase transition-all"
          >
            Déconnexion
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem]">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Projets en cours</p>
            <p className="text-5xl font-serif italic text-emerald-500">{projets.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-[10px] uppercase text-slate-500 tracking-widest">
                <th className="p-8">Chantier / Client</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {projets.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="p-8">
                    <p className="text-lg font-bold">{p.nom_projet}</p>
                    <p className="text-xs text-slate-500">{p.client_name || "Client Amaru"}</p>
                  </td>
                  <td className="p-8 text-right">
                    <Link 
                      href={`/admin/projet/${p.id}`}
                      className="inline-block bg-emerald-500 text-black px-6 py-2 rounded-full text-xs font-black uppercase hover:scale-105 transition-transform"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projets.length === 0 && (
            <div className="p-20 text-center text-slate-500 italic">
              Aucun projet trouvé pour {agencyProfile.company_name}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}