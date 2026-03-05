"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck, KeyRound } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [method, setMethod] = useState<"password" | "pin">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userEmail = email.trim().toLowerCase();

      // 1. AUTHENTIFICATION
      if (method === "password") {
        const { error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("staff_prestataires")
          .select("*")
          .eq("email", userEmail)
          .eq("pin_code", pin.trim())
          .single();

        if (error || !data) throw new Error("Email ou Code PIN incorrect.");
        
        // Stockage de la session PIN
        localStorage.setItem("staff_session", JSON.stringify(data));
      }

      // 2. RÉCUPÉRATION DU RÔLE POUR REDIRECTION
      // On cherche dans la table staff qui est cet utilisateur
      const { data: staffProfile, error: roleError } = await supabase
        .from("staff_prestataires")
        .select("role")
        .eq("email", userEmail)
        .single();

      if (roleError || !staffProfile) {
        // Si l'utilisateur est dans l'Auth mais pas dans la table Staff, 
        // par sécurité on l'envoie sur le dashboard par défaut ou on bloque.
        router.push("/admin/dashboard");
        return;
      }

      // 3. LOGIQUE DE REDIRECTION SELON LE RÔLE
      const userRole = staffProfile.role?.toLowerCase();

      switch (userRole) {
        case "super-admin":
          router.push("/super-admin");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "staff":
        case "prestataire":
          router.push("/admin-chantier");
          break;
        default:
          router.push("/admin/dashboard");
      }

    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter italic">
            Amaru-Homes <span className="text-emerald-500 text-sm align-top">ACCESS</span>
          </h1>
          
          {/* Sélecteur de méthode */}
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mt-8 w-64 mx-auto">
            <button 
              type="button"
              onClick={() => setMethod("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${method === "password" ? "bg-white/10 text-white shadow-lg" : "text-slate-500"}`}
            >
              <KeyRound size={12}/> Pass
            </button>
            <button 
              type="button"
              onClick={() => setMethod("pin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${method === "pin" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500"}`}
            >
              <Lock size={12}/> PIN
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
          {/* Champ Email Commun */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-left block">Identifiant Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {method === "password" ? (
            <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-left block">Mot de passe</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={method === "password"}
                  autoComplete="current-password"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-left block">Code PIN Personnel</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="0000"
                  maxLength={6}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all tracking-[0.5em] font-black text-lg"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required={method === "pin"}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-black py-5 rounded-2xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl ${
              method === 'pin' ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-white text-black shadow-white/10'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Vérifier les accès"}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest">
          Redirection automatique selon profil • Amaru Homes
        </p>
      </div>
    </div>
  );
}