"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfessionalLoginPage() {
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
    setLoading(true);

    try {
      // 1. Connexion Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Récupération du profil pour vérifier le rôle
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error("Détails erreur profil:", profileError);
          // Si le profil manque, c'est souvent un problème de RLS ou de Trigger
          alert("Erreur : Profil non trouvé. Contactez l'administrateur.");
          setLoading(false);
          return;
        }

        // 3. Redirection intelligente selon le rôle
        if (profile?.role === 'super_admin') {
          router.push('/super-admin');
        } else {
          // Redirige les agences (Amaru, etc.) vers leur gestion de programmes
          router.push('/admin/dashboard'); 
        }
      }
    } catch (error: any) {
      alert("Erreur de connexion : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#0f172a] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif italic text-white tracking-tight">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Accès Professionnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-slate-500 ml-4 font-bold tracking-widest">Identifiant</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-slate-500 ml-4 font-bold tracking-widest">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Accéder au Dashboard"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-[9px] mt-8 uppercase tracking-widest">
          Système de gestion de licence sécurisé
        </p>
      </div>
    </div>
  );
}