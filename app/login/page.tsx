"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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

    // 1. Connexion Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      alert("Erreur Auth : " + authError.message);
      setLoading(false);
      return;
    }

    // 2. Récupération du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error("Détails erreur profil:", profileError);
      alert("Profil trouvé dans Auth mais pas dans la table 'profiles'. Vérifiez les RLS.");
      setLoading(false);
      return;
    }

    // 3. Redirection
    if (profile?.role === 'super_admin') {
      router.push('/super-admin');
    } else {
      router.push('/'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-[#0f172a] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif italic text-white">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold font-sans">Accès Professionnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 font-sans">
          <input 
            type="email" placeholder="Email" required
            className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Mot de passe" required
            className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}