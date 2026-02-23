"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Loader2, X, Search, Layout, User, Mail, Home } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Formulaire simplifié pour l'agence
  const [formData, setFormData] = useState({
    email: "", 
    nom: "", 
    prenom: "", 
    nom_villa: ""
  });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    if (data) setProjets(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // 1. Appel API pour créer l'accès client et générer le PIN
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const authData = await res.json();
      if (!res.ok) throw new Error(authData.error);

      // 2. Création de la fiche Villa liée
      const { error: dbError } = await supabase.from('suivi_chantier').insert([{
        nom_client: formData.email,
        client_nom: formData.nom,
        client_prenom: formData.prenom,
        reference_interne: formData.nom_villa,
        pin_code: authData.pin,
        etape_actuelle: 0
      }]);

      if (dbError) throw dbError;

      alert(`Succès ! Le dossier est créé. PIN Client : ${authData.pin}`);
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête simplifié */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-serif italic text-slate-900">Blanca Calida</h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">Console Administration</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-tighter hover:bg-emerald-700 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> Créer un nouveau dossier
          </button>
        </div>

        {/* Liste des Dossiers */}
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
        ) : projets.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
               <Home size={32} />
            </div>
            <p className="text-slate-400 font-serif italic text-lg">Aucun dossier actif pour le moment.</p>
            <button onClick={() => setShowModal(true)} className="text-emerald-600 font-bold text-xs uppercase mt-4 underline">Commencer maintenant</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projets.map((p) => (
              <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Villa</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">PIN: {p.pin_code}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{p.reference_interne}</h3>
                <p className="text-slate-400 text-sm italic mb-6">{p.client_prenom} {p.client_nom}</p>
                <div className="border-t pt-6 flex justify-between items-center">
                   <span className="text-[10px] text-slate-300 uppercase font-bold tracking-tighter">Accès: {p.nom_client}</span>
                   <button className="text-slate-900 font-bold text-[10px] uppercase border-b-2 border-slate-900">Gérer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal "User Friendly" - Tout en un */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateProject} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif italic text-slate-900">Nouveau Dossier</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X /></button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom de la Villa</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input required placeholder="ex: Villa Blanca" className="w-full pl-12 p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/5" onChange={e => setFormData({...formData, nom_villa: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Prénom Client</label>
                    <input required className="w-full p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, prenom: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom Client</label>
                    <input required className="w-full p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, nom: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email (Identifiant de connexion)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="email" required placeholder="client@email.com" className="w-full pl-12 p-5 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={creating} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all flex justify-center items-center gap-4 shadow-xl shadow-slate-200 mt-4">
                  {creating ? <Loader2 className="animate-spin" /> : "Générer le dossier & le code PIN"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, Phone, MapPin, User, Hash, Calendar, HardHat, Euro
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES_CHANTIER = [
  "0. Signature", "1. Terrain", "2. Fondations", "3. Murs", "4. Toiture", 
  "5. Menuiseries", "6. Électricité", "7. Isolation", "8. Plâtrerie", 
  "9. Sols", "10. Peintures", "11. Extérieurs", "12. Remise des clés"
];

export default function AdminDashboard() {
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // État pour la création complète
  const [newDossier, setNewDossier] = useState({
    prenom: "", nom: "", email: "", date_naissance: "", localite: "",
    ref_villa: "", constructeur_nom: "", constructeur_contact: "",
    fin_travaux: "", cashback: 0
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
      // 1. Création de l'accès (PIN) via votre API
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newDossier.email })
      });
      const auth = await res.json();
      if (!res.ok) throw new Error(auth.error);

      // 2. Insertion de toutes les infos dans Supabase
      const { error: dbError } = await supabase.from('suivi_chantier').insert([{
        nom_client: newDossier.email,
        client_nom: newDossier.nom,
        client_prenom: newDossier.prenom,
        date_naissance: newDossier.date_naissance,
        code_postal: newDossier.localite,
        reference_interne: newDossier.ref_villa,
        constructeur_info: newDossier.constructeur_nom,
        fin_travaux_prevue: newDossier.fin_travaux,
        montant_cashback: newDossier.cashback,
        pin_code: auth.pin,
        etape_actuelle: 0,
        documents: []
      }]);

      if (dbError) throw dbError;
      alert(`Dossier créé avec succès ! PIN : ${auth.pin}`);
      setShowModal(false);
      loadData();
    } catch (err: any) { alert(err.message); }
    finally { setUpdating(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900">
      
      {/* BARRE LATÉRALE DE RECHERCHE */}
      <div className="w-full md:w-80 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm">
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-serif italic tracking-tight">Blanca Calida Admin</h1>
          <button onClick={() => setShowModal(true)} className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-100">
            <Plus size={16} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Rechercher un client..." className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none border border-slate-100" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {projets.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedProjet?.id === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}>
              <p className="text-[9px] uppercase font-black mb-1 opacity-60">{p.reference_interne}</p>
              <p className="font-bold text-sm truncate">{p.client_prenom} {p.client_nom}</p>
              <div className="flex justify-between items-center mt-2 opacity-50 text-[9px]">
                <span>PIN: {p.pin_code}</span>
                <span>Étape: {p.etape_actuelle}/12</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ZONE D'ÉDITION PRINCIPALE */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50/50">
        {selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* ENTETE CLIENT */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">Fiche Client active</span>
                <h2 className="text-3xl font-serif italic mt-2">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><Calendar size={14}/> Né(e) le {selectedProjet.date_naissance || "N/C"}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><MapPin size={14}/> {selectedProjet.code_postal}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-300">Statut Financier</p>
                  <p className="text-xl font-bold text-emerald-600">{selectedProjet.montant_cashback}€ <span className="text-[10px] text-slate-400 font-normal">Cashback</span></p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2">
                  <Save size={16}/> Enregistrer
                </button>
              </div>
            </div>

            {/* GRILLE D'INFOS CHANTIER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><HardHat size={14} className="text-blue-500"/> Constructeur</h3>
                <p className="text-sm font-bold">{selectedProjet.constructeur_info || "Non renseigné"}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><Calendar size={14} className="text-orange-500"/> Fin de chantier</h3>
                <p className="text-sm font-bold italic">{selectedProjet.fin_travaux_prevue || "Date à fixer"}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Accès Application</h3>
                <p className="text-sm font-mono font-bold">CODE PIN : {selectedProjet.pin_code}</p>
              </div>
            </div>

            {/* BARRE DE PROGRESSION */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-slate-400">Avancement des travaux</h3>
                <span className="text-lg font-serif italic text-emerald-600">{PHASES_CHANTIER[selectedProjet.etape_actuelle]}</span>
              </div>
              <input type="range" min="0" max="12" value={selectedProjet.etape_actuelle} onChange={(e) => setSelectedProjet({...selectedProjet, etape_actuelle: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-emerald-500 cursor-pointer" />
            </div>

            {/* DOCUMENTS & PHOTOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400">Documents (Plans, Contrats)</h3>
                <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all">+ Ajouter un PDF</button>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400">Photo de suivi</h3>
                <div className="aspect-video bg-slate-50 rounded-3xl flex flex-col items-center justify-center text-slate-300 border border-slate-100">
                  <Camera size={30} />
                  <p className="text-[9px] mt-2 uppercase font-bold tracking-widest cursor-pointer">Uploader le cliché</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm"><Search size={30}/></div>
            <p className="font-serif italic text-xl text-slate-400">Sélectionnez un dossier client</p>
          </div>
        )}
      </div>

      {/* MODAL : CRÉATION DOSSIER COMPLET */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl space-y-8 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h2 className="text-2xl font-serif italic">Nouveau Dossier de Construction</h2>
                <p className="text-slate-400 text-[10px] uppercase mt-1 tracking-widest font-bold">Création client & génération code PIN</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-900"><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Infos Personnelles */}
              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">Propriétaire</h3>
                <input required placeholder="Prénom" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, prenom: e.target.value})} />
                <input required placeholder="Nom" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, nom: e.target.value})} />
                <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, date_naissance: e.target.value})} />
                <input placeholder="Ville / Localité" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, localite: e.target.value})} />
                <input type="email" required placeholder="Email (Identifiant)" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-emerald-100" onChange={e => setNewDossier({...newDossier, email: e.target.value})} />
              </div>

              {/* Infos Chantier */}
              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">Chantier & Projet</h3>
                <input required placeholder="Référence Villa (ex: Villa B22)" className="w-full p-4 bg-slate-900 text-white rounded-xl outline-none placeholder:text-slate-500" onChange={e => setNewDossier({...newDossier, ref_villa: e.target.value})} />
                <input placeholder="Nom du Constructeur" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, constructeur_nom: e.target.value})} />
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Fin estimée des travaux</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, fin_travaux: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase tracking-widest">Montant du Cashback (€)</label>
                  <input type="number" placeholder="ex: 2500" className="w-full p-4 bg-emerald-50 rounded-xl outline-none font-bold text-emerald-700" onChange={e => setNewDossier({...newDossier, cashback: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-600 transition-all flex justify-center items-center gap-4">
              {updating ? <Loader2 className="animate-spin" /> : "Générer le dossier complet & le code PIN"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}