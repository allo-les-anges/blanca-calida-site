"use client";

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Trash2, Loader2, Search, Plus, Zap, UserCheck, 
  FileText, Printer, LogOut, ShieldCheck, MapPin, 
  ExternalLink, Home, Camera, Euro, Calendar, 
  ChevronRight, Info, Upload, X, UserPlus, Mail, Lock, Copy,
  CheckCircle2, Clock, Phone, Globe, Hash,
  LayoutDashboard, Database, Eye, EyeOff, ArrowRight, Settings,
  AlertCircle, Paperclip, HardDrive, Key
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // --- ÉTATS DE L'INTERFACE ---
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [projectTab, setProjectTab] = useState<'infos' | 'suivi' | 'docs'>('infos');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // --- DONNÉES ---
  const [projets, setProjets] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [constats, setConstats] = useState<any[]>([]);
  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });

  // --- ÉTATS DES FORMULAIRES ---
  const [editFields, setEditFields] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  
  // --- ÉTATS POUR LES CONSTATS ---
  const [selectedConstatsDate, setSelectedConstatsDate] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [newProject, setNewProject] = useState({ 
    client_nom: "", 
    client_prenom: "", 
    nom_villa: "",
    email_client: "",
    telephone: "",
    rue: "",
    ville: "",
    code_postal: "",
    pays: "Espagne",
    montant_cashback: 0,
    constructeur_info: "",
    date_livraison_prevue: "",
    lien_photo: ""
  });

  const [newStaff, setNewStaff] = useState({ 
    nom: "", 
    prenom: "", 
    email: "", 
    role: "agent" 
  });

  // --- CHARGEMENT DES DONNÉES ---

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) setAgencyProfile(profile);

      const { data: projs, error: errorProjs } = await supabase
        .from('suivi_chantier')
        .select('*')
        .eq('company_name', profile?.company_name || "Amaru-Homes")
        .order('created_at', { ascending: false });
      
      if (!errorProjs) setProjets(projs || []);

      const { data: staff, error: errorStaff } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_name', profile?.company_name || "Amaru-Homes")
        .order('created_at', { ascending: false });
      
      if (!errorStaff) setStaffList(staff || []);

    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Chargement spécifique au projet sélectionné
  useEffect(() => {
    if (selectedProjet) {
      setEditFields(selectedProjet);
      loadDocuments(selectedProjet.id);
      loadConstats(selectedProjet.id);
    }
  }, [selectedProjet]);

  const loadDocuments = async (projectId: string) => {
    const { data, error } = await supabase
      .from('documents_projets')
      .select('*')
      .eq('projet_id', projectId)
      .order('created_at', { ascending: false });
    
    if (!error) setProjectDocs(data || []);
  };

  const loadConstats = async (projectId: string) => {
    const { data, error } = await supabase
      .from('constats-photos')
      .select('*')
      .eq('id_projet', projectId)
      .order('created_at', { ascending: false });
    
    if (!error) setConstats(data || []);
  };

  // --- ACTIONS DE GESTION ---

  const handleUpdateDossier = async () => {
    if (!selectedProjet) return;
    setUpdating(true);
    const { error } = await supabase
      .from('suivi_chantier')
      .update(editFields)
      .eq('id', selectedProjet.id);

    if (error) {
      alert("Erreur lors de la mise à jour");
    } else {
      alert("✅ Dossier mis à jour avec succès !");
      loadData();
    }
    setUpdating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;

    setUploadingDoc(true);
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${selectedProjet.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents-clients')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents-clients')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from('documents_projets').insert([{
          projet_id: selectedProjet.id,
          nom_fichier: file.name,
          url_fichier: publicUrl,
          type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
          storage_path: filePath
        }]);

        if (insertError) throw insertError;

        await loadDocuments(selectedProjet.id);
    } catch (err: any) {
        console.error(err);
        alert("Erreur d'importation : " + err.message);
    } finally {
        setUploadingDoc(false);
    }
  };

  const deleteDocument = async (docId: string, url: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) return;
    
    const pathParts = url.split('documents-clients/');
    if (pathParts[1]) {
      await supabase.storage.from('documents-clients').remove([pathParts[1]]);
    }
    
    await supabase.from('documents_projets').delete().eq('id', docId);
    loadDocuments(selectedProjet.id);
  };

  // --- GESTION DU STAFF ---

  const handleAddStaff = async (e: React.FormEvent) => {
  e.preventDefault();
  setUpdating(true);

  try {
    // 1. Créer l'utilisateur dans auth.users avec un mot de passe temporaire
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newStaff.email,
      password: 'TemporaryPassword123!', // mot de passe temporaire, à changer à la première connexion
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Échec de la création de l'utilisateur");

    const userId = authData.user.id;
    const autoPin = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Insérer le profil avec l'id de l'utilisateur
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: userId,
      nom: newStaff.nom,
      prenom: newStaff.prenom,
      email: newStaff.email,
      role: newStaff.role, 
      company_name: agencyProfile.company_name,
      pin_code: autoPin,
      pack: "Standard"
    }]);

    if (profileError) throw profileError;

    alert(`✅ Collaborateur ajouté ! PIN généré : ${autoPin}`);
    setShowStaffModal(false);
    setNewStaff({ nom: "", prenom: "", email: "", role: "agent" });
    loadData();
  } catch (err: any) {
    alert("Erreur lors de l'ajout : " + err.message);
  } finally {
    setUpdating(false);
  }
};

  const handleDeleteStaff = async (staffId: string, staffEmail: string) => {
    if (staffEmail === agencyProfile.email) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement ce collaborateur ?`)) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
      
      alert("Collaborateur supprimé.");
      loadData(); // Recharger la liste
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- GESTION DES CONSTATS ET PDF ---

  const groupedConstats = useMemo(() => {
    return constats.reduce((acc: any, c: any) => {
      const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(c);
      return acc;
    }, {});
  }, [constats]);

  const generateConstatsPDF = async (date: string, dailyConstats: any[], action: 'save' | 'preview') => {
  if (isGeneratingPDF) return;
  setIsGeneratingPDF(true);

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // En-tête
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(agencyProfile.company_name || "AMARU-HOMES", 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Département Contrôle Technique & Qualité", 14, 26);

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.line(14, 32, 60, 32);

    // Infos dossier
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Rapport de Constat : #RC-${date.replace(/ /g, '')}`, 140, 20);

    doc.setFont("helvetica", "normal");
    doc.text(`Date de visite : ${date}`, 140, 26);
    doc.text(`Phase : ${selectedProjet?.etape_actuelle || "N/A"}`, 140, 32);

    // Destinataire
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATAIRE :", 14, 55);

    doc.setFont("helvetica", "normal");
    doc.text(`${selectedProjet?.client_prenom} ${selectedProjet?.client_nom}`, 14, 60);
    doc.text(`Projet : ${selectedProjet?.nom_villa}`, 14, 65);

    // Expert
    const expertNom =
      agencyProfile?.prenom && agencyProfile?.nom
        ? `${agencyProfile.prenom} ${agencyProfile.nom}`
        : "Gaëtan Mukeba";

    doc.setFont("helvetica", "bold");
    doc.text("EXPERT RÉFÉRENT :", 110, 55);

    doc.setFont("helvetica", "normal");
    doc.text(expertNom, 110, 60);

    // Construction du body avec texte sécurisé
    const bodyData = dailyConstats.map((c, i) => {

      const note =
        c.note_expert ||
        "Aucune anomalie détectée lors de l'inspection visuelle.";

      const analyse = `STATUT : CONFORME\n\n${note}`;

      // Découpage sécurisé du texte pour éviter débordement
      const analyseLines = doc.splitTextToSize(analyse, 115);

      return [
        `Prise de vue #${i + 1}\n\nGPS : ${c.latitude || 'N/A'}\n${c.longitude || 'N/A'}`,
        analyseLines
      ];
    });

    autoTable(doc, {
      startY: 75,

      head: [['RÉFÉRENCE PHOTO', 'ANALYSE TECHNIQUE & OBSERVATIONS']],

      body: bodyData,

      theme: 'striped',

      headStyles: {
        fillColor: [15, 23, 42],
        fontSize: 9
      },

      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 115 }
      },

      styles: {
        fontSize: 7,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'top'
      },

      margin: { left: 14, right: 14 }
    });

    // Annexe photo
    doc.addPage();

    doc.setFont("helvetica", "bold");
    doc.text("ANNEXE PHOTOGRAPHIQUE ET GÉOLOCALISATION", 14, 20);

    let yPos = 30;

    for (let i = 0; i < dailyConstats.length; i++) {

      const c = dailyConstats[i];

      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      try {
        doc.addImage(c.url_image, 'JPEG', 14, yPos, 120, 75);
      } catch (e) {
        doc.text("(Image non disponible)", 14, yPos + 20);
      }

      doc.setFontSize(8);

      const text = `Illustration #${i + 1} - Capturée le ${new Date(c.created_at).toLocaleString()}`;

      const lines = doc.splitTextToSize(text, 160);

      doc.text(lines, 14, yPos + 82);

      yPos += 95;
    }

    // Certification
    const finalY = doc.internal.pageSize.getHeight() - 40;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, finalY, pageWidth - 14, finalY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");

    doc.text("CERTIFICATION :", 14, finalY + 10);

    const certifText =
      `Je soussigné, ${expertNom}, certifie que les informations, relevés GPS et photographies contenus dans ce rapport reflètent fidèlement l'état d'avancement réel du chantier à la date mentionnée. Document édité par le système Amaru Admin.`;

    const certifLines = doc.splitTextToSize(certifText, 180);

    doc.text(certifLines, 14, finalY + 15);

    if (action === 'save') {
      doc.save(`Rapport_Technique_${date}.pdf`);
    } else {
      window.open(doc.output('bloburl'), '_blank');
    }

  } catch (e) {

    console.error(e);
    alert("Erreur lors de la génération du PDF");

  } finally {

    setIsGeneratingPDF(false);

  }
};

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <div className="absolute inset-0 blur-2xl bg-emerald-500/20 animate-pulse"></div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-8 animate-pulse">Initialisation du Terminal Admin</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans text-left overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* --- SIDEBAR DE NAVIGATION --- */}
      <div className="w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col backdrop-blur-3xl z-40">
        
        {/* Logo & Header Sidebar */}
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight">
                {agencyProfile.company_name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black uppercase text-emerald-500/80 tracking-widest">Admin Control</span>
              </div>
            </div>
            <button 
              onClick={() => activeTab === 'clients' ? setShowModal(true) : setShowStaffModal(true)} 
              className="group relative p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all duration-500 shadow-2xl shadow-emerald-500/10"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          {/* Sélecteur de Tab Principal */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 relative">
            <button 
              onClick={() => setActiveTab('clients')} 
              className={`relative z-10 flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'clients' ? 'text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <LayoutDashboard size={14} /> Dossiers
            </button>
            <button 
              onClick={() => setActiveTab('staff')} 
              className={`relative z-10 flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'staff' ? 'text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <UserPlus size={14} /> Équipe
            </button>
            {/* Indicateur Animé */}
            <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-emerald-500 rounded-xl transition-all duration-500 ease-out ${activeTab === 'staff' ? 'translate-x-[100%]' : 'translate-x-0'}`}></div>
          </div>

          {/* Recherche */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="RECHERCHER..." 
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl text-[10px] font-black border border-white/5 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-slate-600 tracking-widest"
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Liste défilante des éléments */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
          {activeTab === 'clients' ? (
            projets
              .filter(p => `${p.client_prenom} ${p.client_nom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => setSelectedProjet(p)} 
                  className={`w-full text-left p-5 rounded-[1.5rem] border transition-all duration-500 group relative overflow-hidden ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-[11px] text-white uppercase tracking-tighter leading-none">{p.client_prenom} {p.client_nom}</p>
                    {selectedProjet?.id === p.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow"></div>}
                  </div>
                  <p className="text-[9px] uppercase font-black text-emerald-500 flex items-center gap-2 tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                    <MapPin size={10} className="shrink-0" /> {p.nom_villa}
                  </p>
                  <ChevronRight size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/20 transition-all duration-500 ${selectedProjet?.id === p.id ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} />
                </button>
              ))
          ) : (
            staffList
              .filter(s => `${s.prenom} ${s.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(s => (
                <div key={s.id} className="p-5 rounded-[1.5rem] border border-white/5 bg-white/5 flex flex-col gap-4 group hover:bg-white/10 transition-all duration-500">
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <p className="font-black text-[11px] text-white uppercase tracking-tighter">{s.prenom} {s.nom}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${s.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500' : s.role === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {s.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => copyToClipboard(s.pin_code, s.id)}
                        className={`p-2 rounded-xl transition-all duration-300 ${copySuccess === s.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400 hover:text-emerald-500'}`}
                        title="Copier le PIN"
                      >
                        {copySuccess === s.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(s.id, s.email)}
                        className="p-2 bg-white/5 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        title="Supprimer ce collaborateur"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <p className="text-[9px] font-mono text-slate-500 uppercase">Code de sécurité</p>
                    <p className="text-[11px] font-black text-emerald-500 tracking-[0.2em]">{s.pin_code || '------'}</p>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/5 bg-black/20 space-y-2">
            <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest group">
              <Home size={16} className="group-hover:scale-110 transition-transform" /> Site Public
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest group">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Déconnexion
            </button>
        </div>
      </div>

      {/* --- ZONE D'AFFICHAGE PRINCIPALE --- */}
      <div className="flex-1 p-8 lg:p-12 xl:p-16 overflow-y-auto relative">
        
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* HEADER PROJET DYNAMIQUE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/10 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase border border-emerald-500/20 tracking-widest shadow-lg shadow-emerald-500/5">
                          Dossier de construction actif
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">REF: {selectedProjet.id.slice(0,8)}</span>
                    </div>
                    <h2 className="text-6xl xl:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85] animate-in slide-in-from-left duration-700">
                      {editFields.nom_villa}
                    </h2>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <UserCheck size={14} className="text-slate-400" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">
                          Propriétaire : <span className="text-white uppercase tracking-tight">{editFields.client_prenom} {editFields.client_nom}</span>
                        </p>
                      </div>
                      <div className="h-4 w-px bg-white/10"></div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{editFields.etape_actuelle}</p>
                      </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-5 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 border border-white/5 transition-all">
                      <Printer size={18}/> Imprimer
                    </button>
                    <button 
                      onClick={handleUpdateDossier} 
                      disabled={updating} 
                      className="group flex items-center gap-3 px-10 py-5 bg-emerald-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-emerald-500/20"
                    >
                      {updating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} className="group-hover:scale-110 transition-transform" />} 
                      Enregistrer le dossier
                    </button>
                </div>
            </div>

            {/* BARRE DE NAVIGATION INTERNE (ONGLETS) */}
            <div className="flex gap-12 border-b border-white/5 relative">
                {[ 
                  {id: 'infos', label: 'Client & Budget', icon: UserCheck}, 
                  {id: 'suivi', label: 'État du Chantier', icon: MapPin}, 
                  {id: 'docs', label: 'Coffre-fort (Docs)', icon: FileText}
                ].map((t) => (
                    <button 
                      key={t.id} 
                      onClick={() => setProjectTab(t.id as any)} 
                      className={`relative pb-6 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-500 ${projectTab === t.id ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <t.icon size={16} className={projectTab === t.id ? 'animate-pulse' : ''} /> 
                        {t.label}
                        {projectTab === t.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-500"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* CONTENU ONGLET 1 : INFORMATIONS CLIENTS COMPLÈTES */}
            {projectTab === 'infos' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="lg:col-span-8 space-y-10">
                        {/* Section Identité & Contact */}
                        <section className="bg-white/5 p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all duration-500 group">
                            <h3 className="text-xs font-black uppercase text-white mb-8 flex items-center gap-4 tracking-widest">
                              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Info size={16} /></div>
                              Coordonnées du propriétaire
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Prénom</label>
                                    <input 
                                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                      value={editFields.client_prenom || ""} 
                                      onChange={e => setEditFields({...editFields, client_prenom: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Nom</label>
                                    <input 
                                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                      value={editFields.client_nom || ""} 
                                      onChange={e => setEditFields({...editFields, client_nom: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Email</label>
                                  <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                    <input 
                                      className="w-full bg-black/40 border border-white/10 p-5 pl-12 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                      value={editFields.email_client || ""} 
                                      onChange={e => setEditFields({...editFields, email_client: e.target.value})} 
                                    />
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Téléphone</label>
                                  <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                    <input 
                                      className="w-full bg-black/40 border border-white/10 p-5 pl-12 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                      value={editFields.telephone || ""} 
                                      onChange={e => setEditFields({...editFields, telephone: e.target.value})} 
                                    />
                                  </div>
                                </div>
                            </div>
                        </section>

                        {/* Section Adresse complète */}
                        <section className="bg-white/5 p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all duration-500 group">
                            <h3 className="text-xs font-black uppercase text-white mb-8 flex items-center gap-4 tracking-widest">
                              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><MapPin size={16} /></div>
                              Localisation du bien
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Rue / Adresse</label>
                                    <input 
                                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                      value={editFields.rue || ""} 
                                      onChange={e => setEditFields({...editFields, rue: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Ville</label>
                                    <input 
                                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                      value={editFields.ville || ""} 
                                      onChange={e => setEditFields({...editFields, ville: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Code Postal</label>
                                    <div className="relative">
                                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                      <input 
                                        className="w-full bg-black/40 border border-white/10 p-5 pl-12 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                        value={editFields.code_postal || ""} 
                                        onChange={e => setEditFields({...editFields, code_postal: e.target.value})} 
                                      />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Pays</label>
                                    <div className="relative">
                                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                      <input 
                                        className="w-full bg-black/40 border border-white/10 p-5 pl-12 rounded-2xl text-[11px] font-bold text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all" 
                                        value={editFields.pays || ""} 
                                        onChange={e => setEditFields({...editFields, pays: e.target.value})} 
                                      />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar de droite : Cashback & PIN */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Carte Cashback */}
                        <div className="relative bg-emerald-500 p-10 rounded-[3rem] text-black overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <Euro size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="relative z-10">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Récompense Cashback</p>
                              <div className="flex items-baseline gap-2 mt-4">
                                <input 
                                  type="number" 
                                  className="bg-transparent text-5xl font-black w-full outline-none border-b-4 border-black/10 focus:border-black/30 transition-all leading-none" 
                                  value={editFields.montant_cashback || 0} 
                                  onChange={e => setEditFields({...editFields, montant_cashback: parseFloat(e.target.value)})} 
                                />
                                <span className="text-2xl font-black italic">€</span>
                              </div>
                              <p className="text-[9px] font-bold uppercase mt-6 bg-black/10 inline-block px-3 py-1 rounded-full italic tracking-widest">Somme versée après clôture</p>
                            </div>
                        </div>

                        {/* Carte PIN Client */}
                        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center text-center relative group overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-700"></div>
                            <ShieldCheck size={40} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Code PIN de connexion</p>
                            <p className="text-4xl font-black text-white tracking-[0.4em] mt-4 ml-4 leading-none italic select-all">
                              {editFields.pin_code}
                            </p>
                            <button 
                              onClick={() => copyToClipboard(editFields.pin_code, 'pin')}
                              className="mt-6 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all"
                            >
                              <Copy size={12} /> Copier le code
                            </button>
                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-8 flex items-center gap-2">
                              <Lock size={10} /> Chiffrement AES-256 Actif
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENU ONGLET 2 : SUIVI DU CHANTIER */}
            {projectTab === 'suivi' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="lg:col-span-8 space-y-10">
                        {/* Section Progression et Commentaires */}
                        <section className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-4">
                                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><LayoutDashboard size={16} /></div>
                                  Progression Temps Réel
                                </h3>
                                <div className="text-right">
                                  <span className="text-[20px] font-black text-emerald-500 leading-none">
                                    {Math.round((PHASES_CHANTIER.indexOf(editFields.etape_actuelle) / (PHASES_CHANTIER.length - 1)) * 100)}%
                                  </span>
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Avancement Global</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                              <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest ml-1">Étape actuelle sélectionnée</label>
                              <div className="relative">
                                <select 
                                  className="w-full bg-black/60 border border-white/10 p-6 rounded-[1.5rem] text-sm text-emerald-500 font-black outline-none focus:border-emerald-500/50 appearance-none transition-all cursor-pointer shadow-xl" 
                                  value={editFields.etape_actuelle} 
                                  onChange={e => setEditFields({...editFields, etape_actuelle: e.target.value})}
                                >
                                    {PHASES_CHANTIER.map(phase => (
                                      <option key={phase} value={phase} className="bg-[#0F172A] text-white py-4 font-sans">{phase}</option>
                                    ))}
                                </select>
                                <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 rotate-90 pointer-events-none" />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between ml-1">
                                <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Commentaires hebdomadaires</label>
                                <span className="text-[8px] text-slate-600 font-black uppercase">Visible par le client</span>
                              </div>
                              <textarea 
                                rows={6} 
                                className="w-full bg-black/40 border border-white/10 p-8 rounded-[2rem] text-[11px] font-bold text-white outline-none focus:border-emerald-500/50 focus:bg-white/5 transition-all leading-relaxed placeholder:text-slate-700" 
                                value={editFields.commentaire_etape_chantier || ""} 
                                onChange={e => setEditFields({...editFields, commentaire_etape_chantier: e.target.value})} 
                                placeholder="Détaillez ici les travaux effectués cette semaine (ex: Pose de la dalle béton terminée...)"
                              />
                            </div>
                        </section>

                        {/* Section supprimée : Illustration du projet */}

                        {/* NOUVELLE SECTION : CONSTATATIONS TECHNIQUES */}
                        {constats.length > 0 && (
                          <section className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                            <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-4">
                              <ShieldCheck size={16} className="text-emerald-500" />
                              Constats techniques ({constats.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {Object.entries(groupedConstats).map(([date, items]: [string, any]) => (
                                <button
                                  key={date}
                                  onClick={() => setSelectedConstatsDate(date)}
                                  className="text-left p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-black text-white">{date}</p>
                                    <ChevronRight size={18} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <p className="text-[10px] text-slate-400">
                                    {(items as any[]).length} photo{(items as any[]).length > 1 ? 's' : ''}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </section>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Calendrier et constructeur */}
                        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 group hover:border-orange-500/30 transition-all duration-500">
                            <Calendar size={32} className="text-orange-400 mb-6 group-hover:rotate-12 transition-transform duration-500" />
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Livraison estimée</p>
                            <input 
                              type="date" 
                              className="w-full bg-transparent text-2xl font-black text-white mt-4 outline-none border-b-2 border-white/10 pb-4 focus:border-orange-500 transition-all appearance-none" 
                              value={editFields.date_livraison_prevue || ""} 
                              onChange={e => setEditFields({...editFields, date_livraison_prevue: e.target.value})} 
                            />
                            <div className="mt-8 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                              <p className="text-[8px] font-black text-orange-500/70 uppercase leading-relaxed tracking-widest">
                                La date de livraison est mise à jour en temps réel sur l'espace client.
                              </p>
                            </div>
                        </div>

                        {/* Constructeur info */}
                        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Constructeur partenaire</p>
                          <input 
                            className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-emerald-500 transition-all" 
                            value={editFields.constructeur_info || ""} 
                            onChange={e => setEditFields({...editFields, constructeur_info: e.target.value})} 
                            placeholder="Ex: Porcelanosa / Grupo Isan"
                          />
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENU ONGLET 3 : COFFRE-FORT DOCUMENTS */}
            {projectTab === 'docs' && (
                <section className="bg-white/5 p-10 rounded-[3rem] border border-white/5 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                        <div className="space-y-2">
                          <h3 className="text-xs font-black uppercase text-white tracking-[0.3em] flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Database size={16} /></div>
                            Documents Cloud
                          </h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase ml-12 tracking-widest">Zone de stockage sécurisée client</p>
                        </div>
                        <label className="group cursor-pointer relative flex items-center gap-4 px-10 py-5 bg-white text-black rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all duration-500 shadow-xl shadow-white/5 overflow-hidden active:scale-95">
                            {uploadingDoc ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18} className="group-hover:bounce" />} 
                            {uploadingDoc ? "Traitement..." : "Uploader un fichier"}
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingDoc} />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {projectDocs.length > 0 ? (
                          projectDocs.map((doc) => (
                              <div key={doc.id} className="group relative p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex flex-col gap-6 hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                                  <div className="flex items-center justify-between">
                                      <div className="p-4 bg-white/5 rounded-2xl text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-500">
                                        <FileText size={24} />
                                      </div>
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0 transition-transform">
                                          <a href={doc.url_fichier} target="_blank" rel="noreferrer" className="p-3 bg-white/5 text-white hover:bg-emerald-500 hover:text-black rounded-xl transition-all">
                                            <ExternalLink size={16} />
                                          </a>
                                          <button 
                                            onClick={() => deleteDocument(doc.id, doc.url_fichier)} 
                                            className="p-3 bg-white/5 text-white hover:bg-rose-500 rounded-xl transition-all"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[11px] font-black text-white uppercase tracking-tight truncate pr-4" title={doc.nom_fichier}>
                                      {doc.nom_fichier}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[8px] font-black text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded tracking-widest">
                                        {doc.type || 'PDF'}
                                      </span>
                                      <span className="text-[8px] font-bold text-slate-600">
                                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="absolute top-0 right-0 p-8">
                                    <HardDrive size={40} className="text-white/5 rotate-12 group-hover:rotate-0 group-hover:text-emerald-500/10 transition-all duration-700" />
                                  </div>
                              </div>
                          ))
                        ) : (
                          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-4 opacity-30">
                            <FileText size={48} className="text-slate-600" />
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.5em]">Aucun document archivé</p>
                          </div>
                        )}
                    </div>
                </section>
            )}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
            <div className="relative mb-12">
              <Zap size={80} className="text-emerald-500/10 animate-pulse" />
              <div className="absolute inset-0 blur-3xl bg-emerald-500/5 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-black uppercase tracking-[0.8em] text-white/5 italic leading-none">AMARU HOMES</p>
            <p className="text-[9px] font-black text-slate-700 uppercase mt-8 tracking-[0.5em]">Dashboard Terminal v2.4.0</p>
            <div className="mt-12 flex gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL : CRÉATION DE PROJET (avec champs adresse) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#0F172A] w-full max-w-2xl rounded-[3.5rem] border border-white/10 p-12 text-left relative shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-10 right-10 text-slate-500 hover:text-white hover:rotate-90 transition-all duration-500"
            >
              <X size={28} />
            </button>
            
            <div className="mb-10 space-y-2">
              <h2 className="text-4xl font-black uppercase text-white italic tracking-tighter">Initialiser Projet</h2>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Enregistrement d'un nouveau chantier Amaru</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setUpdating(true);
              
              // Préparer l'objet avec les données du formulaire
              const baseProjectData = {
                ...newProject,
                company_name: agencyProfile.company_name,
                pin_code: Math.floor(100000 + Math.random() * 900000).toString(),
                etape_actuelle: PHASES_CHANTIER[0]
              };
              
              // Si la date de livraison est vide, on l'exclut pour éviter l'erreur SQL
              const projectData = baseProjectData.date_livraison_prevue === ""
                ? (({ date_livraison_prevue, ...rest }) => rest)(baseProjectData)
                : baseProjectData;
              
              const { error } = await supabase.from("suivi_chantier").insert([projectData]);
              
              if (!error) { 
                setShowModal(false); 
                setUpdating(false);
                loadData(); 
              } else {
                alert(error.message);
                setUpdating(false);
              }
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom *</label>
                  <input required placeholder="John" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom *</label>
                  <input required placeholder="Doe" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de la Villa *</label>
                <input required placeholder="VILLA AMARU LUXE" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all uppercase italic font-black" onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email client *</label>
                  <input required type="email" placeholder="client@exemple.com" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                  <input placeholder="+33 6 00 00 00 00" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, telephone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Rue / Adresse</label>
                <input placeholder="123 Avenue de la Plage" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, rue: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Ville</label>
                  <input placeholder="Marbella" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, ville: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Code postal</label>
                  <input placeholder="29600" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, code_postal: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Pays</label>
                  <input placeholder="Espagne" value={newProject.pays} className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500 transition-all" onChange={e => setNewProject({...newProject, pays: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={updating} className="w-full bg-emerald-500 text-black py-7 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 mt-6 flex items-center justify-center gap-4">
                {updating ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={18} />}
                Générer le dossier complet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL : AJOUT STAFF (AVEC RÔLE) --- */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#0F172A] w-full max-w-xl rounded-[3.5rem] border border-white/10 p-12 text-left relative shadow-2xl animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowStaffModal(false)} 
              className="absolute top-10 right-10 text-slate-500 hover:text-white hover:rotate-90 transition-all duration-500"
            >
              <X size={28} />
            </button>
            
            <div className="mb-10 space-y-2">
              <h2 className="text-3xl font-black uppercase text-white italic tracking-tighter leading-none">Ajouter un collaborateur</h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Enrôlement dans l'équipe {agencyProfile.company_name}</p>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Prénom" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-[11px] font-bold text-white outline-none focus:border-blue-500 transition-all" onChange={e => setNewStaff({...newStaff, prenom: e.target.value})} />
                <input required placeholder="Nom" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-[11px] font-bold text-white outline-none focus:border-blue-500 transition-all" onChange={e => setNewStaff({...newStaff, nom: e.target.value})} />
              </div>
              <input required type="email" placeholder="Email professionnel" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-[11px] font-bold text-white outline-none focus:border-blue-500 transition-all" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
              
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Attribution du rôle & Privilèges</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-[11px] font-black text-blue-500 outline-none focus:border-blue-500/50 appearance-none transition-all cursor-pointer shadow-xl uppercase tracking-widest" 
                    value={newStaff.role} 
                    onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                  >
                      <option value="agent" className="bg-[#0F172A]">Agent (Accès Limité)</option>
                      <option value="admin" className="bg-[#0F172A]">Administrateur Agence</option>
                      <option value="super_admin" className="bg-[#0F172A]">Super Administrateur</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl text-center space-y-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Zap size={12} /> Sécurité Automatique
                </p>
                <p className="text-[8px] font-bold text-slate-500 uppercase leading-relaxed tracking-tighter">
                  Un code PIN unique à 6 chiffres sera généré. Le collaborateur pourra se connecter immédiatement après validation.
                </p>
              </div>

              <button type="submit" disabled={updating} className="w-full bg-blue-500 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 mt-4 flex items-center justify-center gap-4">
                {updating ? <Loader2 className="animate-spin"/> : <UserPlus size={18} />}
                Confirmer l'invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE DE VISUALISATION DES CONSTATS --- */}
      {selectedConstatsDate && selectedProjet && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Rapport d'inspection</span>
                <h3 className="text-3xl font-black text-white">{selectedConstatsDate}</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic">Phase : {selectedProjet?.etape_actuelle}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => generateConstatsPDF(selectedConstatsDate, groupedConstats[selectedConstatsDate], 'preview')}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all text-xs font-black uppercase shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isGeneratingPDF ? <Loader2 className="animate-spin" size={16}/> : <Printer size={16}/>}
                  Générer Rapport
                </button>
                <button onClick={() => setSelectedConstatsDate(null)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all">
                  <X size={24}/>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={24}/>
                 <p className="text-xs text-slate-300 leading-relaxed italic">
                   "Je certifie que les informations et les photographies présentées ci-dessous ont été relevées sur site par le département technique Amaru-Homes. Les coordonnées GPS garantissent l'authenticité de l'inspection."
                 </p>
              </div>

              {groupedConstats[selectedConstatsDate]?.map((c: any, i: number) => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <a href={c.url_image} target="_blank" rel="noopener noreferrer">
                      <img src={c.url_image} className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-300" />
                    </a>
                  </div>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                       <MapPin size={14} className="text-emerald-500"/> Localisation : {c.latitude}, {c.longitude}
                    </div>
                    <h4 className="text-sm font-black text-white uppercase">Observation technique #{i+1}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500 pl-4 italic">
                      "{c.note_expert || "Constat visuel conforme aux plans d'exécution et aux normes techniques en vigueur."}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Styles Custom pour Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
        .shadow-glow {
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}