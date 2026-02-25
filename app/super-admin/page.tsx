"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Building2, Loader2, LogOut, ShieldCheck, XCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [admins, setAdmins] = useState<any[]>([]);

  const checkUser = useCallback(async () => {
    // On force la récupération de la session fraîche
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setAuthStatus('denied');
      return;
    }

    if (session.user.email?.toLowerCase() === 'gaetan@amaru-homes.com') {
      setAuthStatus('authorized');
      const { data } = await supabase.from('profiles').select('*').neq('role', 'super_admin');
      setAdmins(data || []);
    } else {
      setAuthStatus('denied');
    }
  }, [supabase]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (authStatus === 'loading') return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  if (authStatus === 'denied') {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={60} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-serif text-white mb-4">Accès non détecté</h2>
        <p className="text-slate-400 mb-8">La session n'a pas été enregistrée par votre navigateur.</p>
        <button onClick={() => window.location.href = '/login'} className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Réessayer le Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      {/* Ton interface de dashboard ici... */}
      <h1 className="text-4xl font-serif italic mb-10">Console Gaëtan</h1>
      <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} className="bg-slate-900 px-6 py-2 rounded-xl border border-slate-800 text-xs">Déconnexion</button>
    </div>
  );
}