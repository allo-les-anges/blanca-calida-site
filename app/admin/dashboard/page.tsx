"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, ShieldCheck, Phone, MapPin, User, Calendar, HardHat, Globe
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

  // État pour la création avec les nouveaux champs SQL
  const [newDossier, setNewDossier] = useState({
    prenom: "", nom: "", email: "", date_naissance: "", 
    rue: "", localite: "", pays: "Belgique",
    ref_villa: "", constructeur_nom: "", 
    fin_travaux: "", cashback: 0, memo_admin: ""
  });

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suivi_chantier')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProjets(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Appel API pour le PIN
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newDossier.email })
      });
      const auth = await res.json();
      if (!res.ok) throw new Error(auth.error);

      // 2. Insertion SQL propre
      const { error: dbError } = await supabase.from('suivi_chantier').insert([{
        client_nom: newDossier.nom,
        client_prenom: newDossier.prenom,
        email_client: newDossier.email,
        date_naissance: newDossier.date_naissance,
        rue: newDossier.rue,
        ville: newDossier.localite,
        pays: newDossier.pays,
        nom_villa: newDossier.ref_villa,
        constructeur_info: newDossier.constructeur_nom,
        date_livraison_prevue: newDossier.fin_travaux,
        montant_cashback: newDossier.cashback,
        commentaires_etape: newDossier.memo_admin,
        pin_code: auth.pin,
        etape_actuelle: PHASES_CHANTIER[0] // Commence à la phase 0
      }]);

      if (dbError) throw dbError;
      
      alert(`Dossier créé avec succès ! PIN : ${auth.pin}`);
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredProjets = projets.filter(p => 
    `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nom_villa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm">
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-serif italic tracking-tight">Blanca Calida Admin</h1>
          <button onClick={() => setShowModal(true)} className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg">
            <Plus size={16} /> Nouveau Dossier
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher une villa ou un nom..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs outline-none border border-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-300" /></div>
          ) : (
            filteredProjets.map((p) => (
              <button 
                key={p.id} 
                onClick={() => setSelectedProjet(p)} 
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedProjet?.id === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}
              >
                <p className="text-[9px] uppercase font-black mb-1 opacity-60">{p.nom_villa}</p>
                <p className="font-bold text-sm truncate">{p.client_prenom} {p.client_nom}</p>
                <div className="flex justify-between items-center mt-2 opacity-50 text-[9px]">
                  <span>PIN: {p.pin_code}</span>
                  <span className="truncate max-w-[100px] text-right">{p.etape_actuelle}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50/50">
        {selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">Fiche Client</span>
                <h2 className="text-3xl font-serif italic mt-2">{selectedProjet.client_prenom} {selectedProjet.client_nom}</h2>
                <div className="flex flex-wrap gap-4 mt-4 text-left">
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><Calendar size={14}/> {selectedProjet.date_naissance || "N/C"}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><MapPin size={14}/> {selectedProjet.rue}, {selectedProjet.ville}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><User size={14}/> {selectedProjet.email_client}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Cashback fixé</p>
                  <p className="text-xl font-bold text-emerald-600">{selectedProjet.montant_cashback} €</p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">
                  Sauvegarder
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><HardHat size={14} className="text-blue-500"/> Constructeur</h3>
                <p className="text-sm font-bold">{selectedProjet.constructeur_info || "Non spécifié"}</p>
                <p className="text-[10px] text-slate-400 mt-1">Villa: {selectedProjet.nom_villa}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><Calendar size={14} className="text-orange-500"/> Fin prévue</h3>
                <p className="text-sm font-bold italic">{selectedProjet.date_livraison_prevue || "Non définie"}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Code PIN App</h3>
                <p className="text-sm font-mono font-bold tracking-widest text-emerald-700">{selectedProjet.pin_code}</p>
              </div>
            </div>

            {/* Mémo Admin */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-left">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4">Mémo Inscription (Admin)</h3>
               <p className="text-sm text-slate-600 italic">"{selectedProjet.commentaires_etape || "Aucun mémo pour ce dossier."}"</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm"><Search size={30}/></div>
            <p className="font-serif italic text-xl text-slate-400">Sélectionnez un projet pour l'administrer</p>
          </div>
        )}
      </div>

      {/* MODAL CRÉATION - MISE À JOUR AVEC RUE ET PAYS */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDossier} className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl space-y-8 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h2 className="text-2xl font-serif italic">Nouveau Projet Client</h2>
                <p className="text-slate-400 text-[10px] uppercase mt-1 tracking-widest font-bold">Identité, Adresse & Construction</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* SECTION IDENTITÉ & ADRESSE */}
              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">Informations Client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, nom: e.target.value})} />
                </div>
                <input type="email" required placeholder="Email (Identifiant)" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, email: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 ml-2">DATE DE NAISSANCE</label>
                    <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs" onChange={e => setNewDossier({...newDossier, date_naissance: e.target.value})} />
                  </div>
                  <input placeholder="Téléphone" className="w-full p-4 bg-slate-50 rounded-xl outline-none self-end" onChange={e => setNewDossier({...newDossier, telephone: e.target.value} as any)} />
                </div>

                <h3 className="text-[9px] font-black uppercase text-slate-400 pt-4">Adresse de résidence</h3>
                <input placeholder="Rue et numéro" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, rue: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Ville" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, localite: e.target.value})} />
                  <input placeholder="Pays" defaultValue="Belgique" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, pays: e.target.value})} />
                </div>
              </div>

              {/* SECTION CHANTIER & CASHBACK */}
              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">Détails de Construction</h3>
                <input required placeholder="Référence Villa (ex: VILLA-CORTES)" className="w-full p-4 bg-slate-900 text-white rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, ref_villa: e.target.value})} />
                <input placeholder="Nom du Constructeur" className="w-full p-4 bg-slate-50 rounded-xl outline-none" onChange={e => setNewDossier({...newDossier, constructeur_nom: e.target.value})} />
                
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2">DATE ESTIMÉE DE FIN</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none text-xs" onChange={e => setNewDossier({...newDossier, fin_travaux: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 ml-2">CASHBACK PROMIS (€)</label>
                  <input type="number" placeholder="0" className="w-full p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl outline-none border border-emerald-100" onChange={e => setNewDossier({...newDossier, cashback: parseInt(e.target.value)})} />
                </div>

                <div className="space-y-1 pt-4">
                  <label className="text-[8px] font-bold text-slate-400 ml-2">MÉMO ADMIN (INTERNE)</label>
                  <textarea placeholder="Commentaires sur l'achat, profil client..." className="w-full p-4 bg-slate-50 rounded-xl outline-none h-24 text-sm" onChange={e => setNewDossier({...newDossier, memo_admin: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-600 transition-all flex justify-center items-center gap-4">
              {updating ? <Loader2 className="animate-spin" /> : "Créer le dossier & Générer le PIN"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}