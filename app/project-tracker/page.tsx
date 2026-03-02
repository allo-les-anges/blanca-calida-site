"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, 
  Loader2, FileText, LogOut,
  Clock, ShieldCheck, User, X, ChevronRight, MapPin, CheckCircle2,
  TrendingUp
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
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

  // Simulation/Récupération de l'avancement (à lier à votre colonne 'avancement' en BDD)
  const avancement = projet?.avancement || 65; 

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
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(`RAPPORT DE CHANTIER`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`VILLA : ${projet.nom_villa.toUpperCase()}`, 14, 30);
    doc.text(`EXPERT : ${agentResponsable.toUpperCase()}`, 14, 37);

    // Barre de progression dans le PDF
    doc.setFillColor(51, 65, 85);
    doc.roundedRect(120, 25, 75, 8, 2, 2, 'F');
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(120, 25, (75 * avancement) / 100, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.text(`AVANCEMENT GLOBAL : ${avancement}%`, 120, 22);

    const bodyData = await Promise.all(dailyPhotos.map(async (p) => {
      const b64 = p.url_image ? await getBase64ImageFromURL(p.url_image) : null;
      return {
        remarque: `CONSTAT\n${new Date(p.created_at).toLocaleTimeString()}`,
        description: p.note_expert || "Aucune observation.",
        img: b64
      };
    }));

    autoTable(doc, {
      startY: 55,
      head: [['REMARQUE', 'ANALYSE VISUELLE', 'STATUT']],
      body: bodyData.map(d => [d.remarque, "", "VALIDÉ"]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], halign: 'center' },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const row = bodyData[data.row.index];
          if (row.img) doc.addImage(row.img, 'JPEG', data.cell.x + 10, data.cell.y + 5, 100, 60);
          doc.setFontSize(10);
          doc.text(doc.splitTextToSize(row.description, 110), data.cell.x + 5, data.cell.y + 72);
        }
      },
      didParseCell: (data) => { if (data.section === 'body') data.cell.styles.minCellHeight = 90; }
    });

    doc.save(`Rapport_${date}.pdf`);
    setIsExporting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER & PROGRESS BAR */}
        <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="bg-emerald-500 p-4 rounded-2xl"><HardHat className="text-black" size={28} /></div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Prestige OS</h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">{projet?.nom_villa}</p>
              </div>
            </div>
            <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><LogOut size={24} /></button>
          </div>

          {/* BARRE DE PROGRESSION STYLISÉE */}
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-500" size={20} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">État d'avancement du chantier</span>
              </div>
              <span className="text-4xl font-black text-white">{avancement}%</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-1 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                style={{ width: `${avancement}%` }}
              />
            </div>
          </div>
        </div>

        {/* GRILLE DES RAPPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xl">
              <div className="h-56 relative overflow-hidden">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{date}</h3>
                </div>
              </div>
              <div className="p-8 flex justify-between items-center text-slate-400 group-hover:text-white transition-colors font-black uppercase text-[11px] tracking-widest">
                <span>Dossier technique</span>
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* DOCUMENTS RÉGLEMENTAIRES */}
        <div className="bg-[#0F172A] p-12 rounded-[4rem] border border-white/5 shadow-inner">
           <div className="flex items-center gap-4 mb-10 text-white font-black uppercase tracking-[0.2em] text-sm">
              <ShieldCheck className="text-emerald-500" size={28} /> Coffre-fort numérique
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
                  <span className="text-[12px] font-bold truncate text-slate-300 group-hover:text-white">{doc.nom_fichier}</span>
                  <Download size={18} className="text-slate-600 group-hover:text-emerald-500" />
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[4rem] border border-white/10 overflow-hidden flex flex-col h-[92vh] shadow-2xl relative">
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-2"><CheckCircle2 size={14}/> Rapport certifié</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])} disabled={isExporting} className="bg-white text-black px-10 py-5 rounded-2xl text-[12px] font-black uppercase flex items-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-xl">
                  {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />} PDF EXPERT
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-5 bg-white/5 text-slate-500 hover:text-white rounded-2xl transition-all"><X size={28}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-black/20 rounded-[3rem] overflow-hidden border border-white/5 flex flex-col md:flex-row hover:border-emerald-500/20 transition-all">
                  <div className="md:w-1/2 h-[400px] md:h-auto"><img src={p.url_image} className="w-full h-full object-cover" alt="Detail" /></div>
                  <div className="p-12 md:w-1/2 flex flex-col justify-center space-y-8">
                    <span className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2"><Clock size={16}/> {new Date(p.created_at).toLocaleTimeString()}</span>
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