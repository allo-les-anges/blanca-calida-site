"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, 
  Download, Upload, Key, AlertTriangle, Users, UserPlus, ChevronRight,
  Home, LogOut 
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
  // --- ÉTATS GLOBAUX ---
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ÉTATS CLIENTS ---
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "",
    rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "",
    montant_cashback: 0, commentaires_etape: "",
    etape_actuelle: PHASES_CHANTIER[0]
  });

  // --- ÉTATS STAFF ---
  const [staffList, setStaffList] = useState<any[]>([]);
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
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', projetId).order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedProjet?.id) loadDocuments(selectedProjet.id); }, [selectedProjet]);

  // --- ACTIONS DOCUMENTS (AJOUTÉ) ---
  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;

    setUpdating(true);
    try {
      // 1. Upload vers Supabase Storage (Bucket: 'projet-documents')
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${selectedProjet.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('projet-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('projet-documents')
        .getPublicUrl(filePath);

      // 3. Insérer la référence dans la table SQL
      const { error: dbError } = await supabase
        .from('documents_projets')
        .insert([{
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
    const { error } = await supabase.from('documents_projets').delete().eq('id', docId);
    if (!error && selectedProjet) loadDocuments(selectedProjet.id);
  };

  // --- ACTIONS CLIENTS ---
  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const { error } = await supabase.from('suivi_chantier').insert([{ ...newDossier, pin_code: generatedPin }]);
      if (error) throw error;
      alert(`Dossier Client créé ! PIN : ${generatedPin}`);
      setShowModal(false);
      loadData();
    } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("⚠️ Supprimer ce client définitivement ?")) return;
    await supabase.from('suivi_chantier').delete().eq('id', id);
    setSelectedProjet(null);
    loadData();
  };

  // --- ACTIONS STAFF ---
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.nom || !newStaff.prenom) return;
    setUpdating(true);
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const { error } = await supabase.from('staff_prestataires').insert([{ ...newStaff, pin_code: generatedPin }]);
      if (error) throw error;
      setNewStaff({ nom: "", prenom: "" });
      loadData();
    } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Supprimer cet accès staff ?")) return;
    await supabase.from('staff_prestataires').delete().eq('id', id);
    loadData();
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-85 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm z-20 text-left">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck size={24} strokeWidth={2.5} />
            <h1 className="text-xl font-serif italic text-slate-900">Partner Portal</h1>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Clients</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Staff PIN</button>
          </div>

          {activeTab === 'clients' ? (
            <div className="space-y-4">
              <button onClick={() => setShowModal(true)} className="w-full bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                <Plus size={16} /> Nouveau Dossier
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Rechercher une villa..." className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none border border-slate-100 focus:border-indigo-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateStaff} className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 space-y-3">
              <p className="text-[10px] font-black uppercase text-indigo-600 mb-2">Ajouter un Agent Terrain</p>
              <input required placeholder="Prénom" className="w-full p-3 bg-white rounded-xl text-xs border border-indigo-100 outline-none" value={newStaff.prenom} onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full p-3 bg-white rounded-xl text-xs border border-indigo-100 outline-none" value={newStaff.nom} onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              <button type="submit" disabled={updating} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase">
                {updating ? <Loader2 className="animate-spin mx-auto" size={14}/> : "Générer Accès PIN"}
              </button>
            </form>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-200" /></div> : 
            activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedProjet?.id === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 hover:border-indigo-200'}`}>
                  <p className="font-bold text-sm truncate">{p.client_prenom} {p.client_nom}</p>
                  <div className="flex justify-between items-center mt-1 opacity-60">
                    <p className="text-[9px] uppercase font-medium">{p.nom_villa}</p>
                    <p className="text-[9px] font-mono font-bold">PIN: {p.pin_code}</p>
                  </div>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="w-full bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center group animate-in fade-in">
                  <div>
                    <p className="font-bold text-sm text-slate-700">{s.prenom} {s.nom}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">PIN: {s.pin_code}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteStaff(s.id)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )
          }
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-2">
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all group">
            <Home size={18} className="group-hover:scale-110 transition-transform text-slate-400 group-hover:text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Retour Accueil</span>
          </button>
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group">
            <LogOut size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Quitter</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#FBFDFF]">
        {selectedProjet && activeTab === 'clients' ? (
          <div className="max-w-5xl mx-auto space-y-8 text-left animate-in fade-in slide-in-from-right-4">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200/50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em]">Fiche Chantier</span>
                <h2 className="text-4xl font-serif italic text-slate-900 mt-2">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <div className="flex flex-wrap gap-4 mt-6 text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full"><Mail size={13} className="text-indigo-500"/> {selectedProjet.email_client}</span>
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full"><MapPin size={13} className="text-indigo-500"/> {selectedProjet.ville}</span>
                  <span className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full"><Key size={13}/> PIN CLIENT: {selectedProjet.pin_code}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <h3 className="text-[10px] uppercase text-indigo-400 mb-6 font-black tracking-widest">Dernier rapport terrain</h3>
                  <p className="italic font-serif text-2xl opacity-90 leading-relaxed">"{selectedProjet.commentaires_etape || "En attente du premier rapport..."}"</p>
                  <div className="mt-10 flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                      Étape actuelle : {selectedProjet.etape_actuelle}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-red-50/50 border border-red-100 rounded-[2.5rem] flex items-center justify-between">
                  <div>
                    <h4 className="text-red-600 font-bold text-sm flex items-center gap-2 tracking-tight uppercase">Suppression du dossier</h4>
                    <p className="text-[10px] text-red-400 font-medium mt-1">Toutes les photos et documents seront effacés.</p>
                  </div>
                  <button onClick={() => handleDeleteClient(selectedProjet.id)} className="p-4 bg-white text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* SECTION DOCUMENTS CORRIGÉE */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200/50 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 mb-0 flex items-center gap-2 tracking-widest">
                    <Camera size={14} className="text-indigo-500"/> Documents & Médias
                  </h3>
                  
                  {/* INPUT UPLOAD */}
                  <label className="cursor-pointer p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleUploadDocument} 
                      disabled={updating}
                    />
                  </label>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {documents.length === 0 ? (
                    <div className="text-center py-10">
                      <FileText size={32} className="mx-auto text-slate-100 mb-2" />
                      <p className="text-[10px] text-slate-400 italic">Aucun document</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-indigo-100 transition-all">
                        <div className="truncate flex-1">
                          <p className="text-[10px] font-bold truncate text-slate-700">{doc.nom_fichier}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Download size={14} />
                          </a>
                          <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
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
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="bg-white p-16 rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center animate-pulse">
              <ShieldCheck size={64} className="text-slate-100 mb-6" />
              <p className="font-serif italic text-2xl text-slate-400">Sélectionnez une villa ou un agent</p>
            </div>
          </div>
        )}
      </div>

      {/* MODALE NOUVEAU DOSSIER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-4xl rounded-[3.5rem] p-12 shadow-2xl space-y-8 text-left max-h-[90vh] overflow-y-auto relative border border-white/20">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><X /></button>
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-3xl font-serif italic text-slate-900">Ouverture de Dossier</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Génération automatique du code PIN client</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl w-fit">Informations Client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm border border-slate-100 focus:border-indigo-300 transition-all" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm border border-slate-100 focus:border-indigo-300 transition-all" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                </div>
                <input type="email" required placeholder="Email personnel" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm border border-slate-100 focus:border-indigo-300 transition-all" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-4 py-2 rounded-xl w-fit">Détails de Construction</h3>
                <input required placeholder="Nom de la Villa" className="w-full p-4 bg-slate-900 text-white rounded-2xl outline-none text-sm shadow-xl focus:ring-2 ring-indigo-500 transition-all" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold text-[10px] uppercase tracking-tighter" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                    {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="date" className="w-full p-4 bg-slate-100 rounded-2xl outline-none text-[10px] font-bold" onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all active:scale-[0.98]">
              {updating ? <Loader2 className="animate-spin mx-auto" /> : "Valider & Créer le Dossier"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}