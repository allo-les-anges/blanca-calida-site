"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Camera, FilePlus, Trash2, Loader2, ChevronRight, Euro, ShieldCheck } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- DÉFINITION DES PHASES DE TRAVAUX ---
const PHASES_CHANTIER = [
  "0. Signature du contrat",
  "1. Préparation du terrain",
  "2. Fondations",
  "3. Gros œuvre (Murs)",
  "4. Charpente & Toiture",
  "5. Menuiseries (Fenêtres/Portes)",
  "6. Électricité & Plomberie",
  "7. Isolation",
  "8. Plâtrerie",
  "9. Carrelage & Sols",
  "10. Peintures",
  "11. Aménagements extérieurs",
  "12. Remise des clés"
];

export default function AdminInterface() {
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

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

  // --- FONCTION UPLOAD GÉNÉRIQUE (PHOTOS OU DOCUMENTS) ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploading(type);

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProjet.id}_${Date.now()}.${fileExt}`;

      // UTILISATION DU NOM EXACT DU BUCKET: PHOTOS-CHANTIER
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
      alert("Fichier chargé avec succès !");
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update({
        etape_actuelle: selectedProjet.etape_actuelle,
        lien_photo: selectedProjet.lien_photo,
        commentaire_photo: selectedProjet.commentaire_photo, // Nouvelle colonne à prévoir
        montant_cashback: selectedProjet.montant_cashback,
        documents: selectedProjet.documents
      })
      .eq('id', selectedProjet.id);

    if (error) alert("Erreur de sauvegarde");
    else alert("Projet mis à jour !");
    setUpdating(false);
  };

  if (loading) return <div className="p-10 text-center font-serif italic">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:row font-sans text-slate-900">
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white border-r p-4">
        <h1 className="text-xl font-serif mb-6 px-2">Console Agence</h1>
        {projets.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProjet(p)}
            className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'}`}
          >
            <span className="text-xs font-bold uppercase">{p.nom_client}</span>
          </button>
        ))}
      </div>

      {/* ZONE D'EDITION */}
      <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto space-y-6">
        {selectedProjet && (
          <>
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border">
              <h2 className="text-2xl font-serif">{selectedProjet.nom_client}</h2>
              <button onClick={handleSave} disabled={updating} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex gap-2">
                <Save size={18} /> {updating ? 'Envoi...' : 'Enregistrer'}
              </button>
            </div>

            {/* SLIDER AVEC PHASES TEXTUELLES */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-slate-400 italic">Étape du chantier</label>
                <span className="text-emerald-600 font-bold">{PHASES_CHANTIER[selectedProjet.etape_actuelle]}</span>
              </div>
              <input
                type="range" min="0" max="12"
                value={selectedProjet.etape_actuelle}
                onChange={(e) => setSelectedProjet({...selectedProjet, etape_actuelle: parseInt(e.target.value)})}
                className="w-full h-3 bg-slate-100 rounded-full appearance-none accent-emerald-500"
              />
            </div>

            {/* PHOTO AVEC COMMENTAIRE */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <label className="text-xs font-bold uppercase text-slate-400">Photo de suivi</label>
              {selectedProjet.lien_photo && <img src={selectedProjet.lien_photo} className="w-full rounded-2xl aspect-video object-cover" />}
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Camera className="mx-auto mb-2 text-emerald-500" />
                <span className="text-sm font-medium">{uploading === 'photo' ? 'Chargement...' : 'Prendre une photo'}</span>
              </div>
              <textarea
                placeholder="Commentaire sur la photo..."
                value={selectedProjet.commentaire_photo || ""}
                onChange={(e) => setSelectedProjet({...selectedProjet, commentaire_photo: e.target.value})}
                className="w-full p-4 bg-slate-50 border rounded-xl text-sm"
              />
            </div>

            {/* COFFRE-FORT AVEC UPLOAD ET COMMENTAIRES */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} /> Coffre-fort Numérique
                </label>
                <div className="relative bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                   <input type="file" onChange={(e) => handleFileUpload(e, 'doc')} className="absolute inset-0 opacity-0" />
                   + Uploader Document
                </div>
              </div>

              <div className="space-y-4">
                {selectedProjet.documents?.map((doc: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 border rounded-2xl space-y-2 relative">
                    <button 
                      onClick={() => {
                        const next = selectedProjet.documents.filter((_:any, i:number) => i !== index);
                        setSelectedProjet({...selectedProjet, documents: next});
                      }}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                    <p className="text-xs font-bold text-slate-700 truncate pr-8">{doc.name}</p>
                    <input
                      placeholder="Ajouter un commentaire au document..."
                      value={doc.comment || ""}
                      onChange={(e) => {
                        const nextDocs = [...selectedProjet.documents];
                        nextDocs[index].comment = e.target.value;
                        setSelectedProjet({...selectedProjet, documents: nextDocs});
                      }}
                      className="w-full p-2 bg-white border rounded-lg text-[10px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}