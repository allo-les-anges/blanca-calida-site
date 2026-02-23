"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Camera, Lock, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function AdminChantier() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // États pour la sécurité
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // États pour l'upload
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  // Vérification du code PIN (Simple et efficace pour l'instant)
  const checkPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2026") { // TON CODE PIN ICI
      setIsAuthorized(true);
    } else {
      alert("Code PIN incorrect");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      async function getProjects() {
        const { data } = await supabase.from('suivi_chantier').select('id, nom_villa');
        if (data) setProjects(data);
      }
      getProjects();
    }
  }, [isAuthorized, supabase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setStatus("Envoi vers le chantier...");

      if (!e.target.files || e.target.files.length === 0) return;
      if (!selectedProjectId) return alert("Choisissez une villa");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProjectId}/${Date.now()}.${fileExt}`;

      // 1. Upload dans le bucket existant "photos-chantier"
      const { error: uploadError } = await supabase.storage
        .from('photos-chantier')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Récupération de l'URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos-chantier')
        .getPublicUrl(fileName);

      // 3. Mise à jour de la fiche villa
      const { error: updateError } = await supabase
        .from('suivi_chantier')
        .update({ lien_photo: publicUrl })
        .eq('id', selectedProjectId);

      if (updateError) throw updateError;

      setStatus("Photo publiée !");
      setTimeout(() => setStatus(""), 3000);
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- ÉCRAN DE VERROUILLAGE ---
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <form onSubmit={checkPin} className="bg-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl border border-slate-700">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={30} />
          </div>
          <h1 className="text-xl font-serif text-white mb-2">Accès Opérateur</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-8">Blanca Calida Admin</p>
          <input 
            type="password" 
            placeholder="Code PIN" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center text-white mb-4 outline-none focus:border-emerald-500 transition-all"
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2">
            Entrer <ArrowRight size={14} />
          </button>
        </form>
      </div>
    );
  }

  // --- INTERFACE UPLOAD ---
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-32">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-serif italic italic">Terrain Update</h1>
          <button onClick={() => setIsAuthorized(false)} className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Déconnexion</button>
        </div>

        <div className="space-y-6 bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block font-bold">Sélectionner la Villa</label>
            <select 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-emerald-500 transition-all text-sm"
            >
              <option value="">Choisir un projet...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.nom_villa}</option>)}
            </select>
          </div>

          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" // Force l'ouverture de l'appareil photo sur mobile
              onChange={handleUpload}
              disabled={uploading || !selectedProjectId}
              className="hidden" 
              id="photo-upload" 
            />
            <label 
              htmlFor="photo-upload"
              className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-[2rem] p-12 transition-all cursor-pointer
                ${uploading ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-emerald-500 active:scale-95'}`}
            >
              {uploading ? (
                <Loader2 className="animate-spin text-emerald-500" size={40} />
              ) : (
                <Camera size={40} className={selectedProjectId ? "text-emerald-500" : "text-slate-600"} />
              )}
              <div className="text-center">
                <span className="text-sm font-bold block mb-1">{uploading ? status : "Prendre une photo"}</span>
                {!uploading && <span className="text-[10px] text-slate-500 uppercase tracking-tight italic">Publication instantanée</span>}
              </div>
            </label>
          </div>

          {status && !uploading && (
            <div className="flex items-center gap-2 text-emerald-400 justify-center animate-in fade-in zoom-in">
              <CheckCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}