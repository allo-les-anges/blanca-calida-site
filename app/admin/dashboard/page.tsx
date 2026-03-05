"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Trash2, Loader2, Search, Plus, X,
  Activity, Zap, Briefcase, UserCheck,
  Phone, Mail, Clock, FileText, 
  Image as ImageIcon, Users, ShieldCheck, MapPin, ExternalLink
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES_CHANTIER = [
  "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
  "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
  "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
  "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", 
  "12. Remise des clés"
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [projectReports, setProjectReports] = useState<any[]>([]);

  const [editFields, setEditFields] = useState<any>({});
  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });
  
  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "", email: "", role: "staff" });
  const [newProject, setNewProject] = useState({
    client_nom: "", client_prenom: "", email_client: "", telephone: "",
    ville: "", nom_villa: "", montant_cashback: 0
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profiles } = await supabase.from('profiles').select('*').eq('email', session.user.email);
      const profile = profiles?.[0];
      const currentAgency = profile?.company_name || "Amaru-Homes";
      setAgencyProfile(profile || { company_name: "Amaru-Homes" });

      const { data: projData } = await supabase.from('suivi_chantier')
        .select('*').eq('company_name', currentAgency).order('created_at', { ascending: false });
      if (projData) setProjets(projData);

      const { data: stfData } = await supabase.from('profiles')
        .select('*').eq('company_name', currentAgency).neq('email', session.user.email);
      if (stfData) setStaffList(stfData);

    } catch (err: any) { console.error(err); } finally { setLoading(false); }
  }, []);

  // 1. Fonction de chargement avec gestion d'erreurs et log de contrôle
const loadProjectExtras = async (projectId: string) => {
  if (!projectId) return;
  
  try {
    // Récupération des documents (Vérifiez bien que le nom de la table est 'documents_projets')
    const { data: docs, error: docError } = await supabase
      .from('documents_projets')
      .select('*')
      .eq('projet_id', projectId)
      .order('created_at', { ascending: false });

    if (docError) {
      console.error("Erreur Supabase Documents:", docError.message);
    } else {
      console.log("Documents chargés pour le projet :", docs); // Pour vérifier dans la console F12
      setProjectDocs(docs || []);
    }

    // Récupération des rapports
    const { data: reports, error: repError } = await supabase
      .from('chantier_updates')
      .select('*')
      .eq('projet_id', projectId)
      .order('created_at', { ascending: false });

    if (repError) {
      console.error("Erreur Supabase Rapports:", repError.message);
    } else {
      setProjectReports(reports || []);
    }
    
  } catch (err) {
    console.error("Erreur critique loadProjectExtras:", err);
  }
};

// 2. Les useEffects pour orchestrer le chargement
useEffect(() => { 
  loadData(); 
}, [loadData]);

useEffect(() => { 
  if (selectedProjet?.id) {
    // On réinitialise les champs d'édition avec les données du projet sélectionné
    setEditFields({ ...selectedProjet });
    
    // On force le chargement des documents et rapports liés à cet ID précis
    loadProjectExtras(selectedProjet.id);
  } else {
    // Si aucun projet n'est sélectionné, on vide les listes
    setProjectDocs([]);
    setProjectReports([]);
  }
}, [selectedProjet]);

  const handleUpdateDossier = async () => {
    if (!selectedProjet) return;
    setUpdating(true);
    try {
      await supabase.from('suivi_chantier')
        .update({ 
          client_nom: editFields.client_nom,
          client_prenom: editFields.client_prenom,
          email_client: editFields.email_client,
          telephone: editFields.telephone,
          etape_actuelle: editFields.etape_actuelle,
          commentaires_etape: editFields.commentaires_etape,
          updated_at: new Date().toISOString()
        }).eq('id', selectedProjet.id);

      await supabase.from('chantier_updates').insert([{
          projet_id: selectedProjet.id,
          etape_actuelle: editFields.etape_actuelle,
          commentaires_etape: editFields.commentaires_etape
      }]);

      alert("Dossier client et rapport mis à jour !");
      loadData();
    } catch (err: any) { alert(err.message); }
    setUpdating(false);
  };

  // --- LOGIQUE STORAGE CORRIGÉE ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    setUpdating(true);
    try {
      const fileName = `${selectedProjet.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents-clients')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents-clients')
        .getPublicUrl(fileName);

      await supabase.from('documents_projets').insert([{
        projet_id: selectedProjet.id, 
        nom_fichier: file.name, 
        url: data.publicUrl, 
        type: file.type
      }]);
      
      loadProjectExtras(selectedProjet.id);
    } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleDeleteFile = async (doc: any) => {
    if(!confirm("Supprimer définitivement ce document ?")) return;
    setUpdating(true);
    try {
      // 1. Extraire le nom du fichier du chemin URL pour le storage
      const filePath = doc.url.split('/documents-clients/')[1];
      
      // 2. Supprimer physiquement du bucket
      if (filePath) {
        await supabase.storage.from('documents-clients').remove([filePath]);
      }

      // 3. Supprimer de la base de données
      await supabase.from('documents_projets').delete().eq('id', doc.id);
      
      loadProjectExtras(selectedProjet.id);
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">{agencyProfile.company_name}</h1>
            <div className="flex gap-2">
                <button onClick={() => setShowModal(true)} title="Nouveau Client" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"><Plus size={16}/></button>
                <button onClick={() => setShowStaffModal(true)} title="Ajouter Agent" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-black transition-all"><Users size={16}/></button>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'staff' ? 'bg-blue-500 text-black' : 'text-slate-500'}`}>Équipe</button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {activeTab === 'clients' ? projets.filter(p => `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}>
              <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
              <p className="text-[10px] uppercase font-black text-emerald-500 mt-1">{p.nom_villa}</p>
            </button>
          )) : staffList.map((s) => (
            <div key={s.email} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center group">
              <div className='text-left'><p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p><p className="text-[9px] text-blue-400 uppercase">{s.role}</p></div>
              <button onClick={async () => { if(confirm("Supprimer l'accès ?")) { await supabase.from('profiles').delete().eq('email', s.email); loadData(); }}} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
            
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{selectedProjet.nom_villa}</h2>
                    <div className="flex gap-4 mt-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><ShieldCheck size={12}/> PIN CLIENT : {selectedProjet.pin_code}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><MapPin size={12}/> {selectedProjet.ville}</span>
                    </div>
                </div>
                <button onClick={handleUpdateDossier} disabled={updating} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase hover:scale-105 transition-all shadow-xl">
                    {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Sauvegarder et notifier
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><UserCheck size={14}/> Fiche Client</h3>
                  <div className="space-y-3">
                    <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.client_prenom || ""} onChange={e => setEditFields({...editFields, client_prenom: e.target.value})} placeholder="Prénom" />
                    <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.client_nom || ""} onChange={e => setEditFields({...editFields, client_nom: e.target.value})} placeholder="Nom" />
                    <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.email_client || ""} onChange={e => setEditFields({...editFields, email_client: e.target.value})} placeholder="Email" />
                    <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.telephone || ""} onChange={e => setEditFields({...editFields, telephone: e.target.value})} placeholder="Téléphone" />
                  </div>
                </section>

                {/* --- SECTION DOCUMENTS AMÉLIORÉE --- */}
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase text-orange-400 tracking-widest flex items-center gap-2"><FileText size={14}/> Médias & Documents</h3>
                    <label className="cursor-pointer bg-orange-500/10 text-orange-500 p-2 rounded-lg hover:bg-orange-500 hover:text-black transition-all">
                      <Plus size={14}/><input type="file" className="hidden" onChange={handleFileUpload}/>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {projectDocs.length > 0 ? projectDocs.map((doc) => (
                      <div key={doc.id} className="group relative bg-black/40 rounded-2xl border border-white/5 overflow-hidden hover:border-orange-500/50 transition-all">
                        {/* Aperçu Miniature si Image */}
                        {doc.type?.includes('image') && (
                          <div className="w-full h-20 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity">
                             <img src={doc.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="p-3 flex items-center justify-between bg-[#0F172A]/80 backdrop-blur-sm">
                          <div 
                            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1" 
                            onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                          >
                            <div className="p-2 bg-white/5 rounded-lg">
                              {doc.type?.includes('image') ? <ImageIcon size={14} className="text-orange-400"/> : <FileText size={14} className="text-red-400"/>}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-bold text-slate-300 truncate">{doc.nom_fichier}</span>
                              <span className="text-[8px] text-emerald-500 uppercase font-black flex items-center gap-1">Ouvrir <ExternalLink size={8}/></span>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(doc); }}
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                         <p className="text-[10px] text-slate-600 uppercase tracking-widest italic">Aucun document</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* SUIVI CHANTIER */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><Activity size={14}/> Journal de bord</h3>
                    <select value={editFields.etape_actuelle || ""} onChange={e => setEditFields({...editFields, etape_actuelle: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-emerald-500 outline-none">
                      {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <textarea 
                    value={editFields.commentaires_etape || ""} onChange={e => setEditFields({...editFields, commentaires_etape: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-lg text-slate-200 min-h-[350px] outline-none focus:border-emerald-500 italic"
                    placeholder="Écrivez ici le rapport pour le client..."
                  />
                </div>

                <section className="bg-white/5 p-6 rounded-[3rem] border border-white/5">
                    <h3 className="text-[10px] font-black uppercase text-blue-400 mb-4"><Clock size={14} className="inline mr-2"/> Rapports passés</h3>
                    <div className="space-y-3">
                        {projectReports.map(rep => (
                            <div key={rep.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 text-xs">
                                <div className="flex justify-between text-blue-500 font-bold mb-1">
                                    <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                                    <span className="text-slate-500">{rep.etape_actuelle}</span>
                                </div>
                                <p className="text-slate-400 italic">"{rep.commentaires_etape}"</p>
                            </div>
                        ))}
                    </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={100} className="text-emerald-500 mb-4 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-[0.5em]">Sélectionnez un dossier</p>
          </div>
        )}
      </div>

      {/* MODAL AJOUT STAFF */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8">
            <h2 className="text-xl font-black uppercase text-white mb-6">Ajouter un collaborateur</h2>
            <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const { error } = await supabase.from('profiles').insert([{ ...newStaff, company_name: agencyProfile.company_name }]);
                if (error) alert(error.message);
                else { setShowStaffModal(false); loadData(); }
            }} className="space-y-4 text-left">
              <input required placeholder="Prénom" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
              <select className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                <option value="staff">Agent de suivi</option>
                <option value="admin">Administrateur</option>
              </select>
              <button type="submit" className="w-full bg-blue-500 text-black py-4 rounded-xl font-black text-xs uppercase">Créer l'accès</button>
              <button type="button" onClick={() => setShowStaffModal(false)} className="w-full text-slate-500 text-[10px] uppercase font-bold">Annuler</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU CLIENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10">
            <h2 className="text-2xl font-black uppercase text-white mb-8 text-left">Nouveau Chantier</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                await supabase.from("suivi_chantier").insert([{
                    ...newProject,
                    company_name: agencyProfile.company_name,
                    pin_code: pin,
                    etape_actuelle: PHASES_CHANTIER[0]
                }]);
                setShowModal(false); loadData();
            }} className="grid grid-cols-2 gap-4 text-left">
                <input required placeholder="Prénom Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
                <input required placeholder="Nom Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
                <input required placeholder="Email Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
                <input required placeholder="Nom de la Villa" className="col-span-2 bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-bold text-emerald-500" onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
                <button type="submit" className="col-span-2 bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase mt-4">Lancer le dossier</button>
                <button type="button" onClick={() => setShowModal(false)} className="col-span-2 text-slate-500 text-[10px] uppercase font-bold text-center">Fermer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}