"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, 
  Download, Upload, Key, AlertTriangle, Users, UserPlus, ChevronRight,
  Home, LogOut, LayoutDashboard, Activity, Zap, Euro, Calendar, Briefcase, Globe, UserCheck
} from 'lucide-react';

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

// Configuration des restrictions par pack
const PACK_CONFIG = {
  CORE: { max_staff: 2, label: "CORE", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  ASCENT: { max_staff: 10, label: "ASCENT", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  HORIZON: { max_staff: 999, label: "HORIZON", style: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]" }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [agencyProfile, setAgencyProfile] = useState<any>({
    company_name: "Chargement...",
    logo_url: null,
    pack: "CORE"
  });

  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "" });
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "",
    rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "",
    montant_cashback: 0, commentaires_etape: "",
    etape_actuelle: PHASES_CHANTIER[0]
  });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Profil de l'agence
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setAgencyProfile(profile);
      }

      // 2. Projets et Staff
      const { data: projData } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
      const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
      
      if (projData) setProjets(projData);
      if (stfData) setStaffList(stfData);
    } catch (error) {
      console.error("Erreur loadData:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (projetId: string) => {
    if (!projetId) return;
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', projetId);
    setDocuments(data ? [...data].sort((a, b) => b.id - a.id) : []);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedProjet?.id) loadDocuments(selectedProjet.id); }, [selectedProjet]);

  // --- ACTIONS STAFF ---
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = PACK_CONFIG[agencyProfile.pack as keyof typeof PACK_CONFIG] || PACK_CONFIG.CORE;
    
    if (staffList.length >= config.max_staff) {
      alert(`Limite atteinte pour le pack ${agencyProfile.pack}. Veuillez upgrader votre compte.`);
      return;
    }

    setUpdating(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase.from('staff_prestataires').insert([{ 
      nom: `${newStaff.prenom} ${newStaff.nom}`, 
      pin_code: pin 
    }]);
    if (!error) { setShowStaffModal(false); setNewStaff({nom:"", prenom:""}); loadData(); }
    setUpdating(false);
  };

  // --- UPLOAD & DOSSIERS ---
  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    setUpdating(true);
    try {
      const fileName = `${Math.random().toString(36).substring(2)}_${file.name.replace(/\s/g, '_')}`;
      const filePath = `${selectedProjet.id}/${fileName}`;
      await supabase.storage.from('documents-clients').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(filePath);

      await supabase.from('documents_projets').insert([{
        projet_id: selectedProjet.id, nom_fichier: file.name, url_fichier: publicUrl, storage_path: filePath 
      }]);
      loadDocuments(selectedProjet.id);
    } finally { setUpdating(false); }
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase.from('suivi_chantier').insert([{ ...newDossier, pin_code: pin }]);
    if (!error) { setShowModal(false); loadData(); }
    setUpdating(false);
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  const currentPack = PACK_CONFIG[agencyProfile.pack as keyof typeof PACK_CONFIG] || PACK_CONFIG.CORE;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-8 space-y-8 text-left">
          
          {/* HEADER AGENCE & PACK */}
          <div className="flex items-center gap-4">
            {agencyProfile.logo_url ? (
              <img src={agencyProfile.logo_url} className="w-12 h-12 rounded-2xl object-contain bg-white/5 border border-white/10 p-1.5 shadow-2xl" alt="Logo" />
            ) : (
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/20"><Briefcase className="text-[#020617]" size={22} /></div>
            )}
            <div className="space-y-1.5">
              <h1 className="text-sm font-black text-white uppercase tracking-tight leading-none">{agencyProfile.company_name}</h1>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-[0.15em] ${currentPack.style}`}>
                <Zap size={8} className="mr-1 fill-current" /> {currentPack.label}
              </div>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>Experts</button>
          </div>

          <div className="space-y-4">
            {activeTab === 'clients' ? (
              <button onClick={() => setShowModal(true)} className="w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-emerald-400 transition-all shadow-xl">
                <Plus size={16} /> Nouveau Dossier
              </button>
            ) : (
              <button 
                disabled={agencyProfile.pack === 'CORE' && staffList.length >= currentPack.max_staff}
                onClick={() => setShowStaffModal(true)} 
                className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase transition-all ${agencyProfile.pack === 'CORE' && staffList.length >= currentPack.max_staff ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-white'}`}
              >
                {agencyProfile.pack === 'CORE' && staffList.length >= currentPack.max_staff ? <Key size={16}/> : <UserPlus size={16} />}
                {agencyProfile.pack === 'CORE' && staffList.length >= currentPack.max_staff ? 'Quota Atteint' : 'Ajouter un Expert'}
              </button>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="Recherche..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div> : 
            activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-inner' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                  <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                  <p className="text-[9px] uppercase opacity-50 font-bold tracking-widest">{p.nom_villa}</p>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 group">
                  <div>
                    <div className="flex items-center gap-2"><UserCheck size={12} className="text-emerald-500" /><p className="font-bold text-sm text-white">{s.nom}</p></div>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block tracking-tighter">PIN APP : {s.pin_code}</p>
                  </div>
                  <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              ))
            )
          }
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A] text-left">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 backdrop-blur-3xl flex justify-between items-end shadow-2xl">
              <div>
                <h2 className="text-5xl font-bold tracking-tighter text-white mb-4 italic uppercase">{selectedProjet.nom_villa}</h2>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 border border-white/5"><MapPin size={12}/> {selectedProjet.ville}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">Client PIN : {selectedProjet.pin_code}</span>
                  <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-500/20"><Euro size={12}/> Cashback: {selectedProjet.montant_cashback}€</span>
                </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => window.open('https://votre-site.com', '_blank')} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"><Globe size={20}/></button>
                 <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"><LogOut size={20}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-bold uppercase text-emerald-500 mb-6 tracking-widest flex items-center gap-2"><Activity size={14}/> Étape actuelle : {selectedProjet.etape_actuelle}</h3>
                   <p className="text-2xl font-medium text-slate-200 italic border-l-4 border-emerald-500 pl-8 py-2 leading-relaxed">
                     "{selectedProjet.commentaires_etape || "En attente du premier constat terrain..."}"
                   </p>
                </div>
              </div>

              <div className="bg-[#0F172A]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-[450px] shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-3"><Camera size={16} className="text-emerald-500"/> Documents Clients</h3>
                  <label className="cursor-pointer p-3 bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg shadow-emerald-500/20">
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <input type="file" className="hidden" onChange={handleUploadDocument} disabled={updating} />
                  </label>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
                      <p className="text-[11px] font-medium truncate flex-1 mr-4 text-slate-400 group-hover:text-white">{doc.nom_fichier}</p>
                      <div className="flex gap-2">
                        <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-2 text-slate-600 hover:text-white"><Download size={14} /></a>
                        <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('documents_projets').delete().eq('id', doc.id); loadDocuments(selectedProjet.id); }}} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
              <Zap size={120} className="text-emerald-500 mb-8" />
              <p className="text-3xl font-black uppercase tracking-[0.5em] text-center">{agencyProfile.company_name}</p>
          </div>
        )}
      </div>

      {/* MODALE CRÉATION AGENT */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleCreateStaff} className="bg-[#0F172A] w-full max-w-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nouvel <span className="text-emerald-400">Expert</span></h2>
              <button type="button" onClick={() => setShowStaffModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            <div className="space-y-4">
              <input required placeholder="Prénom" className="w-full p-5 bg-black/40 rounded-2xl border border-white/10 text-sm outline-none focus:border-emerald-500/50" onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full p-5 bg-black/40 rounded-2xl border border-white/10 text-sm outline-none focus:border-emerald-500/50" onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
            </div>
            <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 flex items-center gap-2"><Key size={14}/> Accès Application</p>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">La validation générera un PIN unique. L'agent pourra l'utiliser sur l'app mobile pour synchroniser les rapports photos.</p>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-[11px] hover:bg-white transition-all shadow-xl shadow-emerald-500/10">
              {updating ? 'Initialisation...' : 'Enregistrer & Créer PIN'}
            </button>
          </form>
        </div>
      )}

      {/* MODALE DOSSIER CLIENT (VOTRE BASE CORRIGÉE) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateDossier} className="bg-[#0F172A] w-full max-w-4xl rounded-[3rem] p-10 border border-white/10 text-left space-y-8 my-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Nouveau <span className="text-emerald-400 font-black">Dossier Client</span></h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white"><X /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Identité & Lieu</p>
                  <input required placeholder="Prénom" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  <input type="email" required placeholder="Email Client" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Ville" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                    <input placeholder="Pays" defaultValue="Espagne" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, pays: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Détails Projet</p>
                  <input required placeholder="Nom de la Villa" className="w-full p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 font-black uppercase" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                    <input type="number" placeholder="Cashback (€)" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm" onChange={e => setNewDossier({...newDossier, montant_cashback: Number(e.target.value)})} />
                  </div>
                  <select className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-xs uppercase font-bold" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                    {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <textarea placeholder="Commentaire initial..." className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-sm h-20" onChange={e => setNewDossier({...newDossier, commentaires_etape: e.target.value})} />
               </div>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-white transition-all shadow-xl">
               {updating ? 'Initialisation du Projet...' : 'Créer le Dossier & Générer PIN'}
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}