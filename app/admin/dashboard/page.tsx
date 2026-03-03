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
  
  const [staffList, setStaffList] = useState<any[]>([]); 
  const [adminsList, setAdminsList] = useState<any[]>([]); 
  const [agencyProfile, setAgencyProfile] = useState<any>(null);

  const [newPass, setNewPass] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newDossier, setNewDossier] = useState({
    client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
    nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, etape_actuelle: TRANSLATIONS.fr.phases[0]
  });

  useEffect(() => { 
    setIsMounted(true); 
    loadData(); 
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        if (typeof window !== "undefined") window.location.href = '/login';
        return;
      }

      const user = session.user;

      const { data: profile, error: profError } = await supabase.from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profError) throw profError;

      const currentProfile = profile || { 
        agency_name: "Agence Inconnue", 
        prenom: "Utilisateur", 
        nom: "Admin" 
      };
      
      setAgencyProfile(currentProfile);

      const isSuperAdmin = currentProfile.agency_name === 'SUPER_ADMIN' || user.email === 'gaetan@amaru-homes.com';

      const [projRes, adsRes, stfRes] = await Promise.all([
        supabase.from('suivi_chantier')
          .select('*')
          .order('created_at', { ascending: false })
          .filter(isSuperAdmin ? 'id' : 'agency_name', isSuperAdmin ? 'not.is' : 'eq', isSuperAdmin ? null : currentProfile.agency_name),
        
        supabase.from('profiles')
          .select('*')
          .filter(isSuperAdmin ? 'id' : 'agency_name', isSuperAdmin ? 'not.is' : 'eq', isSuperAdmin ? null : currentProfile.agency_name),
        
        supabase.from('staff_prestataires')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (projRes.data) setProjets(projRes.data);
      if (adsRes.data) setAdminsList(adsRes.data);
      if (stfRes.data) setStaffList(stfRes.data);

    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const clientPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase.from('suivi_chantier').insert([{ 
      ...newDossier, 
      pin_code: clientPin,
      agency_name: agencyProfile?.agency_name 
    }]);

    if (!error) { 
      setShowModal(false); 
      await loadData(); 
      setNewDossier({
        client_prenom: "", client_nom: "", email_client: "", rue: "", ville: "", pays: "Espagne",
        nom_villa: "", date_livraison_prevue: "", montant_cashback: 0, etape_actuelle: TRANSLATIONS.fr.phases[0]
      });
    }
    setUpdating(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (!error) { 
        alert("Mot de passe mis à jour !"); 
        setNewPass(""); 
    } else { 
        alert(error.message); 
    }
    setUpdating(false);
  };

  const loadDocuments = async (id: string) => {
    const { data } = await supabase.from('documents_projets').select('*').eq('projet_id', id);
    setDocuments(data || []);
  };

  useEffect(() => { 
    if (selectedProjet) loadDocuments(selectedProjet.id); 
  }, [selectedProjet]);

  const filteredProjets = useMemo(() => {
    return projets.filter(p => 
      `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projets, searchTerm]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

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
            <div className="overflow-hidden">
              <h1 className="text-sm font-black text-white uppercase truncate">
                {agencyProfile?.agency_name || "Agence"}
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter italic">
                {agencyProfile?.prenom} {agencyProfile?.nom}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>{t.dossiers}</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>{t.experts}</button>
          </div>

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

          <div className="space-y-2">
            {activeTab === 'clients' ? (
              filteredProjets.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                  <p className="font-bold text-sm">{p.client_prenom} {p.client_nom}</p>
                  <p className="text-[9px] uppercase opacity-50 font-bold tracking-widest">{p.nom_villa}</p>
                </button>
              ))
            ) : (
              staffList.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                  <div><p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p><p className="text-[10px] font-mono text-emerald-400">PIN: {s.pin_code}</p></div>
                  <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
            <Settings size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">{t.settings}</span>
          </button>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/'; }} className="w-full flex items-center justify-between p-4 rounded-xl text-slate-500 hover:text-red-500 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-widest">{t.logout}</span> <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0F172A]">
        {activeTab === 'settings' ? (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <section className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400"><ShieldCheck size={28} /></div>
                <div><h2 className="text-2xl font-bold text-white">{t.team}</h2><p className="text-[10px] text-slate-500 uppercase tracking-widest">Équipe {agencyProfile?.agency_name}</p></div>
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
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                 <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6 italic uppercase">{selectedProjet.nom_villa}</h2>
                 <div className="flex flex-wrap gap-3">
                   <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 text-[10px] font-bold uppercase">{t.clientPin} : {selectedProjet.pin_code}</span>
                   <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 text-[10px] font-bold uppercase flex items-center gap-2"><Euro size={12}/> {selectedProjet.montant_cashback}€</span>
                 </div>
               </div>
            </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Zap size={100} className="text-emerald-500 mb-8 opacity-20 animate-pulse" />
            <p className="text-3xl font-black uppercase tracking-[0.4em] text-white/20 text-center mb-4">{agencyProfile?.agency_name}</p>
          </div>
        )}
      </main>

      {/* MODALE DOSSIER */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative my-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={28} /></button>
            <h3 className="text-3xl font-serif italic text-white mb-10">{t.newDossier}</h3>
            <form onSubmit={handleCreateDossier} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input required placeholder="Prénom" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.client_prenom} onChange={e => setNewDossier({...newDossier, client_prenom: e.target.value})} />
                  <input required placeholder="Nom" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.client_nom} onChange={e => setNewDossier({...newDossier, client_nom: e.target.value})} />
                  <input required type="email" placeholder="Email" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500 text-white" value={newDossier.email_client} onChange={e => setNewDossier({...newDossier, email_client: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <input placeholder="Adresse" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" value={newDossier.rue} onChange={e => setNewDossier({...newDossier, rue: e.target.value})} />
                  <input placeholder="Ville" className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none focus:border-blue-500 text-white" value={newDossier.ville} onChange={e => setNewDossier({...newDossier, ville: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest mt-6 shadow-xl shadow-emerald-500/10">
                {updating ? <Loader2 className="animate-spin mx-auto" /> : t.createDossier}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}