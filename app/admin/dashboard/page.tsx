"use client";

import React, { useEffect, useCallback, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Trash2, 
  Loader2, 
  Search, 
  Plus, 
  X, 
  Zap, 
  UserCheck, 
  FileText, 
  Printer, 
  LogOut, 
  Users, 
  ShieldCheck, 
  MapPin, 
  ExternalLink, 
  Home 
} from 'lucide-react';

// INITIALISATION DU CLIENT SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PHASES_CHANTIER = [
  "0. Signature & Réservation", 
  "1. Terrain / Terrassement", 
  "2. Fondations", 
  "3. Murs / Élévation", 
  "4. Toiture / Charpente", 
  "5. Menuiseries", 
  "6. Électricité / Plomberie", 
  "7. Isolation", 
  "8. Plâtrerie", 
  "9. Sols & Carrelages", 
  "10. Peintures / Finitions", 
  "11. Extérieurs / Jardin", 
  "12. Remise des clés"
];

export default function AdminDashboard() {
  const router = useRouter();
  
  // ÉTATS DE L'INTERFACE
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // DONNÉES
  const [projets, setProjets] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  
  // MODALS
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // FORMULAIRES ET PROFIL
  const [editFields, setEditFields] = useState<any>({});
  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });
  
  const [newStaff, setNewStaff] = useState({ 
    nom: "", 
    prenom: "", 
    email: "", 
    role: "agent de suivi" 
  });

  const [newProject, setNewProject] = useState({
    client_nom: "", 
    client_prenom: "", 
    email_client: "", 
    telephone: "", 
    date_naissance: "",
    rue: "", 
    code_postal: "", 
    ville: "", 
    pays: "Espagne",
    nom_villa: "", 
    constructeur_info: "", 
    montant_cashback: 0,
    commentaires_etape: "", 
    commentaire_etape_chantier: "", 
    lien_photo: "", 
    date_livraison_prevue: "", 
    document_url: ""
  });

  // GESTION DE LA DÉCONNEXION
  const handleLogout = async () => {
    if(!confirm("Voulez-vous vous déconnecter ?")) return;
    await supabase.auth.signOut();
    localStorage.removeItem("staff_session");
    router.replace("/login");
  };

  // CHARGEMENT DES DONNÉES (AVEC LOGS)
  const loadData = useCallback(async () => {
    setLoading(true);
    console.log("🔍 [LoadData] Démarrage du chargement...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let userEmail = session?.user?.email;
      let currentAgency = "Amaru-Homes";

      if (!session) {
        console.log("⚠️ [LoadData] Pas de session Auth, vérification localStorage...");
        const savedPinSession = localStorage.getItem("staff_session");
        if (savedPinSession) {
          const pinUser = JSON.parse(savedPinSession);
          userEmail = pinUser.email;
          currentAgency = pinUser.company_name;
        } else {
          console.error("❌ [LoadData] Aucun utilisateur trouvé, redirection login.");
          router.replace("/login");
          return;
        }
      }

      console.log("👤 [LoadData] Utilisateur:", userEmail);

      // Récupérer le profil pour avoir le nom de la compagnie
      const { data: staffData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (profileError) {
        console.warn("⚠️ [LoadData] Erreur profil ou profil inexistant:", profileError.message);
      }

      if (staffData) {
          console.log("🏢 [LoadData] Compagnie détectée:", staffData.company_name);
          setAgencyProfile(staffData);
          currentAgency = staffData.company_name || "Amaru-Homes";
      }

      // Charger les dossiers chantiers
      const { data: projData, error: projError } = await supabase
        .from('suivi_chantier')
        .select('*')
        .eq('company_name', currentAgency)
        .order('created_at', { ascending: false });
      
      if (projError) console.error("❌ [LoadData] Erreur projets:", projError.message);
      if (projData) setProjets(projData);

      // Charger l'équipe
      const { data: stfData, error: stfError } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_name', currentAgency);
      
      if (stfError) console.error("❌ [LoadData] Erreur staff:", stfError.message);
      if (stfData) {
          console.log(`👥 [LoadData] ${stfData.length} membres chargés pour ${currentAgency}`);
          setStaffList(stfData);
      }
      
    } catch (err: any) { 
      console.error("💥 [LoadData] Erreur critique:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  // CHARGEMENT DES DOCUMENTS PROJET
  const loadProjectExtras = async (projectId: string) => {
    const { data: docs } = await supabase
      .from('documents_projets')
      .select('*')
      .eq('projet_id', projectId);
    setProjectDocs(docs || []);
  };

  useEffect(() => { 
    if (selectedProjet?.id) {
      setEditFields({ ...selectedProjet });
      loadProjectExtras(selectedProjet.id);
    }
  }, [selectedProjet]);

  // SAUVEGARDE MODIFICATIONS PROJET
  const handleUpdateDossier = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update(editFields)
      .eq('id', selectedProjet.id);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("✅ Dossier mis à jour !");
      loadData();
    }
    setUpdating(false);
  };

  // SUPPRESSION STAFF
  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce membre ?")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) alert(error.message);
    else loadData();
  };

  // ==========================================
  // FONCTION D'INSCRIPTION STAFF (CORRIGÉE)
  // ==========================================
  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    console.log("🚀 [StaffSignUp] Démarrage de la procédure...");
    
    const staffPin = Math.floor(1000 + Math.random() * 9000).toString();
    const tempPassword = "Amaru" + Math.random().toString(36).slice(-8);
    const targetAgency = agencyProfile.company_name || "Amaru-Homes";

    try {
      // ÉTAPE 1: Création du compte Auth
      console.log("1️⃣ [StaffSignUp] Création Auth pour:", newStaff.email);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStaff.email,
        password: tempPassword,
      });

      if (authError) {
        console.error("❌ [StaffSignUp] Erreur Auth:", authError.message);
        throw new Error(`Erreur Authentification: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("L'utilisateur n'a pas été créé par Supabase Auth.");
      }

      console.log("2️⃣ [StaffSignUp] Auth OK, ID généré:", authData.user.id);

      // ÉTAPE 2: Insertion dans la table Profiles
      const profilePayload = { 
        id: authData.user.id, // Liaison avec l'ID Auth
        prenom: newStaff.prenom,
        nom: newStaff.nom,
        email: newStaff.email,
        role: newStaff.role,
        pin_code: staffPin,
        company_name: targetAgency,
        pack: "Standard"
      };
      
      console.log("3️⃣ [StaffSignUp] Envoi payload table Profiles:", profilePayload);

      const { data: insertedData, error: profileError } = await supabase
        .from('profiles')
        .insert([profilePayload])
        .select();

      if (profileError) {
        console.error("❌ [StaffSignUp] ERREUR TABLE PROFILES:", profileError);
        console.error("Détails:", {
            code: profileError.code,
            hint: profileError.hint,
            details: profileError.details
        });
        throw new Error(`Erreur Base de données: ${profileError.message}`);
      }

      console.log("4️⃣ [StaffSignUp] Insertion réussie !", insertedData);
      alert(`✅ Compte créé avec succès !\nEmail: ${newStaff.email}\nPIN: ${staffPin}\nCompagnie: ${targetAgency}`);
      
      setShowStaffModal(false);
      setNewStaff({ nom: "", prenom: "", email: "", role: "agent de suivi" });
      loadData();

    } catch (err: any) {
      console.error("💥 [StaffSignUp] Échec total:", err.message);
      alert("ERREUR CRITIQUE: " + err.message);
    } finally {
      setUpdating(false);
      console.log("🔚 [StaffSignUp] Fin de procédure.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans print:bg-white text-left">
      
      {/* SIDEBAR GAUCHE */}
      <div className="w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col print:hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black text-white uppercase italic tracking-tighter">
              {agencyProfile.company_name}
            </h1>
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowModal(true)} 
                  className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <Plus size={16}/>
                </button>
                <button 
                  onClick={() => setShowStaffModal(true)} 
                  className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-black transition-all"
                >
                  <Users size={16}/>
                </button>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('clients')} 
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}
            >
              Dossiers
            </button>
            <button 
              onClick={() => setActiveTab('staff')} 
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-blue-500 text-black' : 'text-slate-500'}`}
            >
              Équipe
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs border border-white/5 outline-none focus:border-emerald-500 text-white" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {activeTab === 'clients' ? (
            projets.filter(p => `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
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
            staffList.filter(s => `${s.prenom} ${s.nom}`.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center group">
                <div className="text-left">
                  <p className="font-bold text-sm text-white">{s.prenom} {s.nom}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                    {s.role} • PIN: {s.pin_code}
                  </p>
                </div>
                <button 
                  onClick={() => handleDeleteStaff(s.id)} 
                  className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 space-y-2">
            <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-[10px] font-black uppercase">
              <Home size={16} /> Retour au Site
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-[10px] font-black uppercase">
              <LogOut size={16} /> Déconnexion
            </button>
        </div>
      </div>

      {/* ZONE DE CONTENU PRINCIPAL */}
      <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-5xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{editFields.nom_villa}</h2>
                    <div className="flex gap-4 mt-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                          <ShieldCheck size={12}/> PIN CLIENT : {editFields.pin_code}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase hover:bg-white/20 transition-all">
                      <Printer size={16}/> Imprimer
                    </button>
                    <button 
                      onClick={handleUpdateDossier} 
                      disabled={updating} 
                      className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase hover:scale-105 transition-all shadow-xl shadow-emerald-500/10"
                    >
                      {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Sauvegarder
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                  <UserCheck size={14}/> Client
                </h3>
                <div className="space-y-4">
                  <input 
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-white" 
                    value={editFields.client_nom || ""} 
                    onChange={e => setEditFields({...editFields, client_nom: e.target.value})} 
                    placeholder="Nom"
                  />
                  <input 
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-white" 
                    value={editFields.client_prenom || ""} 
                    onChange={e => setEditFields({...editFields, client_prenom: e.target.value})} 
                    placeholder="Prénom"
                  />
                </div>
              </section>
              
              <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-orange-400 flex items-center gap-2">
                  <MapPin size={14}/> Avancement
                </h3>
                <select 
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs text-emerald-500 font-bold outline-none" 
                  value={editFields.etape_actuelle} 
                  onChange={e => setEditFields({...editFields, etape_actuelle: e.target.value})}
                >
                  {PHASES_CHANTIER.map(phase => <option key={phase} value={phase}>{phase}</option>)}
                </select>
              </section>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <Zap size={100} className="text-emerald-500 mb-4 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-[0.5em]">Sélectionnez un dossier</p>
          </div>
        )}
      </div>

      {/* MODAL STAFF */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 text-left shadow-2xl">
            <h2 className="text-xl font-black uppercase text-white mb-6 italic">Inscrire un membre</h2>
            
            <form onSubmit={handleRegisterStaff} className="space-y-4">
              <input 
                required 
                placeholder="Prénom" 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" 
                value={newStaff.prenom} 
                onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} 
              />
              <input 
                required 
                placeholder="Nom" 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" 
                value={newStaff.nom} 
                onChange={e => setNewStaff({...newStaff, nom: e.target.value})} 
              />
              <input 
                required 
                type="email" 
                placeholder="Email professionnel" 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" 
                value={newStaff.email} 
                onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
              />
              
              <select 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500" 
                value={newStaff.role}
                onChange={e => setNewStaff({...newStaff, role: e.target.value})}
              >
                <option value="agent de suivi">Agent de suivi</option>
                <option value="admin">Administrateur d'agence</option>
                <option value="prestataire">Prestataire externe</option>
              </select>

              <button 
                type="submit" 
                disabled={updating} 
                className="w-full bg-blue-500 text-black py-4 rounded-xl font-black text-xs uppercase flex justify-center items-center gap-2 hover:bg-blue-400 transition-all"
              >
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18}/>} Inscrire le membre
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowStaffModal(false)} 
                className="w-full text-slate-500 text-[10px] uppercase font-bold mt-2"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROJET */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 text-left shadow-2xl">
            <h2 className="text-2xl font-black uppercase text-white mb-8 italic tracking-tighter">Nouveau Projet</h2>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setUpdating(true);
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                try {
                  const { error } = await supabase.from("suivi_chantier").insert([{
                      ...newProject,
                      company_name: agencyProfile.company_name || "Amaru-Homes",
                      pin_code: pin,
                      etape_actuelle: PHASES_CHANTIER[0],
                      created_at: new Date().toISOString()
                  }]);
                  if (error) throw error;
                  setShowModal(false); 
                  loadData();
                } catch (err: any) { alert(err.message); } finally { setUpdating(false); }
              }} 
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white" onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
                  <input required placeholder="Nom Client" className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white" onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
              </div>
              <input required placeholder="Nom de la Villa" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white" onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-500/20">
                {updating ? <Loader2 className="animate-spin" size={20}/> : "Créer le dossier chantier"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}