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
      const filtered = data?.filter(a => a.email?.toLowerCase().trim() !== 'gaetan@amaru-homes.com');
      setAdmins(filtered || []);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setAuthStatus('denied');
          return;
        }

        // --- LA MASTER KEY (ULTRA-SÉCURISÉE) ---
        const userEmail = user.email?.toLowerCase().trim();
        const masterEmail = 'gaetan@amaru-homes.com'.toLowerCase().trim();

        if (userEmail === masterEmail) {
          console.log("Accès Master Key accordé pour:", userEmail);
          setAuthStatus('authorized');
          fetchAdmins();
          return; // On s'arrête là, Gaëtan a tous les droits
        }

        // --- VERIFICATION SECONDAIRE PAR ROLE ---
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'super_admin') {
          setAuthStatus('authorized');
          fetchAdmins();
        } else {
          setAuthStatus('denied');
        }
      } catch (err) {
        console.error("Erreur auth:", err);
        setAuthStatus('denied');
      }
    };

    checkAccess();
  }, [supabase, fetchAdmins]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  // ... (Garder le reste des fonctions createAdminAccount, deleteAdminAccount, copyToClipboard à l'identique)
  
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
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (authError) throw authError;
      if (authData?.user) {
        await supabase.from('profiles').upsert({ 
          id: authData.user.id, email: cleanEmail, role: 'admin', 
          company_name: companyName, prenom: adminPrenom, nom: adminNom, pack: pack
        });
        alert(`Licence activée.`);
        setEmail(""); setPassword(""); setCompanyName(""); fetchAdmins();
      }
    } catch (err: any) { alert(err.message); } finally { setIsGlobalLoading(false); }
  };

  const deleteAdminAccount = async (adminId: string, company: string) => {
    if (!confirm(`Révoquer "${company}" ?`)) return;
    setDeletingId(adminId);
    try {
      await supabase.from('profiles').delete().eq('id', adminId);
      fetchAdmins();
    } catch (err: any) { alert(err.message); } finally { setDeletingId(null); }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
          <p className="text-slate-500 mb-8 text-sm">Seul Gaëtan peut accéder à ce terminal.</p>
          <button onClick={handleLogout} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase text-[10px]">Changer de compte</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-serif italic text-white">Super Control</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">Gaëtan Admin Engine</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-[#0f0f0f] border border-slate-800 p-4 rounded-xl hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          {/* Formulaire et Liste (le reste du JSX reste identique à ton design premium) */}
          <section className="lg:col-span-5">
             <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8">
                <h2 className="text-xl font-serif italic text-white mb-8">Nouvelle Agence</h2>
                <form onSubmit={createAdminAccount} className="space-y-4">
                   <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white" placeholder="Prénom" value={adminPrenom} onChange={e => setAdminPrenom(e.target.value)} required />
                   <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white" placeholder="Nom" value={adminNom} onChange={e => setAdminNom(e.target.value)} required />
                   <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white" placeholder="Nom de l'agence" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                   <input className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                   <input type="password" className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
                   <button className="w-full bg-red-700 py-4 rounded-xl font-black text-[10px] tracking-widest">ACTIVER LA LICENCE</button>
                </form>
             </div>
          </section>

          <section className="lg:col-span-7">
             <h2 className="text-xl font-serif italic text-white mb-8">Agences Actives</h2>
             <div className="space-y-4">
                {filteredAdmins.map(admin => (
                   <div key={admin.id} className="bg-[#0a0a0a] border border-slate-800/60 p-6 rounded-[2rem] flex justify-between items-center">
                      <div>
                         <p className="font-bold text-white">{admin.company_name}</p>
                         <p className="text-[10px] text-slate-500">{admin.email}</p>
                      </div>
                      <button onClick={() => deleteAdminAccount(admin.id, admin.company_name)} className="text-slate-600 hover:text-red-500">
                         <Trash2 size={18} />
                      </button>
                   </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}