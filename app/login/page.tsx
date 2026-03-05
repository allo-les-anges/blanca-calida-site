"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Utilisation du client unique

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
      const userEmail = email.trim().toLowerCase();
      let finalRole = "";

      if (method === "password") {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });
        
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id) // Recherche par ID plus sûre que par email
          .single();
        
        if (profileError || !profile) throw new Error("Profil introuvable.");
        finalRole = profile.role;
      } else {
        const { data: staff, error: staffError } = await supabase
          .from("staff_prestataires")
          .select("*")
          .eq("email", userEmail)
          .eq("pin_code", pin.trim())
          .single();

        if (staffError || !staff) throw new Error("Email ou PIN incorrect.");
        
        localStorage.setItem("staff_session", JSON.stringify(staff));
        finalRole = staff.role;
      }

      // Redirection unifiée
      const roleClean = finalRole?.toLowerCase().trim();
      if (roleClean.includes("super")) {
        router.push("/super-admin");
      } else if (roleClean === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/admin-chantier");
      }

    } catch (err: any) {
      alert(err.message);
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
          <h1 className="text-white text-3xl font-black uppercase italic tracking-tighter">
            Amaru-Homes <span className="text-emerald-500 text-sm align-top">ACCESS</span>
          </h1>
          
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
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest block">Identifiant Email</label>
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
            <div className="space-y-2 animate-in slide-in-from-right-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest block">Mot de passe</label>
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
            <div className="space-y-2 animate-in slide-in-from-left-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest block">Code PIN</label>
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
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Accéder à mon espace"}
          </button>
        </form>
      </div>
    </div>
  );
}