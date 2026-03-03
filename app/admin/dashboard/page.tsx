"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, PlusCircle, Key, FileUp, Settings, 
  Search, ShieldCheck, Loader2, LogOut, Trash2 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchClients();
  }, []);

  async function fetchClients() {
    // Récupère les dossiers de suivi_chantier (vos clients)
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans">
      {/* SIDEBAR DE GESTION */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-8 bg-[#020617]">
        <div className="text-emerald-500 font-serif italic text-2xl">Amaru Admin</div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Users size={18} /> Liste Clients
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-emerald-500 text-black' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <PlusCircle size={18} /> Nouveau Dossier
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-emerald-500 text-black' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Key size={18} /> Codes PIN & Accès
          </button>
        </nav>

        <button 
          onClick={() => { supabase.auth.signOut(); window.location.href='/login'; }}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-serif italic">
            {activeTab === 'clients' && "Gestion des dossiers clients"}
            {activeTab === 'create' && "Créer un nouveau projet"}
            {activeTab === 'security' && "Sécurité et Codes PIN"}
          </h2>
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
            <Search size={16} className="text-slate-500" />
            <input type="text" placeholder="Rechercher..." className="bg-transparent border-none text-xs focus:ring-0 w-48" />
          </div>
        </header>

        {/* CONTENU : LISTE DES CLIENTS */}
        {activeTab === 'clients' && (
          <div className="grid gap-4">
            {loading ? <Loader2 className="animate-spin text-emerald-500 mx-auto" /> : (
              clients.map(client => (
                <div key={client.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 font-bold">
                      {client.client_nom?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{client.nom_villa || "Sans nom"}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        {client.client_prenom} {client.client_nom} — {client.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-3 bg-slate-800 hover:bg-emerald-500 hover:text-black rounded-xl transition-all" title="Uploader Document">
                      <FileUp size={16} />
                    </button>
                    <button className="p-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                    <Link href={`/admin/projet/${client.id}`} className="px-6 py-3 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-tighter">
                      Modifier
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENU : FORMULAIRE CRÉATION (Simplifié) */}
        {activeTab === 'create' && (
          <div className="max-w-2xl bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
            <p className="text-slate-400 text-sm mb-8 italic">Remplissez les informations pour créer un nouveau dossier de suivi.</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Nom du Client</label>
                <input type="text" className="bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="ex: Martin" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Prénom du Client</label>
                <input type="text" className="bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="ex: Jean" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Agence Responsable</label>
                <select className="bg-slate-800 border-none rounded-xl p-3 text-sm text-white">
                  <option>Amaru-Homes</option>
                  <option>Amaru-Prestige</option>
                </select>
              </div>
              <button className="col-span-2 mt-4 bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">
                Créer le dossier client
              </button>
            </div>
          </div>
        )}

        {/* CONTENU : CODES PIN */}
        {activeTab === 'security' && (
          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
             <div className="flex items-center gap-4 mb-8 text-emerald-500">
                <ShieldCheck size={32} />
                <h3 className="text-xl font-bold">Gestion des accès PIN</h3>
             </div>
             <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase font-black border-b border-slate-800">
                    <th className="pb-4">Client</th>
                    <th className="pb-4">Agence</th>
                    <th className="pb-4">Code PIN Actuel</th>
                    <th className="pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {clients.map(c => (
                    <tr key={c.id} className="border-b border-slate-800/50">
                      <td className="py-4 font-bold">{c.client_nom}</td>
                      <td className="py-4 opacity-60 text-xs uppercase">{c.company_name}</td>
                      <td className="py-4 font-mono text-emerald-500">{c.pin_code || "----"}</td>
                      <td className="py-4">
                        <button className="text-[10px] font-bold text-white bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                          Générer Nouveau
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </main>
    </div>
  );
}