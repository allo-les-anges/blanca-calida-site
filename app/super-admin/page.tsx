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

  // Chargement initial des agences
  useEffect(() => { 
    fetchAdmins(); 
  }, []);

  async function fetchAdmins() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'super_admin') // On affiche tout sauf le super_admin
        .order('email', { ascending: true });

      if (error) throw error;
      if (data) setAdmins(data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des admins:", err.message);
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
      // 1. Inscription dans Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (data?.user) {
        // 2. Création ou mise à jour du profil (UPSERT pour éviter l'erreur 409)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            { 
              id: data.user.id, 
              email: email, 
              role: 'admin', 
              company_name: companyName 
            }
          ], { onConflict: 'id' });

        if (profileError) throw profileError;

        alert(`Licence activée avec succès pour ${companyName}`);
        
        // Réinitialisation du formulaire
        setEmail(""); 
        setPassword(""); 
        setCompanyName("");
        
        // Rafraîchir la liste immédiatement
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
        
        {/* Header */}
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
          <button 
            onClick={handleLogout} 
            className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
            title="Se déconnecter"
          >
            <LogOut size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Formulaire (Colonne Gauche) */}
          <section className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl h-fit">
            <h2 className="text-xl font-serif italic mb-8">Register a new customer</h2>
            <form onSubmit={createAdminAccount} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Agency Name</label>
                <input 
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="Example: Amaru-Homes"
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold">Administrator Email</label>
                <input 
                  type="email"
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
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
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-white text-black py-5 mt-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={16}/> Activate the license</>}
              </button>
            </form>
          </section>

          {/* Liste des Agences (Colonne Droite) */}
          <section className="lg:col-span-8">
            <h2 className="text-xl font-serif italic mb-8 ml-4">Contract agencies</h2>
            <div className="grid grid-cols-1 gap-4">
              {admins.length === 0 ? (
                <div className="bg-[#0f172a]/30 border border-dashed border-slate-800 p-12 rounded-[2rem] text-center">
                  <p className="text-slate-600 italic">No active licenses found.</p>
                </div>
              ) : (
                admins.map((admin) => (
                  <div 
                    key={admin.id} 
                    className="bg-[#0f172a]/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between hover:bg-[#0f172a] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <Building2 size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">
                          {admin.company_name || "Untitled Agency"}
                        </p>
                        <p className="text-sm text-slate-500 font-mono">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={12} /> Active License
                      </span>
                      <span className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">
                        Role: {admin.role}
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