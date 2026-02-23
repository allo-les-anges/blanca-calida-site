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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Erreur de connexion : " + error.message);
      setLoading(false);
      return;
    }

    // On récupère le rôle dans la table profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      alert("Profil non trouvé dans la base de données. Vérifiez la table 'profiles'.");
      setLoading(false);
      return;
    }

    // REDIRECTION INTELLIGENTE
    if (profile.role === 'super_admin') {
      router.push('/super-admin');
    } else if (profile.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (profile.role === 'admin_chantier') {
      router.push('/admin-chantier');
    } else {
      // CORRECTION : Si le dossier /mon-projet n'existe pas, on redirige vers l'accueil
      // On affiche une alerte pour comprendre ce qui se passe
      alert("Rôle détecté : " + profile.role + ". Redirection vers l'accueil car la page projet n'existe pas.");
      router.push('/'); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-800 rounded-[2.5rem] p-10 border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif italic">Blanca Calida</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-bold">Accès Professionnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 ml-2">Email</label>
            <input 
              type="email" placeholder="votre@email.com" required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-emerald-500 transition-all text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 ml-2">Mot de passe</label>
            <input 
              type="password" placeholder="••••••••" required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-emerald-500 transition-all text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 mt-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}