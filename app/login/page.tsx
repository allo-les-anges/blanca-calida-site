"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react'; // CORRIGÉ ICI

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfessionalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        // Redirection vers ton dashboard admin
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      alert("Accès refusé : " + (error.message === "Invalid login credentials" ? "Identifiants incorrects" : error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#0f172a] rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-serif italic text-white tracking-tight">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-black">Espace Professionnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2 text-left">
            <label className="text-[9px] uppercase text-slate-500 ml-4 font-bold tracking-widest">Identifiant Pro</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-700 text-white"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 text-left">
            <label className="text-[9px] uppercase text-slate-500 ml-4 font-bold tracking-widest">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-700 text-white"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Connexion au Système"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-800/50">
            <p className="text-center text-slate-600 text-[8px] uppercase tracking-widest leading-relaxed">
              Accès réservé au personnel autorisé<br/>Blanca Calida & Partners
            </p>
        </div>
      </div>
    </div>
  );
}