"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, 
  Download, Upload, Key, AlertTriangle, Users, UserPlus, ChevronRight,
  Home, LogOut, LayoutDashboard, Activity, Zap
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "",
    rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "",
    montant_cashback: 0, commentaires_etape: "",
    etape_actuelle: PHASES_CHANTIER[0]
  });

  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "" });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = async () => {
    setLoading(true);
    const { data: projData } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
    if (projData) setProjets(projData);
    if (stfData) setStaffList(stfData);
    setLoading(false);
  };

  const loadDocuments = async (projetId: string) => {
    if (!projetId) return;
    const { data, error } = await supabase
      .from('documents_projets')
      .select('*')
      .eq('projet_id', projetId)
      .order('created_at', { ascending: false });
    
    if (error) {
       console.error("Erreur de lecture SQL:", error);
    } else {
       setDocuments(data || []);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedProjet?.id) loadDocuments(selectedProjet.id); }, [selectedProjet]);

  // --- GESTION DES FICHIERS (UPLOAD & DELETE) ---
  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${file.name}`;
      const filePath = `${selectedProjet.id}/${fileName}`;

      // 1. Upload vers le Storage
      const { error: uploadError } = await supabase.storage
        .from('documents-clients')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents-clients')
        .getPublicUrl(filePath);

      // 2. Enregistrement en Base de données
      const { error: dbError } = await supabase.from('documents_projets').insert([{
          projet_id: selectedProjet.id,
          nom_fichier: file.name,
          url_fichier: publicUrl,
          storage_path: filePath // On stocke le chemin pour faciliter la suppression plus tard
        }]);

      if (dbError) throw dbError;

      setTimeout(() => {
        loadDocuments(selectedProjet.id);
        setUpdating(false);
      }, 1000);

    } catch (err: any) {
      alert("Erreur upload : " + (err.message || "Erreur inconnue"));
      setUpdating(false);
    } finally {
      e.target.value = ""; 
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    if (!confirm(`Supprimer définitivement le fichier "${doc.nom_fichier}" ?`)) return;

    try {
      setUpdating(true);

      // 1. Supprimer du Storage Supabase si le chemin est connu
      if (doc.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('documents-clients')
          .remove([doc.storage_path]);
        
        if (storageError) console.warn("Note: Fichier non trouvé dans le storage, suppression SQL uniquement.");
      }

      // 2. Supprimer de la table SQL
      const { error: dbError } = await supabase
        .from('documents_projets')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      // 3. Rafraîchir la liste
      await loadDocuments(selectedProjet.id);
      
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // --- AUTRES ACTIONS ---
  const handleDeleteClient = async (id: string) => {
    if (!confirm("⚠️ Supprimer ce dossier client ?")) return;
    await supabase.from('suivi_chantier').delete().eq('id', id);
    setSelectedProjet(null);
    loadData();
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    await supabase.from('suivi_chantier').insert([{ ...newDossier, pin_code: pin }]);
    setShowModal(false);
    loadData();
    setUpdating(false);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from('staff_prestataires').insert([{ ...newStaff, pin_code: pin }]);
    setNewStaff({ nom: "", prenom: "" });
    loadData();
    setUpdating(false);
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-8 space-y-8 text-left">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white uppercase italic">Prestige <span className="text-emerald-400 font-black">OS</span></h1>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Clients</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Agents</button>
          </div>

          {activeTab === 'clients' && (
            <div className="space-y-4">
              <button onClick={() => setShowModal(true)} className="w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-emerald-400 transition-all">
                <Plus size={16} /> Nouveau Dossier
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input type="text" placeholder="Recherche..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div> : 
            activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                  <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                  <p className="text-[9px] uppercase opacity-50">{p.nom_villa}</p>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p>
                  <span className="text-[10px] font-mono text-emerald-400">PIN: {s.pin_code}</span>
                </div>
              ))
            )
          }
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A] text-left">
        {selectedProjet && activeTab === 'clients' ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 backdrop-blur-3xl flex justify-between items-end">
              <div>
                <h2 className="text-5xl font-bold tracking-tighter text-white mb-4">{selectedProjet.nom_villa}</h2>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white/5 px-4 py-2 rounded-full">{selectedProjet.client_prenom} {selectedProjet.client_nom}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">PIN: {selectedProjet.pin_code}</span>
                </div>
              </div>
              <button onClick={() => handleDeleteClient(selectedProjet.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-black p-10 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-6 tracking-widest">Dernier rapport terrain</h3>
                   <p className="text-2xl font-medium text-slate-200 italic border-l-2 border-emerald-500 pl-6 py-2">
                     "{selectedProjet.commentaires_etape || "Aucun log disponible."}"
                   </p>
                </div>
              </div>

              <div className="bg-[#0F172A]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-[500px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-3">
                    <Camera size={16} className="text-emerald-400"/> Documents & Media
                  </h3>
                  <label className="cursor-pointer p-3 bg-emerald-500 text-black rounded-xl hover:scale-105 transition-all">
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <input type="file" className="hidden" onChange={handleUploadDocument} disabled={updating} />
                  </label>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {documents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                      <FileText size={40} className="mb-2" />
                      <p className="text-[10px] uppercase font-bold">Aucun document</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all">
                        <p className="text-[11px] font-medium truncate text-slate-300 flex-1 mr-4">{doc.nom_fichier}</p>
                        <div className="flex gap-2">
                          <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Download size={14} />
                          </a>
                          <button 
                            onClick={() => handleDeleteDocument(doc)} 
                            disabled={updating}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-30"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
             <Zap size={60} className="text-emerald-500 mb-8" />
             <p className="text-2xl font-light italic text-slate-500 tracking-tighter">Sélectionnez un terminal pour commencer</p>
          </div>
        )}
      </div>

      {/* MODALE CRÉATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-[#0F172A] w-full max-w-4xl rounded-[3rem] p-10 border border-white/10 text-left space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white uppercase italic">Nouveau <span className="text-emerald-400 font-black">Dossier</span></h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white"><X /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <input required placeholder="Prénom" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  <input type="email" required placeholder="Email" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
               </div>
               <div className="space-y-4">
                  <input required placeholder="Nom de la Villa" className="w-full p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 outline-none font-bold" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                  <select className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none text-xs uppercase" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                    {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
               </div>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg">Générer Dossier</button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}