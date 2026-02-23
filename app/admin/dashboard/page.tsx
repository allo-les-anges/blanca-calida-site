"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Plus, UserPlus, Loader2, Edit3, X, CheckCircle2, Home, Users
} from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }

  // --- LOGIQUE 1 : CRÉER UN CLIENT D'ABORD ---
  const handleCreatePureClient = async () => {
    if (!newClientEmail) return alert("Email requis");
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newClientEmail }) // On crée juste l'utilisateur
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert(`✅ COMPTE CLIENT CRÉÉ\nPIN: ${result.pin}\nEmail: ${newClientEmail}\n\nVous pouvez maintenant l'associer à une villa.`);
      setShowClientModal(false);
      setNewClientEmail("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // --- LOGIQUE 2 : ASSOCIER UN CLIENT EXISTANT À UNE VILLA ---
  const handleSaveProject = async () => {
    const { error } = await supabase.from('suivi_chantier').update({
        nom_villa: editingProject.nom_villa,
        nom_client: editingProject.nom_client, // On lie l'email ici
        etape_actuelle: editingProject.etape_actuelle,
    }).eq('id', editingProject.id);

    if (!error) {
      setEditingProject(null);
      fetchProjects();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-slate-400">Blanca Calida...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-12 pb-12 px-6 font-sans text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* BARRE D'ACTIONS SUPÉRIEURE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
          <div className="text-left">
            <h1 className="text-3xl font-serif italic text-slate-900">Administration</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Gestion Clients & Patrimoine</p>
          </div>
          
          <div className="flex gap-3">
            {/* BOUTON CRÉER CLIENT (SANS VILLA) */}
            <button 
              onClick={() => setShowClientModal(true)}
              className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
            >
              <UserPlus size={16} /> Nouveau Client
            </button>

            {/* BOUTON CRÉER VILLA */}
            <button 
              onClick={async () => {
                const { data } = await supabase.from('suivi_chantier').insert([{ nom_villa: "Nouveau Projet", etape_actuelle: 1 }]).select();
                if (data) fetchProjects();
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              <Plus size={16} /> Nouvelle Villa
            </button>
          </div>
        </div>

        {/* GRILLE DES VILLAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <h3 className="text-xl font-serif italic text-slate-800">{p.nom_villa}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    {p.nom_client ? `Client: ${p.nom_client}` : "🚫 Aucun client associé"}
                  </p>
                </div>
                <button onClick={() => setEditingProject(p)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600">
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL : CRÉATION CLIENT SEUL */}
        {showClientModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif italic">Nouveau Compte Client</h2>
                <button onClick={() => setShowClientModal(false)}><X /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email de connexion</label>
                  <input 
                    type="email" 
                    className="w-full p-4 bg-slate-50 rounded-2xl mt-2 outline-none border-none" 
                    placeholder="exemple@email.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleCreatePureClient}
                  disabled={isCreating}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex justify-center"
                >
                  {isCreating ? <Loader2 className="animate-spin" /> : "Générer les accès (PIN)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PANEL : ÉDITION VILLA (POUR ASSOCIER UN CLIENT) */}
        {editingProject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-end">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl p-12 overflow-y-auto text-left">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-serif italic">Détails du Dossier</h2>
                <button onClick={() => setEditingProject(null)}><X /></button>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Associer à l'email client</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl mt-2 outline-none" 
                    placeholder="Saisissez l'email du client créé"
                    value={editingProject.nom_client || ""} 
                    onChange={e => setEditingProject({...editingProject, nom_client: e.target.value})} 
                  />
                  <p className="text-[9px] text-slate-400 mt-2 px-2 italic">L'association se fait par l'email. Une fois associé, le client verra cette villa dans son application.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nom de la Villa</label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl mt-2 outline-none" value={editingProject.nom_villa} onChange={e => setEditingProject({...editingProject, nom_villa: e.target.value})} />
                </div>

                <button onClick={handleSaveProject} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest">
                  Enregistrer l'association
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}