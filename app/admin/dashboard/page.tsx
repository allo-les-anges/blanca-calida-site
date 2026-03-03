"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, RefreshCw, AlertCircle } from 'lucide-react';

// Configuration ultra-stable
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'amaru-final-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [loadingStep, setLoadingStep] = useState("Vérification de l'identité...");

  const loadAllData = useCallback(async (user: any) => {
    try {
      setLoadingStep("Accès à la base de données...");
      
      // 1. Profil (Harmonisé sur company_name)
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (pError) console.error("Erreur Profil:", pError);

      const currentAgency = profile?.company_name || "Agence Amaru";
      
      setAgencyProfile({
        ...profile,
        company_name: currentAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
      });

      // 2. Projets
      setLoadingStep("Récupération des chantiers...");
      const { data: allProjects } = await supabase.from('suivi_chantier').select('*');
      
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        // Filtrage strict sur Amaru-Prestige ou Amaru-Homes
        setProjets((allProjects || []).filter(p => p.company_name === currentAgency));
      }
    } catch (err) {
      console.error("Erreur globale:", err);
      setLoadingStep("Erreur de connexion aux données.");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // Écouteur principal
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("⚡ ÉVÉNEMENT AUTH :", event);
      if (session?.user) {
        loadAllData(session.user);
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    // Vérification immédiate au montage
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        loadAllData(session.user);
      } else {
        // Si après 8 secondes rien ne se passe, on propose le reset
        setTimeout(() => {
           setLoadingStep("La session semble bloquée...");
        }, 8000);
      }
    };

    checkInitialSession();
    return () => subscription.unsubscribe();
  }, [loadAllData]);

  if (!isMounted) return null;

  // Écran de chargement amélioré pour éviter la boucle infinie visuelle
  if (!agencyProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-6">
        <div className="relative mb-8">
            <Loader2 className="text-emerald-500 animate-spin" size={60} />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
        </div>
        
        <h2 className="text-lg font-bold tracking-tight mb-2">{loadingStep}</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-10 text-center max-w-[250px]">
            Vérifiez que vous n'êtes pas en navigation privée
        </p>

        <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl text-[10px] font-bold uppercase transition-all"
            >
                <RefreshCw size={12} /> Forcer le reset
            </button>
            <button 
                onClick={() => window.location.href = '/login'}
                className="py-3 text-[10px] text-slate-500 font-bold uppercase hover:text-white transition-colors"
            >
                Retour au login
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-3xl font-serif italic text-emerald-500">Dashboard</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                    {agencyProfile.company_name} — {agencyProfile.prenom}
                </p>
            </div>
            <button 
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
                className="bg-red-500/10 text-red-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase border border-red-500/20"
            >
                Quitter
            </button>
        </header>

        <div className="grid gap-4">
            {projets.length > 0 ? projets.map(p => (
                <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-200">{p.nom_projet}</h3>
                        <p className="text-[10px] text-slate-500 uppercase">{p.company_name}</p>
                    </div>
                    <Link href={`/admin/projet/${p.id}`} className="bg-emerald-500 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase">
                        Ouvrir
                    </Link>
                </div>
            )) : (
                <div className="p-20 text-center border border-dashed border-slate-800 rounded-3xl">
                    <AlertCircle className="mx-auto text-slate-700 mb-4" size={30} />
                    <p className="text-slate-500 text-sm italic">Aucun projet trouvé pour cette agence.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}