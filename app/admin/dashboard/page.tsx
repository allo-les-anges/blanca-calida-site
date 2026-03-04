"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Trash2, Loader2, Search, MapPin, Plus, X,
  LogOut, Activity, Zap, Briefcase, UserCheck,
  Phone, Mail, Calendar, Home, HardHat, Wallet, Clock, FileText, Image as ImageIcon
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

  // États pour l'édition
  const [editComment, setEditComment] = useState("");
  const [editStep, setEditStep] = useState("");
  const [editCashback, setEditCashback] = useState("");
  const [editLivraison, setEditLivraison] = useState("");

  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });

  // État pour la création d'un nouveau projet
  const [newProject, setNewProject] = useState({
    client_nom: "", client_prenom: "", email_client: "", telephone: "",
    rue: "", code_postal: "", ville: "", pays: "Espagne",
    nom_villa: "", constructeur_info: "", montant_cashback: 0, date_naissance: ""
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

      const { data: projData } = await supabase
        .from('suivi_chantier')
        .select('*')
        .eq('company_name', currentAgency)
        .order('created_at', { ascending: false });

      if (projData) setProjets(projData);

      const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
      if (stfData) setStaffList(stfData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  
  useEffect(() => { 
    if (selectedProjet) {
      setEditComment(selectedProjet.commentaires_etape || "");
      setEditStep(selectedProjet.etape_actuelle || PHASES_CHANTIER[0]);
      setEditCashback(selectedProjet.montant_cashback || "");
      setEditLivraison(selectedProjet.date_livraison_prevue || "");
    } 
  }, [selectedProjet]);

  // --- LOGIQUE UPLOAD (Bucket: documents-clients) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'lien_photo' | 'document_url') => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProjet.id}/${field}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents-clients')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents-clients')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('suivi_chantier')
        .update({ [field]: publicUrl })
        .eq('id', selectedProjet.id);

      if (updateError) throw updateError;

      alert("Fichier importé !");
      loadData();
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProjet = async () => {
    if (!selectedProjet) return;
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update({ 
        commentaires_etape: editComment, 
        etape_actuelle: editStep,
        montant_cashback: editCashback,
        date_livraison_prevue: editLivraison,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedProjet.id);
    
    if (!error) {
      alert("Dossier mis à jour !");
      loadData();
    }
    setUpdating(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from("suivi_chantier").insert([{
      ...newProject,
      company_name: agencyProfile.company_name,
      pin_code: generatedPin,
      etape_actuelle: PHASES_CHANTIER[0],
      updated_at: new Date().toISOString()
    }]);

    if (!error) {
      setShowModal(false);
      setNewProject({ client_nom: "", client_prenom: "", email_client: "", telephone: "", rue: "", code_postal: "", ville: "", pays: "Espagne", nom_villa: "", constructeur_info: "", montant_cashback: 0, date_naissance: "" });
      loadData();
    } else {
      alert(error.message);
    }
  };

  const filteredProjets = useMemo(() => {
    return projets.filter(p => 
      `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projets, searchTerm]);

  if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col shadow-2xl">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-emerald-500 p-2 rounded-xl"><Briefcase className="text-black" size={20} /></div>
              <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">{agencyProfile.company_name}</h1>
            </div>
            <button onClick={() => setShowModal(true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
              <Plus size={18} />
            </button>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Staff</button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Filtrer..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {activeTab === 'clients' ? filteredProjets.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}>
              <p className="font-bold text-sm text-white leading-tight">{p.client_prenom} {p.client_nom}</p>
              <p className="text-[10px] uppercase font-black text-emerald-500 mt-1">{p.nom_villa}</p>
            </button>
          )) : staffList.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center">
              <div className='text-left'><p className="font-bold text-sm text-white">{s.nom}</p><p className="text-[10px] text-emerald-500 font-mono">PIN: {s.pin_code}</p></div>
              <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT (Éditeur) */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedProjet.nom_villa}</h2>
                <div className="flex gap-3 mt-4">
                  <span className="bg-emerald-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">PIN: {selectedProjet.pin_code}</span>
                  <span className="bg-white/10 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">{selectedProjet.ville}</span>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <button onClick={handleUpdateProjet} disabled={updating} className="flex-1 flex items-center justify-center gap-2 px-10 py-4 bg-emerald-500 text-black rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">
                    {updating ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Mettre à jour le dossier
                 </button>
                 <button onClick={() => { supabase.auth.signOut(); window.location.href='/login'; }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20"><LogOut size={20}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COLONNE GAUCHE */}
              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2 mb-4"><UserCheck size={14}/> Fiche Client</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3"><Mail size={14} className="text-slate-500"/> {selectedProjet.email_client}</div>
                    <div className="flex items-center gap-3"><Phone size={14} className="text-slate-500"/> {selectedProjet.telephone}</div>
                    <div className="flex items-start gap-3 pt-4 border-t border-white/5"><MapPin size={14} className="text-slate-500 mt-1"/> <div>{selectedProjet.rue}<br/>{selectedProjet.code_postal} {selectedProjet.ville}</div></div>
                  </div>
                </section>

                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2"><Home size={14}/> Finance & Délais</h3>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1 italic">Constructeur</label>
                      <p className="text-sm font-bold text-white">{selectedProjet.constructeur_info || "Non renseigné"}</p>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1 italic">Cashback (€)</label>
                      <input type="text" value={editCashback} onChange={(e) => setEditCashback(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 text-emerald-400 font-bold" />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1 italic">Livraison Estimée</label>
                      <input type="text" value={editLivraison} onChange={(e) => setEditLivraison(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 text-white" />
                    </div>
                  </div>
                </section>

                {/* --- SECTION DOCUMENTS (Bucket: documents-clients) --- */}
                <section className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em] flex items-center gap-2"><FileText size={14}/> Documents & Médias</h3>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-2 italic">Photo Villa</label>
                      {selectedProjet.lien_photo ? (
                        <div className="relative h-24 w-full rounded-2xl overflow-hidden mb-2 group border border-white/5">
                          <img src={selectedProjet.lien_photo} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="villa"/>
                          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-[10px] font-black">Changer</label>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'lien_photo')} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-emerald-500/50 transition-colors">
                           <label className="cursor-pointer flex flex-col items-center gap-2">
                             <ImageIcon size={20} className="text-slate-500"/>
                             <span className="text-[10px] uppercase font-black text-slate-500">Ajouter Photo</span>
                             <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'lien_photo')} />
                           </label>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-2 italic">Fichier PDF / Contrat</label>
                      {selectedProjet.document_url && (
                        <a href={selectedProjet.document_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 font-bold hover:underline block mb-3 truncate">📄 Voir le document actuel</a>
                      )}
                      <input type="file" className="text-[10px] text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-white/5 file:text-white cursor-pointer w-full" onChange={(e) => handleFileUpload(e, 'document_url')} />
                    </div>
                  </div>
                </section>
              </div>

              {/* COLONNE DROITE (ÉTAPES) */}
              <div className="lg:col-span-2 space-y-6 text-left">
                <div className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2"><Activity size={14}/> État d'avancement</h3>
                    <div className="text-[9px] font-mono text-slate-500 bg-black/30 px-4 py-1.5 rounded-full uppercase border border-white/5">MàJ : {selectedProjet.updated_at ? new Date(selectedProjet.updated_at).toLocaleString() : 'Initiale'}</div>
                  </div>
                  
                  <div className="mb-8">
                    <label className="text-[9px] text-slate-500 uppercase font-bold block mb-2 italic">Phase du Chantier</label>
                    <select value={editStep} onChange={(e) => setEditStep(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-emerald-500 text-emerald-500 appearance-none shadow-inner">
                      {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-2 italic">Note à l'attention du client</label>
                  <textarea 
                    value={editComment} onChange={(e) => setEditComment(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-lg text-slate-200 min-h-[400px] outline-none focus:border-emerald-500 italic leading-relaxed shadow-inner"
                    placeholder="Détaillez ici les avancées du chantier..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={120} className="text-emerald-500 mb-4" />
            <p className="text-3xl font-black uppercase tracking-[0.5em]">{agencyProfile.company_name}</p>
          </div>
        )}
      </div>

      {/* MODAL : NOUVEAU CLIENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0F172A] z-10 text-left">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Nouveau Dossier</h2>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Génération automatique du Code PIN de suivi</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-left">
              <div className="md:col-span-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] border-b border-white/5 pb-2">Identité Client</div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Prénom</label>
                <input required className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500" value={newProject.client_prenom} onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Nom</label>
                <input required className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500" value={newProject.client_nom} onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Email</label>
                <input type="email" required className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500" value={newProject.email_client} onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Téléphone</label>
                <input className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500" value={newProject.telephone} onChange={e => setNewProject({...newProject, telephone: e.target.value})} />
              </div>

              <div className="md:col-span-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] border-b border-white/5 pb-2 mt-4">Localisation & Projet</div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-400 ml-2">Nom de la Villa / Plot</label>
                <input required className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none text-white" value={newProject.nom_villa} onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Ville</label>
                <input className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500" value={newProject.ville} onChange={e => setNewProject({...newProject, ville: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Cashback Prévu (€)</label>
                <input type="number" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 font-bold text-emerald-400" value={newProject.montant_cashback} onChange={e => setNewProject({...newProject, montant_cashback: Number(e.target.value)})} />
              </div>

              <button type="submit" className="md:col-span-2 bg-emerald-500 text-black py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] mt-8 hover:bg-white transition-all shadow-2xl">
                Activer le suivi & Générer PIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}