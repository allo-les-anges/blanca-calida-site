"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Loader2, X, Search, Camera, Save, MapPin, Hash, ShieldCheck, Trash2, Home
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES_CHANTIER = [
  "0. Signature", "1. Terrain", "2. Fondations", "3. Murs", "4. Toiture", 
  "5. Menuiseries", "6. Électricité", "7. Isolation", "8. Plâtrerie", 
  "9. Carrelage", "10. Peinture", "11. Extérieurs", "12. Remise des clés"
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
    email: "", nom: "", prenom: "", ref: ""
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    if (data) setProjets(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Création de l'accès (PIN)
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newDossier.email })
      });
      const auth = await res.json();
      
      // 2. Création de la fiche villa
      const { error: dbError } = await supabase.from('suivi_chantier').insert([{
        nom_client: newDossier.email,
        client_nom: newDossier.nom,
        client_prenom: newDossier.prenom,
        reference_interne: newDossier.ref,
        pin_code: auth.pin,
        etape_actuelle: 0,
        documents: []
      }]);

      if (dbError) throw dbError;
      setShowModal(false);
      loadData();
      alert(`Dossier créé ! PIN du client : ${auth.pin}`);
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Filtrage
  const filteredProjets = projets.filter(p => 
    p.reference_interne?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-slate-500">Chargement de votre agence...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col md:flex-row text-slate-900">
      
      {/* SIDEBAR : LISTE DES CHANTIERS */}
      <div className="w-full md:w-80 bg-white border-r flex flex-col h-screen sticky top-0 z-20">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Home size={20}/></div>
            <h1 className="text-xl font-serif italic">Blanca Calida</h1>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="w-full bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Plus size={16} /> Nouveau Dossier
          </button>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Rechercher une villa..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/10"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {filteredProjets.length === 0 && <p className="text-center text-xs text-slate-400 italic">Aucun projet trouvé</p>}
          {filteredProjets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjet(p)}
              className={`w-full text-left p-5 rounded-3xl transition-all border ${selectedProjet?.id === p.id ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedProjet?.id === p.id ? 'text-emerald-400' : 'text-emerald-600'}`}>{p.reference_interne}</span>
                <span className="text-[9px] font-mono opacity-50 text-slate-400">PIN: {p.pin_code}</span>
              </div>
              <p className={`font-bold text-sm truncate ${selectedProjet?.id === p.id ? 'text-white' : 'text-slate-800'}`}>{p.client_prenom} {p.client_nom}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ZONE PRINCIPALE */}
      <div className="flex-1 bg-slate-50/50 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-12 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 block">Dossier en cours</span>
                <h2 className="text-4xl font-serif italic text-slate-900">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <p className="text-slate-400 text-sm mt-2 flex items-center gap-2 italic">
                  Villa {selectedProjet.reference_interne} — {selectedProjet.nom_client}
                </p>
              </div>
              <button onClick={() => alert('Mise à jour enregistrée !')} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-3">
                <Save size={18}/> Enregistrer les modifications
              </button>
            </div>

            {/* PROGRESSION : SLIDER */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
               <div className="flex justify-between items-end mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avancement du projet</h3>
                  <span className="text-2xl font-serif italic text-emerald-600">{PHASES_CHANTIER[selectedProjet.etape_actuelle]}</span>
               </div>
               <input 
                type="range" min="0" max="12" value={selectedProjet.etape_actuelle}
                onChange={(e) => setSelectedProjet({...selectedProjet, etape_actuelle: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-emerald-500 cursor-pointer"
               />
            </div>

            {/* PHOTOS ET DOCS (Simplifié) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dernière Photo</h4>
                    <div className="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 transition-colors cursor-pointer group">
                        <Camera size={32} className="mb-2 group-hover:text-emerald-500" />
                        <span className="text-[10px] font-bold">Ajouter un cliché</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Documents PDF</h4>
                    <div className="space-y-2">
                        <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 border border-slate-100 flex justify-between items-center">
                            <span>PLAN_MASSE_V01.PDF</span>
                            <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer"/>
                        </div>
                        <button className="w-full py-4 border-2 border-dotted border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">+ Déposer un fichier</button>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6">
                <Home size={40} className="text-slate-100" />
            </div>
            <p className="font-serif italic text-xl">Bienvenue sur votre console Blanca Calida</p>
            <p className="text-xs uppercase tracking-widest mt-2">Sélectionnez un projet à gauche pour commencer</p>
          </div>
        )}
      </div>

      {/* MODAL : FUSIONNÉ ET SIMPLE */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic">Nouveau Dossier</h2>
              <p className="text-slate-400 text-xs">Créez la fiche villa et l'accès client en une étape.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Prénom du client" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" onChange={e => setNewDossier({...newDossier, prenom: e.target.value})} />
                <input placeholder="Nom du client" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" onChange={e => setNewDossier({...newDossier, nom: e.target.value})} />
              </div>
              <input placeholder="Email (Identifiant)" type="email" required className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" onChange={e => setNewDossier({...newDossier, email: e.target.value})} />
              <input placeholder="Référence Villa (ex: Villa Jade)" required className="w-full p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-emerald-900 font-bold" onChange={e => setNewDossier({...newDossier, ref: e.target.value})} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Annuler</button>
              <button type="submit" disabled={updating} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                {updating ? <Loader2 className="animate-spin mx-auto" /> : "Créer le dossier complet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}