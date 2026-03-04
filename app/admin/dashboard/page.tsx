"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { 
  Building2, Loader2, LogOut, ShieldCheck, 
  XCircle, Plus, Trash2, Search, Copy, 
  CheckCircle2, LayoutDashboard, Globe
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // État du formulaire synchronisé avec ta colonne SQL : agency_name
  const [form, setForm] = useState({
    email: "", password: "", agencyName: "",
    prenom: "", nom: "", pack: "CORE"
  });

  // 1. Chargement des agences
  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }); 
      
    if (!error && data) {
      // On filtre pour ne pas s'auto-supprimer
      setAdmins(data.filter(a => a.email?.toLowerCase() !== 'gaetan@amaru-homes.com'));
    }
  }, [supabase]);

  // 2. Vérification d'accès blindée
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthStatus('denied');
        return;
      }

      const email = session.user.email?.toLowerCase().trim();

      // Master Key : Gaëtan ou Iris (si Iris est Super Admin)
      if (email === 'gaetan@amaru-homes.com' || email === 'iris@amaru-homes.com') {
        setAuthStatus('authorized');
        fetchAdmins();
        return;
      }

      // Vérification SQL pour les autres
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'super_admin') {
        setAuthStatus('authorized');
        fetchAdmins();
      } else {
        setAuthStatus('denied');
      }
    };
    checkAccess();
  }, [supabase, fetchAdmins]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: form.email.toLowerCase().trim(), 
        password: form.password 
      });
      
      if (authError) throw authError;

      if (authData?.user) {
        // CORRECTION ICI : On utilise agency_name comme dans ton SQL
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: authData.user.id, 
          email: form.email.toLowerCase().trim(), 
          role: 'admin', 
          agency_name: form.agencyName, // Nom de colonne corrigé
          prenom: form.prenom,
          nom: form.nom,
          pack: form.pack
        });

        if (profileError) throw profileError;
        alert("Licence activée avec succès.");
        setForm({ email: "", password: "", agencyName: "", prenom: "", nom: "", pack: "CORE" });
        fetchAdmins();
      }
    } catch (err: any) { alert(err.message); }
    finally { setIsGlobalLoading(false); }
  };

  // Filtrage pour la recherche
  const filteredAdmins = useMemo(() => {
    return admins.filter(a => 
      a.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  if (authStatus === 'loading') return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;
  if (authStatus === 'denied') return (
    <div className="h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="bg-[#0a0a0a] p-10 rounded-[2rem] border border-red-900/20">
        <XCircle size={48} className="text-red-600 mx-auto mb-4" />
        <h2 className="text-xl text-white mb-6">Accès restreint au Super Admin</h2>
        <button onClick={handleLogout} className="bg-white text-black px-8 py-3 rounded-lg font-bold text-xs uppercase">Changer de session</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
             <ShieldCheck className="text-red-600" size={32} />
             <h1 className="text-2xl font-serif italic">Terminal de Contrôle</h1>
          </div>
          <button onClick={handleLogout} className="p-3 bg-white/5 rounded-xl hover:text-red-500"><LogOut size={20}/></button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* FORMULAIRE */}
          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-red-500">Nouvelle Licence</h2>
            <form onSubmit={createAdminAccount} className="space-y-4">
              <input placeholder="Agence (ex: Amaru Prestige)" className="w-full bg-black border border-white/10 p-4 rounded-xl" value={form.agencyName} onChange={e => setForm({...form, agencyName: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Prénom" className="w-full bg-black border border-white/10 p-4 rounded-xl" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} />
                <input placeholder="Nom" className="w-full bg-black border border-white/10 p-4 rounded-xl" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
              </div>
              <input placeholder="Email admin" className="w-full bg-black border border-white/10 p-4 rounded-xl" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              <input type="password" placeholder="Mot de passe" className="w-full bg-black border border-white/10 p-4 rounded-xl" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="submit" className="w-full bg-red-600 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                {isGlobalLoading ? "Action en cours..." : "Déployer la licence"}
              </button>
            </form>
          </div>

          {/* LISTE */}
          <div className="space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input placeholder="Filtrer les agences..." className="w-full bg-[#0a0a0a] border border-white/5 pl-12 pr-4 py-3 rounded-full text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
              {filteredAdmins.map(admin => (
                <div key={admin.id} className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-white uppercase text-xs tracking-tight">{admin.agency_name || "Sans Nom"}</p>
                    <p className="text-[10px] text-slate-500">{admin.email}</p>
                  </div>
                  <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] text-red-500 font-black">{admin.pack}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}