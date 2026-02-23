"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, Edit3, X, Save, Plus, FileText, 
  Upload, Loader2, Calendar, HardHat, Euro, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase
      .from('suivi_chantier')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }

  const createNewProject = async () => {
    const { data } = await supabase
      .from('suivi_chantier')
      .insert([{ 
        nom_villa: "Nouvelle Villa", 
        etape_actuelle: 1, 
        montant_cashback: 0,
        reference_interne: `REF-${Date.now().toString().slice(-4)}`
      }])
      .select();
    
    if (data) {
      setEditingProject(data[0]);
      fetchProjects();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setIsUploading(true);
    const fileName = `${editingProject.id}/${Date.now()}_${file.name}`;
    
    const { data } = await supabase.storage
      .from('documents-clients')
      .upload(fileName, file);

    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(fileName);
      const newDocs = [...(editingProject.documents || []), { name: file.name, url: publicUrl, date: new Date().toLocaleDateString() }];
      setEditingProject({ ...editingProject, documents: newDocs });
    }
    setIsUploading(false);
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
        date_echeance: editingProject.date_echeance,
        documents: editingProject.documents
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
    <div className="min-h-screen bg-[#FDFDFD] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif italic text-slate-900">Gestion des Programmes</h1>
            <p className="text-slate-500 font-light uppercase tracking-widest text-xs">Pilotage Immobilier & Suivi Client</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text"
                placeholder="Rechercher une référence..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-100 bg-white shadow-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={createNewProject}
              className="bg-slate-900 text-white p-3 md:px-6 md:py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nouveau Dossier</span>
            </button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{p.reference_interne || 'SANS RÉF'}</span>
                  <h3 className="text-xl font-serif italic text-slate-800 mt-1">{p.nom_villa}</h3>
                </div>
                <button onClick={() => setEditingProject(p)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Phase de construction</span>
                  <span className="font-semibold text-slate-900">{p.etape_actuelle} / 5</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full transition-all duration-500" style={{ width: `${(p.etape_actuelle / 5) * 100}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cashback</span>
                  <span className="text-lg font-semibold text-slate-900">{p.montant_cashback?.toLocaleString()} €</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Échéance</span>
                  <span className="text-sm text-slate-600">{p.date_echeance ? new Date(p.date_echeance).toLocaleDateString('fr-FR', {month: 'short', year: 'numeric'}) : 'Non fixée'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Panel (Slide-over) */}
        {editingProject && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl font-serif italic">Édition Dossier</h2>
                  <p className="text-slate-400 text-sm mt-1">ID: {editingProject.id.slice(0,8)}...</p>
                </div>
                <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
              </div>

              <div className="space-y-10">
                {/* Section 1: Infos Générales */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Home className="w-3 h-3"/> Nom de la Villa</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-1 focus:ring-slate-200 transition-all" value={editingProject.nom_villa} onChange={e => setEditingProject({...editingProject, nom_villa: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Users className="w-3 h-3"/> Nom du Client</label>
                    <input className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-1 focus:ring-slate-200 transition-all" value={editingProject.nom_client || ''} onChange={e => setEditingProject({...editingProject, nom_client: e.target.value})} />
                  </div>
                </div>

                {/* Section 2: Construction & Finances */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><HardHat className="w-3 h-3"/> Phase Travaux</label>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border-none" value={editingProject.etape_actuelle} onChange={e => setEditingProject({...editingProject, etape_actuelle: parseInt(e.target.value)})}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>Étape {n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Euro className="w-3 h-3"/> Cashback (€)</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-blue-600" value={editingProject.montant_cashback} onChange={e => setEditingProject({...editingProject, montant_cashback: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-3 h-3"/> Échéance</label>
                    <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none" value={editingProject.date_echeance || ''} onChange={e => setEditingProject({...editingProject, date_echeance: e.target.value})} />
                  </div>
                </div>

                {/* Section 3: Documents */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><FileText className="w-3 h-3"/> Documents Officiels</label>
                  <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center transition-colors hover:border-slate-200 group">
                    <input type="file" id="doc-up" className="hidden" onChange={handleFileUpload} />
                    <label htmlFor="doc-up" className="cursor-pointer flex flex-col items-center">
                      {isUploading ? <Loader2 className="animate-spin text-slate-300 w-8 h-8" /> : <Upload className="text-slate-200 group-hover:text-slate-400 w-8 h-8 mb-2 transition-colors" />}
                      <span className="text-sm text-slate-500">Compromis, Plans, Titre de propriété (PDF)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {editingProject.documents?.map((doc: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg"><FileText className="w-4 h-4 text-slate-400" /></div>
                          <div>
                            <p className="text-xs font-medium text-slate-900 truncate max-w-[180px]">{doc.name}</p>
                            <p className="text-[9px] text-slate-400">Ajouté le {doc.date}</p>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" className="text-[10px] font-bold uppercase tracking-tighter text-blue-500 hover:text-blue-700">Ouvrir</a>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95 mt-10"
                >
                  <CheckCircle2 className="w-6 h-6" /> Sauvegarder le Projet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}