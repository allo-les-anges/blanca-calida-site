"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Loader2, 
  Briefcase, 
  LogOut, 
  Plus, 
  Search, 
  Users, 
  LayoutDashboard 
} from 'lucide-react';
import Link from 'next/link'; // Import vérifié

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

  const loadDashboardData = useCallback(async (user: any) => {
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const detectedAgency = profile?.agency_name || profile?.company_name || "Agence non définie";
      
      setAgencyProfile({
        ...profile,
        agency_name: detectedAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
        role: profile?.role || 'admin'
      });

      const { data: allProjects } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });

      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
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

  useEffect(() => {
    setIsMounted(true);
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionActive(true);
        await loadDashboardData(session.user);
      } else {
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            window.location.href = '/login';
          } else {
            setSessionActive(true);
            loadDashboardData(retrySession.user);
          }
        }, 3000);
      }
    };
    initAuth();
  }, [loadDashboardData]);

  if (!isMounted || (loading && !sessionActive)) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Initialisation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex">
      <aside className="w-64 border-r border-slate-800 bg-[#0f172a]/50 hidden md:flex flex-col p-6">
        <div className="mb-10">
          <h2 className="text-emerald-500 font-serif italic text-xl">Amaru Dashboard</h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Interface {agencyProfile?.role}</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 bg-emerald-500/10 text-emerald-500 p-3 rounded-xl text-xs font-bold"><LayoutDashboard size={16} /> Dashboard</button>
          <button className="w-full flex items-center gap-3 text-slate-400 hover:bg-slate-800 p-3 rounded-xl text-xs font-bold"><Briefcase size={16} /> Mes Chantiers</button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.location.href = '/login'; }} className="flex items-center gap-3 text-red-400 p-3 text-xs font-bold mt-auto"><LogOut size={16} /> Déconnexion</button>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-bold">Bonjour, {agencyProfile?.prenom}</h1>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest">{agencyProfile?.agency_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="Rechercher..." className="bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs outline-none w-64" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="p-6">Projet</th>
                  <th className="p-6">Agence</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {projets.filter(p => p.nom_projet?.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="p-6">
                      <p className="text-sm font-bold">{p.nom_projet}</p>
                      <p className="text-[10px] text-slate-500">{p.client_name}</p>
                    </td>
                    <td className="p-6 text-[10px] uppercase font-bold text-slate-400">{p.agency_name || p.company_name}</td>
                    <td className="p-6 text-right">
                      <Link href={`/admin/projet/${p.id}`} className="text-emerald-500 text-xs hover:underline font-bold">Voir détails →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}