"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Camera, Lock, CheckCircle, Loader2, ArrowRight, 
  Search, MapPin, HardHat, LogOut, ChevronDown, 
  Trash2, Send, X
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
  // --- AUTH & UI STATES ---
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- PROJECT STATES ---
  const [searchRef, setSearchRef] = useState("");
  const [project, setProject] = useState<any>(null);
  
  // --- SESSION STATES ---
  const [sessionPhotos, setSessionPhotos] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  // --- 1. CONNEXION ---
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

  // --- 2. RECHERCHE ---
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

  // --- 3. MISE À JOUR PHASE ---
  const handleUpdatePhase = async (newPhase: string) => {
    if (!project) return;
    const { error } = await supabase.from('suivi_chantier').update({ etape_actuelle: newPhase }).eq('id', project.id);
    if (!error) {
      setProject({ ...project, etape_actuelle: newPhase });
      setStatus("Étape mise à jour");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  // --- 4. CAPTURE PHOTO (AJOUT AU BUCKET MAJUSCULE) ---
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !project) return;
    setUploading(true);
    setStatus("Téléchargement...");

    try {
      const file = e.target.files[0];
      const fileName = `${project.id}/session_${Date.now()}.jpg`;

      // Correction ici : Utilisation du nom en MAJUSCULES comme vu sur tes politiques
      const { error: uploadError } = await supabase.storage.from('photos-chantier').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('photos-chantier').getPublicUrl(fileName);

      const newPhoto = {
        url: publicUrl,
        commentaire: comment || "Photo de suivi",
        date: new Date().toISOString(),
        phase: project.etape_actuelle,
        agent: agentName,
        gps: location
      };

      setSessionPhotos([...sessionPhotos, newPhoto]);
      setComment(""); 
      setStatus("Photo ajoutée !");
    } catch (err: any) {
      alert(`Erreur Storage: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  // --- 5. PUBLICATION FINALE (AVEC SAUVEGARDE TABLE CONSTATS-PHOTOS) ---
  const handleFinalSubmit = async () => {
    if (sessionPhotos.length === 0) return;
    setLoading(true);
    setStatus("Publication...");

    try {
      // A. Mise à jour de la table principale
      const { error: updateError } = await supabase.from('suivi_chantier').update({ 
        lien_photo: sessionPhotos[sessionPhotos.length - 1].url,
        updates: [...(project.updates || []), ...sessionPhotos],
        derniere_mise_a_jour: new Date().toISOString()
      }).eq('id', project.id);

      if (updateError) throw updateError;

      // B. Sauvegarde individuelle dans 'constats-photos'
      const photosToInsert = sessionPhotos.map(p => ({
        id_projet: project.id,
        url_image: p.url,
        note_expert: p.commentaire,
        created_at: p.date
      }));

      const { error: insertError } = await supabase.from('constats-photos').insert(photosToInsert);
      if (insertError) throw insertError;

      setProject({...project, updates: [...(project.updates || []), ...sessionPhotos]});
      setSessionPhotos([]);
      setStatus("Rapport envoyé !");
    } catch (err: any) {
      alert(`Erreur Database: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 text-white">
        <div className="w-full max-w-md space-y-12 text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-white/10">
              <Lock size={38} className="text-white" />
            </div>
            <h1 className="text-4xl font-serif italic tracking-tight">Luxury Staff</h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">Terrain & Reporting</p>
          </div>

          <form onSubmit={checkPin} className="space-y-6">
            <input 
              type="password" 
              inputMode="numeric" 
              placeholder="••••" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 text-center text-3xl tracking-[1em] font-black focus:border-indigo-500 focus:bg-white/10 transition-all outline-none"
            />
            <button className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform">
              Connecter <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white italic font-serif text-xl">
              {agentName.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Agent Terrain</p>
              <h2 className="text-sm font-bold tracking-tight">{agentName}</h2>
            </div>
          </div>
          <button onClick={() => setIsAuthorized(false)} className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all border border-white/5">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8">
        {!project ? (
          <div className="space-y-8 pt-10">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif italic text-slate-300">Quel chantier visitez-vous ?</h3>
              <p className="text-slate-500 text-xs">Entrez le nom de la villa ou du client</p>
            </div>
            <div className="relative group">
              <input 
                className="w-full pl-8 pr-20 py-7 bg-white/5 rounded-[2.5rem] border border-white/10 text-lg outline-none focus:border-indigo-500 focus:ring-4 ring-indigo-500/10 transition-all" 
                placeholder="Ex: Villa Bianca..." 
                value={searchRef} 
                onChange={(e) => setSearchRef(e.target.value)} 
              />
              <button 
                onClick={handleSearch} 
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 p-4 rounded-full text-white shadow-xl active:scale-90 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="relative overflow-hidden bg-indigo-600 rounded-[3rem] p-8 shadow-2xl shadow-indigo-900/20">
              <div className="absolute top-0 right-0 p-8 opacity-20"><HardHat size={80} /></div>
              <div className="relative z-10 space-y-1">
                <button onClick={() => setProject(null)} className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4 bg-black/20 px-4 py-1.5 rounded-full flex items-center gap-2 w-fit">
                   <X size={12}/> Changer de villa
                </button>
                <h2 className="text-4xl font-serif italic leading-none">{project.nom_villa}</h2>
                <p className="text-indigo-100/70 font-medium">{project.client_prenom} {project.client_nom}</p>
              </div>
            </div>

            <div className="bg-[#111] rounded-[2.5rem] p-7 border border-white/5 space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Phase de construction
              </label>
              <div className="relative">
                <select 
                  value={project.etape_actuelle} 
                  onChange={(e) => handleUpdatePhase(e.target.value)}
                  className="w-full bg-black border border-white/5 p-6 rounded-2xl text-sm font-bold text-white appearance-none outline-none focus:border-indigo-500 transition-all"
                >
                  {PHASES_CHANTIER.map(phase => <option key={phase} value={phase}>{phase}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="bg-[#111] rounded-[3rem] p-7 border border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nouveau Constat</label>
                {status && <span className="text-[10px] font-bold text-indigo-400 animate-pulse uppercase tracking-tighter">{status}</span>}
              </div>

              {sessionPhotos.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {sessionPhotos.map((p, i) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group">
                      <img src={p.url} className="w-full h-full object-cover" alt="Pre-upload" />
                      <button 
                        onClick={() => setSessionPhotos(sessionPhotos.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-red-600/80 opacity-0 group-active:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea 
                className="w-full p-6 bg-black rounded-3xl border border-white/5 text-sm min-h-[120px] focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700" 
                placeholder="Observations sur le terrain..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { if(navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude})) }} 
                  className={`flex items-center justify-center gap-3 p-5 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${location ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-black border-white/5 text-slate-500'}`}
                >
                  <MapPin size={16} /> {location ? 'GPS OK' : 'Localiser'}
                </button>

                <label className={`flex items-center justify-center gap-3 p-5 rounded-2xl border text-[10px] font-bold uppercase tracking-widest cursor-pointer active:scale-95 transition-all ${uploading ? 'bg-white/5 text-slate-500 border-white/5' : 'bg-white text-black border-white'}`}>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} disabled={uploading} />
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <><Camera size={16} /> Photo</>}
                </label>
              </div>

              {sessionPhotos.length > 0 && (
                <button 
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:bg-indigo-700 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Publier le rapport ({sessionPhotos.length})</>}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}