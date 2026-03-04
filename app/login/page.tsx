"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
    } else {
      // Redirection forcée vers le dashboard admin
      router.push("admin/dashboard");
    }
  };

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-[#0F172A] p-8 rounded-3xl border border-white/10 w-full max-w-md">
        <h1 className="text-white text-2xl font-black mb-6 uppercase tracking-tight">Connexion Admin</h1>
        <input
          type="email"
          placeholder="Email (ex: iris@amaru-homes.com)"
          className="w-full bg-black/50 border border-slate-800 rounded-2xl p-4 text-white mb-4 outline-none focus:border-emerald-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full bg-black/50 border border-slate-800 rounded-2xl p-4 text-white mb-6 outline-none focus:border-emerald-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all uppercase"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}