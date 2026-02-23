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

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    // Suppression du .order('created_at') qui fait planter car la colonne n'existe pas chez toi
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'super_admin');

    if (error) {
      console.error("Erreur récupération:", error.message);
    } else {
      setAdmins(data || []);
    }
  }

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
        // Utilisation de upsert pour garantir la création du profil
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

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20">
              <ShieldAlert size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic text-white text-left">Super Admin SaaS Console</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold text-left">Blanca Calida License Management</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-slate-500 hover:text-white">
            <LogOut size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl h-fit text-left">
            <h2 className="text-xl font-serif italic mb-8 text-left">Register a new customer</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <input 
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" 
                placeholder="Agency Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
              />
              <input 
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" 
                placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required 
              />
              <input 
                type="password" className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" 
                placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required 
              />
              <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex justify-center">
                {loading ? <Loader2 className="animate-spin" /> : "Activate License"}
              </button>
            </form>
          </section>

          <section className="lg:col-span-8 text-left">
            <h2 className="text-xl font-serif italic mb-8 ml-4 text-left">Contract agencies</h2>
            <div className="grid grid-cols-1 gap-4">
              {admins.length === 0 ? (
                <p className="text-slate-600 italic ml-4 text-left">No active licenses found.</p>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Building2 size={28} className="text-emerald-500" />
                      <div className="text-left">
                        <p className="font-bold text-lg text-white text-left">{admin.company_name || "Agency"}</p>
                        <p className="text-sm text-slate-500 text-left">{admin.email}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase">
                      Active
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