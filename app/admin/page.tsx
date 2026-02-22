"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, LayoutDashboard, ChevronRight, Euro, ShieldCheck, FilePlus, Camera, Loader2, Trash2, Hash } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminInterface() {
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('*').order('id', { ascending: true });
    if (data) {
      setProjets(data);
      if (!selectedProjet && data.length > 0) setSelectedProjet(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- FONCTION PHOTO (CAPTURE MOBILE) ---
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingPhoto(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProjet.id}_${Date.now()}.${fileExt}`;

      // ATTENTION : Vérifiez si votre bucket est 'PHOTOS-CHANTIER' ou 'photos-chantier'
      const { error: uploadError } = await supabase.storage
        .from('PHOTOS-CHANTIER') 
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('PHOTOS-CHANTIER').getPublicUrl(fileName);
      
      // On met à jour l'URL dans l'objet local
      setSelectedProjet({ ...selectedProjet, lien_photo: data.publicUrl });
      alert("Photo chargée ! N'oubliez pas d'enregistrer le projet.");
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de la photo. Vérifiez le nom du Bucket.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // --- GESTION DU COFFRE-FORT (DOCUMENTS) ---
  const addDocument = () => {
    const currentDocs = selectedProjet.documents || [];
    setSelectedProjet({
      ...selectedProjet, 
      documents: [...currentDocs, { name: "Nouveau document", url: "" }]
    });
  };

  const updateDoc = (index: number, field: string, value: string) => {
    const newDocs = [...selectedProjet.documents];
    newDocs[index][field] = value;
    setSelectedProjet({ ...selectedProjet, documents: newDocs });
  };

  const removeDoc = (index: number) => {
    const newDocs = selectedProjet.documents.filter((_: any, i: number) => i !== index);
    setSelectedProjet({ ...selectedProjet, documents: newDocs });
  };

  const handleSave = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update({
        nom_client: selectedProjet.nom_client,
        etape_actuelle: selectedProjet.etape_actuelle,
        lien_photo: selectedProjet.lien_photo,
        montant_cashback: selectedProjet.montant_cashback,
        documents: selectedProjet.documents // Sauvegarde le coffre-fort
      })
      .eq('id', selectedProjet.id);

    if (error) alert("Erreur de mise à jour");
    else alert("Projet synchronisé avec succès !");
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-slate-500">Accès aux dossiers agence...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg">
        <div className="p-8 border-b border-slate-100 bg-slate-900 text-white text-center">
          <h1 className="text-xl font-serif tracking-tight">Blanca Calida</h1>
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-1">Console Expert</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {projets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjet(p)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                selectedProjet?.id === p.id ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="text-left">
                <span className="text-[9px] font-black opacity-50 block uppercase">ID: {p.id}</span>
                <span className="text-xs font-bold uppercase truncate">{p.nom_client}</span>
              </div>
              <ChevronRight size={14} className={selectedProjet?.id === p.id ? "text-emerald-400" : "text-slate-300"} />
            </button>
          ))}
        </div>
      </div>

      {/* ZONE D'EDITION */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {selectedProjet && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-serif text-slate-900 leading-tight">{selectedProjet.nom_client}</h2>
                <p className="text-slate-400 text-sm italic mt-1 font-serif">Mise à jour en direct</p>
              </div>
              <button
                onClick={handleSave}
                disabled={updating}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all active:scale-95"
              >
                <Save size={18} /> {updating ? 'Envoi...' : 'Enregistrer les changements'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PHOTO DU CHANTIER */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <Camera size={14} className="text-emerald-500" /> Photo du Rapport
                </label>
                
                {selectedProjet.lien_photo && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border mb-4">
                    <img src={selectedProjet.lien_photo} className="w-full h-full object-cover shadow-inner" alt="Aperçu" />
                  </div>
                )}

                <div className="relative">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full py-8 border-2 border-dashed border-emerald-100 bg-emerald-50/30 rounded-2xl flex flex-col items-center justify-center gap-2">
                    {uploadingPhoto ? <Loader2 className="animate-spin text-emerald-500" /> : <><div className="p-3 bg-emerald-500 text-white rounded-full"><Camera size={24} /></div><span className="text-xs font-bold text-emerald-700 uppercase">Prendre une photo</span></>}
                  </div>
                </div>
              </div>

              {/* CASHBACK & PROGRESSION */}
              <div className="space-y-8">
                <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Euro size={14} /> Cashback Client
                  </label>
                  <input type="number" value={selectedProjet.montant_cashback} onChange={(e) => setSelectedProjet({...selectedProjet, montant_cashback: parseFloat(e.target.value)})} className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-3xl font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Étape actuelle</label>
                    <span className="text-2xl font-serif text-emerald-600 font-bold">{selectedProjet.etape_actuelle}/12</span>
                  </div>
                  <input type="range" min="1" max="12" value={selectedProjet.etape_actuelle} onChange={(e) => setSelectedProjet({...selectedProjet, etape_actuelle: parseInt(e.target.value)})} className="w-full h-3 bg-slate-100 rounded-full appearance-none accent-emerald-500" />
                </div>
              </div>
            </div>

            {/* COFFRE-FORT NUMÉRIQUE */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" /> Documents Client (Coffre-fort)
                </label>
                <button onClick={addDocument} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition-all">
                  <FilePlus size={16} /> Ajouter un document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProjet.documents && selectedProjet.documents.map((doc: any, index: number) => (
                  <div key={index} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl relative transition-all hover:shadow-md">
                    <button onClick={() => removeDoc(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                    <input value={doc.name} onChange={(e) => updateDoc(index, "name", e.target.value)} className="w-full bg-transparent font-bold text-sm text-slate-700 outline-none mb-1" placeholder="Nom du document" />
                    <input value={doc.url} onChange={(e) => updateDoc(index, "url", e.target.value)} className="w-full bg-transparent text-[10px] text-slate-400 font-mono outline-none" placeholder="Lien URL (Google Drive, PDF...)" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}