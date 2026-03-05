"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import centralisé

export default function LoginPage() {
  const router = useRouter();
  
  // ÉTATS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Vérification si déjà connecté au chargement
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        redirectUser(session.user.id, session.user.email || "");
      }
    };
    checkUser();
  }, []);

  // 2. Logique de redirection selon le rôle
  const redirectUser = async (userId: string, userEmail: string) => {
    const cleanEmail = userEmail.toLowerCase().trim();

    // CAS SPÉCIAL : Gaëtan est toujours Super Admin
    if (cleanEmail === 'gaetan@amaru-homes.com') {
      router.push('/super-admin');
      return;
    }

    // Pour les autres (Iris, Gillian, etc.), on vérifie dans la table 'profiles'
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      setErrorMsg("Profil introuvable. Contactez Gaëtan.");
      return;
    }

    const role = profile.role?.toLowerCase().trim();

    if (role === 'super_admin' || role === 'super-admin') {
      router.push('/super-admin');
    } else if (role === 'admin') {
      router.push('/admin'); // Redirige Iris vers son dashboard agence
    } else {
      setErrorMsg("Accès non autorisé.");
    }
  };

  // 3. Action de connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        await redirectUser(data.user.id, data.user.email || "");
      }
    } catch (err: any) {
      setErrorMsg(err.message === "Invalid login credentials" 
        ? "Identifiants invalides." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-red-500/30">
      {/* Design Background Similaire au Super-Admin */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0a0a0a] border border-slate-800/60 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-900/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-serif italic text-white tracking-tight text-center">Terminal de Connexion</h1>
            <p className="text-slate-500 text-[9px] uppercase tracking-[0.3em] font-black mt-2">Accès Sécurisé Engine</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Identifiant (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-slate-800 rounded-xl p-4 pl-12 text-sm text-white focus:border-red-600 outline-none transition-all"
                  placeholder="nom@amaru-homes.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Clé de sécurité</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-slate-800 rounded-xl p-4 pl-12 text-sm text-white focus:border-red-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-lg text-center font-bold uppercase tracking-wider">
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-600 py-4 mt-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center justify-center text-white"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "S'AUTHENTIFIER"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}