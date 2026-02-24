"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home, Camera, FileText, ChevronRight, User } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MobileApp() {
  const [tab, setTab] = useState("home"); // home, journal, docs
  const [projet, setProjet] = useState<any>(null);
  const [journal, setJournal] = useState<any[]>([]);

  useEffect(() => {
    // Logique de récupération identique au dashboard (via email du user connecté)
    // ... (Remplir projet et journal ici)
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* VUE ACCUEIL */}
      {tab === "home" && (
        <div className="animate-in slide-in-from-right duration-300">
          <div className="h-64 relative">
             <img src={projet?.lien_photo} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40" />
             <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-2xl font-serif italic">{projet?.nom_villa}</h1>
                <p className="text-[10px] uppercase tracking-widest opacity-70">Blanca Calida Premium</p>
             </div>
          </div>
          <div className="p-6 -mt-10">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl space-y-4">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                  <span>Étape {projet?.etape_actuelle}</span>
                  <span className="text-emerald-600">45%</span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[45%]" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE JOURNAL (Le flux de tes constats-photos) */}
      {tab === "journal" && (
        <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
          <h2 className="font-serif italic text-2xl">Fil d'actualité</h2>
          {journal.map(item => (
            <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm">
              <img src={item.url_image} className="w-full aspect-square object-cover" />
              <div className="p-5 italic text-slate-600 text-sm">"{item.note_expert}"</div>
            </div>
          ))}
        </div>
      )}

      {/* NAV BAR MOBILE FIXE EN BAS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-4 px-4 z-[100]">
        <button onClick={() => setTab("home")} className={`flex flex-col items-center gap-1 ${tab === "home" ? "text-emerald-600" : "text-slate-400"}`}>
          <Home size={20} /> <span className="text-[8px] font-bold uppercase tracking-widest">Suivi</span>
        </button>
        <button onClick={() => setTab("journal")} className={`flex flex-col items-center gap-1 ${tab === "journal" ? "text-emerald-600" : "text-slate-400"}`}>
          <Camera size={20} /> <span className="text-[8px] font-bold uppercase tracking-widest">Journal</span>
        </button>
        <button onClick={() => setTab("docs")} className={`flex flex-col items-center gap-1 ${tab === "docs" ? "text-emerald-600" : "text-slate-400"}`}>
          <FileText size={20} /> <span className="text-[8px] font-bold uppercase tracking-widest">Docs</span>
        </button>
      </nav>
    </div>
  );
}