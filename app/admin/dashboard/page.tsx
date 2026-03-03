"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trash2, Loader2, Plus, X, Search, Briefcase, LogOut, Zap, Euro, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'staff' | 'settings'>('clients');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAllData = useCallback(async (currentUser: any) => {
    try {
      setLoading(true);
      
      // 1. Récupérer le profil pour connaître l'agence
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      const userAgency = profile?.agency_name || "NON_DEFINI";
      setAgencyProfile(profile || { agency_name: "Agence", prenom: currentUser.email });

      // 2. Charger TOUS les dossiers (on filtrera visuellement après pour ne pas bloquer)
      const { data: projData } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });

      setProjets(projData || []);

    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    // Vérification simple de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadAllData(session.user);
      } else {
        window.location.replace('/login');
      }
    });
  }, [loadAllData]);

  // FILTRE : On ne montre que les projets de l'agence de l'utilisateur
  // Sauf si c'est le super-admin (Gaëtan)
  const filteredProjets = useMemo(() => {
    return projets.filter(p => {
      const matchSearch = `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (user?.email === 'gaetan@amaru-homes.com') return matchSearch; // Le super admin voit tout
      return matchSearch && p.agency_name === agencyProfile?.agency_name;
    });
  }, [projets, searchTerm, agencyProfile, user]);

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin" size={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200">
      <aside className="w-full md:w-80 bg-[#0F172A] border-r border-white/5 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-xl"><Briefcase className="text-black" size={20} /></div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{agencyProfile?.agency_name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" placeholder="Rechercher..." 
                className="w-full pl-10 pr-4 py-2 bg-black/20 rounded-lg text-xs border border-white/5 outline-none focus:border-emerald-500"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {loading ? (
                <p className="text-[10px] text-center text-slate-500 uppercase animate-pulse">Chargement...</p>
              ) : (
                filteredProjets.map((p) => (
                  <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500' : 'border-white/5 hover:bg-white/5'}`}>
                    <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                    <p className="text-[9px] uppercase opacity-50">{p.nom_villa}</p>
                  </button>
                ))
              )}
            </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => { supabase.auth.signOut(); window.location.replace('/login'); }} className="w-full flex items-center justify-between p-4 rounded-xl text-slate-500 hover:text-red-500 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-widest">Déconnexion</span> <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#020617]">
        {selectedProjet ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
              <h2 className="text-4xl font-bold mb-4">{selectedProjet.nom_villa}</h2>
              <div className="flex gap-4">
                <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-bold border border-emerald-500/20">PIN: {selectedProjet.pin_code}</span>
                <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-[10px] font-bold border border-blue-500/20">AGENCE: {selectedProjet.agency_name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={80} />
            <p className="uppercase tracking-[0.5em] font-black">Sélectionnez un dossier</p>
          </div>
        )}
      </main>
    </div>
  );
}