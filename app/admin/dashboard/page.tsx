"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Save, Trash2, Loader2, Search, Plus, X,
  Zap, UserCheck, FileText, Printer, LogOut,
  Users, ShieldCheck, MapPin, ExternalLink, Home
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Listes
  const [projets, setProjets] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  // Sélections et Modals
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // État édition
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [editFields, setEditFields] = useState<any>({});
  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });
  
  // Formulaires nouveaux
  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "", email: "", role: "agent de suivi" });
  const [newProject, setNewProject] = useState({
    client_nom: "", client_prenom: "", email_client: "", telephone: "", date_naissance: "",
    rue: "", code_postal: "", ville: "", pays: "Espagne",
    nom_villa: "", constructeur_info: "", montant_cashback: 0,
    commentaires_etape: "", commentaire_etape_chantier: "", 
    lien_photo: "", date_livraison_prevue: "", document_url: ""
  });

  const handleLogout = async () => {
    if(!confirm("Voulez-vous vous déconnecter ?")) return;
    await supabase.auth.signOut();
    localStorage.removeItem("staff_session");
    router.replace("/login");
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let userEmail = session?.user?.email;
      let currentAgency = "Amaru-Homes";

      if (!session) {
        const savedPinSession = localStorage.getItem("staff_session");
        if (savedPinSession) {
          const pinUser = JSON.parse(savedPinSession);
          userEmail = pinUser.email;
          currentAgency = pinUser.company_name;
        } else {
          router.replace("/login");
          return;
        }
      }

      // 1. Récupérer le profil de l'utilisateur connecté
      const { data: staffData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (staffData) {
          setAgencyProfile(staffData);
          currentAgency = staffData.company_name || "Amaru-Homes";
      }

      // 2. Charger les projets de l'agence
      const { data: projData } = await supabase
        .from('suivi_chantier')
        .select('*')
        .eq('company_name', currentAgency)
        .order('created_at', { ascending: false });
      
      if (projData) setProjets(projData);

      // 3. Charger TOUTE l'équipe de l'agence (pour l'onglet Staff)
      const { data: stfData } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_name', currentAgency);
      
      if (stfData) setStaffList(stfData);
      
    } catch (err: any) { 
      console.error("Erreur chargement:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => { 
    if (selectedProjet?.id) {
      setEditFields({ ...selectedProjet });
      loadProjectExtras(selectedProjet.id);
    }
  }, [selectedProjet]);

  const loadProjectExtras = async (projectId: string) => {
    try {
      const { data: docs } = await supabase.from('documents_projets').select('*').eq('projet_id', projectId).order('created_at', { ascending: false });
      setProjectDocs(docs || []);
    } catch (err) { console.error(err); }
  };

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

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!confirm(`ATTENTION : Voulez-vous vraiment supprimer ${name} de l'équipe ?`)) return;
    setUpdating(true);
    try {
      // Note : Dans Supabase, supprimer de 'profiles' ne supprime pas le compte 'Auth' 
      // sauf si vous avez configuré une fonction spécifique, mais cela l'enlèvera de votre liste agence.
      const { error } = await supabase.from('profiles').delete().eq('id', staffId);
      if (error) throw error;
      
      setStaffList(prev => prev.filter(s => s.id !== staffId));
      alert("Membre retiré avec succès.");
    } catch (err: any) { 
      alert("Erreur lors de la suppression : " + err.message); 
    } finally {
      setUpdating(false);
    }
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

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans print:bg-white print:text-black text-left">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col print:hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">{agencyProfile.company_name}</h1>
            <div className="flex gap-2">
                <button onClick={() => setShowModal(true)} title="Nouveau Projet" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"><Plus size={16}/></button>
                <button onClick={() => setShowStaffModal(true)} title="Ajouter un membre" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-black transition-all"><Users size={16}/></button>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-blue-500 text-black shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}>Équipe</button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500 text-white" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* LISTE DYNAMIQUE (CLIENTS OU ÉQUIPE) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {activeTab === 'clients' ? (
            projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <button 
                key={p.id} 
                onClick={() => setSelectedProjet(p)} 
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}
              >
                <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
                <p className="text-[10px] uppercase font-black text-emerald-500 mt-1">{p.nom_villa}</p>
              </button>
            ))
          ) : (
            staffList.filter(s => `${s.prenom} ${s.nom} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center group animate-in slide-in-from-left-2 duration-300">
                <div className='text-left'>
                  <p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${s.role === 'admin' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {s.role}
                    </span>
                    <p className="text-[9px] text-slate-500 font-bold">PIN: {s.pin_code}</p>
                  </div>
                </div>
                {/* Bouton de suppression d'un membre */}
                <button 
                  onClick={() => handleDeleteStaff(s.id, s.prenom)} 
                  className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Supprimer ce membre"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 space-y-2">
            <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-[10px] font-black uppercase"><Home size={16} /> Retour au Site</button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-[10px] font-black uppercase"><LogOut size={16} /> Déconnexion</button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 p-8 lg:p-12 overflow-y-auto print:p-0">
        {selectedProjet ? (
          <div id="printable-area" className="max-w-6xl mx-auto space-y-8 text-left animate-in fade-in duration-500 print:text-black">
            <div className="flex justify-between items-end border-b border-white/5 pb-8 print:border-slate-200">
                <div>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter print:text-black print:text-3xl">{editFields.nom_villa}</h2>
                    <div className="flex gap-4 mt-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 print:text-slate-700"><ShieldCheck size={12}/> PIN CLIENT : {editFields.pin_code}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1 print:text-slate-700"><MapPin size={12}/> {editFields.ville}, {editFields.pays}</span>
                    </div>
                </div>
                <div className="flex gap-3 print:hidden">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase hover:bg-white/20 transition-all"><Printer size={16}/> Imprimer</button>
                    <button onClick={handleUpdateDossier} disabled={updating} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase hover:scale-105 transition-all shadow-xl shadow-emerald-500/10">
                      {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Sauvegarder
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2"><UserCheck size={14}/> Identité Client</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase font-bold">Prénom</label>
                      <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white" value={editFields.client_prenom || ""} onChange={e => setEditFields({...editFields, client_prenom: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase font-bold">Nom</label>
                      <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white" value={editFields.client_nom || ""} onChange={e => setEditFields({...editFields, client_nom: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase font-bold">Email</label>
                      <input className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white" value={editFields.email_client || ""} onChange={e => setEditFields({...editFields, email_client: e.target.value})} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-orange-400 flex items-center gap-2"><MapPin size={14}/> État d'avancement</h3>
                  <div className="space-y-3">
                    <label className="text-[9px] text-slate-500 uppercase font-bold">Phase Actuelle du Chantier</label>
                    <select 
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-emerald-500 font-bold outline-none" 
                      value={editFields.etape_actuelle || ""} 
                      onChange={e => setEditFields({...editFields, etape_actuelle: e.target.value})}
                    >
                      {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
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
                        <span className="text-[10px] text-white truncate">{doc.nom_fichier}</span>
                        <div className="flex gap-2">
                          <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><ExternalLink size={14}/></a>
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
            <p className="text-2xl font-black uppercase tracking-[0.5em]">Sélectionnez un élément</p>
          </div>
        )}
      </div>

      {/* MODAL AJOUT STAFF */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 text-left shadow-2xl">
            <h2 className="text-xl font-black uppercase text-white mb-6 italic">Inscrire un collaborateur</h2>
            
            <form onSubmit={async (e) => { 
                e.preventDefault(); 
                setUpdating(true);
                const staffPin = Math.floor(1000 + Math.random() * 9000).toString();
                const tempPassword = "Amaru" + Math.random().toString(36).slice(-8);

                try {
                  const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: newStaff.email,
                    password: tempPassword,
                  });

                  if (authError) throw authError;

                  if (authData.user) {
                    const { error: profileError } = await supabase.from('profiles').insert([{ 
                      id: authData.user.id,
                      prenom: newStaff.prenom,
                      nom: newStaff.nom,
                      email: newStaff.email,
                      role: newStaff.role,
                      pin_code: staffPin,
                      company_name: agencyProfile.company_name,
                      pack: "Standard"
                    }]);

                    if (profileError) throw profileError;

                    alert(`Succès ! PIN de connexion : ${staffPin}`);
                    setNewStaff({ nom: "", prenom: "", email: "", role: "agent de suivi" });
                    setShowStaffModal(false); 
                    loadData();
                  }
                } catch (err: any) {
                  alert("Erreur : " + err.message);
                } finally {
                  setUpdating(false);
                }
            }} className="space-y-4">
              <input required placeholder="Prénom" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" value={newStaff.prenom} onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" value={newStaff.nom} onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              <input required type="email" placeholder="Email professionnel" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
              
              <select 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" 
                value={newStaff.role}
                onChange={e => setNewStaff({...newStaff, role: e.target.value})}
              >
                <option value="agent de suivi">Agent de suivi</option>
                <option value="admin">Administrateur d'agence</option>
                <option value="prestataire">Prestataire externe</option>
              </select>

              <button type="submit" disabled={updating} className="w-full bg-blue-500 text-black py-4 rounded-xl font-black text-xs uppercase flex justify-center items-center gap-2 hover:bg-blue-400 transition-all">
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18}/>} Inscrire le collaborateur
              </button>
              
              <button type="button" onClick={() => setShowStaffModal(false)} className="w-full text-slate-500 text-[10px] uppercase font-bold mt-2">Annuler</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU PROJET */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-4xl rounded-[3rem] border border-white/10 p-10 max-h-[90vh] overflow-y-auto text-left shadow-2xl">
            <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Nouveau Dossier Chantier</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
            </div>
            
            <form onSubmit={async (e) => {
                e.preventDefault();
                setUpdating(true);
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                try {
                  const { error } = await supabase.from("suivi_chantier").insert([{
                      ...newProject,
                      company_name: agencyProfile.company_name,
                      pin_code: pin,
                      etape_actuelle: PHASES_CHANTIER[0],
                      created_at: new Date().toISOString()
                  }]);
                  if (error) throw error;
                  setShowModal(false); 
                  loadData();
                } catch (err: any) {
                  alert(err.message);
                } finally {
                  setUpdating(false);
                }
            }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-white/5 pb-2">Identité Client</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="Prénom" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-emerald-500" onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
                        <input required placeholder="Nom" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-emerald-500" onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
                        <input required type="email" placeholder="Email" className="col-span-2 bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-emerald-500" onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest border-b border-white/5 pb-2">Villa</h3>
                    <input required placeholder="Nom de la Villa (ex: Villa Miramar)" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-orange-500" onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-all">
                {updating ? <Loader2 className="animate-spin" size={20}/> : "Créer le dossier"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}