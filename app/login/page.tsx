"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, RefreshCw, Delete, Key } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(true); // Par défaut sur le PIN pour Iris

  // Désactivation de la redirection automatique
  useEffect(() => {
    console.log("Portail Amaru prêt. Mode manuel activé.");
  }, []);

  const handleRedirection = async (userId: string, userEmail?: string) => {
  try {
    console.log("=== handleRedirection ===");
    console.log("userId:", userId);
    console.log("userEmail:", userEmail);

    if (userEmail?.toLowerCase().trim() === 'gaetan@amaru-homes.com') {
      console.log("Redirection spéciale Gaétan vers /super-admin");
      router.replace('/super-admin');
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, company_name, email')
      .or(`id.eq.${userId},email.eq.${userEmail}`)
      .single();

    console.log("Profil reçu :", profile);
    console.log("Erreur éventuelle :", error);

    if (error || !profile) {
      setErrorMsg("Profil manquant dans la base.");
      setLoading(false);
      return;
    }

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
      setErrorMsg("Rôle non autorisé.");
      setLoading(false);
    }
  } catch (err) {
    console.error("Erreur dans handleRedirection :", err);
    setErrorMsg("Erreur système.");
    setLoading(false);
  }
};

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // Logique du Code PIN
  const handlePinInput = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Si le code est complet (exemple: 123456 pour démo ou un code spécifique)
      // Note: Ici tu peux définir un raccourci ou laisser Iris entrer son code habituel
      if (newPin === "240226") { // Code d'exemple Iris
         setEmail("iris@amaru-homes.com");
         setPassword("TonMotDePasseSecret"); // À remplacer par la logique réelle ou auto-submit
      }
    }
  };

  const clearPin = () => setPin("");

  const clearSession = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-slate-800/60 p-8 rounded-[2.5rem] shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-900/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Amaru Engine</h1>
          <p className="text-slate-500 text-[9px] uppercase tracking-[0.3em] font-black mt-1">Authentification Sécurisée</p>
        </div>

        {/* Sélecteur de mode */}
        <div className="flex bg-black p-1 rounded-xl mb-8 border border-slate-900">
          <button 
            onClick={() => setShowPin(true)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${showPin ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            CODE PIN
          </button>
          <button 
            onClick={() => setShowPin(false)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${!showPin ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            IDENTIFIANTS
          </button>
        </div>

        {showPin ? (
          /* CLAVIER PIN */
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-3 w-3 rounded-full border ${pin.length > i ? 'bg-red-600 border-red-600' : 'border-slate-700'}`}
                />
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num)}
                  className="h-16 rounded-2xl bg-black border border-slate-900 text-white text-xl font-bold hover:bg-slate-900 transition-colors"
                >
                  {num}
                </button>
              ))}
              <button onClick={clearPin} className="h-16 rounded-2xl bg-black border border-slate-900 text-red-500 flex items-center justify-center">
                <Delete size={20} />
              </button>
              <button onClick={() => handlePinInput("0")} className="h-16 rounded-2xl bg-black border border-slate-900 text-white text-xl font-bold">0</button>
              <button 
                onClick={() => handleLogin()} 
                className="h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/20"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Key size={20} />}
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAIRE CLASSIQUE */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-2">Identifiant</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all text-sm"
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
                className="w-full bg-black border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all text-sm"
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
              className="w-full bg-red-700 hover:bg-red-600 py-4 mt-4 rounded-xl font-black text-[10px] tracking-[0.2em] text-white flex justify-center items-center transition-all shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "VALIDER L'ACCÈS"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-4">
          <button 
            onClick={clearSession}
            className="text-[9px] text-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase font-black tracking-widest"
          >
            <RefreshCw size={12} /> Réinitialiser le terminal
          </button>
        </div>
      </div>
    </div>
  );
}