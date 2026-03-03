"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialisation du client Supabase SSR
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 1. Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) throw error;

      // 2. Si la session existe, on la sécurise et on redirige
      if (data?.session) {
        console.log("Connexion réussie, stockage session...");
        
        // Enregistrement explicite de la session pour éviter les bugs de cookies
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        if (sessionError) throw sessionError;

        const userEmail = data.session.user.email?.toLowerCase().trim();
        
        // Délai de sécurité pour laisser les cookies s'écrire sur le navigateur
        setTimeout(() => {
          if (userEmail === 'gaetan@amaru-homes.com') {
            window.location.assign('/super-admin');
          } else {
            window.location.assign('/admin/dashboard');
          }
        }, 800); 
      }
    } catch (error: any) {
      alert("Erreur de connexion : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#0f172a] p-10 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif italic text-emerald-500">Master Template</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Connexion Administrateur</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 ml-2">Email Professionnel</label>
            <input 
              type="email" 
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 ml-2">Mot de passe</label>
            <input 
              type="password" 
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Accéder au Dashboard"}
          </button>
        </div>
      </form>
    </div>
  );
}