"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Save, Trash2, Loader2, Search, MapPin, 
  LogOut, Activity, Zap, Briefcase, UserCheck, CheckCircle2,
  Phone, Mail, Calendar, Home, HardHat, Wallet, Clock
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
  
  // Champs modifiables
  const [editComment, setEditComment] = useState("");
  const [editStep, setEditStep] = useState("");
  const [editCashback, setEditCashback] = useState("");
  const [editLivraison, setEditLivraison] = useState("");

  const [agencyProfile, setAgencyProfile] = useState<any>({ company_name: "Amaru-Homes" });

  const loadData = async () => {
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
  };

  useEffect(() => { loadData(); }, []);
  
  useEffect(() => { 
    if (selectedProjet) {
      setEditComment(selectedProjet.commentaires_etape || "");
      setEditStep(selectedProjet.etape_actuelle || PHASES_CHANTIER[0]);
      setEditCashback(selectedProjet.montant_cashback || "");
      setEditLivraison(selectedProjet.date_livraison_prevue || "");
    } 
  }, [selectedProjet]);

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
      alert("Dossier mis à jour avec succès !");
      loadData();
    } else {
      alert("Erreur: " + error.message);
    }
    setUpdating(false);
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
      <div className="w-full md:w-80 bg-[#0F172A]/50 border-r border-white/5 h-screen sticky top-0 flex flex-col">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl"><Briefcase className="text-black" size={20} /></div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter">{agencyProfile.company_name}</h1>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Dossiers</button>
            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Staff</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-xs outline-none border border-white/5 focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {activeTab === 'clients' ? filteredProjets.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjet(p)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjet?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}>
              <p className="font-bold text-sm text-white">{p.client_prenom} {p.client_nom}</p>
              <p className="text-[10px] uppercase font-bold text-emerald-500">{p.nom_villa}</p>
            </button>
          )) : staffList.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center">
              <div><p className="font-bold text-sm text-white">{s.nom}</p><p className="text-[10px] text-emerald-500 font-mono">PIN: {s.pin_code}</p></div>
              <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('staff_prestataires').delete().eq('id', s.id); loadData(); }}} className="text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {selectedProjet ? (
          <div className="max-w-6xl mx-auto space-y-8 text-left">
            {/* Header Projet */}
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{selectedProjet.nom_villa}</h2>
                <div className="flex gap-3 mt-3">
                  <span className="bg-emerald-500 text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">PIN: {selectedProjet.pin_code}</span>
                  <span className="bg-white/10 text-slate-300 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">{selectedProjet.ville}</span>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <button onClick={handleUpdateProjet} disabled={updating} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20">
                    {updating ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Sauvegarder
                 </button>
                 <button onClick={() => { supabase.auth.signOut(); window.location.href='/login'; }} className="p-4 bg-red-500/10 text-red-500 rounded-xl"><LogOut size={18}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Infos Client & Projet */}
              <div className="space-y-6">
                <section className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><UserCheck size={14}/> Client</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm"><Mail size={14} className="text-slate-500"/> {selectedProjet.email_client}</div>
                    <div className="flex items-center gap-3 text-sm"><Phone size={14} className="text-slate-500"/> {selectedProjet.telephone}</div>
                    <div className="flex items-center gap-3 text-sm"><Calendar size={14} className="text-slate-500"/> Né(e) le {selectedProjet.date_naissance}</div>
                    <div className="flex items-start gap-3 text-sm pt-2 border-t border-white/5"><MapPin size={14} className="text-slate-500 mt-1"/> <div>{selectedProjet.rue}<br/>{selectedProjet.code_postal} {selectedProjet.ville}</div></div>
                  </div>
                </section>

                <section className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2"><Home size={14}/> Détails Projet</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1"><HardHat size={10}/> Constructeur</label>
                      <p className="text-sm font-bold">{selectedProjet.constructeur_info || "Non spécifié"}</p>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1"><Wallet size={10}/> Cashback</label>
                      <input type="text" value={editCashback} onChange={(e) => setEditCashback(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-emerald-500" placeholder="Ex: 5000 €" />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1"><Clock size={10}/> Livraison Prévue</label>
                      <input type="text" value={editLivraison} onChange={(e) => setEditLivraison(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-emerald-500" placeholder="Ex: Fin 2026" />
                    </div>
                  </div>
                </section>
              </div>

              {/* Suivi Chantier */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-6 tracking-widest flex items-center gap-2"><Activity size={14}/> Rapport d'avancement</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-500 uppercase font-bold">Étape Actuelle</label>
                      <select value={editStep} onChange={(e) => setEditStep(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 text-slate-300">
                        {PHASES_CHANTIER.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-[9px] text-slate-500 uppercase font-bold block">Dernière mise à jour</label>
                      <p className="text-xs font-mono text-slate-400">{selectedProjet.updated_at ? new Date(selectedProjet.updated_at).toLocaleString() : 'Jamais'}</p>
                    </div>
                  </div>

                  <textarea 
                    value={editComment} onChange={(e) => setEditComment(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-lg text-slate-200 min-h-[300px] outline-none focus:border-emerald-500 italic leading-relaxed"
                    placeholder="Note client : Travaux en cours..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20"><Zap size={100} className="text-emerald-500 mb-4" /><p className="text-2xl font-black uppercase tracking-[0.5em]">{agencyProfile.company_name}</p></div>
        )}
      </div>
    </div>
  );
}