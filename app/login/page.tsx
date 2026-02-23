"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';

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
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    // On récupère le rôle dans la table profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // REDIRECTION INTELLIGENTE
    if (profile?.role === 'super_admin') {
      router.push('/super-admin');
    } else if (profile?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (profile?.role === 'admin_chantier') {
      router.push('/admin-chantier');
    } else {
      // Si c'est un client classique, on l'envoie vers son tracker
      router.push('/mon-projet'); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 rounded-[2.5rem] p-10 border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif italic text-white">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-bold">Accès Professionnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Mot de passe" required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}