"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, Loader2, FileText, LogOut,
  Clock, ShieldCheck, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, MapPin
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
  const [agentResponsable, setAgentResponsable] = useState<string>("Expert Technique");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentStepIndex = projet?.current_step || 3;

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) return;
      const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();
      if (projectData) {
        setProjet(projectData);
        const { data: staff } = await supabase.from("staff_prestataires").select("nom").eq("pin_code", savedPin).maybeSingle();
        if (staff) setAgentResponsable(staff.nom);
        const { data: ph } = await supabase.from("constats-photos").select("*").eq("id_projet", projectData.id).order("created_at", { ascending: false });
        if (ph) setPhotos(ph);
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

  // --- LOGIQUE PDF AMÉLIORÉE (Mise en page fixe) ---
  const handlePDFAction = async (date: string, dailyPhotos: any[], action: 'save' | 'print' | 'preview') => {
    setIsProcessing(true);
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // 1. Header Institutionnel
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 55, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTIGE OS - AGENCE D'EXPERTISE", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`PROJET : Villa ${projet?.nom_villa || "Client"}`, 14, 32);
    doc.text(`DATE DU RAPPORT : ${date}`, 14, 38);
    doc.text(`EXPERT RÉFÉRENT : ${agentResponsable}`, 14, 44);

    // 2. Barre de progression (Bulles PDF)
    const startX = 140;
    CHANTIER_STEPS.forEach((step, i) => {
      const isPast = i + 1 <= currentStepIndex;
      doc.setFillColor(isPast ? step.color : "#475569");
      doc.circle(startX + (i * 12), 35, 3.5, 'F');
    });

    // 3. Corps du rapport (Tableau ultra-pro)
    const tableData = await Promise.all(dailyPhotos.map(async (p) => {
        // Pré-chargement des images pour éviter les cases vides
        const img = new Image();
        img.src = p.url_image;
        await new Promise((r) => img.onload = r);
        return {
            time: new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            note: p.note_expert || "Aucune observation technique particulière.",
            imageUrl: p.url_image
        };
    }));

    autoTable(doc, {
      startY: 65,
      head: [['DÉTAILS TECHNIQUE', 'CONSTAT VISUEL']],
      body: tableData.map(d => [`HEURE: ${d.time}\n\nANALYSE:\n${d.note}`, ""]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
      styles: { cellPadding: 8, fontSize: 9, overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 70 }, 
        1: { cellWidth: 110, minCellHeight: 80 } 
      },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const row = tableData[data.row.index];
          doc.addImage(row.imageUrl, 'JPEG', data.cell.x + 5, data.cell.y + 5, 100, 70);
        }
      }
    });

    // Finalisation
    if (action === 'save') doc.save(`Rapport_PrestigeOS_${date}.pdf`);
    else if (action === 'print') doc.autoPrint();
    else if (action === 'preview') window.open(doc.output('bloburl'));
    
    setIsProcessing(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER DASHBOARD */}
        <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-500 p-4 rounded-2xl"><HardHat className="text-black" size={28} /></div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Prestige OS</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">Agent : {agentResponsable}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
             <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Suivi en temps réel : Villa {projet?.nom_villa}</span>
          </div>
        </div>

        {/* BARRE DE PROGRESSION À BULLES */}
        <div className="relative pt-12 pb-6 px-10 bg-[#0F172A] rounded-[3rem] border border-white/5">
            <div className="relative flex justify-between items-center max-w-5xl mx-auto">
              <div className="absolute h-[2px] w-full bg-slate-800 top-1/2 -translate-y-1/2 left-0 z-0" />
              {CHANTIER_STEPS.map((step, index) => {
                const isActive = index + 1 <= currentStepIndex;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-700
                      ${isActive ? "bg-emerald-500 border-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-slate-900 border-slate-800 text-slate-600"}
                    `}>
                      {isActive ? <CheckCircle2 className="text-black" size={20} /> : <span className="text-xs">{step.id}</span>}
                    </div>
                    <span className={`mt-4 text-[9px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-slate-600"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
        </div>

        {/* FEED PAR DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xl">
              <div className="h-60 relative">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-8 left-8 text-white font-black text-2xl tracking-tighter">{date}</div>
              </div>
              <div className="p-8 flex justify-between items-center text-slate-500 group-hover:text-white uppercase text-[11px] font-black tracking-widest">
                <span>Dossier Technique</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL D'ACTIONS RAPPORT */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-4xl rounded-[4rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-10 border-b border-white/5">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <button onClick={() => setSelectedDay(null)} className="p-4 bg-white/5 text-slate-400 rounded-2xl"><X size={24}/></button>
              </div>

              {/* OPTIONS D'EXPORTATION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')}
                  className="bg-white/5 hover:bg-emerald-500 hover:text-black p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 transition-all group"
                >
                  <Eye size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Prévisualiser</span>
                </button>
                <button 
                  onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'save')}
                  className="bg-white/5 hover:bg-emerald-500 hover:text-black p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 transition-all group"
                >
                  <Save size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Enregistrer PDF</span>
                </button>
                <button 
                  onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'print')}
                  className="bg-white/5 hover:bg-emerald-500 hover:text-black p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 transition-all group"
                >
                  <Printer size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Imprimer</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
                  <ShieldCheck className="text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Contenu certifié par Prestige OS - Expert : {agentResponsable}</p>
                </div>
                {groupedPhotos[selectedDay].map((p: any) => (
                    <div key={p.id} className="flex gap-6 items-center bg-white/[0.02] p-4 rounded-3xl">
                        <img src={p.url_image} className="w-24 h-24 object-cover rounded-2xl" />
                        <p className="text-sm italic text-slate-400">"{p.note_expert || "Aucun commentaire."}"</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}