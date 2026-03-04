"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { 
  Building2, Loader2, LogOut, ShieldCheck, 
  XCircle, Plus, Trash2, ArrowLeft, Search, Copy, 
  CheckCircle2, LayoutDashboard, Globe
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ÉTATS AUTH
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // ÉTATS DONNÉES
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // FORMULAIRE
  const [form, setForm] = useState({
    email: "", password: "", companyName: "",
    prenom: "", nom: "", pack: "CORE"
  });

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. CHARGEMENT DES AGENCES (Optimisé)
  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }); 
      
    if (!error && data) {
      // Filtrer Gaëtan de la liste pour éviter l'auto-suppression accidentelle
      const filtered = data.filter(a => a.email?.toLowerCase().trim() !== 'gaetan@amaru-homes.com');
      setAdmins(filtered);
    }
  }, [supabase]);

  // 2. VÉRIFICATION ACCÈS (Correction du bug de blocage)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setAuthStatus('denied');
          return;
        }

        const email = session.user.email?.toLowerCase().trim();
        setUserEmail(email || null);

        // --- PRIORITÉ ABSOLUE GAËTAN ---
        if (email === 'gaetan@amaru-homes.com') {
          setAuthStatus('authorized');
          await fetchAdmins();
          return;
        }

        // Vérification du rôle pour les autres super-admins éventuels
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'super_admin') {
          setAuthStatus('authorized');
          await fetchAdmins();
        } else {
          setAuthStatus('denied');
        }
      } catch (err) {
        setAuthStatus('denied');
      }
    };

    checkAccess();
  }, [supabase, fetchAdmins]);

  // 3. ACTIONS
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      // Création Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: form.email.toLowerCase().trim(), 
        password: form.password 
      });
      
      if (authError) throw authError;

      if (authData?.user) {
        // Création Profil avec upsert pour écraser si doublon
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: authData.user.id, 
          email: form.email.toLowerCase().trim(), 
          role: 'admin', 
          company_name: form.companyName,
          prenom: form.prenom,
          nom: form.nom,
          pack: form.pack
        });

        if (profileError) throw profileError;
        
        alert("Compte partenaire activé.");
        setForm({ email: "", password: "", companyName: "", prenom: "", nom: "", pack: "CORE" });
        fetchAdmins();
      }
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setIsGlobalLoading(false); 
    }
  };

  const deleteAdminAccount = async (adminId: string, company: string) => {
    if (!confirm(`Révoquer l'accès de ${company} ?`)) return;
    setDeletingId(adminId);
    const { error } = await supabase.from('profiles').delete().eq('id', adminId);
    if (!error) fetchAdmins();
    setDeletingId(null);
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter(a => 
      a.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  // RENDUS CONDITIONNELS
  if (authStatus === 'loading') return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  if (authStatus === 'denied') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-[#0a0a0a] border border-red-900/30 p-12 rounded-[3rem] text-center max-w-md">
        <XCircle size={64} className="text-red-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Accès Non Autorisé</h2>
        <p className="text-slate-500 text-sm mb-8">Email actuel : {userEmail || "Déconnecté"}</p>
        <button onClick={handleLogout} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase text-xs tracking-widest">Reconnexion</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif italic text-white">Super Control</h1>
              <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em]">Master Engine</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-white/5 p-4 rounded-xl hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* FORMULAIRE */}
          <section className="lg:col-span-5 bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem]">
            <h2 className="text-lg font-serif italic text-white mb-8">Déployer un Partenaire</h2>
            <form onSubmit={createAdminAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Prénom" className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-600" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required />
                <input placeholder="Nom" className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-600" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
              </div>
              <input placeholder="Nom de l'agence" className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-600" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required />
              <select className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm outline-none" value={form.pack} onChange={e => setForm({...form, pack: e.target.value})}>
                <option value="CORE">CORE (2 Experts)</option>
                <option value="ASCENT">ASCENT (10 Experts)</option>
                <option value="HORIZON">HORIZON (Illimité)</option>
              </select>
              <div className="h-px bg-white/5 my-4" />
              <input placeholder="Email login" className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-600" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              <input type="password" placeholder="Mot de passe" className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-600" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="submit" disabled={isGlobalLoading} className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all">
                {isGlobalLoading ? <Loader2 className="animate-spin mx-auto" /> : "CRÉER LE COMPTE ADMIN"}
              </button>
            </form>
          </section>

          {/* LISTE */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-serif italic text-white">Database Partenaires</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input placeholder="Rechercher..." className="bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-red-900" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAdmins.map(admin => (
                <div key={admin.id} className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-red-900/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-red-600 border border-white/5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{admin.company_name} <span className="text-[8px] text-red-500 ml-2 uppercase">{admin.pack}</span></p>
                      <p className="text-[10px] text-slate-500">{admin.email}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteAdminAccount(admin.id, admin.company_name)} className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }`}</style>
    </div>
  );
}