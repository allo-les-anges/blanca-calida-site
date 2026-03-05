"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Trash2, Loader2, Search, Plus, X,
  Activity, Zap, UserCheck, FileText, 
  Users, ShieldCheck, MapPin, ExternalLink, Info, Home
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
  const [editFields, setEditFields] = useState<any>({});
  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });
  
  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "", email: "", role: "staff" });
  const [newProject, setNewProject] = useState({
    client_nom: "", client_prenom: "", email_client: "", telephone: "",
    rue: "", code_postal: "", ville: "", pays: "Espagne",
    nom_villa: "", constructeur_info: "", montant_cashback: 0,
    infos_complementaires: "" 
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: staffData } = await supabase.from('staff_prestataires').select('*').eq('email', session.user.email);
      const profile = staffData?.[0];
      const currentAgency = profile?.company_name || "Amaru-Homes";
      setAgencyProfile(profile || { company_name: "Amaru-Homes" });

      const { data: projData } = await supabase.from('suivi_chantier').select('*').eq('company_name', currentAgency).order('created_at', { ascending: false });
      if (projData) setProjets(projData);

      const { data: stfData } = await supabase.from('staff_prestataires').select('*').eq('company_name', currentAgency).neq('email', session.user.email);
      if (stfData) setStaffList(stfData);
    } catch (err: any) { console.error(err); } finally { setLoading(false); }
  }, []);

  const loadProjectExtras = async (projectId: string) => {
    if (!projectId) return;
    try {
      const { data: docs } = await supabase.from('documents_projets').select('*').eq('projet_id', projectId).order('created_at', { ascending: false });
      setProjectDocs(docs || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => { 
    if (selectedProjet?.id) {
      setEditFields({ ...selectedProjet });
      loadProjectExtras(selectedProjet.id);
    }
  }, [selectedProjet]);

  const handleUpdateDossier = async () => {
    if (!selectedProjet) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('suivi_chantier').update({ 
        ...editFields,
        updated_at: new Date().toISOString()
      }).eq('id', selectedProjet.id);
      if (error) throw error;
      alert("Mise à jour effectuée !");
      loadData();
    } catch (err: any) { alert(err.message); }
    setUpdating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    setUpdating(true);
    try {
      const fileName = `${selectedProjet.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents-clients').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('documents-clients').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('documents_projets').insert([{
        projet_id: selectedProjet.id, 
        nom_fichier: file.name, 
        url_fichier: urlData.publicUrl, 
        storage_path: fileName 
      }]);
      if (dbError) throw dbError;
      loadProjectExtras(selectedProjet.id);
    } catch (err: any) { alert("Erreur upload : " + err.message); } finally { setUpdating(false); }
  };

  const handleDeleteFile = async (docId: string, storagePath: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    setUpdating(true);
    try {
      if (storagePath) await supabase.storage.from('documents-clients').remove([storagePath]);
      const { error } = await supabase.from('documents_projets').delete().eq('id', docId);
      if (error) throw error;
      setProjectDocs(prev => prev.filter(doc => doc.id !== docId));
    } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!confirm(`Retirer ${name} de l'équipe ?`)) return;
    try {
      const { error } = await supabase.from('staff_prestataires').delete().eq('id', staffId);
      if (error) throw error;
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans">
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">{agencyProfile.company_name}</h1>
            <div className="flex gap-2">
                <button onClick={() => setShowModal(true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 transition-all"><Plus size={16}/></button>
                <button onClick={() => setShowStaffModal(true)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 transition-all"><Users size={16}/></button>
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
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {activeTab === 'clients' ? projets.filter(p => `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}>
              <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
              <p className="text-[10px] uppercase font-black text-emerald-500 mt-1">{p.nom_villa}</p>
            </button>
          )) : staffList.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center group">
              <div className='text-left'>
                <p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p>
                <p className="text-[9px] text-blue-400 uppercase font-black">{s.role} <span className="text-slate-500 ml-2">PIN: {s.pin_code}</span></p>
              </div>
              <button onClick={() => handleDeleteStaff(s.id, s.prenom)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{editFields.nom_villa}</h2>
                    <div className="flex gap-4 mt-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><ShieldCheck size={12}/> PIN CLIENT : {editFields.pin_code}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><MapPin size={12}/> {editFields.ville}</span>
                    </div>
                </div>
                <button onClick={handleUpdateDossier} disabled={updating} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase hover:scale-105 transition-all shadow-xl shadow-emerald-500/10">
                    {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Sauvegarder
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2"><UserCheck size={14}/> Identité Client</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.client_prenom || ""} onChange={e => setEditFields({...editFields, client_prenom: e.target.value})} placeholder="Prénom" />
                    <input className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.client_nom || ""} onChange={e => setEditFields({...editFields, client_nom: e.target.value})} placeholder="Nom" />
                    <input className="col-span-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.email_client || ""} onChange={e => setEditFields({...editFields, email_client: e.target.value})} placeholder="Email" />
                    <input className="col-span-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.telephone || ""} onChange={e => setEditFields({...editFields, telephone: e.target.value})} placeholder="Téléphone" />
                  </div>
                </section>
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2"><MapPin size={14}/> Coordonnées</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="col-span-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.rue || ""} onChange={e => setEditFields({...editFields, rue: e.target.value})} placeholder="Rue et numéro" />
                    <input className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.code_postal || ""} onChange={e => setEditFields({...editFields, code_postal: e.target.value})} placeholder="Code Postal" />
                    <input className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.ville || ""} onChange={e => setEditFields({...editFields, ville: e.target.value})} placeholder="Ville" />
                  </div>
                </section>
                <section className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/20 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2"><Info size={14}/> Infos Complémentaires</h3>
                  <textarea className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs min-h-[120px] outline-none focus:border-emerald-500" value={editFields.infos_complementaires || ""} onChange={e => setEditFields({...editFields, infos_complementaires: e.target.value})} placeholder="Notes internes..." />
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-orange-400 flex items-center gap-2"><Home size={14}/> Détails Villa</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-500 uppercase ml-2">Phase Actuelle</label>
                      <select className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-emerald-500 font-bold" value={editFields.etape_actuelle || ""} onChange={e => setEditFields({...editFields, etape_actuelle: e.target.value})}>
                        {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs" value={editFields.constructeur_info || ""} onChange={e => setEditFields({...editFields, constructeur_info: e.target.value})} placeholder="Constructeur" />
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs">
                        <span className="text-slate-500">Cashback:</span>
                        <input type="number" className="bg-transparent w-full outline-none" value={editFields.montant_cashback || 0} onChange={e => setEditFields({...editFields, montant_cashback: Number(e.target.value)})} />
                        <span>€</span>
                    </div>
                  </div>
                </section>

                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText size={14}/> Documents</h3>
                    <label className="cursor-pointer bg-white/10 text-white p-2 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
                      {updating ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>}
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={updating} />
                    </label>
                  </div>
                  <div className="space-y-2">
                    {projectDocs.map((doc: any) => (
                      <div key={doc.id} className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center group">
                        <div className="flex items-center gap-3 truncate">
                          <FileText size={14} className="text-orange-400 flex-shrink-0" />
                          <span className="text-[10px] truncate">{doc.nom_fichier}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"><ExternalLink size={14}/></a>
                          <button onClick={() => handleDeleteFile(doc.id, doc.storage_path)} disabled={updating} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
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

      {/* MODAL NOUVEAU STAFF (CORRIGÉE) */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 text-left">
            <h2 className="text-xl font-black uppercase text-white mb-6">Ajouter un collaborateur</h2>
            <form onSubmit={async (e) => { 
                e.preventDefault(); 
                // GÉNÉRATION DU PIN POUR ÉVITER L'ERREUR BDD
                const staffPin = Math.floor(1000 + Math.random() * 9000).toString();
                const { error } = await supabase.from('staff_prestataires').insert([{ 
                  ...newStaff, 
                  pin_code: staffPin,
                  company_name: agencyProfile.company_name 
                }]);
                if (error) alert("Erreur : " + error.message);
                else { 
                  alert(`Collaborateur ajouté ! PIN généré : ${staffPin}`);
                  setShowStaffModal(false); 
                  loadData(); 
                }
            }} className="space-y-4">
              <input required placeholder="Prénom" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
              <select className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                <option value="staff">Agent de suivi</option>
                <option value="admin">Administrateur</option>
                <option value="prestataire">Prestataire</option>
              </select>
              <button type="submit" className="w-full bg-blue-500 text-black py-4 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-500/20">Créer l'accès</button>
              <button type="button" onClick={() => setShowStaffModal(false)} className="w-full text-slate-500 text-[10px] uppercase font-bold mt-2">Annuler</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU CHANTIER */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] border border-white/10 p-10 max-h-[90vh] overflow-y-auto text-left shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Nouveau Dossier Chantier</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Enregistrement client & PIN automatique</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                const { error } = await supabase.from("suivi_chantier").insert([{
                    ...newProject,
                    company_name: agencyProfile.company_name,
                    pin_code: pin,
                    etape_actuelle: PHASES_CHANTIER[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
                if (error) alert("Erreur : " + error.message);
                else { setShowModal(false); loadData(); }
            }} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Prénom Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
                <input required placeholder="Nom Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
                <input required type="email" placeholder="Email" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
                <input placeholder="Téléphone" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, telephone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Rue et numéro" className="col-span-2 bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, rue: e.target.value})} />
                <input placeholder="Code Postal" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, code_postal: e.target.value})} />
                <input placeholder="Ville" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs" onChange={e => setNewProject({...newProject, ville: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nom de la Villa" className="col-span-2 bg-black/50 border border-white/20 rounded-xl p-4 text-sm font-bold text-emerald-500" onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
                <textarea placeholder="Infos complémentaires..." className="col-span-2 bg-black/50 border border-white/10 rounded-xl p-4 text-xs min-h-[80px]" onChange={e => setNewProject({...newProject, infos_complementaires: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-500/20">Créer le dossier & Générer PIN</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}