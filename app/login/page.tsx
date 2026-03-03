"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // On utilise le router officiel

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 1. Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // 2. IMPORTANT : On attend que la session soit bien enregistrée localement
        await supabase.auth.setSession(data.session);
        
        const userEmail = data.session.user.email?.toLowerCase().trim();
        
        // 3. Redirection propre via Next.js Router
        if (userEmail === 'gaetan@amaru-homes.com') {
          router.push('/super-admin');
          router.refresh(); // Force la mise à jour des cookies
        } else {
          router.push('/admin/dashboard');
          router.refresh();
        }
      }
    } catch (error: any) {
      alert("Erreur : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#0f172a] p-10 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif italic text-emerald-500">Master Template</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Connexion Sécurisée</p>
        </div>

        <div className="space-y-5">
          <input 
            type="email" 
            className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Email"
          />
          <input 
            type="password" 
            className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Mot de passe"
          />
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Entrer dans le système"}
          </button>
        </div>
      </form>
    </div>
  );
}