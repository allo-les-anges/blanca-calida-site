"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, FilePlus, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, Phone, MapPin, Hash, Euro, ChevronRight 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES_CHANTIER = [
  "0. Signature du contrat", "1. Préparation du terrain", "2. Fondations", 
  "3. Gros œuvre (Murs)", "4. Charpente & Toiture", "5. Menuiseries", 
  "6. Électricité & Plomberie", "7. Isolation", "8. Plâtrerie", 
  "9. Carrelage & Sols", "10. Peintures", "11. Aménagements extérieurs", "12. Remise des clés"
];

export default function AdminInterface() {
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newDossier, setNewDossier] = useState({
    email: "", nom: "", prenom: "", tel: "", cp: "", ref: "", cashback: 0
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    if (data) {
      setProjets(data);
      if (data.length > 0) setSelectedProjet(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- UPLOAD PHOTOS/DOCS ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploading(type);

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProjet.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('PHOTOS-CHANTIER')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('PHOTOS-CHANTIER').getPublicUrl(fileName);
      
      if (type === 'photo') {
        setSelectedProjet({ ...selectedProjet, lien_photo: data.publicUrl });
      } else {
        const newDoc = { name: file.name, url: data.publicUrl, comment: "" };
        setSelectedProjet({
          ...selectedProjet,
          documents: [...(selectedProjet.documents || []), newDoc]
        });
      }
    } catch (error: any) {
      alert("Erreur upload: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newDossier.email })
      });
      const auth = await res.json();
      if (!res.ok) throw new Error(auth.error);

      const { error: dbError } = await supabase.from('suivi_chantier').insert([{
        nom_client: newDossier.email,
        client_nom: newDossier.nom,
        client_prenom: newDossier.prenom,
        telephone: newDossier.tel,
        code_postal: newDossier.cp,
        reference_interne: newDossier.ref,
        montant_cashback: newDossier.cashback,
        pin_code: auth.pin,
        etape_actuelle: 0,
        documents: []
      }]);

      if (dbError) throw dbError;
      alert(`Fiche créée ! PIN client : ${auth.pin}`);
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update({
        etape_actuelle: selectedProjet.etape_actuelle,
        lien_photo: selectedProjet.lien_photo,
        commentaire_photo: selectedProjet.commentaire_photo,
        montant_cashback: selectedProjet.montant_cashback,
        documents: selectedProjet.documents
      })
      .eq('id', selectedProjet.id);

    if (error) alert("Erreur de sauvegarde");
    else alert("Projet mis à jour !");
    setUpdating(false);
  };

  const filteredProjets = projets.filter(p => 
    p.reference_interne?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-serif italic">Chargement des dossiers...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-900">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white border-r flex flex-col h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-serif italic">Console Agence</h1>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
          >
            <Plus size={18} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Référence ou Nom..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {filteredProjets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjet(p)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedProjet?.id === p.id ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-white border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{p.reference_interne}</span>
                <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold italic">PIN: {p.pin_code}</span>
              </div>
              <p className="font-bold text-sm truncate">{p.client_prenom} {p.client_nom}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ZONE D'EDITION */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50/50">
        {selectedProjet ? (
          <div className="max-w-4xl mx-auto space-y-8 text-left pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div>
                <h2 className="text-3xl font-serif">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="text-slate-400 text-xs flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full"><Hash size={14}/> {selectedProjet.reference_interne}</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full"><Phone size={14}/> {selectedProjet.telephone}</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full"><MapPin size={14}/> {selectedProjet.code_postal}</span>
                </div>
              </div>
              <button onClick={handleSave} disabled={updating} className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all">
                {updating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                Enregistrer
              </button>
            </div>

            {/* PROGRESSION */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Étape du chantier</h3>
                <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-1.5 rounded-full">{PHASES_CHANTIER[selectedProjet.etape_actuelle]}</span>
              </div>
              <input
                type="range" min="0" max="12"
                value={selectedProjet.etape_actuelle}
                onChange={(e) => setSelectedProjet({...selectedProjet, etape_actuelle: parseInt(e.target.value)})}
                className="w-full h-2.5 bg-slate-100 rounded-full appearance-none accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* PHOTO DE SUIVI */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Dernière mise à jour photo</h3>
              {selectedProjet.lien_photo && (
                <div className="relative group">
                  <img src={selectedProjet.lien_photo} className="w-full rounded-3xl aspect-video object-cover shadow-inner" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Aperçu actuel</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-emerald-400 transition-colors group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Camera className="mx-auto mb-3 text-slate-300 group-hover:text-emerald-500 transition-colors" size={32} />
                  <span className="text-sm font-bold text-slate-500">{uploading === 'photo' ? 'Chargement...' : 'Nouvelle Photo'}</span>
                </div>
                <textarea
                  placeholder="Écrire un message pour le client à propos de cette photo..."
                  value={selectedProjet.commentaire_photo || ""}
                  onChange={(e) => setSelectedProjet({...selectedProjet, commentaire_photo: e.target.value})}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 min-h-[120px]"
                />
              </div>
            </div>

            {/* COFFRE-FORT NUMÉRIQUE */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-500" /> Coffre-fort Documents
                </h3>
                <div className="relative bg-blue-50 text-blue-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-100 transition-all">
                   <input type="file" onChange={(e) => handleFileUpload(e, 'doc')} className="absolute inset-0 opacity-0 cursor-pointer" />
                   + Ajouter un PDF
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProjet.documents?.map((doc: any, index: number) => (
                  <div key={index} className="p-5 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-3 relative group">
                    <button 
                      onClick={() => {
                        const next = selectedProjet.documents.filter((_:any, i:number) => i !== index);
                        setSelectedProjet({...selectedProjet, documents: next});
                      }}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShieldCheck size={16}/></div>
                      <p className="text-[11px] font-bold text-slate-700 truncate pr-6 uppercase tracking-wider">{doc.name}</p>
                    </div>
                    <input
                      placeholder="Commentaire sur ce document..."
                      value={doc.comment || ""}
                      onChange={(e) => {
                        const nextDocs = [...selectedProjet.documents];
                        nextDocs[index].comment = e.target.value;
                        setSelectedProjet({...selectedProjet, documents: nextDocs});
                      }}
                      className="w-full p-3 bg-white border border-slate-100 rounded-xl text-[10px] outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
               <Search size={32} />
            </div>
            <p className="font-serif italic text-lg">Sélectionnez un dossier pour l'éditer</p>
          </div>
        )}
      </div>

      {/* MODAL NOUVEAU DOSSIER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center border-b pb-6 border-slate-100">
              <div>
                <h2 className="text-2xl font-serif italic">Nouveau Dossier Client</h2>
                <p className="text-slate-400 text-xs mt-1">Créez le compte et la fiche de suivi simultanément.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identité</label>
                <input placeholder="Prénom" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" onChange={e => setNewDossier({...newDossier, prenom: e.target.value})} />
              </div>
              <div className="space-y-1.5 text-left pt-5">
                <input placeholder="Nom" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" onChange={e => setNewDossier({...newDossier, nom: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email de connexion</label>
                <input type="email" placeholder="client@email.com" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 border-2 border-transparent focus:border-emerald-500/10" onChange={e => setNewDossier({...newDossier, email: e.target.value})} />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contact</label>
                <input placeholder="Téléphone" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setNewDossier({...newDossier, tel: e.target.value})} />
              </div>
              <div className="space-y-1.5 text-left pt-5">
                <input placeholder="Code Postal" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setNewDossier({...newDossier, cp: e.target.value})} />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-2">Référence Villa</label>
                <input placeholder="Ex: B24" required className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none border-2 border-blue-100 focus:border-blue-400 transition-all" onChange={e => setNewDossier({...newDossier, ref: e.target.value})} />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cashback (€)</label>
                <input type="number" placeholder="Montant" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setNewDossier({...newDossier, cashback: parseInt(e.target.value)})} />
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all shadow-xl flex justify-center items-center gap-3">
              {updating ? <Loader2 className="animate-spin" /> : "Créer le dossier & générer le PIN client"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}