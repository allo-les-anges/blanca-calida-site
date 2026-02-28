"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { 
  Building2, Loader2, LogOut, ShieldCheck, 
  XCircle, Plus, Users, LayoutDashboard, Trash2,
  ArrowLeft, BarChart3, TrendingUp, Hash
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- LOGIQUE ANALYTICS : Inscriptions par mois ---
  const monthlyStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const currentMonth = new Date().getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const m = months[(currentMonth - i + 12) % 12];
      stats[m] = 0;
    }

    admins.forEach(admin => {
      const date = new Date(admin.created_at);
      const m = months[date.getMonth()];
      if (stats[m] !== undefined) stats[m] += 1;
    });

    return Object.entries(stats);
  }, [admins]);

  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); 
    if (!error) {
      const filtered = data?.filter(a => a.role !== 'super_admin');
      setAdmins(filtered || []);
    }
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();
      
      if (!user || user.email?.toLowerCase().trim() !== targetEmail) {
        setAuthStatus('denied');
      } else {
        setAuthStatus('authorized');
        fetchAdmins();
      }
    };
    checkUser();
  }, [supabase, fetchAdmins]);

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (authData?.user) {
        await supabase.from('profiles').upsert({ 
          id: authData.user.id, 
          email: email.toLowerCase().trim(), 
          role: 'admin', 
          company_name: companyName 
        });
        alert(`Licence activée avec succès.`);
        setEmail(""); setPassword(""); setCompanyName("");
        fetchAdmins();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const deleteAdminAccount = async (adminId: string, company: string) => {
    if (!confirm(`Révoquer définitivement l'accès de l'agence "${company}" ?`)) return;
    setDeletingId(adminId);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', adminId);
      if (error) throw error;
      fetchAdmins();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setDeletingId(null);
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#0a0a0a] border border-red-900/30 p-12 rounded-[3rem]">
          <XCircle size={64} className="text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-white mb-6">Accès Non Autorisé</h2>
          <Link href="/login" className="block w-full bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Retour Identification</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans">
      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-serif italic text-white tracking-tight">Super Control</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Gaëtan Admin Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-3 bg-[#0f0f0f] border border-slate-800 px-8 py-4 rounded-2xl hover:bg-slate-900 transition-all">
              <ArrowLeft size={18} className="text-slate-500 group-hover:text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Revenir au site</span>
            </Link>
            <button 
              onClick={async () => { await supabase.auth.signOut(); window.location.assign('/login'); }}
              className="group flex items-center gap-3 bg-[#0f0f0f] border border-slate-800 px-8 py-4 rounded-2xl hover:bg-red-950/30 transition-all"
            >
              <LogOut size={18} className="text-slate-500 group-hover:text-red-400" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLONNE GAUCHE */}
          <section className="lg:col-span-4 space-y-8">
            {/* GRAPHIQUE */}
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-serif italic text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-red-500" /> Croissance Licences
                </h3>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <div className="flex items-end justify-between h-32 gap-2">
                {monthlyStats.map(([month, count]) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-3 group">
                    <div 
                      style={{ height: count === 0 ? '4px' : `${(count / Math.max(...monthlyStats.map(s => s[1] as number), 1)) * 100}%` }} 
                      className="w-full bg-gradient-to-t from-red-900 to-red-500 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                    />
                    <span className="text-[8px] uppercase font-black text-slate-600">{month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FORMULAIRE */}
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-xl font-serif italic text-white mb-8 flex items-center gap-3">
                <Plus size={20} className="text-red-500" /> Déployer Licence
              </h2>
              <form onSubmit={createAdminAccount} className="space-y-4">
                <input className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-red-600 outline-none transition-colors" placeholder="Nom de l'agence" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                <input className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-red-600 outline-none transition-colors" placeholder="Email admin" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-red-600 outline-none transition-colors" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={isGlobalLoading} className="w-full bg-red-700 hover:bg-red-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                  {isGlobalLoading ? <Loader2 className="animate-spin mx-auto" /> : "Générer Accès"}
                </button>
              </form>
            </div>
          </section>

          {/* COLONNE DROITE */}
          <section className="lg:col-span-8">
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 min-h-full">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-serif italic text-white flex items-center gap-3">
                    <LayoutDashboard size={20} className="text-red-500" /> Agences sous contrat
                 </h2>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-4 py-2 rounded-full border border-slate-800">Live</span>
               </div>
               <div className="space-y-4">
                 {admins.length === 0 ? (
                   <p className="text-slate-600 italic p-12 text-center border border-dashed border-slate-800 rounded-3xl">Aucun contrat actif.</p>
                 ) : (
                   admins.map((admin) => (
                     <div key={admin.id} className="flex items-center justify-between p-6 bg-[#050505] border border-slate-800/40 rounded-[2rem] group hover:border-red-900/40 transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <div className="h-12 w-12 bg-[#0a0a0a] border border-slate-800 rounded-xl flex items-center justify-center text-red-500">
                            <Building2 size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-lg">{admin.company_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{admin.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteAdminAccount(admin.id, admin.company_name)}
                          className="h-10 w-10 flex items-center justify-center text-slate-700 hover:text-red-500 transition-colors"
                        >
                          {deletingId === admin.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}