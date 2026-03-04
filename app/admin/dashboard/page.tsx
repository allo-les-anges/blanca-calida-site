"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Plus, Users, FileText, LayoutDashboard, 
  LogOut, Search, HardHat, Euro, MapPin, 
  ChevronRight, Loader2, Trash2, ShieldCheck, Globe, X
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- ÉTATS ---
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyInfo, setAgencyInfo] = useState<{name: string, pack: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Formulaire synchronisé avec la table suivi_chantier
  const [newProject, setNewProject] = useState({
    client_nom: "",
    client_prenom: "",
    email_client: "",
    telephone: "",
    rue: "",
    code_postal: "",
    ville: "",
    pays: "",
    nom_villa: "",
    constructeur_info: "",
    montant_cashback: 0,
    date_livraison_prevue: ""
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    // 1. Récupérer le nom de l'agence et le pack
    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_name, pack")
      .eq("id", session.user.id)
      .single();
    
    if (profile) setAgencyInfo({ name: profile.agency_name, pack: profile.pack });

    // 2. Récupérer les projets
    // Note : On suppose que vos projets sont liés via une colonne admin_id ou que l'admin voit tout son périmètre
    const { data: projects, error } = await supabase
      .from("suivi_chantier")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProjets(projects || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- LOGIQUE DE RECHERCHE ---
  const filteredProjets = useMemo(() => {
    return projets.filter(p => 
      `${p.client_nom} ${p.client_prenom} ${p.nom_villa}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projets, searchTerm]);

  // --- CRÉATION DE CLIENT ---
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase.from("suivi_chantier").insert([{
      ...newProject,
      pin_code: generatedPin,
      etape_actuelle: 1, // Étape initiale
      // admin_id: session.user.id // Décommentez si vous avez cette colonne pour filtrer par agence
    }]);

    if (!error) {
      setShowModal(false);
      setNewProject({
        client_nom: "", client_prenom: "", email_client: "", telephone: "",
        rue: "", code_postal: "", ville: "", pays: "",
        nom_villa: "", constructeur_info: "", montant_cashback: 0, date_livraison_prevue: ""
      });
      fetchData();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest italic">Initialisation du Terminal Admin...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6 text-left">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 text-black">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                {agencyInfo?.name || "Agence Partenaire"}
              </h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-2">
                Licence {agencyInfo?.pack || "Active"} • Gestion Immobilière
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10"
            >
              <Plus size={18} /> Nouveau Client
            </button>
            <button onClick={handleLogout} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Users size={24}/></div>
            <div><p className="text-[10px] uppercase font-black text-slate-500">Total Clients</p><p className="text-2xl font-bold">{projets.length}</p></div>
          </div>
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Euro size={24}/></div>
            <div><p className="text-[10px] uppercase font-black text-slate-500">Cashback Engagé</p><p className="text-2xl font-bold">{projets.reduce((acc, p) => acc + (p.montant_cashback || 0), 0)} €</p></div>
          </div>
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500"><HardHat size={24}/></div>
            <div><p className="text-[10px] uppercase font-black text-slate-500">Chantiers Actifs</p><p className="text-2xl font-bold">{projets.filter(p => p.etape_actuelle < 5).length}</p></div>
          </div>
        </div>

        {/* LISTE */}
        <div className="bg-[#0F172A] rounded-[3rem] border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
            <h3 className="font-black uppercase text-[10px] tracking-widest flex items-center gap-3">
              <FileText className="text-emerald-500" size={16} /> Portefeuilles Clients
            </h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                placeholder="Rechercher un dossier..." 
                className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs focus:border-emerald-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                  <th className="p-6 font-black">Identité & Villa</th>
                  <th className="p-6 font-black">Constructeur</th>
                  <th className="p-6 font-black">Localisation</th>
                  <th className="p-6 font-black">Cashback</th>
                  <th className="p-6 font-black text-center">PIN Code</th>
                  <th className="p-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjets.map((p) => (
                  <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-white text-sm">{p.client_prenom} {p.client_nom}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">{p.nom_villa}</p>
                    </td>
                    <td className="p-6 font-mono text-[10px] text-slate-400">
                      {p.constructeur_info || "N/A"}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-400 text-xs lowercase italic">
                        <MapPin size={12} className="text-slate-600" /> {p.ville}, {p.pays}
                      </div>
                    </td>
                    <td className="p-6 font-black text-emerald-400 text-sm">
                      {p.montant_cashback} €
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-emerald-500 tracking-wider">
                        {p.pin_code}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => router.push(`/admin/chantier/${p.id}`)}
                        className="p-3 bg-white/5 rounded-2xl group-hover:bg-emerald-500 group-hover:text-black transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProjets.length === 0 && (
              <div className="p-20 text-center text-slate-600 italic text-sm">Aucun résultat trouvé.</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CRÉATION CLIENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0F172A] z-10">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Nouveau Dossier Immobilier</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Prénom Client</label>
                <input required className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none" value={newProject.client_prenom} onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Nom Client</label>
                <input required className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none" value={newProject.client_nom} onChange={e => setNewProject({...newProject, client_nom: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Email</label>
                <input type="email" className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none" value={newProject.email_client} onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Téléphone</label>
                <input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none" value={newProject.telephone} onChange={e => setNewProject({...newProject, telephone: e.target.value})} />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="md:col-span-1"><label className="text-[9px] uppercase font-black text-slate-500">Ville</label><input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm" value={newProject.ville} onChange={e => setNewProject({...newProject, ville: e.target.value})} /></div>
                <div className="md:col-span-1"><label className="text-[9px] uppercase font-black text-slate-500">Pays</label><input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm" value={newProject.pays} onChange={e => setNewProject({...newProject, pays: e.target.value})} /></div>
                <div className="md:col-span-1"><label className="text-[9px] uppercase font-black text-slate-500">Code Postal</label><input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm" value={newProject.code_postal} onChange={e => setNewProject({...newProject, code_postal: e.target.value})} /></div>
              </div>

              <div className="md:col-span-2 space-y-1 border-t border-white/5 pt-6">
                <label className="text-[9px] uppercase font-black text-emerald-500 ml-2">Nom de la Villa / Projet</label>
                <input required className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none" value={newProject.nom_villa} onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Info Constructeur</label>
                <input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none" value={newProject.constructeur_info} onChange={e => setNewProject({...newProject, constructeur_info: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 ml-2">Montant Cashback (€)</label>
                <input type="number" className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm outline-none text-emerald-400 font-bold" value={newProject.montant_cashback} onChange={e => setNewProject({...newProject, montant_cashback: Number(e.target.value)})} />
              </div>
              
              <button type="submit" className="md:col-span-2 bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-4 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                Générer le dossier & Code PIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}