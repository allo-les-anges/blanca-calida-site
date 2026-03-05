"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Petit check au montage : si déjà connecté, on redirige
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleRedirection(session.user.id, session.user.email);
      }
    };
    checkUser();
  }, []);

  const handleRedirection = async (userId: string, userEmail?: string) => {
    try {
      // 1. Priorité absolue Gaëtan (Super Admin)
      if (userEmail?.toLowerCase().trim() === 'gaetan@amaru-homes.com') {
        router.replace('/super-admin');
        return;
      }

      // 2. Recherche du profil par ID ou EMAIL pour plus de flexibilité (Iris Fix)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, company_name, email')
        .or(`id.eq.${userId},email.eq.${userEmail}`)
        .single();

      if (error || !profile) {
        setErrorMsg("Accès non autorisé : Profil manquant.");
        setLoading(false);
        return;
      }

      // 3. Stockage d'une session de secours pour le dashboard (évite les éjections)
      localStorage.setItem("staff_session", JSON.stringify({
        email: profile.email,
        role: profile.role,
        company_name: profile.company_name || "Amaru-Homes"
      }));

      // 4. Routage selon le rôle
      if (profile.role === 'super_admin') {
        router.replace('/super-admin');
      } else if (profile.role === 'admin' || profile.role === 'staff') {
        router.replace('/admin/dashboard');
      } else {
        setErrorMsg("Rôle non reconnu.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Redirection error:", err);
      setErrorMsg("Erreur de protocole de sécurité.");
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
      setErrorMsg(error.message === "Invalid login credentials" ? "Clé d'accès ou identifiant invalide" : error.message);
      setLoading(false);
    } else if (data?.user) {
      await handleRedirection(data.user.id, data.user.email);
    }
  };

  const clearSession = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-slate-800/60 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-900/20">
          <ShieldCheck size={32} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">Amaru Engine</h1>
        <p className="text-slate-500 text-[10px] text-center uppercase tracking-[0.3em] mb-8 font-black">Security Protocol</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Identifiant</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050505] border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all text-sm"
              placeholder="admin@amaru-homes.com"
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Clé d'accès</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050505] border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all text-sm"
              placeholder="••••••••"
              required 
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
              <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tighter">{errorMsg}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-red-700 hover:bg-red-600 py-4 mt-4 rounded-xl font-black text-[10px] tracking-[0.2em] text-white flex justify-center items-center transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "INITIALISER LA CONNEXION"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-4">
          <button 
            onClick={clearSession}
            className="text-[9px] text-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase font-black tracking-widest"
          >
            <RefreshCw size={12} /> Purger la session locale
          </button>
          <p className="text-[8px] text-slate-800 text-center uppercase font-mono">Build: 2026.03.IRIS_READY</p>
        </div>
      </div>
    </div>
  );
}