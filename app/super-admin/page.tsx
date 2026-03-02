"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { 
  Building2, Loader2, LogOut, ShieldCheck, 
  XCircle, Plus, Users, Trash2,
  ArrowLeft, Search, Copy, CheckCircle2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États formulaire
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }); 
      
    if (!error) {
      const filtered = data?.filter(a => a.role !== 'super_admin');
      setAdmins(filtered || []);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAccess = async () => {
      setAuthStatus('loading');
      
      // 1. Récupération de la session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log("DEBUG: Aucun utilisateur trouvé dans la session");
        setAuthStatus('denied');
        return;
      }

      const userEmail = user.email?.toLowerCase().trim();
      const masterEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();

      console.log("DEBUG: Tentative d'accès pour", userEmail);

      // 2. Vérification du rôle dans la table profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // 3. LOGIQUE D'AUTORISATION ULTRA-PRIORITAIRE
      // On autorise si c'est ton email OU si le rôle est super_admin
      if (userEmail === masterEmail || profile?.role === 'super_admin') {
        console.log("DEBUG: Accès autorisé !");
        setAuthStatus('authorized');
        fetchAdmins();
      } else {
        console.log("DEBUG: Accès refusé. Rôle trouvé:", profile?.role);
        setAuthStatus('denied');
      }
    };

    checkAccess();
  }, [supabase, fetchAdmins]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.assign('/login');
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => 
      admin.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: cleanEmail, 
        password 
      });
      
      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: authData.user.id, 
          email: cleanEmail, 
          role: 'admin', 
          company_name: companyName,
          prenom: adminPrenom,
          nom: adminNom,
          pack: pack
        });

        if (profileError) throw profileError;
        alert(`Licence ${pack} créée pour ${companyName}`);
        setEmail(""); setPassword(""); setCompanyName(""); setAdminPrenom(""); setAdminNom("");
        fetchAdmins();
      }
    } catch (err: any) { alert(err.message); } finally { setIsGlobalLoading(false); }
  };

  const deleteAdminAccount = async (adminId: string, company: string) => {
    if (!confirm(`Supprimer ${company} ?`)) return;
    setDeletingId(adminId);
    try {
      await supabase.from('profiles').delete().eq('id', adminId);
      fetchAdmins();
    } catch (err: any) { alert(err.message); } finally { setDeletingId(null); }
  };

  if (authStatus === 'loading') return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  if (authStatus === 'denied') return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
       <div className="bg-[#0a0a0a] border border-red-900/30 p-12 rounded-[3rem] shadow-2xl max-w-md w-full">
          <XCircle size={64} className="text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-white mb-6">Accès Refusé</h2>
          <p className="text-slate-500 mb-8 text-sm">Vérifiez vos logs console ou contactez le support.</p>
          <button onClick={handleLogout} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase text-[10px]">Réinitialiser la session</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 text-left">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic text-white tracking-tight">Super Control</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Gaëtan Admin Engine</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <LogOut size={20} /> Déconnexion
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-xl font-serif italic text-white mb-8 flex items-center gap-3"><Plus size={20} className="text-red-500" /> Nouvelle Agence</h2>
              <form onSubmit={createAdminAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input autoComplete="given-name" placeholder="Prénom" className="bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm" value={adminPrenom} onChange={e => setAdminPrenom(e.target.value)} required />
                  <input autoComplete="family-name" placeholder="Nom" className="bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm" value={adminNom} onChange={e => setAdminNom(e.target.value)} required />
                </div>
                <input autoComplete="organization" placeholder="Agence" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                <select value={pack} onChange={e => setPack(e.target.value)} className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm">
                  <option value="CORE">CORE</option>
                  <option value="ASCENT">ASCENT</option>
                  <option value="HORIZON">HORIZON</option>
                </select>
                <div className="pt-4 border-t border-slate-900 space-y-4">
                  <input autoComplete="email" placeholder="Email" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm" value={email} onChange={e => setEmail(e.target.value)} required />
                  <input type="password" placeholder="Mot de passe" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-sm" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={isGlobalLoading} className="w-full bg-red-700 py-4 mt-6 rounded-xl font-black uppercase text-[10px]">
                  {isGlobalLoading ? <Loader2 className="animate-spin mx-auto" /> : "ACTIVER LA LICENCE"}
                </button>
              </form>
            </div>
          </section>

          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-4">
               <h2 className="text-xl font-serif italic text-white flex items-center gap-3"><Users size={20} className="text-red-500" /> Agences Actives</h2>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="bg-[#0a0a0a] border border-slate-800/60 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{admin.company_name} <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded ml-2">{admin.pack}</span></p>
                    <p className="text-[9px] text-slate-600">{admin.email}</p>
                  </div>
                  <button onClick={() => deleteAdminAccount(admin.id, admin.company_name)} className="text-slate-700 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}