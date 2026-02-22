"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, User, ImageIcon, LayoutDashboard, ChevronRight, Euro, ShieldCheck, FilePlus } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminInterface() {
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  const handleSave = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update({
        nom_client: selectedProjet.nom_client,
        etape_actuelle: selectedProjet.etape_actuelle,
        lien_photo: selectedProjet.lien_photo,
        montant_cashback: selectedProjet.montant_cashback
      })
      .eq('id', selectedProjet.id);

    if (error) alert("Erreur lors de la mise à jour");
    else alert("Modifications publiées avec succès !");
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-slate-500">Connexion à la console agence...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SIDEBAR - LISTE DES CHANTIERS */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 border-b border-slate-100 bg-slate-900 text-white">
          <h1 className="text-xl font-serif">Blanca Calida</h1>
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-1">Console Promoteur</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {projets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjet(p)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                selectedProjet?.id === p.id ? 'bg-slate-100 border-l-4 border-emerald-500 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-tight truncate">{p.nom_client}</span>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* ZONE D'EDITION DYNAMIQUE */}
      <div className="flex-1 p-12 overflow-y-auto">
        {selectedProjet && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-2xl font-serif text-slate-900">Édition : {selectedProjet.nom_client}</h2>
                <p className="text-slate-400 text-sm italic">Les changements seront visibles immédiatement par le client.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all"
              >
                <Save size={18} /> {updating ? 'Publication...' : 'Enregistrer'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SECTION AVANCEMENT & FINANCES */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <LayoutDashboard size={14} /> Progression (Étape {selectedProjet.etape_actuelle})
                  </label>
                  <input
                    type="range" min="0" max="12"
                    value={selectedProjet.etape_actuelle}
                    onChange={(e) => setSelectedProjet({...selectedProjet, etape_actuelle: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-emerald-500"
                  />
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Euro size={14} /> Montant du Cashback
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={selectedProjet.montant_cashback}
                      onChange={(e) => setSelectedProjet({...selectedProjet, montant_cashback: parseFloat(e.target.value)})}
                      className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold">€</span>
                  </div>
                </div>
              </div>

              {/* SECTION PHOTO & DOCUMENTS */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ImageIcon size={14} /> Photo du chantier (URL)
                  </label>
                  <input
                    type="text"
                    value={selectedProjet.lien_photo || ''}
                    onChange={(e) => setSelectedProjet({...selectedProjet, lien_photo: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono"
                    placeholder="https://..."
                  />
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={14} /> Coffre-fort (Lien Document)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      placeholder="Module d'import bientôt actif"
                      className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                    />
                    <button className="bg-slate-100 p-3 rounded-xl text-slate-400"><FilePlus size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}