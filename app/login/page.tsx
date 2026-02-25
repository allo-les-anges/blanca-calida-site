"use client";

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function ProfessionalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Configuration critique pour que le cookie soit lisible par le Middleware
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token', // Nom standard attendu
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    }
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;

      if (data?.session) {
        // FORCE l'écriture immédiate et redirige vers la page souhaitée
        console.log("Session OK, redirection...");
        window.location.href = '/super-admin'; 
      }
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#0f172a] rounded-[3rem] p-10 border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-serif italic text-white tracking-tight">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-black">Accès Superviseur</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase text-slate-500 ml-4 font-bold tracking-widest">Email Administrateur</label>
            <input 
              type="email" 
              placeholder="gaetan@amaru-homes.com" 
              required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 text-white"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] uppercase text-slate-500 ml-4 font-bold tracking-widest">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 text-white"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrer dans le Système"}
          </button>
        </form>
      </div>
    </div>
  );
}