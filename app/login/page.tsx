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

  // Désactivation de la redirection automatique pour forcer l'action manuelle
  useEffect(() => {
    console.log("Portail Amaru prêt. Connexion automatique désactivée.");
  }, []);

  const handleRedirection = async (userId: string, userEmail?: string) => {
    try {
      if (userEmail?.toLowerCase().trim() === 'gaetan@amaru-homes.com') {
        router.replace('/super-admin');
        return;
      }

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

      // Stockage de secours pour éviter les éjections sur le dashboard
      localStorage.setItem("staff_session", JSON.stringify({
        email: profile.email,
        role: profile.role,
        company_name: profile.company_name || "Amaru-Homes"
      }));

      if (profile.role === 'super_admin') {
        router.replace('/super-admin');
      } else if (profile.role === 'admin' || profile.role === 'staff') {
        router.replace('/admin/dashboard');
      } else {
        setErrorMsg("Rôle non reconnu.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Erreur de protocole.");
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
      setErrorMsg(error.message === "Invalid login credentials" ? "Identifiants invalides" : error.message);
      setLoading(false);
    } else if (data?.user) {
      await handleRedirection(data.user.id, data.user.email);
    }
  };

  const clearSession = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    
    // Nettoyage manuel des cookies au cas où
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-slate-800/60 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-900/20">
          <ShieldCheck size={32} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">Login Engine</h1>
        <p className="text-slate-500 text-[10px] text-center uppercase tracking-[0.3em] mb-8 font-black">Manual Override Required</p>

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
            {loading ? <Loader2 className="animate-spin" size={18} /> : "VALIDER L'ACCÈS"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-4">
          <button 
            onClick={clearSession}
            className="text-[9px] text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase font-black tracking-widest"
          >
            <RefreshCw size={12} /> Déconnexion forcée / Reset
          </button>
        </div>
      </div>
    </div>
  );
}