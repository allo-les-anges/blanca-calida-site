"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Camera, Download, Calendar, 
  MapPin, Loader2, FileText, LogOut,
  CheckCircle2, Clock, ShieldCheck, User, X, ChevronRight
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agentName, setAgentName] = useState<string>("Expert Technique");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();

      if (projectData) {
        setProjet(projectData);
        // On récupère l'agent lié au PIN
        const { data: staff } = await supabase.from("staff_prestataires").select("nom").eq("pin_code", savedPin).maybeSingle();
        if (staff) setAgentName(staff.nom);

        const { data: ph } = await supabase.from("constats-photos").select("*").eq("id_projet", projectData.id).order("created_at", { ascending: false });
        if (ph) setPhotos(ph);

        const { data: doc } = await supabase.from("documents_projets").select("*").eq("projet_id", projectData.id);
        if (doc) setDocuments(doc);
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Regroupement des photos par date
  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc: any, photo: any) => {
      const date = new Date(photo.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(`RAPPORT DE CHANTIER - ${date.toUpperCase()}`, 14, 25);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Expert : ${agentName}`, 140, 50);
    doc.text(`Villa : ${projet.nom_villa}`, 14, 50);

    autoTable(doc, {
      startY: 60,
      head: [['Heure', 'Observation Technique', 'Statut']],
      body: dailyPhotos.map(p => [
        new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        p.note_expert || "Conforme",
        "Validé"
      ]),
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Rapport_${projet.nom_villa}_${date.replace(/ /g, '_')}.pdf`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#0F172A] p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl"><HardHat className="text-black" /></div>
            <div>
              <h1 className="text-xl font-black uppercase">Journal de Bord</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Expert en charge : {agentName}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-2 text-slate-500 hover:text-white"><LogOut /></button>
        </div>

        {/* GRILLE DES VIGNETTES PAR DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="h-48 relative">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="Day Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Rapports du jour</p>
                  <h3 className="text-2xl font-bold text-white tracking-tighter">{date}</h3>
                </div>
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">
                  {groupedPhotos[date].length} Photos
                </div>
              </div>
              <div className="p-6 flex justify-between items-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">Voir le détail technique</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL : DÉTAIL D'UNE JOURNÉE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Analyse technique complète</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                >
                  <FileText size={14} /> PDF du Jour
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-2 text-slate-400 hover:text-white"><X /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-black/40 rounded-2xl overflow-hidden border border-white/5">
                  <div className="h-64"><img src={p.url_image} className="w-full h-full object-cover" /></div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                      <span className="flex items-center gap-1"><Clock size={12}/> {new Date(p.created_at).toLocaleTimeString()}</span>
                      <span className="text-emerald-500">Expert : {agentName}</span>
                    </div>
                    <p className="text-sm italic text-slate-300 leading-relaxed">"{p.note_expert || "Aucun commentaire pour ce constat."}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}