"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Plus, Users, FileText, LayoutDashboard, 
  LogOut, Search, HardHat, Euro, MapPin, 
  ChevronRight, Loader2, Trash2, ShieldCheck, Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ÉTATS DONNÉES
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyInfo, setAgencyInfo] = useState<{name: string, pack: string} | null>(null);

  // ÉTATS FORMULAIRE (Synchronisé avec vos colonnes SQL)
  const [showModal, setShowModal] = useState(false);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    // 1. Récupérer l'agence
    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_name, pack")
      .eq("id", session.user.id)
      .single();
    
    if (profile) setAgencyInfo({ name: profile.agency_name, pack: profile.pack });

    // 2. Récupérer les projets (On utilise created_by ou admin_id selon votre liaison)
    const { data: projects, error } = await supabase
      .from("suivi_chantier")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProjets(projects || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Génération PIN 6 chiffres
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Insertion avec vos noms de colonnes exacts
    const { error } = await supabase.from("suivi_chantier").insert([{
      ...newProject,
      pin_code: generatedPin,
      etape_actuelle: 1, // par défaut
      // admin_id: session?.user.id // Assurez-vous d'avoir cette colonne pour lier le projet à l'agence
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
      alert("Erreur SQL : " + error.message);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-10 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AGENCE */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-500 p-4 rounded-2xl text-black shadow-lg shadow-emerald-500/20">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white">{agencyInfo?.name || "Agence"}</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Partenaire {agencyInfo?.pack}</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all">
            + Nouveau Client
          </button>
        </header>

        {/* TABLEAU DES CLIENTS */}
        <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                <th className="p-6">Client & Villa</th>
                <th className="p-6">Constructeur</th>
                <th className="p-6">Cashback</th>
                <th className="p-6">Localisation</th>
                <th className="p-6 text-center">Code PIN</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projets.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <p className="font-bold text-white text-sm">{p.client_prenom} {p.client_nom}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">{p.nom_villa}</p>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-slate-400">{p.constructeur_info || "-"}</span>
                  </td>
                  <td className="p-6 text-emerald-400 font-black text-sm">{p.montant_cashback} €</td>
                  <td className="p-6 text-xs text-slate-400">{p.ville}, {p.pays}</td>
                  <td className="p-6 text-center">
                    <span className="bg-black px-3 py-1 rounded border border-white/10 font-mono text-emerald-500 text-xs">{p.pin_code}</span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => router.push(`/admin/chantier/${p.id}`)} className="p-2 bg-white/5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CRÉATION (AVEC VOS COLONNES SQL) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-3xl rounded-[3rem] border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-black uppercase text-white mb-8">Nouveau Dossier Immobilier</h2>
            
            <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Prénom Client" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.client_prenom} onChange={e => setNewProject({...newProject, client_prenom: e.target.value})} required />
              <input placeholder="Nom Client" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.client_nom} onChange={e => setNewProject({...newProject, client_nom: e.target.value})} required />
              <input placeholder="Email" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.email_client} onChange={e => setNewProject({...newProject, email_client: e.target.value})} />
              <input placeholder="Téléphone" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.telephone} onChange={e => setNewProject({...newProject, telephone: e.target.value})} />
              
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <input placeholder="Rue" className="md:col-span-2 bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.rue} onChange={e => setNewProject({...newProject, rue: e.target.value})} />
                <input placeholder="CP" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.code_postal} onChange={e => setNewProject({...newProject, code_postal: e.target.value})} />
                <input placeholder="Ville" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.ville} onChange={e => setNewProject({...newProject, ville: e.target.value})} />
              </div>

              <input placeholder="Nom de la Villa" className="bg-black border border-white/5 p-4 rounded-xl text-sm font-bold text-emerald-500" value={newProject.nom_villa} onChange={e => setNewProject({...newProject, nom_villa: e.target.value})} required />
              <input placeholder="Info Constructeur" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.constructeur_info} onChange={e => setNewProject({...newProject, constructeur_info: e.target.value})} />
              <input type="number" placeholder="Cashback (€)" className="bg-black border border-white/5 p-4 rounded-xl text-sm font-bold text-emerald-400" value={newProject.montant_cashback} onChange={e => setNewProject({...newProject, montant_cashback: Number(e.target.value)})} />
              <input type="date" placeholder="Livraison Prévue" className="bg-black border border-white/5 p-4 rounded-xl text-sm" value={newProject.date_livraison_prevue} onChange={e => setNewProject({...newProject, date_livraison_prevue: e.target.value})} />

              <button type="submit" className="md:col-span-2 bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all">
                Générer le Dossier & le Code PIN
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="md:col-span-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}