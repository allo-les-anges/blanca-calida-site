"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, 
  Download, Upload, Key, AlertTriangle, Users, UserPlus, ChevronRight,
  Home, LogOut, LayoutDashboard, Activity, Zap, Euro, Calendar, Briefcase, Globe, UserCheck, CheckCircle2
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
  
  const [editComment, setEditComment] = useState("");
  const [editStep, setEditStep] = useState("");

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

  // --- CHARGEMENT DES DONNÉES (CORRIGÉ POUR VERCEL) ---
  const loadData = async () => {
    setLoading(true);
    console.log("Démarrage du chargement pour Amaru-Homes...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email) {
        const userEmail = user.email.toLowerCase();

        // 1. Récupérer le profil (On enlève .single() pour éviter le crash si non trouvé)
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail);

        // On définit le nom exact trouvé en base, ou le fallback correct
        const profile = profiles?.[0];
        const currentAgencyName = profile?.company_name || "Amaru-Homes";

        setAgencyProfile({
          company_name: currentAgencyName,
          pack: profile?.pack || "CORE",
          logo_url: profile?.logo_url || null
        });

        console.log("Recherche des dossiers pour :", currentAgencyName);

        // 2. Charger les dossiers avec le NOM EXACT (Amaru-Homes)
        const { data: projData, error: projError } = await supabase
          .from('suivi_chantier')
          .select('*')
          .eq('company_name', currentAgencyName)
          .order('created_at', { ascending: false });

        if (projError) throw projError;
        if (projData) setProjets(projData);

        // 3. Charger le staff
        const { data: stfData } = await supabase
          .from('staff_prestataires')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (stfData) setStaffList(stfData);
      }
    } catch (err) {
      console.error("Erreur critique loadData:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (projetId: string) => {
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', projetId);
    setDocuments(data ? [...data].sort((a, b) => b.id - a.id) : []);
  };

  useEffect(() => { loadData(); }, []);
  
  useEffect(() => { 
    if (selectedProjet?.id) {
      loadDocuments(selectedProjet.id);
      setEditComment(selectedProjet.commentaires_etape || "");
      setEditStep(selectedProjet.etape_actuelle || PHASES_CHANTIER[0]);
    } 
  }, [selectedProjet]);

  // --- ACTIONS LOGIQUE ---

  const handleUpdateProjet = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update({ 
        commentaires_etape: editComment, 
        etape_actuelle: editStep,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedProjet.id);
    
    if (!error) {
      alert("Projet mis à jour !");
      loadData();
    }
    setUpdating(false);
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    setUpdating(true);
    try {
      const fileName = `${selectedProjet.id}/${type}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('documents-clients').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(fileName);

      await supabase.from('documents_projets').insert([{
        projet_id: selectedProjet.id, 
        nom_fichier: file.name, 
        url_fichier: publicUrl, 
        storage_path: fileName,
        type_document: type
      }]);
      loadDocuments(selectedProjet.id);
    } catch (err: any) {
      alert(err.message);
    } finally { setUpdating(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = PACK_CONFIG[agencyProfile.pack as keyof typeof PACK_CONFIG] || PACK_CONFIG.CORE;
    if (staffList.length >= config.max_staff) {
      alert("Limite atteinte pour votre pack.");
      return;
    }
    setUpdating(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase.from('staff_prestataires').insert([{ nom: `${newStaff.prenom} ${newStaff.nom}`, pin_code: pin }]);
    if (!error) { setShowStaffModal(false); setNewStaff({nom:"", prenom:""}); loadData(); }
    setUpdating(false);
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // On force l'utilisation de company_name pour lier le dossier à l'agence actuelle
    const { error } = await supabase.from('suivi_chantier').insert([{ 
      ...newDossier, 
      pin_code: pin,
      company_name: agencyProfile.company_name 
    }]);

    if (!error) { 
      setShowModal(false); 
      loadData(); 
    } else {
      alert("Erreur lors de la création : " + error.message);
    }
    setUpdating(false);
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  const currentPack = PACK_CONFIG[agencyProfile.pack as keyof typeof PACK_CONFIG] || PACK_CONFIG.CORE;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans text-left">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-8 space-y-8">
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
            <button onClick={() => activeTab === 'clients' ? setShowModal(true) : setShowStaffModal(true)} className="w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-emerald-400 transition-all shadow-xl">
              <Plus size={16} /> {activeTab === 'clients' ? 'Nouveau Dossier' : 'Ajouter un Expert'}
            </button>
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
                  <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
                  <p className="text-[9px] uppercase opacity-50 font-bold tracking-widest text-emerald-400">{p.nom_villa}</p>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                  <div>
                    <div className="flex items-center gap-2"><UserCheck size={12} className="text-emerald-500" /><p className="font-bold text-sm text-white">{s.nom}</p></div>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1">PIN : {s.pin_code}</p>
                  </div>
                  <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              ))
            )
          }
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A]">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 flex justify-between items-center shadow-2xl">
              <div>
                <h2 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase italic">{selectedProjet.nom_villa}</h2>
                <div className="flex flex-wrap gap-3">
                   <span className="bg-emerald-500 text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">PIN CLIENT: {selectedProjet.pin_code}</span>
                   <span className="bg-white/5 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><MapPin size={10}/> {selectedProjet.ville}</span>
                </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={handleUpdateProjet} disabled={updating} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
                    {updating ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Enregistrer Modifs
                 </button>
                 <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={18}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Progression du Chantier</h3>
                <div className="bg-black/40 p-3 rounded-[2rem] border border-white/5 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {PHASES_CHANTIER.map((phase, idx) => {
                    const isActive = editStep === phase;
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setEditStep(phase)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-emerald-500 border-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20' : 'bg-transparent border-white/5 text-slate-500 hover:border-white/20'}`}
                      >
                        <span className="text-[10px] uppercase tracking-tight truncate">{phase}</span>
                        {isActive && <CheckCircle2 size={14} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest flex items-center gap-2">
                    <Activity size={14}/> Note pour le client (Étape {editStep.split('.')[0]})
                  </h3>
                  <textarea 
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-lg text-slate-200 min-h-[150px] outline-none focus:border-emerald-500/50 transition-all italic"
                    placeholder="Écrivez ici l'avancement pour le client..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-2"><Camera size={14} className="text-emerald-500"/> Galerie Photo</h3>
                      <label className="cursor-pointer p-2 bg-emerald-500 text-black rounded-lg hover:scale-110 transition-all">
                        <Plus size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadDocument(e, 'photo')} />
                      </label>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {documents.filter(d => d.type_document !== 'pdf').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                          <img src={doc.url_fichier} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 ml-4 truncate text-[10px] font-bold text-slate-400">{doc.nom_fichier}</div>
                          <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('documents_projets').delete().eq('id', doc.id); loadDocuments(selectedProjet.id); }}} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-2"><FileText size={14} className="text-blue-400"/> Dossier PDF</h3>
                      <label className="cursor-pointer p-2 bg-blue-500 text-white rounded-lg hover:scale-110 transition-all">
                        <Upload size={16} />
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleUploadDocument(e, 'pdf')} />
                      </label>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {documents.filter(d => d.type_document === 'pdf').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FileText size={14}/></div>
                          <div className="flex-1 ml-4 truncate text-[10px] font-bold text-slate-400">{doc.nom_fichier}</div>
                          <a href={doc.url_fichier} target="_blank" className="p-2 text-slate-600 hover:text-white"><Download size={14}/></a>
                        </div>
                      ))}
                    </div>
                  </div>
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}