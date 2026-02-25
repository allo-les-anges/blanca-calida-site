"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // On attend un tout petit peu pour laisser le temps au navigateur d'écrire le cookie
        setTimeout(() => {
          window.location.href = '/super-admin';
        }, 500);
      }
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#0f172a] p-10 rounded-[2rem] border border-slate-800 shadow-2xl">
        <h1 className="text-2xl font-serif italic mb-8 text-center text-emerald-500">Blanca Calida</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-emerald-500"
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-emerald-500"
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}