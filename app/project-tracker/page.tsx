"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { HardHat, Camera, FileText, Download, Calendar, MapPin } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Récupérer les infos de la table suivi_chantier
      const { data: proj } = await supabase
        .from("suivi_chantier")
        .select("*")
        .eq("email_client", user.email)
        .single();

      if (proj) {
        setProjet(proj);
        // 2. Récupérer l'historique de la table constats-photos
        const { data: photos } = await supabase
          .from("constats-photos")
          .select("*")
          .eq("id_projet", proj.id)
          .order("created_at", { ascending: false });
        setJournal(photos || []);
      }
      setLoading(false);
    };
    fetchAllData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center italic font-serif">Luxury Estates - Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* SECTION 1 : RÉSUMÉ DU PROJET */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/2 aspect-video rounded-3xl overflow-hidden shadow-inner">
               <img src={projet?.lien_photo} className="w-full h-full object-cover" alt="Villa" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
               <h1 className="text-4xl font-serif italic text-slate-900 mb-2">{projet?.nom_villa}</h1>
               <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest gap-2 mb-6">
                 <MapPin size={12}/> {projet?.ville}, {projet?.pays}
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-slate-400 italic">Progression</span>
                    <span className="text-emerald-600">Phase {projet?.etape_actuelle}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '45%' }}></div>
                  </div>
               </div>
            </div>
          </div>

          {/* CASHBACK CARD */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-center">
            <h3 className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Cashback Garanti</h3>
            <div className="text-5xl font-serif italic mb-2">{projet?.montant_cashback} €</div>
            <p className="text-slate-400 text-xs leading-relaxed">Ce montant sera crédité sur votre compte dès la livraison finale de votre villa.</p>
          </div>
        </div>

        {/* SECTION 2 : JOURNAL DE BORD & PHOTOS */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-serif italic flex items-center gap-3">
              <Camera className="text-emerald-600" /> Journal de construction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {journal.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="h-56 overflow-hidden">
                    <img src={item.url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Calendar size={12}/> {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <p className="text-slate-600 italic text-sm leading-relaxed">"{item.note_expert}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOCUMENTS SECUTISÉS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif italic flex items-center gap-3">
              <FileText className="text-emerald-600" /> Coffre-fort numérique
            </h2>
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
               {/* Ici tu peux mapper tes documents PDF s'ils sont dans une table documents */}
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Plan_Masse_Villa.pdf</span>
                  <Download size={16} className="text-emerald-600 cursor-pointer" />
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}