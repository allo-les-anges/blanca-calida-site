"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function ProfessionalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Erreur de connexion : " + error.message);
      setLoading(false);
      return;
    }

    // Récupération sécurisée du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, company_name')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      alert("Profil non trouvé. Assurez-vous d'avoir ajouté votre UID dans la table 'profiles' sur Supabase.");
      setLoading(false);
      return;
    }

    // Système de redirection
    if (profile.role === 'super_admin') {
      router.push('/super-admin');
    } else if (profile.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      alert(`Bienvenue ${profile.company_name || ""}. Rôle : ${profile.role}.`);
      router.push('/'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-[#0f172a] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif italic text-white">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Professional Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={18} />
            <input 
              type="email" placeholder="Email Address" required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-emerald-500 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
            <input 
              type="password" placeholder="Password" required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-emerald-500 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}