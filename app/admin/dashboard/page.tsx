"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, Edit3, X, Save, Plus, FileText, 
  Upload, Loader2, Calendar, HardHat, Euro, CheckCircle2,
  Home, Users, ChevronRight, UserPlus, Mail, Lock
} from 'lucide-react';

const PHASES_CHANTIER = [
  "Préparation & Terrassement", "Fondations", "Soubassement", "Dallage",
  "Élévation des murs", "Charpente", "Couverture / Toiture", "Menuiseries extérieures",
  "Plâtrerie / Isolation", "Électricité & Plomberie", "Finitions intérieures", "Aménagements extérieurs"
];

export default function AdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  // États pour la création de compte client
  const [clientEmail, setClientEmail] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase
      .from('suivi_chantier')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }

  // Fonction pour créer un compte client et le lier au projet
  const handleCreateClientAccount = async () => {
    if (!clientEmail) return alert("Veuillez saisir un email");
    setIsCreatingAccount(true);

    try {
      // 1. Appel d'une fonction Edge ou création via l'API Auth
      // Note: Idéalement, utilisez une "Service Role Key" via une API Route 
      // pour créer un utilisateur sans le déconnecter.
      // Ici, on simule la création simplifiée pour la logique métier :
      const tempPassword = "Client" + Math.floor(Math.random() * 10000);
      
      const { data, error } = await supabase.auth.signUp({
        email: clientEmail,
        password: tempPassword,
        options: { data: { role: 'client' } }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Mettre à jour le projet avec l'ID du client
        const { error: updateError } = await supabase
          .from('suivi_chantier')
          .update({ 
            client_id: data.user.id,
            nom_client: clientEmail // Par défaut on utilise l'email
          })
          .eq('id', editingProject.id);

        if (updateError) throw updateError;

        alert(`Compte créé !\nEmail: ${clientEmail}\nMot de passe provisoire: ${tempPassword}`);
        setClientEmail("");
        fetchProjects();
      }
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const createNewProject = async () => {
    const { data } = await supabase
      .from('suivi_chantier')
      .insert([{ 
        nom_villa: "Nouvelle Villa", 
        etape_actuelle: 1, 
        montant_cashback: 0,
        reference_interne: `BC-${Date.now().toString().slice(-4)}`
      }])
      .select();
    
    if (data) {
      setEditingProject(data[0]);
      fetchProjects();
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('suivi_chantier')
      .update({
        nom_villa: editingProject.nom_villa,
        nom_client: editingProject.nom_client,
        reference_interne: editingProject.reference_interne,
        montant_cashback: editingProject.montant_cashback,
        etape_actuelle: editingProject.etape_actuelle,
        date_echeance: editingProject.date_echeance
      })
      .eq('id', editingProject.id);

    if (!error) {
      setEditingProject(null);
      fetchProjects();
    }
  };

  const filteredProjects = projects.filter(p => 
    p.nom_villa?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.reference_interne?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-slate-400 text-xl">Blanca Calida Administration...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-12 pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto text-left">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <h1 className="text-4xl font-serif italic text-slate-900">Gestion des Programmes</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Pilotage Immobilier • 12 Phases</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text"
                placeholder="Rechercher une villa..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={createNewProject}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} /> <span className="font-bold text-xs uppercase tracking-widest">Nouveau Dossier</span>
            </button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-left">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{p.reference_interne}</span>
                  <h3 className="text-2xl font-serif italic text-slate-800 mt-1">{p.nom_villa}</h3>
                </div>
                <button onClick={() => setEditingProject(p)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  <Edit3 size={18} />
                </button>
              </div>

              {/* Progress Bar 12 Steps */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-400">Progression</span>
                  <span className="text-emerald-600">Phase {p.etape_actuelle} / 12</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(p.etape_actuelle / 12) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 italic truncate">{PHASES_CHANTIER[p.etape_actuelle - 1]}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Cashback</span>
                  <p className="text-lg font-bold text-slate-900">{p.montant_cashback?.toLocaleString()} €</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Livraison</span>
                  <p className="text-sm font-medium text-slate-600">{p.date_echeance ? new Date(p.date_echeance).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edition Slide-over Panel */}
        {editingProject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-end">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl p-12 overflow-y-auto animate-in slide-in-from-right duration-500 text-left">
              <div className="flex justify-between items-center mb-16">
                <div className="text-left">
                  <h2 className="text-3xl font-serif italic text-slate-900">Configuration</h2>
                  <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest mt-1">Dossier technique</p>
                </div>
                <button onClick={() => setEditingProject(null)} className="p-4 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
              </div>

              <div className="space-y-10">
                {/* Section Accès Client */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <UserPlus className="text-emerald-600" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Accès Client Tracker</h4>
                  </div>
                  
                  {editingProject.client_id ? (
                    <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Compte client actif ({editingProject.nom_client})</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-500 leading-relaxed">Créez un accès pour que votre client puisse suivre l'évolution de sa villa depuis son espace personnel.</p>
                      <div className="flex gap-2">
                        <input 
                          type="email" 
                          placeholder="Email du client"
                          className="flex-1 p-4 bg-white rounded-xl border-none text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                        <button 
                          onClick={handleCreateClientAccount}
                          disabled={isCreatingAccount}
                          className="bg-emerald-600 text-white px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                        >
                          {isCreatingAccount ? <Loader2 className="animate-spin w-4 h-4" /> : "Créer"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Informations Projet */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom de la Villa</label>
                      <input className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 outline-none" value={editingProject.nom_villa} onChange={e => setEditingProject({...editingProject, nom_villa: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Référence Interne</label>
                      <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-mono text-sm" value={editingProject.reference_interne} onChange={e => setEditingProject({...editingProject, reference_interne: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phase Actuelle (1 à 12)</label>
                    <select 
                      className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none appearance-none"
                      value={editingProject.etape_actuelle}
                      onChange={e => setEditingProject({...editingProject, etape_actuelle: parseInt(e.target.value)})}
                    >
                      {PHASES_CHANTIER.map((name, i) => (
                        <option key={i} value={i + 1}>Étape {i + 1} : {name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cashback Client (€)</label>
                      <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-emerald-600" value={editingProject.montant_cashback} onChange={e => setEditingProject({...editingProject, montant_cashback: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date d'échéance</label>
                      <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl border-none" value={editingProject.date_echeance || ''} onChange={e => setEditingProject({...editingProject, date_echeance: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl mt-4"
                >
                  <CheckCircle2 size={20} /> Enregistrer le projet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}