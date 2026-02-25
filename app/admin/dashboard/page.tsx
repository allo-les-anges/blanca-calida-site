"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, MapPin, Mail, FileText, Download, Upload
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
    rue: "", // Ajouté
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

  // FONCTION UPLOAD IMAGES / DOCUMENTS
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
      alert("Erreur upload storage : Vérifiez vos policies.");
    } finally {
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
      if (!res.ok) throw new Error(auth.error);

      const { error } = await supabase.from('suivi_chantier').insert([{
        ...newDossier,
        pin_code: auth.pin
      }]);

      if (error) throw error;
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert("Erreur Supabase : " + err.message); // C'est ici que l'erreur RLS de ton image 6 s'affiche
    } finally {
      setUpdating(false);
    }
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck size={20} />
            <h1 className="text-xl font-serif italic">Blanca Calida</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">
            <Plus size={16} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none border border-slate-100" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-200" /></div> : 
            filteredProjets.map((p) => (
              <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedProjet?.id === p.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:border-emerald-200'}`}>
                <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                <p className="text-[9px] opacity-60 uppercase mt-1">{p.nom_villa}</p>
              </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8 text-left">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-serif italic">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <div className="flex gap-4 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Mail size={14}/> {selectedProjet.email_client}</span>
                  <span className="flex items-center gap-1"><MapPin size={14}/> {selectedProjet.rue}, {selectedProjet.ville}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white">
                <h3 className="text-[10px] uppercase text-emerald-400 mb-4 font-black">Note Interne</h3>
                <p className="italic font-serif text-lg opacity-80">"{selectedProjet.commentaires_etape || "Aucune note."}"</p>
              </div>

              {/* BLOC DOCUMENTS / IMAGES */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                  <Camera size={14} className="text-purple-500"/> Images & Documents
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-2">
                  {documents.length > 0 ? documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <a href={doc.url_fichier} target="_blank" className="text-[10px] font-bold truncate hover:underline">{doc.nom_fichier}</a>
                      <Download size={14} className="text-slate-400" />
                    </div>
                  )) : <p className="text-[10px] italic text-slate-300">Aucun fichier.</p>}
                </div>
                <div className="mt-4">
                  {uploadSuccess && <p className="text-[10px] text-emerald-600 font-bold text-center mb-2">✓ CHARGÉ</p>}
                  <label className="w-full bg-slate-900 text-white py-4 rounded-xl text-[9px] font-black uppercase cursor-pointer hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                    <span>{uploading ? "Chargement..." : "Uploader"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p className="font-serif italic text-2xl">Sélectionnez un client</p>
          </div>
        )}
      </div>

      {/* MODALE CORRIGÉE (RUE + LABELS) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl space-y-8 text-left max-h-[90vh] overflow-y-auto relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl"><X /></button>
            <h2 className="text-2xl font-serif italic border-b pb-4">Nouveau Dossier Client</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">Informations Client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Prénom</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100" onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Nom</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100" onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Email</label>
                  <input type="email" required className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100" onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                </div>
                {/* CHAMP RUE ENFIN PRÉSENT */}
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Adresse / Rue</label>
                  <input placeholder="Ex: Rue Royale, 10" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100" onChange={e => setNewDossier({...newDossier, rue: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Ville" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm border border-slate-100" onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                  <input defaultValue="Belgique" className="w-full p-4 bg-emerald-50 text-emerald-900 font-bold rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, pays: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">Suivi Construction</h3>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Nom de la Villa</label>
                  <input required className="w-full p-4 bg-slate-900 text-white rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                </div>
                <textarea placeholder="Note interne..." className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs border border-slate-100 h-24" onChange={e => setNewDossier({...newDossier, commentaires_etape: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-4 bg-orange-50 rounded-xl outline-none font-bold text-xs" onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                    {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs" onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                </div>
                <input type="number" placeholder="Cashback (€)" className="w-full p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl outline-none text-sm" onChange={e => setNewDossier({...newDossier, montant_cashback: parseInt(e.target.value) || 0})} />
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px]">
              {updating ? <Loader2 className="animate-spin" /> : "CRÉER ET GÉNÉRER PIN"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}