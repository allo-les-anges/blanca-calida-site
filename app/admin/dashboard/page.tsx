"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, LogOut, RefreshCw, Briefcase, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: true, storageKey: 'amaru-final-v8' }
  }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async (user: any) => {
    try {
      // 1. Récupération du profil
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      // On nettoie la valeur pour éviter les erreurs d'espaces
      const userAgency = (profile?.company_name || "").trim();
      
      setAgencyProfile({
        ...profile,
        company_name: userAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
      });

      // 2. Récupération et Filtrage
      const { data: allProjects } = await supabase.from('suivi_chantier').select('*');
      
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || profile?.role === 'super_admin';

      if (isSuperAdmin) {
        setProjets(allProjects || []);
      } else {
        // Filtrage ultra-souple : on compare en minuscules et sans espaces
        const filtered = (allProjects || []).filter(p => {
          const projectAgency = (p.company_name || "").trim().toLowerCase();
          const targetAgency = userAgency.toLowerCase();
          return projectAgency === targetAgency;
        });
        setProjets(filtered);
      }
    } catch (err) {
      console.error("Erreur de données:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) loadAllData(session.user);
      else setLoading(false);
    };
    check();
  }, [loadAllData]);

  if (!isMounted) return null;

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white font-sans">
      <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Synchronisation des projets...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-start mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-4xl font-serif italic text-emerald-500">Bonjour {agencyProfile?.prenom}</h1>
               {agencyProfile?.role === 'super_admin' && <ShieldCheck className="text-emerald-500/50" size={20} />}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
              Agence : <span className="text-slate-300">{agencyProfile?.company_name || "Gaëtan (Admin)"}</span>
            </p>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
            className="border border-red-500/20 text-red-500 text-[10px] font-bold uppercase px-6 py-2 rounded-full hover:bg-red-500/10 transition-all"
          >
            Déconnexion
          </button>
        </header>

        <div className="grid gap-6">
          {projets.length > 0 ? (
            projets.map(p => (
              <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-6 mb-6 md:mb-0">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-1">{p.nom_villa || "Villa Amaru"}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">{p.client_nom} {p.client_prenom}</p>
                    <div className="flex gap-2 mt-3">
                        <span className="text-[9px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase font-bold">{p.ville || "Espagne"}</span>
                        <span className="text-[9px] bg-emerald-500/10 px-2 py-1 rounded text-emerald-500 uppercase font-bold">{p.etape_actuelle || "En cours"}</span>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/admin/projet/${p.id}`}
                  className="w-full md:w-auto bg-emerald-500 text-black px-12 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all text-center"
                >
                  Ouvrir le suivi
                </Link>
              </div>
            ))
          ) : (
            <div className="p-24 text-center border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10">
              <p className="text-slate-500 italic text-sm mb-6">Aucun projet trouvé pour "{agencyProfile?.company_name}".</p>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 px-6 py-3 rounded-full hover:bg-emerald-500/10 transition-all">
                <RefreshCw size={14} /> Forcer la synchronisation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}