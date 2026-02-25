"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase-auth-token', 
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
  const userEmail = data.session.user.email;
  console.log("Connexion réussie pour :", userEmail);
  
  setTimeout(() => {
    if (userEmail === 'gaetan@amaru-homes.com') {
      // Gaëtan (Superviseur) va vers la gestion globale
      window.location.assign('/super-admin');
    } else {
      // Les partenaires (Iris, etc.) vont vers leur dashboard spécifique
      // On utilise le chemin que tu m'as donné : /admin/dashboard
      window.location.assign('/admin/dashboard');
    }
  }, 800);
}
    } catch (error: any) {
      alert("Erreur : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md bg-[#0f172a] p-10 rounded-[2rem] border border-slate-800 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif italic text-emerald-500 tracking-tight">Blanca Calida</h1>
          {/* TITRE MIS À JOUR ICI */}
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Espace de Connexion</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold tracking-widest text-left">Identifiant</label>
            <input 
              type="email" 
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-colors text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold tracking-widest text-left">Mot de passe</label>
            <input 
              type="password" 
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-colors text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-50 mt-4 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Entrer dans le système"}
          </button>
        </div>
      </form>
    </div>
  );
}