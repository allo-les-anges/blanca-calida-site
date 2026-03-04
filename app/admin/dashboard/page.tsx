"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Trash2, Loader2, Search, MapPin, Plus, X,
  LogOut, Activity, Zap, Briefcase, UserCheck,
  Phone, Mail, Calendar, Home, HardHat, Wallet, Clock, FileText, 
  Image as ImageIcon, ExternalLink, File, Video, Eye, Edit3
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

  // Documents et rapports
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [projectReports, setProjectReports] = useState<any[]>([]);

  // États pour l'édition des infos client et projet
  const [editClient, setEditClient] = useState({
    prenom: "", nom: "", email: "", tel: "", rue: "", ville: "", cp: ""
  });
  const [editComment, setEditComment] = useState("");
  const [editStep, setEditStep] = useState("");

  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profiles } = await supabase.from('profiles').select('*').eq('email', session.user.email);
      const profile = profiles?.[0];
      setAgencyProfile(profile || { company_name: "Amaru-Homes" });

      const { data: projData } = await supabase
        .from('suivi_chantier')
        .select('*')
        .order('created_at', { ascending: false });

      if (projData) setProjets(projData);

      const { data: stfData } = await supabase.from('staff_prestataires').select('*').order('created_at', { ascending: false });
      if (stfData) setStaffList(stfData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const loadProjectExtras = async (projectId: string) => {
    // Récupération de l'intégralité des documents
    const { data: docs } = await supabase
      .from('documents_projets')
      .select('*')
      .eq('projet_id', projectId)
      .order('created_at', { ascending: false });
    setProjectDocs(docs || []);

    const { data: reports } = await supabase
      .from('chantier_updates')
      .select('*')
      .eq('projet_id', projectId)
      .order('created_at', { ascending: false });
    setProjectReports(reports || []);
  };

  useEffect(() => { loadData(); }, [loadData]);
  
  useEffect(() => { 
    if (selectedProjet) {
      setEditClient({
        prenom: selectedProjet.client_prenom || "",
        nom: selectedProjet.client_nom || "",
        email: selectedProjet.email_client || "",
        tel: selectedProjet.telephone || "",
        rue: selectedProjet.rue || "",
        ville: selectedProjet.ville || "",
        cp: selectedProjet.code_postal || ""
      });
      setEditComment(selectedProjet.commentaires_etape || "");
      setEditStep(selectedProjet.etape_actuelle || PHASES_CHANTIER[0]);
      loadProjectExtras(selectedProjet.id);
    } 
  }, [selectedProjet]);

  const handleUpdateFullDossier = async () => {
    if (!selectedProjet) return;
    setUpdating(true);
    try {
      // Mise à jour des infos client ET du suivi
      const { error } = await supabase
        .from('suivi_chantier')
        .update({ 
          client_prenom: editClient.prenom,
          client_nom: editClient.nom,
          email_client: editClient.email,
          telephone: editClient.tel,
          rue: editClient.rue,
          ville: editClient.ville,
          code_postal: editClient.cp,
          commentaires_etape: editComment, 
          etape_actuelle: editStep,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProjet.id);

      // Log dans l'historique
      await supabase.from('chantier_updates').insert([{
          projet_id: selectedProjet.id,
          etape_actuelle: editStep,
          commentaires_etape: editComment
      }]);

      if (!error) {
        alert("Dossier client et documents mis à jour !");
        loadData();
      }
    } catch (err) { console.error(err); }
    setUpdating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjet) return;

    setUpdating(true);
    try {
      const fileName = `${selectedProjet.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents-clients').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents-clients').getPublicUrl(fileName);

      await supabase.from('documents_projets').insert([{
        projet_id: selectedProjet.id,
        nom_fichier: file.name,
        url: publicUrl,
        type: file.type
      }]);

      loadProjectExtras(selectedProjet.id);
    } catch (error: any) { alert(error.message); }
    setUpdating(false);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    if (type.includes('image')) return <ImageIcon size={20} className="text-orange-400" />;
    return <File size={20} className="text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xs font-black uppercase tracking-widest text-emerald-500">{agencyProfile.company_name}</h1>
            <button onClick={() => setShowModal(true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"><Plus size={18}/></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {projets.filter(p => `${p.client_prenom} ${p.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}>
              <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
              <p className="text-[10px] uppercase font-black text-slate-500">{p.nom_villa}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Header avec action de sauvegarde globale */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{selectedProjet.nom_villa}</h2>
                    <p className="text-emerald-500 font-mono text-sm mt-2">Dossier #{selectedProjet.pin_code}</p>
                </div>
                <button onClick={handleUpdateFullDossier} disabled={updating} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase hover:scale-105 transition-all shadow-lg">
                    {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Enregistrer les modifications
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* COLONNE GAUCHE : INFOS CLIENT EDITABLES */}
              <div className="space-y-6">
                <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2 mb-4"><UserCheck size={14}/> Fiche Client</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <input value={editClient.prenom} onChange={e => setEditClient({...editClient, prenom: e.target.value})} placeholder="Prénom" className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                        <input value={editClient.nom} onChange={e => setEditClient({...editClient, nom: e.target.value})} placeholder="Nom" className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-600" size={14}/>
                        <input value={editClient.email} onChange={e => setEditClient({...editClient, email: e.target.value})} placeholder="Email" className="w-full bg-black/40 border border-white/5 p-3 pl-10 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-slate-600" size={14}/>
                        <input value={editClient.tel} onChange={e => setEditClient({...editClient, tel: e.target.value})} placeholder="Téléphone" className="w-full bg-black/40 border border-white/5 p-3 pl-10 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-2">
                        <p className="text-[9px] uppercase font-bold text-slate-500 ml-1">Adresse de livraison</p>
                        <input value={editClient.rue} onChange={e => setEditClient({...editClient, rue: e.target.value})} placeholder="Rue et numéro" className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                        <div className="grid grid-cols-3 gap-2">
                            <input value={editClient.cp} onChange={e => setEditClient({...editClient, cp: e.target.value})} placeholder="CP" className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                            <input value={editClient.ville} onChange={e => setEditClient({...editClient, ville: e.target.value})} placeholder="Ville" className="col-span-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"/>
                        </div>
                    </div>
                  </div>
                </section>

                {/* GESTION DES DOCUMENTS (CORRIGÉE) */}
                <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em] flex items-center gap-2"><FileText size={14}/> Documents ({projectDocs.length})</h3>
                    <label className="cursor-pointer bg-orange-400/10 text-orange-400 p-2 rounded-lg hover:bg-orange-400 hover:text-black transition-all">
                      <Plus size={14}/><input type="file" className="hidden" onChange={handleFileUpload}/>
                    </label>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {projectDocs.map((doc) => (
                      <div key={doc.id} className="group relative bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 outline-none">
                            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-emerald-500/10">{getFileIcon(doc.type || "")}</div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">{doc.nom_fichier}</p>
                                <p className="text-[9px] text-slate-500 uppercase">{new Date(doc.created_at).toLocaleDateString()}</p>
                            </div>
                        </a>
                        <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('documents_projets').delete().eq('id', doc.id); loadProjectExtras(selectedProjet.id); }}} 
                                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* COLONNE DROITE : SUIVI CHANTIER */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0F172A] p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2"><Activity size={14}/> Journal de bord</h3>
                    <select value={editStep} onChange={e => setEditStep(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-emerald-500 outline-none focus:border-emerald-500">
                        {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <textarea 
                    value={editComment} onChange={e => setEditComment(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-lg text-slate-200 min-h-[500px] outline-none focus:border-emerald-500 italic leading-relaxed"
                    placeholder="Écrivez ici le compte-rendu pour le client..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Zap size={100} className="text-emerald-500 mb-4 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-[0.5em]">Sélectionnez un dossier</p>
          </div>
        )}
      </div>
    </div>
  );
}