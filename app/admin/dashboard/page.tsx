"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Loader2, Search, MapPin, LogOut, Activity, Zap, Briefcase, UserCheck, CheckCircle2, Trash2
} from 'lucide-react';

// 1. Initialisation unique à l'extérieur pour éviter les instances multiples
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PHASES_CHANTIER = [
  "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
  "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
  "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
  "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", 
  "12. Remise des clés"
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [editComment, setEditComment] = useState("");
  const [editStep, setEditStep] = useState("");

  const loadData = async () => {
    setLoading(true);
    console.log("Démarrage du chargement...");
    
    try {
      // 2. Vérification de la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Aucune session trouvée");
        setLoading(false);
        return;
      }

      const userEmail = session.user.email?.toLowerCase();
      console.log("Utilisateur connecté :", userEmail);

      // 3. Récupérer le profil
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail);

      const profile = profiles?.[0];
      const currentAgency = profile?.company_name || "Amaru-Homes";
      setAgencyProfile(profile || { company_name: "Amaru-Homes" });

      // 4. Charger les dossiers
      const { data: projData } = await supabase
        .from('suivi_chantier')
        .select('*')
        .eq('company_name', currentAgency)
        .order('created_at', { ascending: false });

      if (projData) setProjets(projData);

    } catch (err) {
      console.error("Erreur globale :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (selectedProjet) {
      setEditComment(selectedProjet.commentaires_etape || "");
      setEditStep(selectedProjet.etape_actuelle || PHASES_CHANTIER[0]);
    }
  }, [selectedProjet]);

  const filteredProjets = useMemo(() => {
    return projets.filter(p => 
      `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projets, searchTerm]);

  // ÉCRAN SI NON CONNECTÉ
  if (!loading && !agencyProfile) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
        <div className="bg-[#0F172A] p-8 rounded-3xl border border-white/10 text-center max-w-md">
          <Zap className="text-emerald-500 mx-auto mb-4" size={48} />
          <h2 className="text-white font-black text-xl mb-2">SESSION EXPIRÉE</h2>
          <p className="text-slate-400 text-sm mb-6">Vous devez être connecté pour accéder à l'administration d'Amaru-Homes.</p>
          <a href="/login" className="block w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors">
            Retour au Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-white font-bold uppercase tracking-widest text-[10px]">Vérification de la session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200">
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-[#0F172A] border-r border-white/5 h-screen sticky top-0 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg text-black"><Briefcase size={20}/></div>
            <h1 className="font-black text-white text-sm uppercase">{agencyProfile?.company_name}</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs border border-white/10 outline-none focus:border-emerald-500"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {filteredProjets.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}>
              <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase">{p.nom_villa}</p>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-y-auto text-left">
        {selectedProjet ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex justify-between items-center shadow-2xl">
              <div>
                <h2 className="text-4xl font-black text-white italic uppercase">{selectedProjet.nom_villa}</h2>
                <span className="bg-emerald-500 text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mt-2 inline-block">PIN: {selectedProjet.pin_code}</span>
              </div>
              <button onClick={() => { supabase.auth.signOut(); window.location.href='/login'; }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={18}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-black/40 p-4 rounded-[2rem] border border-white/5 space-y-2 h-fit">
                {PHASES_CHANTIER.map((phase) => (
                  <button key={phase} onClick={() => setEditStep(phase)} className={`w-full text-left p-3 rounded-xl text-[10px] font-bold uppercase transition-all ${editStep === phase ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:bg-white/5'}`}>
                    {phase}
                  </button>
                ))}
              </div>
              <div className="md:col-span-2 bg-[#0F172A] p-8 rounded-[2rem] border border-white/5">
                <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2"><Activity size={14}/> Note pour le client</h3>
                <textarea 
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-white min-h-[200px] outline-none focus:border-emerald-500 italic"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={100} className="text-emerald-500" />
            <p className="text-3xl font-black uppercase tracking-[0.5em]">Amaru-Homes</p>
          </div>
        )}
      </div>
    </div>
  );
}