"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, Download, Upload, Key
} from 'lucide-react';

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
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newDossier, setNewDossier] = useState({
    client_prenom: "",
    client_nom: "",
    email_client: "",
    rue: "",
    ville: "",
    pays: "Belgique",
    nom_villa: "",
    date_livraison_prevue: "",
    montant_cashback: 0,
    commentaires_etape: "",
    etape_actuelle: PHASES_CHANTIER[0]
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    if (data) setProjets(data);
    setLoading(false);
  };

  const loadDocuments = async (projetId: string) => {
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', projetId);
    setDocuments(data || []);
  };

  useEffect(() => { loadData(); }, []);
  
  useEffect(() => {
    if (selectedProjet?.id) loadDocuments(selectedProjet.id);
  }, [selectedProjet]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    
    setUploading(true);
    const filePath = `${selectedProjet.id}/${Date.now()}_${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage.from('documents-clients').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(filePath);
      
      await supabase.from('documents_projets').insert([{
        projet_id: selectedProjet.id,
        nom_fichier: file.name,
        url_fichier: publicUrl
      }]);

      loadDocuments(selectedProjet.id);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      alert("Erreur upload storage.");
    } finally {
      setUploading(false);
    }
  };

  // --- FONCTION CORRIGÉE : PLUS D'APPEL API AUTH ---
  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Générer un PIN localement (4 chiffres)
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

      // 2. Insérer directement dans la table des chantiers
      const { error } = await supabase.from('suivi_chantier').insert([{
        ...newDossier,
        pin_code: generatedPin
      }]);

      if (error) throw error;

      alert(`Dossier Client créé ! PIN : ${generatedPin}`);
      setShowModal(false);
      loadData();
      
      // Reset
      setNewDossier({
        client_prenom: "", client_nom: "", email_client: "",
        rue: "", ville: "", pays: "Belgique",
        nom_villa: "", date_livraison_prevue: "",
        montant_cashback: 0, commentaires_etape: "",
        etape_actuelle: PHASES_CHANTIER[0]
      });

    } catch (err: any) {
      alert("Erreur de création : " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans">
      
      {/* SIDEBAR - Style Indigo SaaS */}
      <div className="w-full md:w-80 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm z-20">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck size={20} />
            <h1 className="text-xl font-serif italic text-slate-900">Partner Portal</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="w-full bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Plus size={16} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Rechercher un client..." className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none border border-slate-100 focus:border-indigo-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-200" /></div> : 
            filteredProjets.map((p) => (
              <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedProjet?.id === p.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:border-indigo-200'}`}>
                <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-[9px] opacity-60 uppercase">{p.nom_villa}</p>
                  <p className="text-[9px] font-mono bg-black/10 px-1 rounded">PIN: {p.pin_code}</p>
                </div>
              </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto bg-slate-50/50">
        {selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8 text-left">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-serif italic text-slate-900">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <div className="flex gap-4 mt-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Mail size={14} className="text-indigo-500"/> {selectedProjet.email_client}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500"/> {selectedProjet.rue}, {selectedProjet.ville}</span>
                  <span className="flex items-center gap-1.5"><Key size={14} className="text-amber-500"/> Accès : {selectedProjet.pin_code}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
                  <FileText size={120} />
                </div>
                <h3 className="text-[10px] uppercase text-indigo-400 mb-6 font-black tracking-widest">Note de suivi</h3>
                <p className="italic font-serif text-xl opacity-90 leading-relaxed">"{selectedProjet.commentaires_etape || "Aucune note pour le moment."}"</p>
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
                   <div className="px-4 py-2 bg-indigo-500 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                      Étape actuelle : {selectedProjet.etape_actuelle}
                   </div>
                </div>
              </div>

              {/* DOCUMENTS */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2 tracking-widest">
                  <Camera size={14} className="text-indigo-500"/> Galerie & Pièces
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                  {documents.length > 0 ? documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <a href={doc.url_fichier} target="_blank" className="text-[10px] font-bold truncate text-slate-700 hover:text-indigo-600">{doc.nom_fichier}</a>
                      <Download size={14} className="text-slate-400" />
                    </div>
                  )) : <p className="text-[10px] italic text-slate-300 text-center py-8">Aucun document chargé.</p>}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  {uploadSuccess && <p className="text-[10px] text-emerald-600 font-bold text-center mb-3 animate-bounce">✓ FICHIER ENREGISTRÉ</p>}
                  <label className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[9px] font-black uppercase cursor-pointer hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-md">
                    {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                    <span>{uploading ? "Transfert..." : "Ajouter un fichier"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center">
              <ShieldCheck size={48} className="text-slate-100 mb-4" />
              <p className="font-serif italic text-2xl text-slate-400">Prêt pour le suivi chantier</p>
              <p className="text-xs uppercase tracking-widest mt-2">Sélectionnez un dossier dans la liste</p>
            </div>
          </div>
        )}
      </div>

      {/* MODALE - STYLE ÉPURÉ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-4xl rounded-[3rem] p-12 shadow-2xl space-y-8 text-left max-h-[95vh] overflow-y-auto relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors rounded-2xl"><X /></button>
            
            <div className="border-b pb-6">
               <h2 className="text-3xl font-serif italic text-slate-900">Nouveau Dossier Client</h2>
               <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Lancement de la procédure de suivi</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full w-fit tracking-widest">Identité Client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Prénom</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100 focus:border-indigo-300" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Nom</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100 focus:border-indigo-300" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Email de contact</label>
                  <input type="email" required className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100 focus:border-indigo-300" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Localisation du projet</label>
                  <input placeholder="Rue et numéro" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100 focus:border-indigo-300" onChange={e => setNewDossier({...newDossier, rue: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Ville" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100" onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                  <input defaultValue="Belgique" className="w-full p-4 bg-slate-100 text-slate-500 font-bold rounded-xl outline-none text-sm cursor-not-allowed" readOnly />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full w-fit tracking-widest">Détails Construction</h3>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Nom du modèle / Villa</label>
                  <input required className="w-full p-4 bg-indigo-900 text-white rounded-xl outline-none text-sm shadow-inner" placeholder="Ex: Villa Maria" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Note initiale</label>
                  <textarea placeholder="Commentaires ou spécificités..." className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs border border-slate-100 h-24" onChange={e => setNewDossier({...newDossier, commentaires_etape: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-4 bg-slate-900 text-white rounded-xl outline-none font-bold text-[10px] uppercase tracking-tighter" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                    {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs border border-slate-100" onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-tighter">Cashback Client (€)</label>
                   <input type="number" placeholder="Montant" className="w-full p-4 bg-emerald-50 text-emerald-700 font-black rounded-xl outline-none text-sm border border-emerald-100" onChange={e => setNewDossier({...newDossier, montant_cashback: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98]">
              {updating ? <Loader2 className="animate-spin mx-auto" /> : "Générer le dossier et le PIN sécurisé"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}