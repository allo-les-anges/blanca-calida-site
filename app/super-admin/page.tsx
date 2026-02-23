"use client";
import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ShieldAlert, UserPlus, Building2, Loader2, LogOut, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
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
      .neq('role', 'super_admin'); // On affiche tout le monde sauf vous
    if (data) setAdmins(data);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data?.user) {
      // On insère avec le role ET le company_name
      const { error: insertError } = await supabase.from('profiles').insert([
        { 
          id: data.user.id, 
          email, 
          role: 'admin', 
          company_name: companyName 
        }
      ]);

      if (insertError) {
        alert("Erreur table profiles: " + insertError.message);
      } else {
        alert(`Licence activée pour ${companyName}`);
        setEmail(""); setPassword(""); setCompanyName("");
        fetchAdmins();
      }
    }
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif italic">Console SaaS Super Admin</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">Blanca Calida Management</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-lg font-serif italic mb-6">Nouveau Client</h2>
            <form onSubmit={createAdminAccount} className="space-y-4">
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm"
                placeholder="Nom de l'agence"
                value={companyName} onChange={e => setCompanyName(e.target.value)} required
              />
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm"
                placeholder="Email Admin"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
              <input 
                type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm"
                placeholder="Mot de passe"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
              <button type="submit" disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Activer la licence"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-serif italic mb-6">Agences & Comptes</h2>
            {admins.map((admin) => (
              <div key={admin.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-2xl text-slate-400">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{admin.company_name || "Sans nom"}</p>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase">
                  <CheckCircle size={12} /> {admin.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}