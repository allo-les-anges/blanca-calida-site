"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Camera, Lock, CheckCircle, Loader2, ArrowRight, 
  Search, MapPin, Info, HardHat, LogOut 
} from 'lucide-react';

// Les 12 phases métier pour Blanca Calida
const PHASES_CHANTIER = [
  "Préparation & Terrassement", "Fondations", "Soubassement", "Dallage",
  "Élévation des murs", "Charpente", "Couverture / Toiture", "Menuiseries extérieures",
  "Plâtrerie / Isolation", "Électricité & Plomberie", "Finitions intérieures", "Aménagements extérieurs"
];

export default function AdminChantier() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Sécurité
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Recherche et Projet
  const [searchRef, setSearchRef] = useState("");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Upload et Contenu
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const checkPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2026") setIsAuthorized(true);
    else alert("Code PIN incorrect");
  };

  // 1. Recherche dynamique par Référence ou ID
  const handleSearch = async () => {
    if (!searchRef) return;
    setLoading(true);
    const { data } = await supabase
      .from('suivi_chantier')
      .select('*')
      .or(`reference_interne.ilike.%${searchRef}%,nom_villa.ilike.%${searchRef}%`)
      .maybeSingle();

    if (data) {
      setProject(data);
      setSearchRef(""); // Reset recherche après succès
    } else {
      alert("Aucune villa trouvée pour cette référence");
    }
    setLoading(false);
  };

  // 2. Géolocalisation (Gage de confiance)
  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, () => alert("Veuillez autoriser la localisation pour certifier la photo."));
    }
  };

  // 3. Logique d'envoi enrichie
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !project) return;
      
      setUploading(true);
      setStatus("Certification GPS & Envoi...");

      const file = e.target.files[0];
      const fileName = `${project.id}/phase_${project.etape_actuelle}_${Date.now()}.jpg`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('photos-chantier')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos-chantier')
        .getPublicUrl(fileName);

      // Création du nouvel update (Historique)
      const newUpdate = {
        url: publicUrl,
        commentaire: comment,
        phase: PHASES_CHANTIER[project.etape_actuelle - 1],
        date: new Date().toISOString(),
        gps: location
      };

      // Mise à jour de la table
      const { error: updateError } = await supabase
        .from('suivi_chantier')
        .update({ 
          lien_photo: publicUrl, // Photo principale
          updates: [...(project.updates || []), newUpdate], // Historique
          derniere_mise_a_jour: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      setStatus("Mise à jour publiée !");
      setComment("");
      setLocation(null);
      setTimeout(() => setStatus(""), 3000);
      
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <form onSubmit={checkPin} className="bg-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl border border-slate-700">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={30} />
          </div>
          <h1 className="text-xl font-serif mb-2 italic">Accès Terrain</h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-8 font-bold">Opérateur Blanca Calida</p>
          <input 
            type="password" placeholder="CODE PIN" value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center mb-4 outline-none focus:border-emerald-500 transition-all tracking-[0.5em] font-bold"
          />
          <button type="submit" className="w-full bg-emerald-600 py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2">
            Entrer <ArrowRight size={14} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-12 font-sans">
      {/* Header & Recherche */}
      <div className="bg-slate-800/50 backdrop-blur-md sticky top-0 z-10 p-6 border-b border-white/5">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <HardHat className="text-emerald-500" size={20}/>
                <h1 className="text-xl font-serif italic">Administration Chantier</h1>
             </div>
             <button onClick={() => setIsAuthorized(false)} className="p-2 text-slate-500"><LogOut size={18}/></button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-slate-900 rounded-xl border-none text-sm focus:ring-1 focus:ring-emerald-500"
                placeholder="Ex: EMERALD 08..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
              />
            </div>
            <button onClick={handleSearch} className="bg-white text-slate-900 px-4 rounded-xl font-bold">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      {!project ? (
        <div className="flex flex-col items-center justify-center pt-24 text-slate-600 px-12 text-center">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="font-serif italic text-lg">Recherchez une villa par son nom ou sa référence pour commencer.</p>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Fiche Projet */}
          <div className="bg-emerald-600 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">{project.reference_interne}</span>
              <h2 className="text-2xl font-serif italic mb-2">{project.nom_villa}</h2>
              <div className="flex items-center gap-2 text-emerald-100 text-[10px] uppercase font-bold tracking-tighter">
                <MapPin size={12} /> Las Terrenas, Samaná
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10"><HardHat size={80}/></div>
          </div>

          {/* Slider 12 Phases */}
          <div className="bg-slate-800 rounded-[2rem] p-6 border border-slate-700">
            <div className="flex justify-between items-end mb-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phase de construction</label>
              <span className="text-2xl font-serif italic text-emerald-500">{project.etape_actuelle}/12</span>
            </div>
            
            <input 
              type="range" min="1" max="12" step="1"
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-6"
              value={project.etape_actuelle}
              onChange={async (e) => {
                const val = parseInt(e.target.value);
                setProject({...project, etape_actuelle: val});
                await supabase.from('suivi_chantier').update({ etape_actuelle: val }).eq('id', project.id);
              }}
            />
            
            <div className="p-4 bg-slate-900/50 rounded-2xl flex items-start gap-3 border border-slate-700">
              <Info className="w-4 h-4 text-emerald-500 mt-1" />
              <div>
                <p className="text-xs font-bold text-white uppercase">{PHASES_CHANTIER[project.etape_actuelle - 1]}</p>
                <p className="text-[10px] text-slate-500 mt-1">Le slider met à jour la progression du client.</p>
              </div>
            </div>
          </div>

          {/* Upload & Geo */}
          <div className="bg-slate-800 rounded-[2rem] p-6 border border-slate-700 space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mise à jour visuelle</label>
            
            <textarea 
              className="w-full p-4 bg-slate-900 rounded-2xl border-none text-sm min-h-[100px] focus:ring-1 focus:ring-emerald-500"
              placeholder="Ajouter un commentaire pour le client..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button 
              onClick={getGeoLocation}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest
                ${location ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
            >
              <MapPin size={14} />
              {location ? 'Localisation GPS Certifiée' : 'Activer Géolocalisation'}
            </button>

            <div className="relative">
              <input 
                type="file" accept="image/*" capture="environment" 
                className="hidden" id="photo-up" 
                onChange={handleUpload}
                disabled={uploading}
              />
              <label 
                htmlFor="photo-up"
                className={`w-full py-6 rounded-2xl font-bold flex flex-col items-center justify-center gap-3 shadow-lg transition-all cursor-pointer
                  ${uploading ? 'bg-slate-700' : 'bg-white text-slate-900 active:scale-95'}`}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Camera className="w-8 h-8" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Publier la Photo Terrain</span>
                  </>
                )}
              </label>
            </div>
            
            {status && (
               <div className="flex items-center gap-2 text-emerald-400 justify-center animate-bounce pt-2">
                 <CheckCircle size={14} /> <span className="text-[10px] font-bold uppercase">{status}</span>
               </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}