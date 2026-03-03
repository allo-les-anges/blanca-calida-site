"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, Plus, Search, LayoutDashboard, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Configuration du client avec persistance forcée
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction de chargement des données
  const loadDashboardData = useCallback(async (user: any) => {
    console.log("🔍 ÉTAPE 2 : Chargement des données pour :", user.email);
    try {
      setLoading(true);

      // 1. Récupération du profil (Uniquement company_name suite à votre suppression de colonne)
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profError) console.warn("⚠️ Profil non trouvé :", profError.message);

      const currentAgency = profile?.company_name || "Agence Amaru";
      
      setAgencyProfile({
        ...profile,
        company_name: currentAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
        role: profile?.role || 'admin'
      });

      // 2. Chargement des projets
      const { data: allProjects, error: projError } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });

      if (projError) console.error("❌ Erreur projets :", projError.message);

      // 3. Filtrage Super Admin vs Admin d'agence
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        const filtered = (allProjects || []).filter(p => 
          p.company_name === currentAgency
        );
        setProjets(filtered);
      }
    } catch (err) {
      console.error("🔥 Erreur critique :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // ÉCOUTEUR EN TEMPS RÉEL : C'est la clé pour éviter la redirection immédiate
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔔 Événement Auth détecté :", event);
      if (session) {
        setSessionActive(true);
        loadDashboardData(session.user);
      }
    });

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSessionActive(true);
        loadDashboardData(session.user);
      } else {
        // Délai de grâce augmenté à 4s pour les connexions instables
        setTimeout(async () => {
          const { data: { session: retry } } = await supabase.auth.getSession();
          if (!retry) {
            console.error("❌ Redirection Login : Aucune session après 4s");
            window.location.href = '/login';
          }
        }, 4000);
      }
    };

    initAuth();
    return () => subscription.unsubscribe(); // Nettoyage de l'écouteur
  }, [loadDashboardData]);

  if (!isMounted || (loading && !sessionActive)) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Sécurisation de la session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0f172a]/50 hidden md:flex flex-col p-6">
        <div className="mb-10">
          <h2 className="text-emerald-500 font-serif italic text-xl">Amaru Dashboard</h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            {agencyProfile?.company_name}
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 bg-emerald-500/10 text-emerald-500 p-3 rounded-xl text-xs font-bold transition-all">
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </nav>
        <button 
          onClick={() => { supabase.auth.signOut().then(() => window.location.href = '/login'); }}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 p-3 text-xs font-bold mt-auto transition-colors"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-bold">Bonjour, {agencyProfile?.prenom}</h1>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">
              {agencyProfile?.role === 'super_admin' ? 'Vue Globale' : `Agence ${agencyProfile?.company_name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Rechercher un projet..." 
                className="bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs outline-none w-64 focus:border-emerald-500 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  <th className="p-6">Projet</th>
                  <th className="p-6">Agence</th>
                  <th className="p-6">Statut</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {projets
                  .filter(p => p.nom_projet?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-6">
                        <p className="text-sm font-bold text-slate-200">{p.nom_projet}</p>
                        <p className="text-[10px] text-slate-500">{p.client_name}</p>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {p.company_name}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-bold uppercase">En cours</span>
                      </td>
                      <td className="p-6 text-right">
                        <Link href={`/admin/projet/${p.id}`} className="text-emerald-500 text-xs hover:underline font-bold">Voir →</Link>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {projets.length === 0 && !loading && (
              <div className="p-20 text-center text-slate-500 text-sm italic">
                Aucun projet trouvé pour l'agence {agencyProfile?.company_name}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}