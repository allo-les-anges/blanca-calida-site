"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, Loader2, LogOut, ShieldCheck, 
  XCircle, Plus, Trash2, ArrowLeft, Search, 
  Copy, CheckCircle2, LayoutDashboard, Globe
} from 'lucide-react';
import { supabase } from "@/lib/supabase"; // Importation centralisée

export default function SuperAdminDashboard() {
  const router = useRouter();

  // ÉTATS DE NAVIGATION ET AUTH
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // ÉTATS DES DONNÉES
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ÉTATS FORMULAIRE GROUPÉS (Plus court, plus propre)
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    prenom: "",
    nom: "",
    pack: "CORE"
  });
  
  // ÉTATS UI
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. CHARGEMENT DES AGENCES
  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }); 
      
    if (!error && data) {
      // On filtre Gaëtan pour la liste
      setAdmins(data.filter(a => a.email?.toLowerCase().trim() !== 'gaetan@amaru-homes.com'));
    }
  }, []);

  // 2. VÉRIFICATION DE L'ACCÈS
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthStatus('denied');
          return;
        }

        const email = session.user.email?.toLowerCase().trim();
        setUserEmail(email || null);

        // Autorisation si Gaëtan OU si rôle super_admin
        if (email === 'gaetan@amaru-homes.com') {
          setAuthStatus('authorized');
          fetchAdmins();
        } else {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role?.toLowerCase().includes('super')) {
            setAuthStatus('authorized');
            fetchAdmins();
          } else {
            setAuthStatus('denied');
          }
        }
      } catch (err) {
        setAuthStatus('denied');
      }
    };
    checkAccess();
  }, [fetchAdmins]);

  // 3. ACTIONS
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.replace('/login');
  };

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      // Inscription dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: form.email.toLowerCase().trim(), 
        password: form.password 
      });
      
      if (authError) throw authError;

      if (authData?.user) {
        // Insertion dans la table profiles
        const { error: profileError } = await supabase.from('profiles').insert({ 
          id: authData.user.id, 
          email: form.email.toLowerCase().trim(), 
          role: 'admin', 
          company_name: form.companyName,
          prenom: form.prenom,
          nom: form.nom,
          pack: form.pack
        });

        if (profileError) throw profileError;
        
        alert(`Licence ${form.pack} activée.`);
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
    if (!confirm(`Révoquer définitivement l'accès de "${company}" ?`)) return;
    setDeletingId(adminId);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', adminId);
      if (error) throw error;
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter(a => 
      a.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  // RENDUS CONDITIONNELS (Chargement / Refus)
  if (authStatus === 'loading') return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono text-xs uppercase tracking-widest">
      <Loader2 className="animate-spin text-red-600 mr-3" /> Initialisation du terminal...
    </div>
  );

  if (authStatus === 'denied') return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white text-center">
      <div className="bg-[#0a0a0a] border border-red-900/30 p-12 rounded-[3rem] shadow-2xl max-w-md w-full">
        <XCircle size={64} className="text-red-600 mx-auto mb-6" />
        <h2 className="text-3xl font-serif mb-6">Accès Refusé</h2>
        <p className="text-slate-500 mb-8 text-sm">Session : {userEmail || "Inconnue"}</p>
        <button onClick={handleLogout} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-200">Changer de session</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-red-500/30">
      {/* Background Effet Blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic text-white tracking-tight">Super Control</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Gaëtan Admin Engine
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/" className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#0f0f0f] border border-slate-800 px-6 py-3 rounded-xl hover:bg-slate-900 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ArrowLeft size={16} /> Site Public
            </Link>
            <button onClick={handleLogout} className="h-12 w-12 flex items-center justify-center bg-[#0f0f0f] border border-slate-800 rounded-xl hover:bg-red-950/30 transition-all text-slate-500">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Section Formulaire */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-xl font-serif italic text-white mb-8 flex items-center gap-3">
                <Plus size={20} className="text-red-500" /> Déployer une licence
              </h2>
              <form onSubmit={createAdminAccount} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Prénom</label>
                    <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Nom</label>
                    <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Agence / Partenaire</label>
                  <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Niveau du Pack</label>
                  <select className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-red-600" value={form.pack} onChange={e => setForm({...form, pack: e.target.value})}>
                    <option value="CORE">CORE (2 Experts)</option>
                    <option value="ASCENT">ASCENT (10 Experts)</option>
                    <option value="HORIZON">HORIZON (Illimité)</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-900 space-y-4">
                  <input placeholder="Email de connexion" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  <input type="password" placeholder="Mot de passe" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                </div>
                <button type="submit" disabled={isGlobalLoading} className="w-full bg-red-700 hover:bg-red-600 py-4 mt-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all">
                  {isGlobalLoading ? <Loader2 className="animate-spin mx-auto" /> : "ACTIVER LA LICENCE PARTNER"}
                </button>
              </form>
            </div>
            
            <div className="bg-gradient-to-br from-red-950/20 to-transparent border border-red-900/20 rounded-3xl p-8 flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Total Agences Actives</p>
                <p className="text-3xl font-serif italic text-white">{admins.length}</p>
              </div>
              <Globe size={32} className="text-red-900/40" />
            </div>
          </section>

          {/* Section Liste */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-xl font-serif italic text-white flex items-center gap-3">
                <LayoutDashboard size={20} className="text-red-500" /> Database Live
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  placeholder="Rechercher..." 
                  className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-slate-800 rounded-full text-[11px] outline-none focus:border-red-900 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="group bg-[#0a0a0a] border border-slate-800/60 p-6 rounded-[2rem] hover:border-red-900/40 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 bg-black border border-slate-800 rounded-xl flex items-center justify-center text-red-600">
                        <Building2 size={20} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-white text-lg">{admin.company_name}</p>
                          <span className="text-[8px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-black">{admin.pack}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-mono text-slate-600">ID: {admin.id}</p>
                          <button onClick={() => copyToClipboard(admin.id)} className="text-slate-700 hover:text-white transition-colors">
                            {copiedId === admin.id ? <CheckCircle2 size={10} className="text-emerald-500" /> : <Copy size={10} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{admin.prenom} {admin.nom}</p>
                        <p className="text-[9px] text-slate-600">{admin.email}</p>
                      </div>
                      <button 
                        onClick={() => deleteAdminAccount(admin.id, admin.company_name)}
                        className="h-11 w-11 rounded-xl border border-slate-800 flex items-center justify-center text-slate-700 hover:text-red-500 transition-all bg-black"
                        disabled={deletingId === admin.id}
                      >
                        {deletingId === admin.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}