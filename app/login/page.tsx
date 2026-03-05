"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ShieldCheck, KeyRound } from "lucide-react";
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
      if (session) handleRedirection(session.user.id);
    };
    checkUser();
  }, []);

  const handleRedirection = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        setErrorMsg("Profil introuvable.");
        return;
      }

      if (profile.role === 'super_admin') {
        router.push('/super-admin');
      } else if (profile.role === 'admin') {
        router.push('/admin');
      } else {
        setErrorMsg("Rôle non autorisé.");
      }
    } catch (err) {
      setErrorMsg("Erreur de redirection.");
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
      await handleRedirection(data.user.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-slate-800/60 p-10 rounded-[2.5rem] shadow-2xl text-center">
        <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-900/20">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-8">Accès Portail</h1>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#111] border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600"
            required 
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#111] border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600"
            required 
          />
          {errorMsg && <p className="text-red-500 text-xs font-bold text-center">{errorMsg}</p>}
          <button type="submit" disabled={loading} className="w-full bg-red-600 py-4 rounded-xl font-bold text-white hover:bg-red-500 flex justify-center">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "SE CONNECTER"}
          </button>
        </form>
      </div>
    </div>
  );
}