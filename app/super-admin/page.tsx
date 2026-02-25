"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Building2, Loader2, LogOut, ShieldCheck, XCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
  // CONFIGURATION RENFORCÉE POUR VERCEL
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase-auth-token', // Nom unique pour retrouver ta session
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'super_admin');
    if (!error) setAdmins(data || []);
  }, [supabase]);

  useEffect(() => {
    const checkUser = async (retryCount = 0) => {
      // 1. On récupère l'utilisateur actuel directement (plus fiable que getSession)
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        if (retryCount < 2) {
          console.log(`Tentative ${retryCount + 1}... Session non trouvée.`);
          setTimeout(() => checkUser(retryCount + 1), 1000);
          return;
        }
        setAuthStatus('denied');
        return;
      }

      // 2. Nettoyage strict des emails pour la comparaison
      const loggedInEmail = user.email?.toLowerCase().trim();
      const targetEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();

      console.log("Email connecté:", loggedInEmail);
      console.log("Email attendu:", targetEmail);

      // 3. Vérification du rôle dans la table profiles (Sécurité supplémentaire)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (loggedInEmail === targetEmail || profile?.role === 'super_admin') {
        setAuthStatus('authorized');
        fetchAdmins();
      } else {
        console.error("Accès refusé : Email ou rôle incorrect");
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
          email: email, 
          role: 'admin', 
          company_name: companyName 
        });
        alert(`Licence activée pour ${companyName}`);
        setEmail(""); setPassword(""); setCompanyName("");
        fetchAdmins();
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
          <p className="text-slate-500 font-serif italic">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/20 p-10 rounded-[2.5rem]">
          <XCircle size={60} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-white mb-2">Accès restreint</h2>
          <p className="text-slate-400 text-sm mb-8">Session non trouvée ou email non autorisé.</p>
          <button 
            onClick={() => window.location.assign('/login')}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
          >
            Retour au portail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl border border-emerald-500/20">
              <ShieldCheck size={36} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-serif italic text-white">Super Admin</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">Gaëtan</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.assign('/login'))} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
            <LogOut size={18} /> Déconnexion
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl h-fit text-left">
            <h2 className="text-xl font-serif italic mb-8">Nouveau Partenaire</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="Nom de l'agence" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="Email admin" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Activer la licence"}
              </button>
            </form>
          </section>

          <section className="lg:col-span-8">
            <h2 className="text-xl font-serif italic mb-8 ml-4 text-left">Agences sous contrat</h2>
            <div className="grid grid-cols-1 gap-4">
              {admins.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-800 rounded-[2rem] text-center text-slate-600 italic">Aucune licence active.</div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-[#020617] rounded-2xl text-emerald-500"><Building2 size={24} /></div>
                      <div className="text-left">
                        <p className="font-bold text-lg text-white">{admin.company_name}</p>
                        <p className="text-sm text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase">Licence Active</div>
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