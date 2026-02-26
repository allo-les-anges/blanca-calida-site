"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { HardHat, Camera, FileText, Download, Calendar, MapPin, Loader2 } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      // On récupère le PIN qui a été sauvé au moment du login
      const savedPin = localStorage.getItem("client_access_pin");
      
      if (!savedPin) {
        window.location.href = "/"; // Redirige vers l'accueil si pas de PIN
        return;
      }

      // Récupérer les infos du projet correspondant au PIN
      const { data, error } = await supabase
        .from("suivi_chantier")
        .select("*")
        .eq("pin_code", savedPin) // On cherche par le PIN
        .maybeSingle();

      if (data) {
        setProjet(data);
      }
      setLoading(false);
    };
    fetchProjectData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <Loader2 className="animate-spin mb-4 text-emerald-600" size={40} />
      <span className="font-serif italic text-xl">Préparation de votre espace personnel...</span>
    </div>
  );

  if (!projet) return <div className="p-20 text-center">Aucun projet trouvé avec ce code.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER & PROGRESSION */}
        <div className="grid lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
               <img src={projet.lien_photo || "/placeholder-villa.jpg"} className="w-full h-full object-cover" alt="Votre Villa" />
            </div>
            <div className="flex-1 w-full">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 block">Espace Propriétaire</span>
               <h1 className="text-5xl font-serif italic text-slate-900 mb-4 tracking-tight">{projet.nom_villa}</h1>
               <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest gap-2 mb-8">
                 <MapPin size={14} className="text-emerald-500"/> {projet.ville}
               </div>
               
               <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Statut actuel</span>
                    <span className="text-emerald-600">{projet.etape_actuelle}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: '60%' }}></div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[3rem] p-10 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
                <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Cashback Garanti</h3>
                <div className="text-6xl font-serif italic mb-4">{projet.montant_cashback?.toLocaleString()} €</div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed font-bold">Crédité lors de la remise des clés</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Download size={200}/></div>
          </div>
        </div>

        {/* SECTION PHOTOS (JOURNAL DE BORD) */}
        <div className="space-y-8 text-left">
            <h2 className="text-3xl font-serif italic flex items-center gap-4">
               <Camera className="text-emerald-500" size={30} /> Journal du chantier
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projet.updates?.map((update: any, index: number) => (
                <div key={index} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                   <div className="h-64 overflow-hidden">
                      <img src={update.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Suivi chantier" />
                   </div>
                   <div className="p-8">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar size={12}/> {new Date(update.date).toLocaleDateString()}
                         </span>
                         <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{update.phase}</span>
                      </div>
                      <p className="text-slate-600 italic text-sm leading-relaxed">"{update.commentaire}"</p>
                   </div>
                </div>
              ))}
            </div>
        </div>

      </div>
    </div>
  );
}