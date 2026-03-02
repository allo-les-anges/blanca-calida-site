"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { 
  Building2, Loader2, LogOut, ShieldCheck, 
  XCircle, Plus, Users, LayoutDashboard, Trash2,
  ArrowLeft, Zap, Search, Copy, CheckCircle2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Formulaire de création
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [adminPrenom, setAdminPrenom] = useState("");
  const [adminNom, setAdminNom] = useState("");
  const [pack, setPack] = useState("CORE");
  
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      if (!user) { setAuthStatus('denied'); return; }
      
      const targetEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();
      if (user.email?.toLowerCase().trim() === targetEmail) {
        setAuthStatus('authorized');
        fetchAdmins();
      } else { setAuthStatus('denied'); }
    };
    checkUser();
  }, [supabase, fetchAdmins]);

  // LOGIQUE DE FILTRE (NOM OU ID)
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => 
      admin.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: authData.user.id, 
          email: email.toLowerCase().trim(), 
          role: 'admin', 
          company_name: companyName,
          prenom: adminPrenom,
          nom: adminNom,
          pack: pack
        });

        if (profileError) throw profileError;

        alert(`Licence ${pack} créée avec succès !`);
        setEmail(""); setPassword(""); setCompanyName(""); setAdminPrenom(""); setAdminNom("");
        fetchAdmins();
      }
    } catch (err: any) { alert(err.message); } finally { setIsGlobalLoading(false); }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authStatus === 'loading') return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans">
      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 text-left">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic text-white tracking-tight">Super Control</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Gaëtan Admin Engine</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/" className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#0f0f0f] border border-slate-800 px-6 py-3 rounded-xl hover:bg-slate-900 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
              <ArrowLeft size={16} /> Site
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* SECTION CRÉATION (5 COLONNES) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl text-left">
              <h2 className="text-xl font-serif italic text-white mb-8 flex items-center gap-3">
                <Plus size={20} className="text-red-500" /> Nouvelle Agence Partner
              </h2>

              <form onSubmit={createAdminAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Prénom Admin</label>
                    <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" placeholder="Iris" value={adminPrenom} onChange={e => setAdminPrenom(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Nom Admin</label>
                    <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" placeholder="Luxe" value={adminNom} onChange={e => setAdminNom(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Nom de l'agence</label>
                  <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" placeholder="Nom de l'agence" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Pack Licence</label>
                  <select value={pack} onChange={e => setPack(e.target.value)} className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-red-600">
                    <option value="CORE">CORE (2 Experts)</option>
                    <option value="ASCENT">ASCENT (10 Experts)</option>
                    <option value="HORIZON">HORIZON (Illimité)</option>
                  </select>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Email de connexion</label>
                    <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" placeholder="admin@agence.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Mot de passe</label>
                    <input type="password" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-red-600 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" disabled={isGlobalLoading} className="w-full bg-red-700 hover:bg-red-600 py-4 mt-6 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                  {isGlobalLoading ? <Loader2 className="animate-spin mx-auto" /> : "Générer l'accès Partner"}
                </button>
              </form>
            </div>
          </section>

          {/* SECTION LISTE & FILTRES (7 COLONNES) */}
          <section className="lg:col-span-7 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
              <h2 className="text-xl font-serif italic text-white flex items-center gap-3">
                <Users size={20} className="text-red-500" /> Agences sous contrat
              </h2>
              
              {/* BARRE DE RECHERCHE DYNAMIQUE */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  type="text" 
                  placeholder="Rechercher Nom ou ID..." 
                  className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-slate-800 rounded-full text-[11px] outline-none focus:border-red-900/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAdmins.length === 0 ? (
                <div className="p-20 border border-dashed border-slate-800 rounded-[3rem] text-center opacity-50">
                  <p className="font-serif italic text-slate-500">Aucune agence ne correspond à votre recherche.</p>
                </div>
              ) : (
                filteredAdmins.map((admin) => (
                  <div key={admin.id} className="group bg-[#0a0a0a] border border-slate-800/60 p-6 rounded-[2rem] hover:border-red-900/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-black border border-slate-800 rounded-xl flex items-center justify-center text-red-600">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-white group-hover:text-red-500 transition-colors">{admin.company_name || 'Sans Nom'}</p>
                            <span className="text-[8px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-black tracking-tighter">{admin.pack}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] font-mono text-slate-600 truncate max-w-[150px]">ID: {admin.id}</p>
                            <button 
                              onClick={() => copyToClipboard(admin.id)} 
                              className="text-slate-700 hover:text-white transition-colors"
                              title="Copier l'ID"
                            >
                              {copiedId === admin.id ? <CheckCircle2 size={10} className="text-emerald-500" /> : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{admin.prenom} {admin.nom}</p>
                          <p className="text-[9px] text-slate-600">{admin.email}</p>
                        </div>
                        <button 
                          onClick={() => deleteAdminAccount(admin.id, admin.company_name)}
                          disabled={deletingId === admin.id}
                          className="h-10 w-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-700 hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          {deletingId === admin.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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