"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, MapPin, FileText, Download, Upload, 
  LogOut, Activity, Zap, Briefcase, UserCheck, CheckCircle2
} from 'lucide-react';

// Initialisation unique
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });
  const [editComment, setEditComment] = useState("");
  const [editStep, setEditStep] = useState("");

  const loadData = async () => {
    console.log("1. Tentative de récupération de session...");
    setLoading(true);
    
    try {
      // On récupère la session active
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        console.error("ERREUR : Aucun utilisateur connecté.");
        setLoading(false);
        return;
      }

      console.log("2. Utilisateur trouvé :", user.email);

      // 1. Récupérer le profil
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email?.toLowerCase());

      const profile = profiles?.[0];
      const currentAgency = profile?.company_name || "Amaru-Homes";
      
      console.log("3. Agence identifiée :", currentAgency);
      if (profile) setAgencyProfile(profile);

      // 2. Charger les dossiers (On enlève le filtre temporairement si ça vide la liste)
      console.log("4. Chargement des dossiers suivi_chantier...");
      const { data: projData, error: projError } = await supabase
        .from('suivi_chantier')
        .select('*')
        .eq('company_name', currentAgency)
        .order('created_at', { ascending: false });

      if (projError) console.error("Erreur SQL dossiers:", projError);
      
      console.log("5. Dossiers récupérés :", projData?.length || 0);
      if (projData) setProjets(projData);

    } catch (err) {
      console.error("ERREUR CRITIQUE :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync edit fields
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

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      <p className="text-white text-xs font-bold uppercase tracking-widest">Initialisation Amaru-Homes...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200">
      {/* SIDEBAR SIMPLE */}
      <div className="w-full md:w-80 bg-[#0F172A] border-r border-white/5 h-screen sticky top-0 flex flex-col">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-black"><Briefcase size={20}/></div>
            <h1 className="font-black text-white text-sm uppercase">{agencyProfile.company_name}</h1>
          </div>
          <input 
            type="text" placeholder="Rechercher..." 
            className="w-full p-3 bg-white/5 rounded-xl text-xs border border-white/10 outline-none focus:border-emerald-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredProjets.length === 0 ? (
            <p className="text-[10px] text-slate-500 text-center italic">Aucun dossier trouvé pour cette agence</p>
          ) : (
            filteredProjets.map((p) => (
              <button 
                key={p.id} 
                onClick={() => setSelectedProjet(p)}
                className={`w-full text-left p-4 mb-2 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}
              >
                <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">{p.nom_villa}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
             {/* Le reste de ton interface ici */}
             <div className="bg-white/5 p-8 rounded-3xl border border-white/5 flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black text-white italic uppercase">{selectedProjet.nom_villa}</h2>
                <button className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold text-xs uppercase">Enregistrer</button>
             </div>
             {/* ... contenu détaillé ... */}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={100} />
            <p className="text-xl font-black uppercase tracking-[0.5em]">Amaru-Homes</p>
          </div>
        )}
      </div>
    </div>
  );
}