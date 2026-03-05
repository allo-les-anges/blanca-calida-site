"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, LogOut } from "lucide-react"; // Ajout de LogOut
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true); // État pour bloquer le flash

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Au lieu de rediriger direct, on vérifie si c'est une session valide
          await handleRedirection(session.user.id, session.user.email);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    };
    checkUser();
  }, []);

  // Fonction pour casser la boucle infinie manuellement
  const forceLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.reload(); 
  };

  const handleRedirection = async (userId: string, userEmail?: string) => {
    try {
      // Redirection simplifiée pour éviter les erreurs 404
      if (userEmail?.toLowerCase().trim() === 'gaetan@amaru-homes.com') {
        router.replace('/super-admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role === 'super_admin') {
        router.replace('/super-admin');
      } else if (profile?.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    } catch (err) {
      // Si erreur de profil, on reste sur le login et on arrête le chargement
      setIsChecking(false);
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

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
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

          {errorMsg && <p className="text-red-500 text-xs font-bold text-center uppercase">{errorMsg}</p>}
          
          <button type="submit" disabled={loading} className="w-full bg-red-600 py-4 rounded-xl font-black text-[11px] tracking-widest text-white hover:bg-red-500 flex justify-center shadow-lg">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "SE CONNECTER"}
          </button>
        </form>

        {/* BOUTON DE SECOURS POUR CASSER LA BOUCLE */}
        <button 
          onClick={forceLogout}
          className="mt-8 text-[9px] text-slate-600 uppercase tracking-widest hover:text-red-500 flex items-center gap-2 mx-auto transition-colors"
        >
          <LogOut size={12} /> Réinitialiser la session (si bloqué)
        </button>
      </div>
    </div>
  );
}