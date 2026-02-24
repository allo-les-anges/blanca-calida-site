"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, Phone, MapPin, User, Calendar, HardHat, Globe, Mail, FileText, Download, Upload
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

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
    date_naissance: "",
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
    const { data } = await supabase
      .from('suivi_chantier')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjets(data);
    setLoading(false);
  };

  const loadDocuments = async (projetId: string) => {
    if (!projetId) return;
    const { data } = await supabase
      .from('documents_projets')
      .select('*')
      .eq('projet_id', projetId)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data);
  };

  useEffect(() => { loadData(); }, []);
  
  useEffect(() => {
    if (selectedProjet?.id) {
      loadDocuments(selectedProjet.id);
    } else {
      setDocuments([]);
    }
  }, [selectedProjet]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const currentProjetId = selectedProjet?.id;

    if (!files || !files[0] || !currentProjetId) return;
    
    setUploading(true);
    setUploadSuccess(false);
    const file = files[0];
    const filePath = `${currentProjetId}/${Date.now()}_${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('documents-clients')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('documents_projets').insert([{
        projet_id: currentProjetId,
        nom_fichier: file.name,
        url_fichier: publicUrl
      }]);

      if (dbError) throw dbError;
      
      await loadDocuments(currentProjetId);
      
      setUploading(false);
      setUploadSuccess(true);
      if (e.target) e.target.value = ""; 

      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (err: any) {
      console.error("Erreur Upload:", err);
      setUploading(false);
    }
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newDossier.email_client })
      });
      
      const auth = await res.json();
      if (!res.ok) throw new Error(auth.error || "Erreur Auth");

      const dataToInsert: any = {
        ...newDossier,
        pin_code: auth.pin,
      };

      if (!dataToInsert.date_naissance) delete dataToInsert.date_naissance;
      if (!dataToInsert.date_livraison_prevue) delete dataToInsert.date_livraison_prevue;
      dataToInsert.montant_cashback = Number(dataToInsert.montant_cashback) || 0;

      const { error: dbError } = await supabase
        .from('suivi_chantier')
        .insert([dataToInsert]);

      if (dbError) throw dbError;
      
      setUpdating(false);
      setShowModal(false);
      loadData();
      
    } catch (err: any) {
      setUpdating(false);
      console.error(err);
    }
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => 
      `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nom_villa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projets, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans">
      
      <div className="w-full md:w-80 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm">
        <div className="p-6 space-y-4 text-left">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck size={20} />
            <h1 className="text-xl font-serif italic tracking-tight text-slate-900">Blanca Calida</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg">
            <Plus size={16} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none border border-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-200" /></div>
          ) : (
            filteredProjets.map((p) => (
              <button 
                key={p.id} 
                onClick={() => setSelectedProjet(p)} 
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedProjet?.id === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}
              >
                <p className="text-[9px] uppercase font-black mb-1 opacity-60">{p.nom_villa || "Sans Nom"}</p>
                <p className="font-bold text-sm truncate">{p.client_prenom} {p.client_nom}</p>
                <div className="flex justify-between items-center mt-2 opacity-50 text-[9px]">
                  <span className="font-mono font-bold">PIN: {p.pin_code}</span>
                  <span className="truncate max-w-[100px]">{p.etape_actuelle?.split('.')[0]}...</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50/50">
        {selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left w-full">
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full tracking-widest">Dossier Administré</span>
                <h2 className="text-4xl font-serif italic mt-4">{selectedProjet?.client_prenom} {selectedProjet?.client_nom}</h2>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><Mail size={14}/> {selectedProjet?.email_client}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><MapPin size={14}/> {selectedProjet?.ville}, {selectedProjet?.pays}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><Calendar size={14}/> PIN: {selectedProjet?.pin_code}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Cashback Accordé</p>
                <p className="text-3xl font-bold text-emerald-600">{selectedProjet?.montant_cashback?.toLocaleString()} €</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><HardHat size={14} className="text-blue-500"/> Projet Villa</h3>
                    <p className="text-lg font-bold text-slate-800">{selectedProjet?.nom_villa}</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Étape Actuelle</p>
                      <p className="text-sm font-bold text-blue-900">{selectedProjet?.etape_actuelle}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><Calendar size={14} className="text-orange-500"/> Calendrier</h3>
                    <p className="text-lg font-bold text-slate-800 italic">{selectedProjet?.date_livraison_prevue || "Non définie"}</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-[0.2em]">Mémo Personnel Blanca Calida</h3>
                  <p className="text-lg text-slate-300 italic font-serif leading-relaxed">
                    "{selectedProjet?.commentaires_etape || "Aucun mémo interne."}"
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                  <FileText size={14} className="text-purple-500"/> Documents Clients
                </h3>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-2">
                  {documents.length > 0 ? documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileText size={14}/></div>
                        <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 truncate hover:underline">{doc.nom_fichier}</a>
                      </div>
                      <a href={doc.url_fichier} download className="text-slate-300 hover:text-emerald-500"><Download size={14}/></a>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-slate-400 italic text-[10px]">Aucun document trouvé.</div>
                  )}
                </div>
                
                <div className="mt-4">
                  {uploadSuccess && (
                    <p className="text-[10px] text-emerald-600 font-bold text-center mb-2 animate-pulse uppercase">
                      ✓ Document ajouté
                    </p>
                  )}
                  <label className="w-full bg-slate-900 text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4">
                      {uploading ? <Loader2 key="l1" className="animate-spin" size={16}/> : <Upload key="l2" size={16}/>}
                    </div>
                    <span>{uploading ? "Chargement..." : "Ajouter un document"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="application/pdf,image/*" disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
             <p className="font-serif italic text-2xl text-slate-400">Administration Blanca Calida</p>
             <p className="text-xs uppercase tracking-widest font-bold">Sélectionnez un client pour gérer son dossier</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl space-y-8 text-left max-h-[90vh] overflow-y-auto relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"><X /></button>
            <h2 className="text-2xl font-serif italic border-b pb-4">Nouveau Dossier Client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">Informations Personnelles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                </div>
                <input type="email" required placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Ville" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                  <input defaultValue="Belgique" className="w-full p-4 bg-emerald-50 text-emerald-900 font-bold rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, pays: e.target.value})} />
                </div>
              </div>
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">Données de Construction</h3>
                <input required placeholder="Nom de la Villa" className="w-full p-4 bg-slate-900 text-white rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-orange-600 ml-2">État initial</label>
                    <select className="w-full p-4 bg-orange-50 rounded-xl outline-none font-bold text-xs" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                      {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 ml-2">Livraison prévue</label>
                    <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs" onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-emerald-600 ml-2">Cashback Promis (€)</label>
                  <input type="number" placeholder="0" className="w-full p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, montant_cashback: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-600 transition-all flex justify-center items-center">
              {updating ? <Loader2 className="animate-spin" /> : "CRÉER LE DOSSIER CLIENT"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}