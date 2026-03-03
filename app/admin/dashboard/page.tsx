"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Loader2, 
  Briefcase, 
  LogOut, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  LayoutDashboard 
} from 'lucide-react';

// Client standard pour éviter les conflits de cookies SSR/Middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction de chargement des données (Gère le bug des deux colonnes)
  const loadDashboardData = useCallback(async (user: any) => {
    try {
      setLoading(true);

      // 1. Récupération du profil (Flexible sur agency_name vs company_name)
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profError) throw profError;

      // Fusion des colonnes identifiées sur les images 8d41e0 et 8cefc6
      const detectedAgency = profile?.agency_name || profile?.company_name || "Agence non définie";
      
      setAgencyProfile({
        ...profile,
        agency_name: detectedAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
        role: profile?.role || 'admin'
      });

      // 2. Chargement de TOUS les projets pour filtrage
      const { data: allProjects, error: projError } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });

      if (projError) throw projError;

      // 3. Logique de filtrage (Super Admin vs Admin d'agence)
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        // Filtrage strict mais tolérant aux deux noms de colonnes
        const filtered = (allProjects || []).filter(p => 
          p.agency_name === detectedAgency || 
          p.company_name === detectedAgency
        );
        setProjets(filtered);
      }
    } catch (err) {
      console.error("Erreur critique Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gestion de l'authentification avec sécurité anti-boucle
  useEffect(() => {
    setIsMounted(true);

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSessionActive(true);
        await loadDashboardData(session.user);
      } else {
        // Sécurité : On attend 3s pour laisser au navigateur le temps d'écrire les cookies
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            window.location.href = '/login'; // Redirection brute si toujours rien
          } else {
            setSessionActive(true);
            loadDashboardData(retrySession.user);
          }
        }, 3000);
      }
    };

    initAuth();
  }, [loadDashboardData]);

  // État de chargement initial
  if (!isMounted || (loading && !sessionActive)) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Initialisation du Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex">
      {/* Sidebar Latérale */}
      <aside className="w-64 border-r border-slate-800 bg-[#0f172a]/50 hidden md:flex flex-col p-6">
        <div className="mb-10">
          <h2 className="text-emerald-500 font-serif italic text-xl">Amaru Dashboard</h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Interface {agencyProfile?.role}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 bg-emerald-500/10 text-emerald-500 p-3 rounded-xl text-xs font-bold transition-all">
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-800 p-3 rounded-xl text-xs font-bold transition-all">
            <Briefcase size={16} /> Mes Chantiers
          </button>
          {agencyProfile?.role === 'super_admin' && (
            <button className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-800 p-3 rounded-xl text-xs font-bold transition-all">
              <Users size={16} /> Équipes
            </button>
          )}
        </nav>

        <button 
          onClick={() => { supabase.auth.signOut(); window.location.href = '/login'; }}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 p-3 text-xs font-bold transition-all mt-auto"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-md">
          <div>
            <h1 className="text-lg font-bold">Bonjour, {agencyProfile?.prenom}</h1>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest">{agencyProfile?.agency_name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text"
                placeholder="Rechercher un projet..."
                className="bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs focus:border-emerald-500 outline-none w-64 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 px-4 rounded-full text-xs font-bold flex items-center gap-2 transition-all">
              <Plus size={16} /> Nouveau
            </button>
          </div>
        </header>

        {/* Zone de défilement */}
        <section className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem]">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Projets Actifs</p>
              <p className="text-4xl font-serif italic text-emerald-500">{projets.length}</p>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="p-6 font-bold">Projet / Client</th>
                  <th className="p-6 font-bold">Agence Responsable</th>
                  <th className="p-6 font-bold">Statut</th>
                  <th className="p-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {projets.length > 0 ? (
                  projets.filter(p => p.nom_projet?.toLowerCase().includes(searchTerm.toLowerCase())).map((projet) => (
                    <tr key={projet.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-6">
                        <p className="text-sm font-bold text-slate-200">{projet.nom_projet}</p>
                        <p className="text-[10px] text-slate-500">{projet.client_name}</p>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-bold uppercase tracking-tighter">
                          {projet.agency_name || projet.company_name}
                        </span>
                      </td>
                      <td className="p-6 text-xs text-emerald-400 font-medium">En cours</td>
                      <td className="p-6 text-right text-xs">
                        <Link href={`/admin/projet/${projet.id}`} className="text-emerald-500 hover:underline">Voir détails →</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-600 italic text-sm">
                      Aucun projet trouvé pour cette configuration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}