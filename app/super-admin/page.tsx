"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Building2, Loader2, LogOut, ShieldCheck, XCircle, Plus, Users, LayoutDashboard } from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase-auth-token',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  );

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*'); 
    if (!error) {
      const filtered = data?.filter(a => a.role !== 'super_admin');
      setAdmins(filtered || []);
    }
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthStatus('denied');
        return;
      }
      const targetEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();
      if (user.email?.toLowerCase().trim() === targetEmail) {
        setAuthStatus('authorized');
        fetchAdmins();
      } else {
        setAuthStatus('denied');
      }
    };
    checkUser();
  }, [supabase, fetchAdmins]);

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (authData?.user) {
        await supabase.from('profiles').upsert({ 
          id: authData.user.id, 
          email: email.toLowerCase().trim(), 
          role: 'admin', 
          company_name: companyName 
        }, { onConflict: 'id' });
        alert(`Licence activée pour ${companyName}`);
        setEmail(""); setPassword(""); setCompanyName("");
        fetchAdmins();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0a0a0a] border border-red-900/30 p-12 rounded-[3rem] text-center shadow-2xl">
          <XCircle size={64} className="text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-white mb-4">Accès Refusé</h2>
          <button onClick={() => window.location.assign('/login')} className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em]">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-red-500/30">
      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-slate-900/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.3)]">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic text-white tracking-tight">Super Control</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Gaëtan Admin Engine</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); window.location.assign('/login'); }}
            className="group flex items-center gap-3 bg-[#0f0f0f] hover:bg-red-950/30 border border-slate-800 hover:border-red-800/50 px-8 py-4 rounded-2xl transition-all duration-300"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-400">Terminer Session</span>
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* FORM SECTION */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Plus size={80} />
              </div>
              
              <h2 className="text-xl font-serif italic text-white mb-8 flex items-center gap-3">
                <Plus size={20} className="text-red-500" /> 
                Déployer une licence
              </h2>

              <form onSubmit={createAdminAccount} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-4">Partenaire</label>
                  <input className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-red-600 outline-none transition-colors shadow-inner" placeholder="Ex: Agence Immo Luxe" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-4">Identifiant Email</label>
                  <input className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-red-600 outline-none transition-colors shadow-inner" placeholder="admin@agence.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-4">Clé d'accès</label>
                  <input type="password" className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-red-600 outline-none transition-colors shadow-inner" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-600 py-5 mt-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-[0_10px_20px_rgba(185,28,28,0.2)]">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Générer l'accès Partner"}
                </button>
              </form>
            </div>

            {/* QUICK STAT (SaaS Style) */}
            <div className="bg-gradient-to-br from-red-950/20 to-transparent border border-red-900/20 rounded-3xl p-8 flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Total Agences</p>
                <p className="text-3xl font-serif italic text-white">{admins.length}</p>
              </div>
              <Users size={32} className="text-red-900/40" />
            </div>
          </section>

          {/* LIST SECTION */}
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="text-xl font-serif italic text-white flex items-center gap-3">
                <LayoutDashboard size={20} className="text-red-500" />
                Agences sous contrat
              </h2>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-full border border-slate-800">Live Database</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {admins.length === 0 ? (
                <div className="p-20 border border-dashed border-slate-800 rounded-[3rem] text-center">
                  <p className="text-slate-600 font-serif italic text-lg">Aucun contrat actif détecté dans le système.</p>
                </div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="group bg-[#0a0a0a] hover:bg-[#0f0f0f] border border-slate-800/60 hover:border-red-900/40 p-1 transition-all duration-300 rounded-[2.2rem]">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-[#050505] border border-slate-800 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                          <Building2 size={24} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg text-white group-hover:text-red-500 transition-colors">{admin.company_name || 'Agence sans nom'}</p>
                          <p className="text-xs text-slate-500 font-mono tracking-tight">{admin.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="px-5 py-2 rounded-full border border-emerald-900/30 bg-emerald-950/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                          Active
                        </div>
                        <div className="h-10 w-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-600 hover:text-red-500 hover:border-red-500 cursor-pointer transition-all">
                          <Plus size={16} className="rotate-45" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}