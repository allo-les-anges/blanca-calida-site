"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShieldAlert, Building2, Loader2, LogOut, ShieldCheck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  
  // Initialisation synchronisée avec la page login et sécurisée pour le build
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'blanca-calida-auth-token', // Identique à la page login
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      }
    }
  );

  // États de l'interface
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [debugInfo, setDebugInfo] = useState("");
  
  // États du dashboard
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);

  // Récupération des agences
  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'super_admin');

    if (error) {
      console.error("Erreur récupération:", error.message);
    } else {
      setAdmins(data || []);
    }
  }, [supabase]);

  // Vérification de la session au chargement
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setDebugInfo("Aucune session trouvée. Veuillez vous reconnecter.");
          setAuthStatus('denied');
          return;
        }

        const userEmail = session.user.email?.toLowerCase().trim();
        const masterEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();

        if (userEmail === masterEmail) {
          setAuthStatus('authorized');
          fetchAdmins();
        } else {
          setDebugInfo(`Accès refusé pour : ${userEmail}`);
          setAuthStatus('denied');
        }
      } catch (err: any) {
        setDebugInfo("Erreur de connexion au serveur d'authentification.");
        setAuthStatus('denied');
      }
    };
    
    checkUser();
  }, [supabase, fetchAdmins]);

  // Création d'un compte agence
  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            role: 'admin',
            company_name: companyName
          });

        if (profileError) throw profileError;

        alert(`Succès : Licence activée pour ${companyName}`);
        setEmail(""); setPassword(""); setCompanyName("");
        fetchAdmins();
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ÉCRANS DE TRANSITION ET SÉCURITÉ ---

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
          <p className="text-slate-500 font-serif italic tracking-widest">Vérification de l'identité...</p>
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
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">{debugInfo}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
          >
            Retour au login
          </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD PRINCIPAL ---

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl border border-emerald-500/20">
              <ShieldCheck size={36} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-serif italic text-white">Super Admin Console</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">Gestion des Licences Blanca Calida</p>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} 
            className="text-slate-500 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 transition-all"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
          {/* Formulaire de création */}
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl h-fit">
            <h2 className="text-xl font-serif italic mb-8">Nouveau Partenaire</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-500 font-bold ml-2">Agence</label>
                <input 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="Nom de l'agence" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-500 font-bold ml-2">Identifiant Email</label>
                <input 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="email@agence.com" value={email} onChange={e => setEmail(e.target.value)} required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-500 font-bold ml-2">Mot de passe</label>
                <input 
                  type="password" className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all flex justify-center shadow-xl shadow-emerald-500/10 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : "Activer la licence"}
              </button>
            </form>
          </section>

          {/* Liste des agences */}
          <section className="lg:col-span-8">
            <h2 className="text-xl font-serif italic mb-8 ml-4">Agences sous contrat</h2>
            <div className="grid grid-cols-1 gap-4">
              {admins.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-800 rounded-[2rem] text-center text-slate-600 italic">
                  Aucune agence partenaire enregistrée.
                </div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="group bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-[#020617] rounded-2xl border border-slate-800 text-emerald-500 group-hover:scale-110 transition-transform">
                        <Building2 size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg text-white">{admin.company_name || "Agence Partenaire"}</p>
                        <p className="text-sm text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                      Licence Active
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