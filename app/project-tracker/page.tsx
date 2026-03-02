"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, Loader2, FileText, LogOut,
  Clock, ShieldCheck, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, Globe, ExternalLink
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CHANTIER_STEPS = [
  { id: 1, label: "Fondations", color: "#ef4444" },
  { id: 2, label: "Gros Œuvre", color: "#f97316" },
  { id: 3, label: "Hors d'Eau", color: "#eab308" },
  { id: 4, label: "Finitions", color: "#22c55e" },
  { id: 5, label: "Livraison", color: "#10b981" }
];

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agentResponsable, setAgentResponsable] = useState<string>("Chargement...");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      // 1. Récupérer le projet
      const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();
      
      if (projectData) {
        setProjet(projectData);

        // 2. Récupérer l'expert lié au PIN (Table staff_prestataires)
        const { data: staff } = await supabase.from("staff_prestataires")
          .select("nom")
          .eq("pin_code", savedPin)
          .maybeSingle();
        setAgentResponsable(staff?.nom || "Expert Prestige OS");

        // 3. Récupérer les photos
        const { data: ph } = await supabase.from("constats-photos")
          .select("*")
          .eq("id_projet", projectData.id)
          .order("created_at", { ascending: false });
        if (ph) setPhotos(ph);

        // 4. Récupérer les documents (Coffre-fort)
        const { data: docs } = await supabase.from("documents_projets")
          .select("id, nom_fichier, url_fichier")
          .eq("projet_id", projectData.id);
        if (docs) setDocuments(docs);
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

  const handlePDFAction = async (date: string, dailyPhotos: any[], action: 'save' | 'print' | 'preview') => {
    setIsProcessing(true);
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // Header Prestige OS
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTIGE OS", 14, 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`RAPPORT TECHNIQUE D'EXPERTISE`, 14, 30);
    doc.text(`PROJET : Villa ${projet?.nom_villa}`, 14, 38);
    doc.text(`EXPERT : ${agentResponsable}`, 14, 44);
    doc.text(`DATE : ${date}`, 150, 44);

    const tableData = await Promise.all(dailyPhotos.map(async (p) => {
        return {
            time: new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            note: p.note_expert || "Conforme aux normes en vigueur.",
            imageUrl: p.url_image
        };
    }));

    autoTable(doc, {
      startY: 60,
      head: [['ANALYSE DE L\'EXPERT', 'CONSTAT VISUEL']],
      body: tableData.map(d => [`HEURE : ${d.time}\n\n${d.note}`, ""]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
      columnStyles: { 0: { cellWidth: 75 }, 1: { cellWidth: 105, minCellHeight: 80 } },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const row = tableData[data.row.index];
          doc.addImage(row.imageUrl, 'JPEG', data.cell.x + 2.5, data.cell.y + 5, 100, 70);
        }
      }
    });

    if (action === 'save') doc.save(`PrestigeOS_${projet.nom_villa}_${date}.pdf`);
    else if (action === 'print') doc.autoPrint();
    else if (action === 'preview') window.open(doc.output('bloburl'));
    setIsProcessing(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* TOP BAR / NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20"><HardHat className="text-black" size={28} /></div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Prestige OS</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">Expert : {agentResponsable}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <a href="https://votre-site.com" className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
              <Globe size={16} /> Retour au site
            </a>
            <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* PROGRESS ROADMAP */}
        <div className="bg-[#0F172A] p-10 rounded-[3rem] border border-white/5">
           <div className="relative flex justify-between items-center max-w-5xl mx-auto pt-4">
              <div className="absolute h-[1px] w-full bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
              {CHANTIER_STEPS.map((step, index) => {
                const isPassed = index + 1 <= (projet?.current_step || 1);
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${isPassed ? "bg-emerald-500 border-emerald-900 shadow-lg shadow-emerald-500/20" : "bg-slate-900 border-slate-800 text-slate-600"}`}>
                      {isPassed ? <CheckCircle2 className="text-black" size={18} /> : <span className="text-[10px]">{step.id}</span>}
                    </div>
                    <span className={`mt-4 text-[8px] font-black uppercase tracking-widest ${isPassed ? "text-white" : "text-slate-600"}`}>{step.label}</span>
                  </div>
                );
              })}
           </div>
        </div>

        {/* GRILLE DES RAPPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[3rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="h-56 relative overflow-hidden">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-6 left-8 text-white font-black text-xl tracking-tighter">{date}</div>
              </div>
              <div className="p-6 flex justify-between items-center text-slate-500 group-hover:text-emerald-400 uppercase text-[10px] font-black tracking-widest transition-colors">
                <span>Dossier de visite</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* COFFRE-FORT NUMÉRIQUE (DOCUMENTS) */}
        <div className="bg-[#0F172A] p-12 rounded-[4rem] border border-white/5 shadow-inner">
           <div className="flex items-center gap-4 mb-10 text-xs font-black uppercase tracking-[0.2em] text-white">
              <ShieldCheck className="text-emerald-500" size={24} /> Coffre-fort numérique du projet
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.length > 0 ? documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all group">
                  <div className="flex items-center gap-4 truncate">
                    <FileText className="text-emerald-500 shrink-0" size={20} />
                    <span className="text-[11px] font-bold truncate text-slate-300 group-hover:text-white uppercase">{doc.nom_fichier}</span>
                  </div>
                  <Download size={16} className="text-slate-600 group-hover:text-emerald-500 shrink-0" />
                </a>
              )) : (
                <p className="text-slate-600 italic text-xs">Aucun document administratif importé.</p>
              )}
           </div>
        </div>
      </div>

      {/* MODAL OPTIONS RAPPORT */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-4xl rounded-[4rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-white/5">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <CheckCircle2 size={14}/> Signé numériquement par Prestige OS
                  </p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 transition-all group">
                  <Eye size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Aperçu</span>
                </button>
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'save')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 transition-all group">
                  <Save size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Enregistrer</span>
                </button>
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'print')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 transition-all group">
                  <Printer size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Imprimer</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-4">
                {groupedPhotos[selectedDay].map((p: any) => (
                    <div key={p.id} className="flex gap-6 items-center bg-white/[0.02] p-4 rounded-3xl border border-white/5">
                        <img src={p.url_image} className="w-20 h-20 object-cover rounded-xl" />
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(p.created_at).toLocaleTimeString()}</p>
                          <p className="text-xs text-slate-300 italic">"{p.note_expert || "RAS"}"</p>
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