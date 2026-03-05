"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck, UserCircle, KeyRound } from "lucide-react";

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
      if (method === "password") {
        // --- CONNEXION CLASSIQUE (SUPABASE AUTH) ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
      } else {
        // --- CONNEXION PAR PIN (TABLE STAFF) ---
        const { data, error } = await supabase
          .from("staff_prestataires")
          .select("*")
          .eq("email", email.trim().toLowerCase())
          .eq("pin_code", pin.trim())
          .single();

        if (error || !data) throw new Error("Email ou Code PIN incorrect.");

        // On simule une session pour le mode PIN car il ne passe pas par Supabase Auth
        localStorage.setItem("staff_session", JSON.stringify(data));
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4 font-sans">
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
              onClick={() => setMethod("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${method === "password" ? "bg-white/10 text-white shadow-lg" : "text-slate-500"}`}
            >
              <KeyRound size={12}/> Pass
            </button>
            <button 
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
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Identifiant Email</label>
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
            /* Champ Mot de Passe */
            <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Mot de passe</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={method === "password"}
                />
              </div>
            </div>
          ) : (
            /* Champ Code PIN */
            <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Code PIN</label>
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
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest">
          Interface de gestion hybride • Amaru Homes
        </p>
      </div>
    </div>
  );
}