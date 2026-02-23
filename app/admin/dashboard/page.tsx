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
}