"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, Plus, Search, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

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
    console.log("🔍 ÉTAPE 2 : Début chargement données pour l'user :", user.email);
    try {
      setLoading(true);

      // 1. Profil
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profError) {
        console.warn("⚠️ Attention : Profil non trouvé ou erreur :", profError.message);
      } else {
        console.log("✅ Profil récupéré avec succès :", profile);
      }

      const currentAgency = profile?.company_name || "Agence par défaut";
      console.log("🏢 Agence détectée (via company_name) :", currentAgency);

      setAgencyProfile({
        ...profile,
        company_name: currentAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
        role: profile?.role || 'admin'
      });

      // 2. Projets
      console.log("📡 Appel de la table 'suivi_chantier'...");
      const { data: allProjects, error: projError } = await supabase
        .from('suivi_chantier')
        .select('*');

      if (projError) {
        console.error("❌ Erreur Supabase Projets :", projError.message);
      } else {
        console.log("📊 Nombre de projets bruts reçus :", allProjects?.length);
      }

      // 3. Filtrage
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      console.log("👑 Est Super Admin ?", isSuperAdmin);

      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        const filtered = (allProjects || []).filter(p => p.company_name === currentAgency);
        console.log("🎯 Projets filtrés pour l'agence :", filtered.length);
        setProjets(filtered);
      }
    } catch (err) {
      console.error("🔥 ERREUR FATALE dans loadDashboardData :", err);
    } finally {
      setLoading(false);
      console.log("🏁 Fin du chargement des données.");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    console.log("🚀 ÉTAPE 1 : Le composant est monté (isMounted)");

    const initAuth = async () => {
      console.log("🔑 Vérification de la session en cours...");
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) console.error("❌ Erreur Auth :", authError.message);

      if (session) {
        console.log("✅ Session trouvée ! User ID :", session.user.id);
        setSessionActive(true);
        await loadDashboardData(session.user);
      } else {
        console.log("⏳ Pas de session immédiate. Lancement du délai de grâce (2.5s)...");
        setTimeout(async () => {
          const { data: { session: retry } } = await supabase.auth.getSession();
          if (!retry) {
            console.error("❌ ÉCHEC FINAL : Pas de session après délai. Redirection login.");
            window.location.href = '/login';
          } else {
            console.log("🎉 Session récupérée après délai !");
            setSessionActive(true);
            loadDashboardData(retry.user);
          }
        }, 2500);
      }
    };
    initAuth();
  }, [loadDashboardData]);

  // Affichage des états de blocage
  if (!isMounted) return null;

  if (loading && !sessionActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-white">Analyse de la connexion... (Regardez la console F12)</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">
      <div className="max-w-4xl mx-auto bg-[#0f172a] p-8 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-emerald-500 mb-4">Dashboard de {agencyProfile?.prenom}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
          <div className="p-4 bg-slate-900 rounded-xl">
            <p className="text-slate-500">Agence</p>
            <p className="font-bold">{agencyProfile?.company_name}</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl">
            <p className="text-slate-500">Rôle</p>
            <p className="font-bold">{agencyProfile?.role}</p>
          </div>
        </div>

        <h2 className="text-xl mb-4">Projets ({projets.length})</h2>
        <div className="space-y-3">
          {projets.map(p => (
            <div key={p.id} className="p-4 border border-slate-800 rounded-xl flex justify-between">
              <span>{p.nom_projet}</span>
              <span className="text-slate-500 text-xs">{p.company_name}</span>
            </div>
          ))}
          {projets.length === 0 && <p className="text-slate-600 italic">Aucun projet à afficher.</p>}
        </div>

        <button 
          onClick={() => { supabase.auth.signOut().then(() => window.location.href = '/login'); }}
          className="mt-10 text-red-400 text-xs font-bold flex items-center gap-2"
        >
          <LogOut size={14} /> DÉCONNEXION
        </button>
      </div>
    </div>
  );
}