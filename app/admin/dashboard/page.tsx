"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, PlusCircle, Key, FileUp, Settings, 
  Search, ShieldCheck, Loader2, LogOut, Trash2,
  Briefcase, MapPin, Euro, Calendar
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // --- ÉTATS DEMANDÉS ---
  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "", pin: "" });
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, 
    etape_actuelle: "Fondations", company_name: "Amaru-Homes"
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchClients();
  }, [fetchClients]);

  // --- ACTIONS ---
  const handleCreateDossier = async () => {
    setLoading(true);
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    const { error } = await supabase.from('suivi_chantier').insert([{
      ...newDossier,
      pin_code: generatedPin
    }]);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert(`Dossier créé ! Code PIN client : ${generatedPin}`);
      setNewDossier({
        client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
        nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, 
        etape_actuelle: "Fondations", company_name: "Amaru-Homes"
      });
      fetchClients();
      setActiveTab('clients');
    }
    setLoading(false);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-slate-800 p-8 flex flex-col gap-10 bg-[#020617] sticky top-0 h-screen">
        <div>
            <div className="text-emerald-500 font-serif italic text-3xl">Amaru</div>
            <div className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 mt-1">Administration</div>
        </div>
        
        <nav className="flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Users size={18} /> Liste Clients
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <PlusCircle size={18} /> Nouveau Dossier
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Key size={18} /> Codes PIN & Accès
          </button>
        </nav>

        <button 
          onClick={() => { supabase.auth.signOut(); window.location.href='/login'; }}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-serif italic">
            {activeTab === 'clients' && "Gestion des dossiers"}
            {activeTab === 'create' && "Nouveau Dossier Client"}
            {activeTab === 'security' && "Sécurité & Accès"}
          </h2>
        </header>

        {/* TAB: LISTE CLIENTS */}
        {activeTab === 'clients' && (
          <div className="grid gap-4">
            {loading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div> : (
              clients.map(client => (
                <div key={client.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                  <div className="flex gap-8 items-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{client.nom_villa || "Projet Amaru"}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        <span>{client.client_prenom} {client.client_nom}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-emerald-500/80">{client.company_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link href={`/admin/projet/${client.id}`} className="px-8 py-4 bg-slate-800 hover:bg-emerald-500 hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Modifier Dossier
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: CRÉATION DOSSIER (FORMULAIRE COMPLET) */}
        {activeTab === 'create' && (
          <div className="max-w-4xl bg-slate-900/40 border border-slate-800 p-12 rounded-[3rem] shadow-2xl">
            <div className="grid grid-cols-2 gap-8">
              {/* Infos Client */}
              <div className="col-span-2 border-b border-slate-800 pb-4 mb-2">
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Identité du Client</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Nom</label>
                <input type="text" value={newDossier.client_nom} onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} className="input-field" placeholder="ex: Martin" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Prénom</label>
                <input type="text" value={newDossier.client_prenom} onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} className="input-field" placeholder="ex: Jean" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Email Client</label>
                <input type="email" value={newDossier.email_client} onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} className="input-field" placeholder="jean.martin@email.com" />
              </div>

              {/* Infos Projet */}
              <div className="col-span-2 border-b border-slate-800 pb-4 mt-6 mb-2">
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Détails du Projet & Localisation</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Nom de la Villa</label>
                <input type="text" value={newDossier.nom_villa} onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} className="input-field" placeholder="ex: Villa Serena" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Agence Responsable</label>
                <select value={newDossier.company_name} onChange={e => setNewDossier({...newDossier, company_name: e.target.value})} className="input-field bg-slate-800">
                  <option value="Amaru-Homes">Amaru-Homes</option>
                  <option value="Amaru-Prestige">Amaru-Prestige</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Adresse / Rue</label>
                <input type="text" value={newDossier.rue} onChange={e => setNewDossier({...newDossier, rue: e.target.value})} className="input-field" placeholder="Calle de la Mar..." />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Ville</label>
                <input type="text" value={newDossier.ville} onChange={e => setNewDossier({...newDossier, ville: e.target.value})} className="input-field" placeholder="Dénia" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Pays</label>
                <input type="text" value={newDossier.pays} onChange={e => setNewDossier({...newDossier, pays: e.target.value})} className="input-field" />
              </div>

              {/* Chiffres & Dates */}
              <div className="col-span-2 border-b border-slate-800 pb-4 mt-6 mb-2">
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Finances & Livraison</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Montant Cashback (€)</label>
                <input type="number" value={newDossier.montant_cashback} onChange={e => setNewDossier({...newDossier, montant_cashback: Number(e.target.value)})} className="input-field" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Livraison Prévue</label>
                <input type="date" value={newDossier.date_livraison_prevue} onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} className="input-field text-slate-400" />
              </div>

              <button 
                onClick={handleCreateDossier}
                disabled={loading}
                className="col-span-2 mt-8 bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50"
              >
                {loading ? "Création en cours..." : "Générer le dossier client"}
              </button>
            </div>
          </div>
        )}

        {/* TAB: SECURITY / PIN */}
        {activeTab === 'security' && (
          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
              <div className="flex items-center gap-4 mb-10 text-emerald-500">
                <ShieldCheck size={32} />
                <h3 className="text-xl font-bold">Base des codes PIN Clients</h3>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black">
                      <th className="p-6">Client / Villa</th>
                      <th className="p-6 text-center">Code PIN Actuel</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-white/5 transition-all">
                        <td className="p-6">
                          <div className="font-bold text-slate-200">{c.client_nom} {c.client_prenom}</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{c.nom_villa} — {c.company_name}</div>
                        </td>
                        <td className="p-6 text-center">
                          <span className="bg-emerald-500/10 text-emerald-500 px-6 py-2 rounded-xl font-mono text-xl font-bold border border-emerald-500/20">
                            {c.pin_code || "----"}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button className="text-[9px] font-black uppercase bg-slate-800 px-5 py-2 rounded-lg hover:bg-white hover:text-black transition-all">
                            Réinitialiser
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .input-field {
          @apply bg-slate-800/50 border-none rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none placeholder:text-slate-600;
        }
      `}</style>
    </div>
  );
}