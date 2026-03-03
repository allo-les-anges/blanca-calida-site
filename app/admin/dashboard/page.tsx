"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Trash2, Loader2, Plus, X, Search, Briefcase, 
  LogOut, Zap, Euro, ArrowLeft, Settings, Key, Mail, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TRANSLATIONS = {
  fr: {
    dossiers: "Dossiers", experts: "Experts", newDossier: "Nouveau Dossier", 
    addExpert: "Ajouter un Expert", search: "Recherche...", 
    clientPin: "PIN Client", settings: "Gestion Agence", logout: "Déconnexion", 
    backHome: "Retour Accueil", changePass: "Mon mot de passe", team: "Collaborateurs",
    inviteDev: "Inviter", phases: ["0. Signature", "1. Terrain"]
  }
};

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'staff' | 'settings'>('clients');
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null); // null = attente, false = rediriger
  
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]); 
  const [adminsList, setAdminsList] = useState<any[]>([]); 
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction de chargement des données (appelée uniquement si session OK)
  const loadDashboardData = useCallback(async (user: any) => {
    try {
      const { data: profile } = await supabase.from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const currentProfile = profile || { agency_name: "Agence", prenom: "Admin" };
      setAgencyProfile(currentProfile);

      const isSuperAdmin = currentProfile.agency_name === 'SUPER_ADMIN' || user.email === 'gaetan@amaru-homes.com';

      const [projRes, adsRes, stfRes] = await Promise.all([
        supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('staff_prestataires').select('*')
      ]);

      setProjets(projRes.data || []);
      setAdminsList(adsRes.data || []);
      setStaffList(stfRes.data || []);
    } catch (err) {
      console.error("Erreur data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // 1. Écouteur de session en temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      
      if (session) {
        setSessionActive(true);
        loadDashboardData(session.user);
      } else {
        // On laisse un petit délai pour éviter les faux positifs au chargement
        setTimeout(() => {
          if (!session) {
            console.log("Redirection vers login...");
            window.location.replace('/login');
          }
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDashboardData]);

  // Écran de chargement initial (fond noir pour éviter le flash)
  if (!isMounted || sessionActive === null) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Initialisation sécurisée...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans">
      <aside className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
             <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition-all"><ArrowLeft size={16} /></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Retour Accueil</span>
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20"><Briefcase className="text-[#020617]" size={22} /></div>
            <div>
              <h1 className="text-sm font-black text-white uppercase">{agencyProfile?.agency_name}</h1>
              <p className="text-[10px] text-emerald-400 font-bold italic">{agencyProfile?.prenom} {agencyProfile?.nom}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Experts</button>
          </div>
          
          <div className="space-y-2">
            {projets.map((p) => (
              <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500' : 'border-white/5 hover:bg-white/5'}`}>
                <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                <p className="text-[9px] uppercase opacity-50">{p.nom_villa}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={() => { supabase.auth.signOut(); window.location.replace('/'); }} className="w-full flex items-center justify-between p-4 rounded-xl text-slate-500 hover:text-red-500 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest">Déconnexion</span> <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A]">
        {loading ? (
          <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : selectedProjet ? (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl">
                <h2 className="text-5xl font-bold text-white mb-6 uppercase italic tracking-tighter">{selectedProjet.nom_villa}</h2>
                <div className="flex gap-4">
                  <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-bold border border-emerald-500/20">PIN: {selectedProjet.pin_code}</span>
                  <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-[10px] font-bold border border-blue-500/20">{selectedProjet.montant_cashback}€ Cashback</span>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Zap size={100} className="text-emerald-500 mb-4 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-[0.3em]">Tableau de Bord</p>
          </div>
        )}
      </main>
    </div>
  );
}