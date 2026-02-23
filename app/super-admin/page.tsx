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

  // Chargement des données au démarrage
  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    console.log("Tentative de récupération des profils...");
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'super_admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération :", error.message);
    } else {
      console.log("Admins récupérés :", data);
      setAdmins(data || []);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Création du compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        console.log("Utilisateur Auth créé avec ID:", authData.user.id);

        // 2. On utilise UPSERT au lieu de UPDATE pour être certain que la ligne existe avec le bon nom
        // Cela règle le problème si le Trigger SQL est plus lent que le code
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            role: 'admin',
            company_name: companyName
          }, { onConflict: 'id' });

        if (profileError) throw profileError;

        alert(`Succès : La licence pour ${companyName} est maintenant active.`);
        
        // Réinitialisation
        setEmail("");
        setPassword("");
        setCompanyName("");
        
        // Rafraîchir la liste
        await fetchAdmins();
      }
    } catch (err: any) {
      console.error("Erreur complète :", err);
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
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
          <button 
            onClick={handleLogout} 
            className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all flex items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Logout</span>
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* FORMULAIRE DE CRÉATION */}
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl h-fit">
            <h2 className="text-xl font-serif italic mb-8">Register a new customer</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Agency Name</label>
                <input 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="e.g. Amaru-Homes" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Admin Email</label>
                <input 
                  type="email"
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="admin@agency.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-white text-black py-5 mt-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={16}/> Activate License</>}
              </button>
            </form>
          </section>

          {/* LISTE DES AGENCES */}
          <section className="lg:col-span-8">
            <h2 className="text-xl font-serif italic mb-8 ml-4">Contract agencies</h2>
            <div className="grid grid-cols-1 gap-4 text-white">
              {admins.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-800 rounded-[2rem] text-center">
                   <p className="text-slate-600 italic">No active licenses found in the database.</p>
                </div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between hover:border-slate-600 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-slate-800 rounded-2xl text-emerald-500">
                        <Building2 size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{admin.company_name || "New Agency"}</p>
                        <p className="text-sm text-slate-500 font-mono">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={12} /> Active
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        UID: {admin.id.substring(0, 8)}...
                      </span>
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