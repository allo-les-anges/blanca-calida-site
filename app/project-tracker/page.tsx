"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, Loader2, FileText, LogOut,
  Clock, ShieldCheck, User, X, ChevronRight, MapPin, CheckCircle2,
  Flag, Hammer, Paintbrush, Key
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- CONFIGURATION DES ÉTAPES DU CHANTIER ---
const CHANTIER_STEPS = [
  { id: 1, label: "Fondations", icon: <Flag size={14}/>, color: "#ef4444" }, // Rouge
  { id: 2, label: "Gros Œuvre", icon: <Hammer size={14}/>, color: "#f97316" }, // Orange
  { id: 3, label: "Hors d'Eau", icon: <ShieldCheck size={14}/>, color: "#eab308" }, // Jaune
  { id: 4, label: "Finitions", icon: <Paintbrush size={14}/>, color: "#22c55e" }, // Vert clair
  { id: 5, label: "Livraison", icon: <Key size={14}/>, color: "#10b981" }  // Vert émeraude
];

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => reject("Erreur image");
    img.src = url;
  });
};

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agentResponsable, setAgentResponsable] = useState<string>("Expert Prestige OS");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Étape actuelle (1 à 5). Dans un cas réel, ceci viendrait de projet.etape_actuelle
  const currentStepIndex = projet?.current_step || 3; 

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }
      const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();
      if (projectData) {
        setProjet(projectData);
        const { data: staff } = await supabase.from("staff_prestataires").select("nom").eq("pin_code", savedPin).maybeSingle();
        if (staff) setAgentResponsable(staff.nom);
        const { data: ph } = await supabase.from("constats-photos").select("*").eq("id_projet", projectData.id).order("created_at", { ascending: false });
        if (ph) setPhotos(ph);
        const { data: doc } = await supabase.from("documents_projets").select("id, nom_fichier, url_fichier").eq("projet_id", projectData.id);
        if (doc) setDocuments(doc || []);
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc: any, photo: any) => {
      const date = new Date(photo.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(`RAPPORT D'EXPERTISE TECHNIQUE`, 14, 20);
    
    doc.setFontSize(9);
    doc.text(`VILLA : ${projet.nom_villa.toUpperCase()}`, 14, 30);
    doc.text(`DATE : ${date}`, 14, 36);

    // Dessin de la barre de progression (Bulles) dans le PDF
    const startX = 110;
    const gap = 18;
    CHANTIER_STEPS.forEach((step, i) => {
      const isDone = i + 1 <= currentStepIndex;
      doc.setFillColor(isDone ? step.color : "#cbd5e1");
      doc.circle(startX + (i * gap), 32, 3, 'F');
      doc.setFontSize(6);
      doc.setTextColor(isDone ? 255 : 150);
      doc.text(step.label, startX + (i * gap) - 5, 40);
    });

    const bodyData = await Promise.all(dailyPhotos.map(async (p) => {
      const b64 = p.url_image ? await getBase64ImageFromURL(p.url_image) : null;
      return { remarque: `CONSTAT ${new Date(p.created_at).toLocaleTimeString()}`, description: p.note_expert || "RAS", img: b64 };
    }));

    autoTable(doc, {
      startY: 55,
      head: [['RÉFÉRENCE', 'CONSTAT VISUEL', 'ÉTAT']],
      body: bodyData.map(d => [d.remarque, "", "VALIDÉ"]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const row = bodyData[data.row.index];
          if (row.img) doc.addImage(row.img, 'JPEG', data.cell.x + 10, data.cell.y + 5, 100, 60);
          doc.text(doc.splitTextToSize(row.description, 110), data.cell.x + 5, data.cell.y + 75);
        }
      },
      didParseCell: (data) => { if (data.section === 'body') data.cell.styles.minCellHeight = 95; }
    });

    doc.save(`Rapport_${date}.pdf`);
    setIsExporting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* DASHBOARD HEADER */}
        <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20"><HardHat className="text-black" size={28} /></div>
              <div><h1 className="text-2xl font-black uppercase tracking-tighter">Prestige OS</h1><p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">{projet?.nom_villa}</p></div>
            </div>
            <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><LogOut size={24} /></button>
          </div>

          {/* BARRE DE PROGRESSION À BULLES (STYLISÉE) */}
          <div className="relative pt-12 pb-6 px-4 bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 opacity-20" />
            
            <div className="relative flex justify-between items-center max-w-4xl mx-auto">
              {/* Ligne de connexion en arrière-plan */}
              <div className="absolute h-1 w-full bg-slate-800 top-1/2 -translate-y-1/2 left-0 z-0" />
              
              {CHANTIER_STEPS.map((step, index) => {
                const isCompleted = index + 1 < currentStepIndex;
                const isCurrent = index + 1 === currentStepIndex;
                const isFuture = index + 1 > currentStepIndex;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center group">
                    {/* Bulle */}
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-2xl
                        ${isCompleted ? "bg-emerald-500 border-emerald-900 text-black scale-90 opacity-70" : ""}
                        ${isCurrent ? "bg-white border-emerald-500 text-black scale-110 shadow-emerald-500/40" : ""}
                        ${isFuture ? "bg-slate-900 border-slate-800 text-slate-600" : ""}
                      `}
                      style={isCurrent ? { boxShadow: `0 0 30px ${step.color}44` } : {}}
                    >
                      {isCompleted ? <CheckCircle2 size={24} /> : step.icon}
                    </div>
                    {/* Label */}
                    <span className={`mt-4 text-[10px] font-black uppercase tracking-widest transition-colors
                      ${isCurrent ? "text-white" : "text-slate-500"}
                    `}>
                      {step.label}
                    </span>
                    {/* Badge Livraison */}
                    {index === CHANTIER_STEPS.length - 1 && (
                      <div className="absolute -top-8 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[8px] font-black border border-emerald-500/20">FINAL</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FEED PAR DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xl">
              <div className="h-60 relative overflow-hidden">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-8 left-8 text-white font-black text-2xl tracking-tighter">{date}</div>
              </div>
              <div className="p-8 flex justify-between items-center text-slate-500 group-hover:text-white uppercase text-[11px] font-black tracking-widest">
                <span>Archives techniques</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* DOCUMENTS */}
        <div className="bg-[#0F172A] p-12 rounded-[4rem] border border-white/5">
           <div className="flex items-center gap-4 mb-10 text-sm font-black uppercase tracking-[0.2em]"><ShieldCheck className="text-emerald-500" /> Documents du projet</div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/[0.1] transition-all">
                  <span className="text-xs font-bold text-slate-300 truncate pr-4">{doc.nom_fichier}</span>
                  <Download size={18} className="text-emerald-500 shrink-0" />
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[4rem] border border-white/10 overflow-hidden flex flex-col h-[90vh]">
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
              <div className="flex gap-4">
                <button onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])} disabled={isExporting} className="bg-white text-black px-10 py-5 rounded-2xl text-xs font-black uppercase hover:bg-emerald-500 transition-all flex items-center gap-3">
                  {isExporting ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>} Rapport PDF
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-5 bg-white/5 text-slate-400 rounded-2xl"><X size={24}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-black/20 rounded-[3rem] overflow-hidden border border-white/5 flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-[400px] md:h-auto"><img src={p.url_image} className="w-full h-full object-cover" /></div>
                  <div className="p-12 md:w-1/2 flex flex-col justify-center space-y-6">
                    <span className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-2"><Clock size={14}/> {new Date(p.created_at).toLocaleTimeString()}</span>
                    <p className="text-3xl italic text-slate-100 font-serif leading-tight">"{p.note_expert || "RAS"}"</p>
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