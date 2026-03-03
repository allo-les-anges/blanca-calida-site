"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, 
  Download, Upload, Key, UserPlus, 
  Home, LogOut, Activity, Zap, Euro, Calendar, Briefcase, UserCheck, Settings, Globe
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TRANSLATIONS = {
  fr: {
    dossiers: "Dossiers", experts: "Experts", newDossier: "Nouveau Dossier", 
    addExpert: "Ajouter un Expert", search: "Recherche...", currentStep: "Étape actuelle",
    clientPin: "PIN Client", cashback: "Cashback", docs: "Documents Clients",
    noDocs: "Aucun document chargé.", createExpert: "Nouvel Expert", savePin: "Enregistrer l'expert",
    createDossier: "Créer le Dossier & Générer PIN", loading: "Chargement...",
    settings: "Profil & Agence", save: "Enregistrer",
    phases: [
      "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
      "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
      "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
      "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", "12. Remise des clés"
    ]
  }
};

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [lang] = useState<'fr'>('fr');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [agencyProfile, setAgencyProfile] = useState<any>({ id: null, company_name: "Amaru-Homes", prenom: "", nom: "", logo_url: null });

  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "", pin: "" });
  
  // ÉTAT DU DOSSIER CLIENT (CONFORME À TA DEMANDE)
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, etape_actuelle: TRANSLATIONS.fr.phases[0]
  });

  useEffect(() => { setIsMounted(true); loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setAgencyProfile(profile);
      }
      const { data: projData } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
      const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
      if (projData) setProjets(projData);
      if (stfData) setStaffList(stfData);
    } finally { setLoading(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const finalPin = newStaff.pin || Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase.from('staff_prestataires').insert([{ 
      prenom: newStaff.prenom, nom: newStaff.nom, pin_code: finalPin 
    }]);
    if (!error) { setShowStaffModal(false); setNewStaff({nom:"", prenom:"", pin:""}); loadData(); }
    setUpdating(false);
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    // Génération automatique du PIN Client (6 chiffres)
    const clientPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase.from('suivi_chantier').insert([{ 
      ...newDossier, 
      pin_code: clientPin,
      updated_at: new Date().toISOString()
    }]);

    if (!error) { 
      setShowModal(false); 
      setNewDossier({
        client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
        nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, etape_actuelle: TRANSLATIONS.fr.phases[0]
      });
      loadData(); 
    } else {
      alert("Erreur: " + error.message);
    }
    setUpdating(false);
  };

  const loadDocuments = async (id: string) => {
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', id);
    setDocuments(data || []);
  };

  useEffect(() => { if (selectedProjet) loadDocuments(selectedProjet.id); }, [selectedProjet]);

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20"><Briefcase className="text-[#020617]" size={22} /></div>
            <h1 className="text-sm font-black text-white uppercase truncate">{agencyProfile.company_name}</h1>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'clients' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>{t.dossiers}</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'staff' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>{t.experts}</button>
          </div>

          <div className="space-y-4">
            {activeTab === 'clients' ? (
              <button onClick={() => setShowModal(true)} className="w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-emerald-400 transition-all shadow-xl"><Plus size={16} /> {t.newDossier}</button>
            ) : (
              <button onClick={() => setShowStaffModal(true)} className="w-full bg-emerald-500 text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-white transition-all"><UserPlus size={16} /> {t.addExpert}</button>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder={t.search} className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {activeTab === 'clients' ? (
            filteredProjets.map((p) => (
              <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                <p className="text-[9px] uppercase opacity-50 font-bold tracking-widest">{p.nom_villa}</p>
              </button>
            ))
          ) : (
            staffList.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                <div><p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p><p className="text-[10px] font-mono text-emerald-400">PIN: {s.pin_code}</p></div>
                <button onClick={async () => { if(confirm("Supprimer l'expert ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A]">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 backdrop-blur-3xl flex justify-between items-end shadow-2xl">
              <div>
                <h2 className="text-4xl font-bold tracking-tighter text-white mb-4 italic uppercase">{selectedProjet.nom_villa}</h2>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2"><MapPin size={12}/> {selectedProjet.ville}, {selectedProjet.pays}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">{t.clientPin} : {selectedProjet.pin_code}</span>
                  <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20"><Euro size={12}/> {t.cashback}: {selectedProjet.montant_cashback}€</span>
                </div>
              </div>
              <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20"><LogOut size={20}/></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-bold uppercase text-emerald-500 mb-6 flex items-center gap-2"><Activity size={14}/> {t.currentStep} : {selectedProjet.etape_actuelle}</h3>
                   <p className="text-xl text-slate-200 italic border-l-4 border-emerald-500 pl-6 py-2 leading-relaxed">"{selectedProjet.commentaires_etape || "Pas de commentaires."}"</p>
                </div>
              </div>
              <div className="bg-[#0F172A]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-[450px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-3"><Camera size={16} className="text-emerald-500"/> {t.docs}</h3>
                  <label className="cursor-pointer p-3 bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg shadow-emerald-500/20">
                     <Upload size={18} /><input type="file" className="hidden" />
                  </label>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {documents.length === 0 ? <p className="text-[10px] text-slate-500 italic text-center mt-10">Aucun document.</p> : documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                      <p className="text-[11px] truncate flex-1 text-slate-400">{doc.nom_fichier}</p>
                      <a href={doc.url_fichier} target="_blank" className="p-2 text-slate-600 hover:text-white"><Download size={14} /></a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={120} className="text-emerald-500 mb-8" />
            <p className="text-3xl font-black uppercase tracking-[0.5em] text-center">Sélectionnez un dossier</p>
          </div>
        )}
      </main>

      {/* MODALE CRÉATION DOSSIER (CHAMPS COMPLETS) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative my-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={28} /></button>
            <div className="mb-10">
                <h3 className="text-3xl font-serif italic text-white">{t.newDossier}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Enregistrement nouveau projet de construction</p>
            </div>
            
            <form onSubmit={handleCreateDossier} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SECTION IDENTITÉ */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-emerald-500 uppercase ml-2 tracking-widest flex items-center gap-2"><UserCheck size={12}/> Identité Client</label>
                  <input required placeholder="Prénom" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 transition-all" value={newDossier.client_prenom} onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 transition-all" value={newDossier.client_nom} onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  <input required type="email" placeholder="Email Contact" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 transition-all" value={newDossier.email_client} onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                </div>

                {/* SECTION LOCALISATION */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest flex items-center gap-2"><Globe size={12}/> Localisation Projet</label>
                  <input placeholder="Adresse / Rue" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 transition-all" value={newDossier.rue} onChange={e => setNewDossier({...newDossier, rue: e.target.value})} />
                  <input placeholder="Ville" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 transition-all" value={newDossier.ville} onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                  <input placeholder="Pays" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 transition-all" value={newDossier.pays} onChange={e => setNewDossier({...newDossier, pays: e.target.value})} />
                </div>
              </div>

              {/* SECTION TECHNIQUE & FINANCE */}
              <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-purple-400 uppercase ml-2 tracking-widest flex items-center gap-2"><Home size={12}/> Détails Villa</label>
                    <input required placeholder="Nom de la Villa (ex: Villa Bianca)" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-purple-500 transition-all" value={newDossier.nom_villa} onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                    <select className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500" value={newDossier.etape_actuelle} onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                        {TRANSLATIONS.fr.phases.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-amber-400 uppercase ml-2 tracking-widest flex items-center gap-2"><Calendar size={12}/> Délais & Cashback</label>
                    <input type="date" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-amber-500 transition-all text-slate-400" value={newDossier.date_livraison_prevue} onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                    <div className="relative">
                        <Euro className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                        <input type="number" placeholder="Montant Cashback" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-amber-500 transition-all" value={newDossier.montant_cashback} onChange={e => setNewDossier({...newDossier, montant_cashback: Number(e.target.value)})} />
                    </div>
                </div>
              </div>

              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest mt-6 flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-500/10">
                {updating ? <Loader2 className="animate-spin" /> : <><Save size={18}/> {t.createDossier}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE AJOUT EXPERT */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0F172A] w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative">
            <button onClick={() => setShowStaffModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-serif italic text-white">{t.createExpert}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Accès Application Terrain</p>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input type="text" required placeholder="Prénom" className="w-full p-5 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-emerald-500" value={newStaff.prenom} onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input type="text" required placeholder="Nom" className="w-full p-5 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-emerald-500" value={newStaff.nom} onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              <input type="text" placeholder="PIN Personnel (Auto si vide)" className="w-full p-5 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-emerald-500 font-mono text-center text-xl tracking-widest" maxLength={6} value={newStaff.pin} onChange={e => setNewStaff({...newStaff, pin: e.target.value})} />
              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest mt-6 flex items-center justify-center gap-3">
                {updating ? <Loader2 className="animate-spin" /> : <><Save size={18}/> {t.savePin}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
      `}</style>
    </div>
  );
}