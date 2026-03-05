"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) handleRedirection(session.user.id, session.user.email);
    };
    checkUser();
  }, []);

  const handleRedirection = async (userId: string, userEmail?: string) => {
    try {
      // Sécurité pour ton compte Gaëtan
      if (userEmail?.toLowerCase().trim() === 'gaetan@amaru-homes.com') {
        router.push('/super-admin');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        setErrorMsg("Profil introuvable.");
        setLoading(false);
        return;
      }

      // CORRECTION DES CHEMINS SELON TON ARBORESCENCE
      if (profile.role === 'super_admin') {
        router.push('/super-admin'); // Vers app/super-admin/page.tsx
      } else if (profile.role === 'admin') {
        router.push('/admin/dashboard'); // Vers app/admin/dashboard/page.tsx
      } else {
        setErrorMsg("Rôle non reconnu.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Erreur de redirection.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setErrorMsg("Identifiants incorrects.");
      setLoading(false);
    } else if (data?.user) {
      await handleRedirection(data.user.id, data.user.email);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-slate-800/60 p-10 rounded-[2.5rem] shadow-2xl text-center">
        <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-900/20">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-8 italic">Amaru Portail</h1>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600"
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-2">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600"
              required 
            />
          </div>
          {errorMsg && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-tighter">{errorMsg}</p>}
          <button type="submit" disabled={loading} className="w-full bg-red-600 py-4 rounded-xl font-black text-[11px] tracking-widest text-white hover:bg-red-500 flex justify-center shadow-lg">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "SE CONNECTER"}
          </button>
        </form>
      </div>
    </div>
  );
}