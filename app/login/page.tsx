"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialisation standard et robuste
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Crucial pour garder la session active
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        console.log("Session validée !");
        
        // POINT CLÉ : On attend 1 seconde avant de changer de page.
        // Cela laisse le temps au navigateur d'écrire les cookies/localStorage
        // que l'on voit vides sur tes captures d'écran (image_167f7f.png).
        setTimeout(() => {
          // Utiliser assign force un rechargement complet de la page destination,
          // ce qui oblige le Super-Admin à relire les nouveaux cookies.
          window.location.assign('/super-admin');
        }, 1000);
      }
    } catch (error: any) {
      alert("Erreur : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md bg-[#0f172a] p-10 rounded-[2rem] border border-slate-800 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10 text-left">
          <h1 className="text-3xl font-serif italic text-emerald-500 tracking-tight">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Espace Superviseur</p>
        </div>

        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold tracking-widest">Identifiant</label>
            <input 
              type="email" 
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-colors text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase text-slate-500 ml-2 font-bold tracking-widest">Mot de passe</label>
            <input 
              type="password" 
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-colors text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Vérification..." : "Entrer dans le système"}
          </button>
        </div>
      </form>
    </div>
  );
}