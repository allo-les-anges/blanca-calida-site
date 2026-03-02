"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function DebugDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSpecs() {
      // 1. On récupère l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. On récupère son profil en base
      let profile = null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profile = data;
      }

      setDebugInfo({ user, profile });
      setLoading(false);
    }
    getSpecs();
  }, []);

  const forceLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  if (loading) return <div className="p-20 text-white">Analyse du système...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono">
      <h1 className="text-red-500 text-2xl mb-10 underline tracking-tighter uppercase font-black">Console de Diagnostic Gaëtan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="border border-slate-800 p-6 rounded-xl bg-[#050505]">
          <h2 className="text-emerald-500 mb-4">1. Identité Session (Auth)</h2>
          <pre className="text-[10px] overflow-auto max-h-60 bg-black p-4">
            {JSON.stringify(debugInfo?.user, null, 2)}
          </pre>
          <p className="mt-4 text-sm">
            Email détecté : <span className="text-yellow-500">{debugInfo?.user?.email || "AUCUN"}</span>
          </p>
        </div>

        <div className="border border-slate-800 p-6 rounded-xl bg-[#050505]">
          <h2 className="text-emerald-500 mb-4">2. Données Profil (Base de données)</h2>
          <pre className="text-[10px] overflow-auto max-h-60 bg-black p-4">
            {JSON.stringify(debugInfo?.profile, null, 2)}
          </pre>
          <p className="mt-4 text-sm">
            Rôle en base : <span className="text-yellow-500">{debugInfo?.profile?.role || "NON TROUVÉ"}</span>
          </p>
        </div>
      </div>

      <div className="mt-20 border-t border-red-900 pt-10 text-center">
        <p className="mb-6 text-slate-400">Si l'email ci-dessus est bien <b className="text-white">gaetan@amaru-homes.com</b> mais que tu es bloqué :</p>
        <button 
          onClick={forceLogout}
          className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full font-black uppercase text-xs transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
        >
          Étape 1 : Nettoyer la session et Re-connecter
        </button>
      </div>

      <div className="mt-10 text-center">
        <button 
          onClick={() => window.location.reload()}
          className="text-slate-500 underline text-xs"
        >
          Étape 2 : Rafraîchir la page après modif Supabase
        </button>
      </div>
    </div>
  );
}