"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, PlusCircle, Key, FileUp, Settings, 
  Search, ShieldCheck, Loader2, LogOut, Trash2 
} from 'lucide-react';
// IMPORT CRUCIAL POUR VERCEL
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

  useEffect(() => {
    setIsMounted(true);
    fetchClients();
  }, []);

  async function fetchClients() {
    // Récupération des dossiers (suivi_chantier)
    const { data } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans">
      {/* SIDEBAR */}
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
        </header>

        {activeTab === 'clients' && (
          <div className="grid gap-4">
            {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" /></div> : (
              clients.map(client => (
                <div key={client.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 font-bold uppercase">
                      {client.client_nom?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{client.nom_villa || "Sans nom"}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        {client.client_prenom} {client.client_nom} — <span className="text-emerald-500/80">{client.company_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-3 bg-slate-800 hover:bg-emerald-500 hover:text-black rounded-xl transition-all">
                      <FileUp size={16} />
                    </button>
                    <Link href={`/admin/projet/${client.id}`} className="px-6 py-3 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-tighter">
                      Modifier Dossier
                    </Link>
                  </div>
                </div>
              ))
            )}
            {clients.length === 0 && !loading && <p className="text-center text-slate-500 p-12 italic border border-dashed border-slate-800 rounded-3xl">Aucun client trouvé.</p>}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
            <p className="text-slate-400 text-sm mb-8 italic">Informations de base pour le nouveau client.</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Nom</label>
                <input type="text" className="bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Prénom</label>
                <input type="text" className="bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-500">Agence</label>
                <select className="bg-slate-800 border-none rounded-xl p-3 text-sm text-white">
                  <option>Amaru-Homes</option>
                  <option>Amaru-Prestige</option>
                </select>
              </div>
              <button className="col-span-2 mt-4 bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">
                Créer la fiche client
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
             <div className="flex items-center gap-4 mb-8 text-emerald-500">
                <ShieldCheck size={32} />
                <h3 className="text-xl font-bold">Gestion des codes PIN</h3>
             </div>
             <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase font-black border-b border-slate-800">
                    <th className="pb-4">Dossier</th>
                    <th className="pb-4 text-center">PIN</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id} className="border-b border-slate-800/50">
                      <td className="py-4">
                        <div className="font-bold">{c.client_nom}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{c.company_name}</div>
                      </td>
                      <td className="py-4 text-center font-mono text-emerald-500 text-lg">
                        {c.pin_code || "----"}
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-[9px] font-black uppercase bg-white/5 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
                          Modifier PIN
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