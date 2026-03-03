"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Camera, Trash2, Loader2, Plus, X, 
  Search, MapPin, Download, Upload, UserPlus, 
  LogOut, Activity, Zap, Euro, Calendar, Briefcase, 
  UserCheck, Globe, ArrowLeft, ExternalLink,
  Home, Settings, Key, Mail, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TRANSLATIONS = {
  fr: {
    dossiers: "Dossiers", experts: "Experts", newDossier: "Nouveau Dossier", 
    addExpert: "Ajouter un Expert", search: "Recherche...", currentStep: "Étape actuelle",
    clientPin: "PIN Client", cashback: "Cashback", docs: "Documents Clients",
    noDocs: "Aucun document chargé.", createExpert: "Nouvel Expert", savePin: "Enregistrer l'expert",
    createDossier: "Créer le Dossier & Générer PIN", loading: "Chargement...",
    settings: "Gestion Agence", logout: "Déconnexion", backHome: "Retour Accueil",
    changePass: "Mon mot de passe", team: "Collaborateurs Agence",
    inviteDev: "Inviter un collaborateur", save: "Enregistrer",
    phases: [
      "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
      "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
      "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
      "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", "12. Remise des clés"
    ]
  }
};

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [lang] = useState<'fr'>('fr');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'clients' | 'staff' | 'settings'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  
  const [staffList, setStaffList] = useState<any[]>([]); // Experts terrain
  const [adminsList, setAdminsList] = useState<any[]>([]); // Collaborateurs bureau
  const [agencyProfile, setAgencyProfile] = useState<any>({ id: null, company_name: "Amaru-Homes", prenom: "", nom: "" });

  const [newStaff, setNewStaff] = useState({ nom: "", prenom: "", pin: "" });
  const [newPass, setNewPass] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, etape_actuelle: TRANSLATIONS.fr.phases[0]
  });

  useEffect(() => { setIsMounted(true); loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setAgencyProfile(profile);
      }
      const { data: projData } = await supabase.from('suivi_chantier').select('*').order('created_at', { ascending: false });
      const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
      const { data: adsData } = await supabase.from('profiles').select('prenom, nom, email');
      
      if (projData) setProjets(projData);
      if (stfData) setStaffList(stfData);
      if (adsData) setAdminsList(adsData);
    } finally { setLoading(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const finalPin = newStaff.pin || Math.floor(1000 + Math.random() * 9000).toString();
    const { error } = await supabase.from('staff_prestataires').insert([{ 
      prenom: newStaff.prenom, nom: newStaff.nom, pin_code: finalPin 
    }]);
    if (!error) { setShowStaffModal(false); setNewStaff({nom:"", prenom:"", pin:""}); loadData(); }
    setUpdating(false);
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const clientPin = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from('suivi_chantier').insert([{ ...newDossier, pin_code: clientPin }]);
    if (!error) { setShowModal(false); loadData(); }
    setUpdating(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (!error) { alert("Mot de passe mis à jour !"); setNewPass(""); }
    else { alert(error.message); }
    setUpdating(false);
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;
    setUpdating(true);
    try {
      const filePath = `${selectedProjet.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from('documents-clients').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(filePath);
      await supabase.from('documents_projets').insert([{ projet_id: selectedProjet.id, nom_fichier: file.name, url_fichier: publicUrl }]);
      loadDocuments(selectedProjet.id);
    } finally { setUpdating(false); }
  };

  const loadDocuments = async (id: string) => {
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', id);
    setDocuments(data || []);
  };

  useEffect(() => { if (selectedProjet) loadDocuments(selectedProjet.id); }, [selectedProjet]);

  const filteredProjets = useMemo(() => {
    return projets.filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projets, searchTerm]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
             <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition-all"><ArrowLeft size={16} /></div>
             <span className="text-[10px] font-black uppercase tracking-widest">{t.backHome}</span>
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20"><Briefcase className="text-[#020617]" size={22} /></div>
            <div>
              <h1 className="text-sm font-black text-white uppercase truncate">{agencyProfile.company_name}</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter italic italic">Admin</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>{t.dossiers}</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>{t.experts}</button>
          </div>

          {activeTab !== 'settings' && (
            <div className="space-y-4">
              {activeTab === 'clients' ? (
                <button onClick={() => setShowModal(true)} className="w-full bg-white text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-emerald-400 transition-all"><Plus size={16} /> {t.newDossier}</button>
              ) : (
                <button onClick={() => setShowStaffModal(true)} className="w-full bg-emerald-500 text-black p-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-white transition-all"><UserPlus size={16} /> {t.addExpert}</button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input type="text" placeholder={t.search} className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => {setSelectedProjet(p); setActiveTab('clients');}} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-inner' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                  <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                  <p className="text-[9px] uppercase opacity-50 font-bold tracking-widest">{p.nom_villa}</p>
                </button>
              ))
            ) : activeTab === 'staff' ? (
              staffList.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 group">
                  <div><p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p><p className="text-[10px] font-mono text-emerald-400">PIN: {s.pin_code}</p></div>
                  <button onClick={async () => { if(confirm("Supprimer l'expert ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              ))
            ) : null}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 space-y-2 bg-black/20">
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
            <Settings size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">{t.settings}</span>
          </button>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/'; }} className="w-full flex items-center justify-between p-4 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-widest">{t.logout}</span> <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A]">
        {activeTab === 'settings' ? (
          /* SECTION PARAMÈTRES ET ÉQUIPE */
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <section className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400"><ShieldCheck size={28} /></div>
                <div><h2 className="text-2xl font-bold text-white">{t.team}</h2><p className="text-[10px] text-slate-500 uppercase tracking-widest">Collaborateurs Agence</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  {adminsList.map((admin, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div><p className="text-sm font-bold">{admin.prenom} {admin.nom}</p><p className="text-[10px] text-slate-500">{admin.email}</p></div>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase rounded-full">Admin</span>
                    </div>
                  ))}
                </div>
                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-4">{t.inviteDev}</h3>
                  <input type="email" placeholder="email@agence.com" className="w-full bg-white/5 p-4 rounded-xl border border-white/5 outline-none mb-4" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <button className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Mail size={14}/> Inviter</button>
                </div>
              </div>
            </section>

            <section className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400"><Key size={28} /></div>
                <h2 className="text-2xl font-bold text-white">{t.changePass}</h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="flex flex-col md:flex-row gap-4">
                <input type="password" required placeholder="Nouveau mot de passe" className="flex-1 bg-black/40 p-5 rounded-2xl border border-white/5 outline-none focus:border-emerald-500" value={newPass} onChange={e => setNewPass(e.target.value)} />
                <button type="submit" className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all">Mettre à jour</button>
              </form>
            </section>
          </div>
        ) : selectedProjet ? (
          /* SECTION DOSSIER CLIENT (Identique à ton code original) */
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">
                    <Home size={12}/> {t.dossiers} <span className="text-slate-600">/</span> {selectedProjet.nom_villa}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6 italic uppercase leading-tight">{selectedProjet.nom_villa}</h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5 text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><MapPin size={12}/> {selectedProjet.ville}, {selectedProjet.pays}</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 text-[10px] font-bold uppercase">{t.clientPin} : {selectedProjet.pin_code}</span>
                    <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 text-[10px] font-bold uppercase flex items-center gap-2"><Euro size={12}/> {selectedProjet.montant_cashback}€</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5 h-full">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><Activity size={14}/> {t.currentStep}</h3>
                      <span className="px-4 py-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 text-[10px] font-black uppercase">{selectedProjet.etape_actuelle}</span>
                   </div>
                   <div className="relative">
                      <div className="absolute -left-6 top-0 bottom-0 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                      <p className="text-2xl text-slate-200 italic font-medium leading-relaxed pl-4">
                        "{selectedProjet.commentaires_etape || "Aucun commentaire disponible."}"
                      </p>
                   </div>
                </div>
              </div>

              <div className="bg-[#0F172A]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-[500px] shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-3"><Camera size={16} className="text-emerald-500"/> {t.docs}</h3>
                  <label className="cursor-pointer p-3 bg-emerald-500 text-black rounded-xl hover:scale-110 active:scale-95 transition-all">
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <input type="file" className="hidden" onChange={handleUploadDocument} disabled={updating} />
                  </label>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {documents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30"><Upload size={40}/><p className="text-[10px] font-bold uppercase mt-4">{t.noDocs}</p></div>
                  ) : documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 group transition-all">
                      <div className="flex-1 mr-4 overflow-hidden"><p className="text-[11px] font-bold truncate">{doc.nom_fichier}</p></div>
                      <div className="flex gap-1">
                        <a href={doc.url_fichier} target="_blank" className="p-2 text-slate-500 hover:text-white"><Download size={14} /></a>
                        <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('documents_projets').delete().eq('id', doc.id); loadDocuments(selectedProjet.id); }}} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Zap size={100} className="text-emerald-500 mb-8 opacity-20 animate-pulse" />
            <p className="text-3xl font-black uppercase tracking-[0.4em] text-white/20 text-center mb-4">{agencyProfile.company_name}</p>
            <div className="flex gap-4">
               <button onClick={() => setShowModal(true)} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Créer un dossier</button>
               <Link href="/" className="px-8 py-3 bg-emerald-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white">Homepage</Link>
            </div>
          </div>
        )}
      </main>

      {/* MODALES : Identiques au code fourni, réintégrées ici */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative my-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={28} /></button>
            <h3 className="text-3xl font-serif italic text-white mb-10">{t.newDossier}</h3>
            <form onSubmit={handleCreateDossier} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-emerald-500 uppercase ml-2 tracking-widest">Identité Client</label>
                  <input required placeholder="Prénom" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.client_prenom} onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.client_nom} onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  <input required type="email" placeholder="Email" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.email_client} onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">Localisation</label>
                  <input placeholder="Adresse" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" value={newDossier.rue} onChange={e => setNewDossier({...newDossier, rue: e.target.value})} />
                  <input placeholder="Ville" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" value={newDossier.ville} onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                  <input placeholder="Pays" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" value={newDossier.pays} onChange={e => setNewDossier({...newDossier, pays: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-purple-400 uppercase ml-2 tracking-widest">Projet</label>
                    <input required placeholder="Nom de la Villa" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-purple-500 text-white" value={newDossier.nom_villa} onChange={e => setNewDossier({...newDossier, nom_villa: e.target.value})} />
                    <select className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.etape_actuelle} onChange={e => setNewDossier({...newDossier, etape_actuelle: e.target.value})}>
                        {TRANSLATIONS.fr.phases.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-amber-400 uppercase ml-2 tracking-widest">Planning</label>
                    <input type="date" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-amber-500 text-slate-400" value={newDossier.date_livraison_prevue} onChange={e => setNewDossier({...newDossier, date_livraison_prevue: e.target.value})} />
                    <input type="number" placeholder="Cashback (€)" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-amber-500 text-white" value={newDossier.montant_cashback} onChange={e => setNewDossier({...newDossier, montant_cashback: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest mt-6 shadow-xl shadow-emerald-500/10">
                {updating ? <Loader2 className="animate-spin mx-auto" /> : t.createDossier}
              </button>
            </form>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0F172A] w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative">
            <button onClick={() => setShowStaffModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-serif italic text-white text-center mb-10">{t.createExpert}</h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input type="text" required placeholder="Prénom" className="w-full p-5 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newStaff.prenom} onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
              <input type="text" required placeholder="Nom" className="w-full p-5 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newStaff.nom} onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              <input type="text" placeholder="PIN (Optionnel)" className="w-full p-5 bg-black/40 rounded-2xl border border-white/5 outline-none focus:border-emerald-500 font-mono text-center tracking-widest text-xl text-white" maxLength={6} value={newStaff.pin} onChange={e => setNewStaff({...newStaff, pin: e.target.value})} />
              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs mt-6">
                {updating ? <Loader2 className="animate-spin mx-auto" /> : t.savePin}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
      `}</style>
    </div>
  );
}