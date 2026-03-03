"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, Plus, Search, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

// Utilisation d'un client unique pour éviter les instanciations multiples
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'amaru-auth-token', // Clé personnalisée pour éviter les conflits middleware
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDashboardData = useCallback(async (user: any) => {
    console.log("💾 Chargement des données pour :", user.email);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const currentAgency = profile?.company_name || "Agence Amaru";
      setAgencyProfile({
        ...profile,
        company_name: currentAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
      });

      const { data: allProjects } = await supabase.from('suivi_chantier').select('*');
      
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';
      
      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        setProjets((allProjects || []).filter(p => p.company_name === currentAgency));
      }
    } catch (err) {
      console.error("Erreur de données:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // On écoute les changements. Si SIGNED_IN arrive, on bloque la redirection.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("⚡ ÉVÉNEMENT CAPTÉ :", event);
      if (session) {
        loadDashboardData(session.user);
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    const checkInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("✅ Session initiale OK");
        loadDashboardData(session.user);
      } else {
        // AU LIEU DE REDIRIGER, ON LAISSE UNE CHANCE À L'ÉVÉNEMENT SIGNED_IN
        console.log("⏳ En attente de l'événement SIGNED_IN...");
        setTimeout(async () => {
          const { data: { session: finalCheck } } = await supabase.auth.getSession();
          if (!finalCheck) {
            console.log("🚫 Toujours rien, redirection finale.");
            window.location.href = '/login';
          }
        }, 6000); // On monte à 6 secondes pour être sûr
      }
    };

    checkInitialAuth();
    return () => subscription.unsubscribe();
  }, [loadDashboardData]);

  if (!isMounted) return null;

  // TANT QUE l'agencyProfile n'est pas chargé, on montre le loader
  // même si sessionActive est techniquement false.
  if (loading && !agencyProfile) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-white text-xs font-bold uppercase tracking-widest">Initialisation Amaru...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif italic text-emerald-500">Bonjour {agencyProfile?.prenom}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
              {agencyProfile?.company_name}
            </p>
          </div>
          <button 
            onClick={() => { supabase.auth.signOut(); window.location.href = '/login'; }}
            className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase border border-red-400/20 px-4 py-2 rounded-full hover:bg-red-400/10 transition-all"
          >
            <LogOut size={14} /> Quitter
          </button>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
           <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="p-6 text-[10px] uppercase text-slate-500">Projet</th>
                  <th className="p-6 text-[10px] uppercase text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {projets.map(p => (
                  <tr key={p.id} className="border-t border-slate-800/50 hover:bg-slate-800/20">
                    <td className="p-6">
                      <p className="font-bold">{p.nom_projet}</p>
                      <p className="text-[10px] text-slate-500">{p.company_name}</p>
                    </td>
                    <td className="p-6 text-right">
                      <Link href={`/admin/projet/${p.id}`} className="text-emerald-500 text-xs font-bold">Consulter →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
           {projets.length === 0 && (
             <div className="p-20 text-center text-slate-600 italic">Aucun projet trouvé.</div>
           )}
        </div>
      </div>
    </div>
  );
}