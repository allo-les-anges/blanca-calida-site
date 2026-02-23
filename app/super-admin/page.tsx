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
    const { data } = await supabase.from('profiles').select('*').neq('role', 'super_admin'); 
    if (data) setAdmins(data);
  }

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. On crée l'utilisateur (Le Trigger SQL va créer le profil admin automatiquement)
    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      alert("Erreur Auth : " + authError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // 2. On attend 1s pour être sûr que le profil est créé par le trigger, puis on update le nom
      await new Promise(r => setTimeout(r, 1000));
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ company_name: companyName })
        .eq('id', data.user.id);

      if (updateError) console.error("Update non critique:", updateError.message);

      alert(`Licence activée pour ${companyName}`);
      setEmail(""); setPassword(""); setCompanyName("");
      fetchAdmins();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20 shadow-lg shadow-red-500/5">
              <ShieldAlert size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-serif italic tracking-tight text-white">Super Admin SaaS Console</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">Blanca Calida License Management</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-3 text-slate-500 hover:text-white transition-all">
            <LogOut size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-xl font-serif italic mb-8">Register a new customer</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white" placeholder="Agency Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Activate License"}
              </button>
            </form>
          </section>

          <section className="lg:col-span-8">
            <h2 className="text-xl font-serif italic mb-8 ml-4">Contract agencies</h2>
            <div className="grid grid-cols-1 gap-4 text-white">
              {admins.length === 0 && <p className="text-slate-600 italic">No active licenses.</p>}
              {admins.map((admin) => (
                <div key={admin.id} className="bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Building2 size={28} className="text-emerald-500" />
                    <div>
                      <p className="font-bold text-lg">{admin.company_name || "New Agency"}</p>
                      <p className="text-sm text-slate-500">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={12} /> Active
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Role: {admin.role}</span>
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