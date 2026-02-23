"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, FilePlus, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, Phone, MapPin, User, Hash 
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

  // État pour le nouveau dossier
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

  // --- CRÉATION COMPLÈTE (CLIENT + PROJET) ---
  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Création du compte Auth via ton API existante
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newDossier.email })
      });
      const auth = await res.json();
      if (!res.ok) throw new Error(auth.error);

      // 2. Création de la ligne en base
      const { error: dbError } = await supabase.from('suivi_chantier').insert([{
        nom_client: newDossier.email,
        client_nom: newDossier.nom,
        client_prenom: newDossier.prenom,
        telephone: newDossier.tel,
        code_postal: newDossier.cp,
        reference_interne: newDossier.ref,
        montant_cashback: newDossier.cashback,
        pin_code: auth.pin,
        etape_actuelle: 0
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

  // --- FILTRAGE PAR RÉFÉRENCE OU NOM ---
  const filteredProjets = projets.filter(p => 
    p.reference_interne?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) return <div className="p-10 text-center font-serif italic">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-900">
      
      {/* SIDEBAR AVEC RECHERCHE */}
      <div className="w-full md:w-80 bg-white border-r flex flex-col h-screen sticky top-0">
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-serif italic">Console Agence</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            <Plus size={18} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Rechercher Villa..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredProjets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjet(p)}
              className={`w-full text-left p-4 rounded-2xl mb-2 transition-all border ${selectedProjet?.id === p.id ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-white border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{p.reference_interne || 'Sans Réf'}</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 italic">PIN: {p.pin_code}</span>
              </div>
              <p className="font-bold text-sm truncate">{p.client_prenom} {p.client_nom}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ZONE D'EDITION */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-4xl mx-auto space-y-8 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-serif">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <Hash size={14}/> {selectedProjet.reference_interne} • <MapPin size={14}/> {selectedProjet.code_postal}
                </p>
              </div>
              <button onClick={handleSave} disabled={updating} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex gap-2 shadow-lg shadow-emerald-200">
                <Save size={18} /> {updating ? 'Envoi...' : 'Enregistrer les modifications'}
              </button>
            </div>

            {/* LE RESTE DE TON CODE (SLIDER, PHOTO, DOCS) RESTE ICI... */}
            {/* [Slider Étape] */}
            {/* [Photo Suivi] */}
            {/* [Coffre-fort] */}

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300 italic">Sélectionnez ou créez un dossier</div>
        )}
      </div>

      {/* MODAL NOUVEAU DOSSIER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif italic">Nouvelle Fiche Client</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Prénom" required className="p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all" onChange={e => setNewDossier({...newDossier, prenom: e.target.value})} />
              <input placeholder="Nom" required className="p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all" onChange={e => setNewDossier({...newDossier, nom: e.target.value})} />
              <input type="email" placeholder="Email" required className="col-span-2 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all" onChange={e => setNewDossier({...newDossier, email: e.target.value})} />
              <input placeholder="Téléphone" className="p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all" onChange={e => setNewDossier({...newDossier, tel: e.target.value})} />
              <input placeholder="Code Postal" className="p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all" onChange={e => setNewDossier({...newDossier, cp: e.target.value})} />
              <input placeholder="Réf Villa (ex: B24)" required className="p-4 bg-slate-50 rounded-2xl outline-none border-2 border-emerald-100" onChange={e => setNewDossier({...newDossier, ref: e.target.value})} />
              <input type="number" placeholder="Cashback (€)" className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setNewDossier({...newDossier, cashback: parseInt(e.target.value)})} />
            </div>

            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all">
              {updating ? <Loader2 className="animate-spin mx-auto" /> : "Créer le dossier & le compte client"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}