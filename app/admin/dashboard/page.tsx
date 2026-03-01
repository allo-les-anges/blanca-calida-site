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
  // --- ÉTATS ---
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

  // --- CHARGEMENT ---
  const loadData = async () => {
    setLoading(true);
    const { data: projData } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
    if (projData) setProjets(projData);
    if (stfData) setStaffList(stfData);
    setLoading(false);
  };

  const loadDocuments = async (projetId: string) => {
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', projetId).order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedProjet?.id) loadDocuments(selectedProjet.id); }, [selectedProjet]);

  // --- ACTIONS LOGIQUE ---
  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${selectedProjet.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents-clients')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents-clients')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('documents_projets').insert([{
          projet_id: selectedProjet.id,
          nom_fichier: file.name,
          url_fichier: publicUrl
        }]);

      if (dbError) throw dbError;
      loadDocuments(selectedProjet.id);
    } catch (err: any) {
      alert("Erreur upload : " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    await supabase.from('documents_projets').delete().eq('id', docId);
    if (selectedProjet) loadDocuments(selectedProjet.id);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("⚠️ Supprimer ce dossier client définitivement ?")) return;
    const { error } = await supabase.from('suivi_chantier').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      setSelectedProjet(null);
      loadData();
    }
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const { error } = await supabase.from('suivi_chantier').insert([{ ...newDossier, pin_code: generatedPin }]);
      if (error) throw error;
      setShowModal(false);
      loadData();
    } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await supabase.from('staff_prestataires').insert([{ ...newStaff, pin_code: generatedPin }]);
      setNewStaff({ nom: "", prenom: "" });
      loadData();
    } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Supprimer cet accès agent ?")) return;
    await supabase.from('staff_prestataires').delete().eq('id', id);
    loadData();
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Zap size={20} className="text-emerald-400" />
            </div>
            <h1 className="text-lg font-bold tracking-tighter text-white uppercase italic">Prestige <span className="text-emerald-400 font-black">OS</span></h1>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-white'}`}>Clients</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-white'}`}>Agents</button>
          </div>

          {activeTab === 'clients' ? (
            <div className="space-y-4 text-left">
              <button onClick={() => setShowModal(true)} className="group w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all">
                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Nouveau Dossier
              </button>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={14} />
                <input type="text" placeholder="Recherche villa..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500/50 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateStaff} className="space-y-3 text-left">
               <input required placeholder="Prénom" className="w-full p-3 bg-white/5 rounded-xl border border-white/5 text-xs outline-none focus:border-emerald-500/50" value={newStaff.prenom} onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
               <input required placeholder="Nom" className="w-full p-3 bg-white/5 rounded-xl border border-white/5 text-xs outline-none focus:border-emerald-500/50" value={newStaff.nom} onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
               <button type="submit" className="w-full bg-emerald-500 text-black py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest">Créer Accès Agent</button>
            </form>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500/30" /></div> : 
            activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                  <p className={`font-bold text-sm ${selectedProjet?.id === p.id ? 'text-emerald-400' : 'text-slate-200'}`}>{p.client_prenom} {p.client_nom}</p>
                  <div className="flex justify-between items-center mt-1 opacity-50">
                    <p className="text-[9px] uppercase font-bold tracking-widest">{p.nom_villa}</p>
                    <p className="text-[9px] font-mono">PIN: {p.pin_code}</p>
                  </div>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p>
                    <span className="text-[10px] font-mono text-emerald-400">PIN: {s.pin_code}</span>
                  </div>
                  <button onClick={() => handleDeleteStaff(s.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))
            )
          }
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 space-y-1">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-emerald-400 rounded-xl transition-all">
            <Home size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard Public</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A] text-left">
        {selectedProjet && activeTab === 'clients' ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="relative group overflow-hidden bg-white/[0.02] p-8 md:p-12 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><LayoutDashboard size={120} /></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-[1px] w-8 bg-emerald-500"></span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.4em]">Propriété Active</span>
                  </div>
                  <h2 className="text-5xl font-bold tracking-tighter text-white mb-4">{selectedProjet.nom_villa}</h2>
                  <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5"><UserPlus size={12} className="text-emerald-400"/> {selectedProjet.client_prenom} {selectedProjet.client_nom}</span>
                    <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"><Key size={12}/> PIN ACCÈS: {selectedProjet.pin_code}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleDeleteClient(selectedProjet.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="relative bg-black p-10 rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-2xl">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                      <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                        <Activity size={24} className="text-emerald-400" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status Phase</p>
                        <p className="text-emerald-400 font-mono font-bold text-xl">{selectedProjet.etape_actuelle}</p>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Journal de bord Agent</h3>
                    <p className="text-2xl font-medium text-slate-200 leading-relaxed italic border-l-2 border-emerald-500 pl-6 py-2">
                      "{selectedProjet.commentaires_etape || "Aucun log terrain disponible."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F172A]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-3 tracking-[0.2em]">
                    <Camera size={16} className="text-emerald-400"/> Drive Médias
                  </h3>
                  <label className="cursor-pointer p-3 bg-emerald-500 text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <input type="file" className="hidden" onChange={handleUploadDocument} disabled={updating} />
                  </label>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
                  {documents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl p-8">
                      <FileText size={40} className="mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-center text-white">Drive Vide</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl group border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                        <div className="truncate flex-1">
                          <p className="text-[11px] font-medium truncate text-slate-300 group-hover:text-emerald-400">{doc.nom_fichier}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Download size={14} />
                          </a>
                          <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
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
          <div className="h-full flex flex-col items-center justify-center">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500/20 blur-[100px]"></div>
               <div className="relative bg-white/[0.02] border border-white/10 p-20 rounded-[4rem] backdrop-blur-3xl flex flex-col items-center">
                 <Zap size={60} className="text-emerald-500 mb-8 animate-pulse shadow-emerald-500" />
                 <p className="font-bold text-[10px] uppercase tracking-[0.5em] text-emerald-400 mb-2">Prestige System</p>
                 <p className="text-2xl font-light text-slate-500 italic">Veuillez sélectionner un terminal actif</p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALE CRÉATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-[#0F172A] w-full max-w-4xl rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold tracking-tighter text-white uppercase italic">Initialiser <span className="text-emerald-400 font-black">Nouveau Dossier</span></h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400"><X /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Client</p>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Prénom" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm transition-all" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm transition-all" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                </div>
                <input type="email" required placeholder="Email personnel" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm transition-all" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Construction</p>
                <input required placeholder="Nom de la Villa" className="w-full p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 outline-none text-sm font-bold transition-all" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none text-xs font-bold uppercase" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                    {PHASES_CHANTIER.map(p => <option key={p} value={p} className="bg-[#0F172A]">{p}</option>)}
                  </select>
                  <input type="date" className="w-full p-4 bg-black/40 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-sm transition-all" onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
              {updating ? <Loader2 className="animate-spin mx-auto" /> : "Générer Dossier Master"}
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}