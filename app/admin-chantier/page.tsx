"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Camera, Lock, CheckCircle, Loader2, ArrowRight, 
  Search, MapPin, Info, HardHat, LogOut 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES_CHANTIER = [
  "Préparation & Terrassement", "Fondations", "Soubassement", "Dallage",
  "Élévation des murs", "Charpente", "Couverture / Toiture", "Menuiseries extérieures",
  "Plâtrerie / Isolation", "Électricité & Plomberie", "Finitions intérieures", "Aménagements extérieurs"
];

export default function AdminChantier() {
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchRef, setSearchRef] = useState("");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const checkPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2026") setIsAuthorized(true);
    else alert("Code PIN incorrect");
  };

  const handleSearch = async () => {
    if (!searchRef) return;
    setLoading(true);
    const { data } = await supabase
      .from('suivi_chantier')
      .select('*')
      .or(`nom_villa.ilike.%${searchRef}%,email_client.ilike.%${searchRef}%`)
      .maybeSingle();

    if (data) {
      setProject(data);
      setSearchRef(""); 
    } else {
      alert("Aucune villa trouvée");
    }
    setLoading(false);
  };

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, () => alert("Veuillez autoriser la localisation."));
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !project) return;
      
      setUploading(true);
      setStatus("Envoi en cours...");

      const file = e.target.files[0];
      const fileName = `${project.id}/phase_${project.etape_actuelle || 1}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('photos-chantier')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos-chantier')
        .getPublicUrl(fileName);

      // Préparation du nouvel historique (Updates)
      const newUpdate = {
        url: publicUrl,
        commentaire: comment,
        phase: project.etape_actuelle,
        date: new Date().toISOString(),
        gps: location
      };

      const { error: updateError } = await supabase
        .from('suivi_chantier')
        .update({ 
          lien_photo: publicUrl,
          commentaire_etape_chantier: comment,
          updates: [...(project.updates || []), newUpdate],
          derniere_mise_a_jour: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      setStatus("Publié avec succès !");
      setProject({...project, lien_photo: publicUrl, updates: [...(project.updates || []), newUpdate]});
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
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-8 font-bold">Blanca Calida Admin</p>
          <input 
            type="password" placeholder="CODE PIN" value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center mb-4 outline-none focus:border-emerald-500 tracking-[0.5em] font-bold"
          />
          <button type="submit" className="w-full bg-emerald-600 py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2">
            Entrer <ArrowRight size={14} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12 font-sans">
      <div className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 p-6 border-b border-white/5">
        <div className="max-w-md mx-auto space-y-4 text-left">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <HardHat className="text-emerald-500" size={20}/>
                <h1 className="text-xl font-serif italic">Suivi de Chantier</h1>
             </div>
             <button onClick={() => setIsAuthorized(false)} className="p-2 text-slate-500"><LogOut size={18}/></button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-sm focus:ring-1 focus:ring-emerald-500"
                placeholder="Nom villa ou Email..."
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
          <p className="font-serif italic text-lg">Recherchez une villa pour publier une photo.</p>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 text-left">
          
          <div className="bg-emerald-600 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Client: {project.client_nom}</span>
              <h2 className="text-2xl font-serif italic mb-2">{project.nom_villa}</h2>
              <div className="flex items-center gap-2 text-emerald-100 text-[10px] uppercase font-bold tracking-widest">
                <MapPin size={12} /> {project.ville || "Chantier Local"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800">
            <div className="flex justify-between items-end mb-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progression</label>
              <span className="text-2xl font-serif italic text-emerald-500">{project.etape_actuelle || "N/A"}</span>
            </div>
            
            <div className="p-4 bg-slate-950/50 rounded-2xl flex items-start gap-3 border border-slate-800">
              <Info className="w-4 h-4 text-emerald-500 mt-1" />
              <div>
                <p className="text-xs font-bold text-white uppercase">Étape Active</p>
                <p className="text-[10px] text-slate-500 mt-1">L'étape est définie par l'administration centrale.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mise à jour Terrain</label>
            
            <textarea 
              className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm min-h-[100px] focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="Expliquez les travaux du jour..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button 
              onClick={getGeoLocation}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest
                ${location ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
            >
              <MapPin size={14} />
              {location ? 'Position GPS Validée' : 'Certifier ma position'}
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
                className={`w-full py-8 rounded-2xl font-bold flex flex-col items-center justify-center gap-3 shadow-lg transition-all cursor-pointer
                  ${uploading ? 'bg-slate-800' : 'bg-white text-slate-900 active:scale-95'}`}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Camera className="w-8 h-8" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Prendre la photo</span>
                  </>
                )}
              </label>
            </div>
            
            {status && (
               <div className="flex items-center gap-2 text-emerald-400 justify-center animate-pulse pt-2">
                 <CheckCircle size={14} /> <span className="text-[10px] font-bold uppercase">{status}</span>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}