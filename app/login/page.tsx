"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // On cherche le collaborateur qui possède cet email ET ce code PIN
      const { data, error } = await supabase
        .from("staff_prestataires")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("pin_code", pin.trim())
        .single();

      if (error || !data) {
        throw new Error("Email ou Code PIN incorrect.");
      }

      // Connexion réussie ! 
      // On stocke les infos basiques en local pour simuler une session
      localStorage.setItem("staff_session", JSON.stringify({
        id: data.id,
        email: data.email,
        role: data.role,
        nom: data.nom,
        prenom: data.prenom,
        company: data.company_name
      }));

      // Redirection vers le dashboard
      router.push("/admin/dashboard");
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Header Logo/Titre */}
        <div className="text-center">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter italic">
            Amaru-Homes <span className="text-emerald-500 text-sm align-top">ADMIN</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">
            Accès sécurisé par Code PIN
          </p>
        </div>

        {/* Formulaire */}
        <form 
          onSubmit={handlePinLogin} 
          className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-5"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
              Identifiant Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="nom@amaru-homes.com"
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
              Code PIN Personnel
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                maxLength={6}
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all tracking-[0.5em] text-lg font-bold"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Ouvrir la session"
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest">
          Système de gestion interne v2.0
        </p>
      </div>
    </div>
  );
}