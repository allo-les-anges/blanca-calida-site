"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Briefcase, LogOut, Zap, ArrowLeft, Plus, Search } from 'lucide-react';
import Link from 'next/link';

// Utilisation du client standard pour éviter les conflits SSR
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);

  const loadDashboardData = useCallback(async (user: any) => {
    try {
      // 1. Récupération du profil (On accepte agency_name OU company_name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // On harmonise les données des images 8d41e0 et 8cefc6
      const agency = profile?.agency_name || profile?.company_name || "Agence";
      
      setAgencyProfile({ ...profile, agency_name: agency });

      // 2. Chargement des projets
      const { data: projRes } = await supabase.from('suivi_chantier').select('*');
      
      // Filtrage souple
      if (user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin') {
        setProjets(projRes || []);
      } else {
        const filtered = (projRes || []).filter(p => 
          p.agency_name === agency || p.company_name === agency
        );
        setProjets(filtered);
      }
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const initAuth = async () => {
      // On force la récupération de la session sans redirection immédiate
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSessionActive(true);
        await loadDashboardData(session.user);
      } else {
        // AU LIEU DE REDIRIGER, ON ATTEND. 
        // Si après 3 secondes il n'y a toujours rien, alors on sort.
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            window.location.href = '/login';
          } else {
            setSessionActive(true);
            loadDashboardData(retrySession.user);
          }
        }, 3000);
      }
    };

    initAuth();
  }, [loadDashboardData]);

  if (!isMounted || (loading && !sessionActive)) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vérification de la session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
       {/* Votre interface de Dashboard ici */}
       <div className="p-10">
         <h1 className="text-2xl font-bold text-emerald-500">
           Bienvenue {agencyProfile?.prenom || 'Admin'}
         </h1>
         <p className="text-slate-400">Agence : {agencyProfile?.agency_name}</p>
         <div className="mt-10">
            {projets.length > 0 ? (
              <p>{projets.length} projets trouvés.</p>
            ) : (
              <p>Aucun projet trouvé pour cette agence.</p>
            )}
         </div>
         <button 
           onClick={() => { supabase.auth.signOut(); window.location.href = '/login'; }}
           className="mt-10 text-red-500 text-xs uppercase font-bold"
         >
           Déconnexion
         </button>
       </div>
    </div>
  );
}