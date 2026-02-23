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
      .neq('role', 'super_admin'); 
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
      await supabase.from('profiles').insert([
        { id: data.user.id, email, role: 'admin', company_name: companyName }
      ]);
      alert(`Licence activée pour ${companyName}`);
      setEmail(""); setPassword(""); setCompanyName("");
      fetchAdmins();
    } else if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 shadow-lg shadow-red-500/5">
              <ShieldAlert size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic tracking-tight">Super Admin SaaS Console</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">Blanca Calida License Management</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all">
            <LogOut size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-xl font-serif italic mb-8">Register a new customer</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Agency Name</label>
                <input 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="Example: Real Estate Agency X"
                  value={companyName} onChange={e => setCompanyName(e.target.value)} required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Administrator Email</label>
                <input 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="admin@agency.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Password</label>
                <input 
                  type="password" className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 mt-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={16}/> Activate the license</>}
              </button>
            </form>
          </section>

          <section className="lg:col-span-8">
            <h2 className="text-xl font-serif italic mb-8 ml-4">Contract agencies</h2>
            <div className="grid grid-cols-1 gap-4">
              {admins.length === 0 && <p className="text-slate-600 italic ml-4">No active licenses found.</p>}
              {admins.map((admin) => (
                <div key={admin.id} className="bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between hover:bg-[#0f172a] transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white">{admin.company_name || "New Agency"}</p>
                      <p className="text-sm text-slate-500 font-mono">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={12} /> Active License
                    </span>
                    <span className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">Role: {admin.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}