"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Trash2, Loader2, Plus, X, Search, Briefcase, 
  LogOut, Zap, Euro, ArrowLeft, Settings, UserPlus, 
  Save, Calendar, MapPin, Mail
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES = [
  "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
  "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
  "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
  "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", "12. Remise des clés"
];

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'staff' | 'settings'>('clients');
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]); 
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Formulaire pour nouveau dossier
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "",
    nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, etape_actuelle: PHASES[0]
  });

  // --- CHARGEMENT DES DONNÉES AVEC DOUBLE VÉRIFICATION DE COLONNE ---
  const loadDashboardData = useCallback(async (user: any) => {
    try {
      setLoading(true);

      // 1. Récupération du profil (Gestion des colonnes agency_name OU company_name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const detectedAgency = profile?.agency_name || profile?.company_name || "Agence";
      
      setAgencyProfile({
        ...profile,
        agency_name: detectedAgency,
        prenom: profile?.prenom || user.email.split('@')[0],
        nom: profile?.nom || ""
      });

      // 2. Chargement des données
      const [projRes, stfRes] = await Promise.all([
        supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false }),
        supabase.from('staff_prestataires').select('*')
      ]);

      // Filtrage : Super Admin voit tout, les autres filtrent par leur agence détectée
      const isSuperAdmin = user.email === 'gaetan@amaru-homes.com' || detectedAgency === 'SUPER_ADMIN';
      
      if (isSuperAdmin) {
        setProjets(projRes.data || []);
      } else {
        const filtered = (projRes.data || []).filter(p => 
          p.agency_name === detectedAgency || p.company_name === detectedAgency
        );
        setProjets(filtered);
      }

      setStaffList(stfRes.data || []);

    } catch (err) {
      console.error("Erreur critique:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const checkSession = async () => {
      // On récupère la session de manière active
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Session détectée pour:", session.user.email);
        setSessionActive(true);
        loadDashboardData(session.user);
      } else {
        console.warn("Pas de session, tentative via onAuthStateChange...");
        // Fallback sur l'écouteur si getSession échoue au premier boot
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setSessionActive(true);
            loadDashboardData(session.user);
          } else {
            // On attend 2 secondes avant de bannir, pour laisser au SSR le temps de respirer
            setTimeout(() => {
               if (!session) window.location.replace('/login');
            }, 2000);
          }
        });
        return () => subscription.unsubscribe();
      }
    };

    checkSession();
  }, [loadDashboardData]);

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase.from('suivi_chantier').insert([{ 
      ...newDossier, 
      pin_code: pin,
      agency_name: agencyProfile?.agency_name 
    }]);

    if (!error) {
      setShowModal(false);
      loadDashboardData({ id: agencyProfile.id, email: agencyProfile.email });
    }
    setUpdating(false);
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => 
      `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projets, searchTerm]);

  if (!isMounted || sessionActive === null) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Initialisation sécurisée...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-white/5 space-y-4">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
             <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500 group-hover:text-black"><ArrowLeft size={14} /></div>
             Retour Accueil
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20"><Briefcase className="text-[#020617]" size={22} /></div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-black text-white uppercase truncate">{agencyProfile?.agency_name}</h1>
              <p className="text-[10px] text-emerald-400 font-bold italic">{agencyProfile?.prenom} {agencyProfile?.nom}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Experts</button>
          </div>

          <div className="space-y-4">
            <button onClick={() => setShowModal(true)} className="w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-emerald-400 transition-all"><Plus size={16} /> Nouveau Dossier</button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="Recherche..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            {activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500' : 'border-white/5 hover:bg-white/5'}`}>
                  <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                  <p className="text-[9px] uppercase opacity-50 font-bold tracking-widest">{p.nom_villa}</p>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{s.prenom} {s.nom}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">PIN: {s.pin_code}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={() => { supabase.auth.signOut(); window.location.replace('/login'); }} className="w-full flex items-center justify-between p-4 rounded-xl text-slate-500 hover:text-red-500 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest">Déconnexion</span> <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Mise à jour des dossiers...</p>
          </div>
        ) : selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={120} /></div>
                <h2 className="text-5xl font-bold text-white mb-6 uppercase italic tracking-tighter">{selectedProjet.nom_villa}</h2>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">PIN: {selectedProjet.pin_code}</div>
                  <div className="bg-blue-500/10 text-blue-400 px-5 py-2 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Euro size={12}/> {selectedProjet.montant_cashback}€ Cashback</div>
                  <div className="bg-white/5 text-white/50 px-5 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest">Agence: {selectedProjet.agency_name}</div>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={100} className="text-emerald-500 mb-6 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-[0.5em]">Sélectionnez un dossier</p>
          </div>
        )}
      </main>

      {/* MODAL NOUVEAU DOSSIER */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0F172A] w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
            <h3 className="text-3xl font-serif italic text-white mb-8">Nouveau Projet</h3>
            <form onSubmit={handleCreateDossier} className="grid grid-cols-2 gap-4">
              <input required placeholder="Prénom Client" className="bg-black/40 p-4 rounded-xl border border-white/5 text-white" value={newDossier.client_prenom} onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
              <input required placeholder="Nom Client" className="bg-black/40 p-4 rounded-xl border border-white/5 text-white" value={newDossier.client_nom} onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
              <input required placeholder="Référence Constructeur" className="col-span-2 bg-black/40 p-4 rounded-xl border border-white/5 text-white" value={newDossier.nom_villa} onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
              <button type="submit" disabled={updating} className="col-span-2 bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest mt-4">
                {updating ? <Loader2 className="animate-spin mx-auto" /> : "Créer le dossier & générer PIN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}