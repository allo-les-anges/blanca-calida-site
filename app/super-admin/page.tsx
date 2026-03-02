"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, ShieldAlert, LogOut, ShieldCheck, Plus, Users, Trash2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);

  // 1. VERIFICATION ULTRA-SIMPLIFIÉE
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email?.toLowerCase().trim() === 'gaetan@amaru-homes.com') {
        setUser(user);
        // On charge les données seulement si c'est Gaëtan
        const { data } = await supabase.from('profiles').select('*');
        setAdmins(data?.filter(a => a.email !== 'gaetan@amaru-homes.com') || []);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  // SI CE N'EST PAS GAETAN
  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="bg-[#0a0a0a] border border-red-900/30 p-12 rounded-[3rem] max-w-md w-full">
        <ShieldAlert size={64} className="text-red-600 mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-white mb-4">Accès de Secours Activé</h2>
        <p className="text-slate-500 mb-8 text-sm text-left">
          Le système ne reconnaît pas votre session comme <b>gaetan@amaru-homes.com</b>.<br/><br/>
          Votre email actuel : <span className="text-red-500 font-bold">{user?.email || "Non connecté"}</span>
        </p>
        <button onClick={handleLogout} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase text-[10px]">
          Se reconnecter avec le bon compte
        </button>
      </div>
    </div>
  );

  // SI C'EST GAETAN, ON AFFICHE LE DASHBOARD
  return (
    <div className="min-h-screen bg-[#050505] text-white p-10">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-10">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-red-600" size={40} />
          <h1 className="text-3xl font-serif italic text-white underline decoration-red-600">Super Control Gaëtan</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <LogOut size={20} /> Déconnexion
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
        {/* SECTION LISTE */}
        <section className="bg-[#0a0a0a] border border-slate-800 p-8 rounded-[2rem]">
          <h2 className="text-xl font-serif mb-6 flex items-center gap-2"><Users size={20} className="text-red-500"/> Agences Actives</h2>
          <div className="space-y-4">
            {admins.map(admin => (
              <div key={admin.id} className="bg-black border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold">{admin.company_name}</p>
                  <p className="text-xs text-slate-500">{admin.email}</p>
                </div>
                <button className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
            {admins.length === 0 && <p className="text-slate-600 italic">Aucune agence ou RLS bloquante.</p>}
          </div>
        </section>

        {/* SECTION INFOS */}
        <section className="bg-red-950/10 border border-red-900/20 p-8 rounded-[2rem]">
          <h2 className="text-xl font-serif mb-6 text-red-500">Statut Système</h2>
          <p className="text-sm text-slate-400 mb-4">Connecté en tant que :</p>
          <div className="bg-black p-4 rounded-xl border border-red-900/40 text-red-500 font-mono text-sm">
            {user.email}
          </div>
          <div className="mt-6 p-4 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs border border-emerald-500/20">
            ✓ Authentification directe réussie.
          </div>
        </section>
      </div>
    </div>
  );
}