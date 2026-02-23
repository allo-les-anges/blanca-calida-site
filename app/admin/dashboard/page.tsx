"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, Edit3, X, Plus, CheckCircle2, UserPlus, Loader2, Upload, FileText
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
  const [clientEmail, setClientEmail] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }

  const handleCreateClientAccount = async () => {
    if (!clientEmail) return alert("Veuillez saisir un email");
    setIsCreatingAccount(true);
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        body: JSON.stringify({ email: clientEmail, projectId: editingProject.id })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert(`✅ Compte Créé !\nPIN Mobile: ${result.pin}\nMot de passe: ${result.password}`);
      setClientEmail("");
      fetchProjects();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingProject) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingProject.id}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('villas-documents').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('villas-documents').getPublicUrl(fileName);
      await supabase.from('suivi_chantier').update({ document_url: publicUrl }).eq('id', editingProject.id);
      
      alert("Document technique enregistré !");
      fetchProjects();
    } catch (err: any) {
      alert("Erreur upload : " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const createNewProject = async () => {
    const { data } = await supabase.from('suivi_chantier').insert([{ 
        nom_villa: "Nouvelle Villa", etape_actuelle: 1, reference_interne: `BC-${Date.now().toString().slice(-4)}`
    }]).select();
    if (data) { setEditingProject(data[0]); fetchProjects(); }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('suivi_chantier').update({
        nom_villa: editingProject.nom_villa,
        nom_client: editingProject.nom_client,
        reference_interne: editingProject.reference_interne,
        montant_cashback: editingProject.montant_cashback,
        etape_actuelle: editingProject.etape_actuelle,
        date_echeance: editingProject.date_echeance
    }).eq('id', editingProject.id);
    if (!error) { setEditingProject(null); fetchProjects(); }
  };

  const filteredProjects = projects.filter(p => 
    p.nom_villa?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.reference_interne?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-slate-400 text-xl">Blanca Calida Administration...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-12 pb-12 px-6 font-sans text-left">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <h1 className="text-4xl font-serif italic text-slate-900">Gestion des Programmes</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Pilotage Immobilier • 12 Phases</p>
          </div>
          <div className="flex gap-4">
            <input type="text" placeholder="Rechercher..." className="px-4 py-3 rounded-xl border border-slate-100 shadow-sm outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={createNewProject} className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
              <Plus size={18} /> Nouveau Dossier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-left">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{p.reference_interne}</span>
                  <h3 className="text-2xl font-serif italic text-slate-800 mt-1">{p.nom_villa}</h3>
                </div>
                <button onClick={() => setEditingProject(p)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all">
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-400">Progression</span>
                  <span className="text-emerald-600">Phase {p.etape_actuelle} / 12</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(p.etape_actuelle / 12) * 100}%` }}></div>
                </div>
                {p.document_url && (
                  <a href={p.document_url} target="_blank" className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-tighter mt-2">
                    <FileText size={12}/> Document technique disponible
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {editingProject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-end">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl p-12 overflow-y-auto animate-in slide-in-from-right text-left">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h2 className="text-3xl font-serif italic text-slate-900">Configuration</h2>
                  <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest mt-1">Dossier technique</p>
                </div>
                <button onClick={() => setEditingProject(null)} className="p-4 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
              </div>

              <div className="space-y-10">
                {/* ACCÈS CLIENT & PIN */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left">
                  <div className="flex items-center gap-3 mb-6">
                    <UserPlus className="text-emerald-600" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Accès Client & PIN</h4>
                  </div>
                  {editingProject.client_id ? (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-1">
                      <span className="text-emerald-600 text-xs font-bold">Client : {editingProject.nom_client}</span>
                      <span className="text-slate-500 text-[10px] font-mono">CODE PIN MOBILE : {editingProject.pin_code}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="email" placeholder="Email du client" className="flex-1 p-4 bg-white rounded-xl text-sm outline-none" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                      <button onClick={handleCreateClientAccount} disabled={isCreatingAccount} className="bg-emerald-600 text-white px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                        {isCreatingAccount ? <Loader2 className="animate-spin" /> : "Créer"}
                      </button>
                    </div>
                  )}
                </div>

                {/* UPLOAD DOCUMENT */}
                <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="text-blue-600" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Plans & Documents</h4>
                  </div>
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                  <label htmlFor="file-upload" className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-all">
                    {isUploading ? <Loader2 className="animate-spin text-blue-600" /> : <span className="text-[10px] font-bold text-blue-600 uppercase">Choisir un fichier</span>}
                  </label>
                </div>

                <div className="space-y-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left block">Nom de la Villa</label>
                    <input className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none" value={editingProject.nom_villa} onChange={e => setEditingProject({...editingProject, nom_villa: e.target.value})} />
                    
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-left block">Phase Actuelle</label>
                    <select className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none appearance-none" value={editingProject.etape_actuelle} onChange={e => setEditingProject({...editingProject, etape_actuelle: parseInt(e.target.value)})}>
                        {PHASES_CHANTIER.map((name, i) => <option key={i} value={i + 1}>Étape {i + 1} : {name}</option>)}
                    </select>
                </div>

                <button onClick={handleSave} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}