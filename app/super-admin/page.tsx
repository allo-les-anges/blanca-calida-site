"use client";
import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShieldAlert, UserPlus, Building2, Loader2, LogOut, CheckCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    if (data) setAdmins(data);
  }

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Création de l'utilisateur dans Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          role: 'admin',
          company_name: companyName 
        } 
      }
    });

    if (data?.user) {
      // 2. Création du profil avec le rôle admin
      await supabase.from('profiles').insert([
        { id: data.user.id, email, role: 'admin' }
      ]);
      alert(`Compte Admin créé pour ${companyName}`);
      setEmail(""); setPassword(""); setCompanyName("");
      fetchAdmins();
    }
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif italic">Console SaaS Super Admin</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">Gestion des licences Blanca Calida</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulaire de création d'agence */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-lg font-serif italic mb-6">Enregistrer un nouveau client</h2>
            <form onSubmit={createAdminAccount} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2">Nom de l'agence</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm"
                  placeholder="Ex: Agence Immobilière X"
                  value={companyName} onChange={e => setCompanyName(e.target.value)} required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2">Email Administrateur</label>
                <input 
                  type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm"
                  placeholder="admin@client.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2">Mot de passe</label>
                <input 
                  type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={16}/> Activer la licence</>}
              </button>
            </form>
          </div>

          {/* Liste des licences actives */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-serif italic mb-6">Agences sous contrat</h2>
            {admins.map((admin) => (
              <div key={admin.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-2xl text-slate-400">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{admin.email}</p>
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase">
                      <CheckCircle size={10} /> Licence Active
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Rôle</p>
                  <p className="text-xs font-mono text-white">ADMIN_CORE</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}