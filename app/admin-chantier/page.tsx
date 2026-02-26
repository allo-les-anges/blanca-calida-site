"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Camera, Lock, CheckCircle, Loader2, ArrowRight, 
  Search, MapPin, Info, HardHat, LogOut, ChevronDown 
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

export default function AdminChantier() {
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [agentName, setAgentName] = useState("");
  
  const [searchRef, setSearchRef] = useState("");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  // --- 1. CONNEXION PAR PIN STAFF ---
  const checkPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase.from('staff_prestataires').select('prenom, nom').eq('pin_code', pin).maybeSingle();
    if (data) {
      setAgentName(`${data.prenom} ${data.nom}`);
      setIsAuthorized(true);
    } else {
      alert("PIN invalide.");
      setPin("");
    }
    setLoading(false);
  };

  // --- 2. RÉCUPÉRATION DU CHANTIER ---
  const handleSearch = async () => {
    if (!searchRef) return;
    setLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('*').or(`nom_villa.ilike.%${searchRef}%,client_nom.ilike.%${searchRef}%`).maybeSingle();
    if (data) {
      setProject(data);
      setSearchRef(""); 
    } else {
      alert("Chantier introuvable.");
    }
    setLoading(false);
  };

  // --- 3. MISE À JOUR DE L'ÉTAPE (NOUVEAU) ---
  const handleUpdatePhase = async (newPhase: string) => {
    if (!project) return;
    const { error } = await supabase.from('suivi_chantier').update({ etape_actuelle: newPhase }).eq('id', project.id);
    if (!error) {
      setProject({ ...project, etape_actuelle: newPhase });
      setStatus("Étape mise à jour !");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  // --- 4. ENVOI PHOTO & RAPPORT ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !project) return;
      setUploading(true);
      setStatus("Envoi du constat...");

      const file = e.target.files[0];
      const fileName = `${project.id}/terrain_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage.from('constats-photos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('constats-photos').getPublicUrl(fileName);

      const newUpdate = {
        url: publicUrl,
        commentaire: comment,
        phase: project.etape_actuelle,
        date: new Date().toISOString(),
        agent: agentName,
        gps: location
      };

      const { error: updateError } = await supabase.from('suivi_chantier').update({ 
        lien_photo: publicUrl,
        commentaires_etape: comment,
        updates: [...(project.updates || []), newUpdate],
        derniere_mise_a_jour: new Date().toISOString()
      }).eq('id', project.id);

      if (updateError) throw updateError;

      setStatus("Rapport publié !");
      setProject({...project, updates: [...(project.updates || []), newUpdate]});
      setComment("");
      setLocation(null);
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <form onSubmit={checkPin} className="bg-slate-900 p-10 rounded-[3rem] w-full max-w-sm text-center border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20"><Lock size={32} /></div>
          <h1 className="text-2xl font-serif italic mb-2">Accès Staff</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-10 font-black tracking-widest">Terrain & Certification</p>
          <input type="text" inputMode="numeric" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center mb-6 outline-none focus:border-indigo-500 tracking-[0.6em] font-black text-xl"/>
          <button type="submit" className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">Entrer <ArrowRight size={16} /></button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12 font-sans">
      {/* STICKY HEADER */}
      <div className="bg-slate-900/90 backdrop-blur-xl sticky top-0 z-20 p-6 border-b border-white/5">
        <div className="max-w-md mx-auto space-y-5 text-left">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg"><HardHat size={18}/></div>
                <div><h1 className="text-sm font-serif italic leading-none">{agentName}</h1><p className="text-[8px] uppercase tracking-widest text-slate-500 mt-1">Mode Terrain Actif</p></div>
             </div>
             <button onClick={() => setIsAuthorized(false)} className="p-3 bg-slate-800 rounded-xl text-slate-400"><LogOut size={18}/></button>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 pl-6 pr-4 py-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm outline-none focus:border-indigo-500" placeholder="Nom Villa..." value={searchRef} onChange={(e) => setSearchRef(e.target.value)} />
            <button onClick={handleSearch} className="bg-white text-slate-900 px-6 rounded-2xl font-black">{loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search size={20} />}</button>
          </div>
        </div>
      </div>

      {!project ? (
        <div className="pt-32 text-center opacity-20"><Search size={64} className="mx-auto mb-4" /><p className="font-serif italic text-xl">Rechercher un chantier...</p></div>
      ) : (
        <div className="max-w-md mx-auto p-6 space-y-6 text-left animate-in slide-in-from-bottom-6">
          
          {/* CARD PROJET */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Villa Sélectionnée</span>
              <h2 className="text-3xl font-serif italic mb-1 mt-4">{project.nom_villa}</h2>
              <p className="text-indigo-100 text-sm font-medium opacity-80">{project.client_prenom} {project.client_nom}</p>
            </div>
          </div>

          {/* SÉLECTEUR DE PHASE (NOUVEAU) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-7 border border-white/5 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Étape actuelle du chantier</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="relative">
              <select 
                value={project.etape_actuelle} 
                onChange={(e) => handleUpdatePhase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-sm font-bold text-white appearance-none outline-none focus:border-indigo-500 shadow-inner transition-all"
              >
                {PHASES_CHANTIER.map(phase => <option key={phase} value={phase}>{phase}</option>)}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
            <p className="text-[9px] text-slate-500 italic">Modifier ici pour informer instantanément le client du changement de phase.</p>
          </div>

          {/* FORMULAIRE RAPPORT PHOTO */}
          <div className="bg-slate-900 rounded-[2.5rem] p-7 border border-white/5 space-y-5 shadow-xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Note de passage</label>
            <textarea className="w-full p-5 bg-slate-950 rounded-[1.5rem] border border-slate-800 text-sm min-h-[120px] focus:border-indigo-500 outline-none" placeholder="Travaux réalisés, points d'attention..." value={comment} onChange={(e) => setComment(e.target.value)} />
            
            <button onClick={() => { if(navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude})) }} className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${location ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              <MapPin size={16} /> {location ? 'GPS Validé' : 'Certifier ma position'}
            </button>

            <div className="relative pt-2">
              <input type="file" accept="image/*" capture="environment" className="hidden" id="cam-up" onChange={handleUpload} disabled={uploading} />
              <label htmlFor="cam-up" className={`w-full py-10 rounded-[2rem] font-black flex flex-col items-center justify-center gap-4 shadow-2xl transition-all cursor-pointer ${uploading ? 'bg-slate-800' : 'bg-white text-slate-950 active:scale-95'}`}>
                {uploading ? <Loader2 className="animate-spin" size={32} /> : <><div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center"><Camera size={28} /></div><span className="text-[11px] uppercase tracking-[0.3em]">Prendre la photo</span></>}
              </label>
            </div>
            
            {status && <div className="flex items-center gap-3 text-emerald-400 justify-center animate-bounce pt-2"><CheckCircle size={18} /> <span className="text-[10px] font-black uppercase">{status}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}