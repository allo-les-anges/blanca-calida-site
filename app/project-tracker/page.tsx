"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Camera, Download, Calendar, 
  MapPin, Loader2, FileText, LogOut, ArrowLeft,
  CheckCircle2, Clock, ShieldCheck, ChevronRight
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PHASES = [
  "Signature", "Terrassement", "Fondations", "Murs", "Toiture", 
  "Menuiseries", "Électricité", "Isolation", "Plâtrerie", 
  "Sols", "Peintures", "Extérieurs", "Clés"
];

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
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      const { data: projectData } = await supabase
        .from("suivi_chantier")
        .select("*")
        .eq("pin_code", savedPin)
        .maybeSingle();

      if (projectData) {
        setProjet(projectData);
        
        // Charger Photos
        const { data: photosData } = await supabase
          .from("constats-photos")
          .select("*")
          .eq("id_projet", projectData.id)
          .order("created_at", { ascending: false });
        if (photosData) setPhotos(photosData);

        // Charger Documents Admin
        const { data: docsData } = await supabase
          .from("documents_projets")
          .select("*")
          .eq("projet_id", projectData.id);
        if (docsData) setDocuments(docsData);

        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const downloadPDF = async () => {
    if (!projet || photos.length === 0) return;
    setIsExporting(true);
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // --- DESIGN DU PDF (STYLE BUREAU D'ETUDE) ---
    // Entête
    doc.setFillColor(15, 23, 42); // Navy Dark
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RAPPORT D'EXPERTISE CHANTIER", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Villa : ${projet.nom_villa.toUpperCase()}`, 14, 30);
    
    // Infos de traçabilité
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text(`Généré le : ${dateStr} à ${timeStr}`, 140, 50);
    doc.text(`Expert en charge : Bureau d'Étude Prestige OS`, 140, 55);
    doc.text(`Client : ${projet.client_prenom} ${projet.client_nom}`, 14, 55);

    const rows = await Promise.all(photos.map(async (p) => {
      try {
        const base64 = await getBase64ImageFromURL(p.url_image);
        return {
          date: new Date(p.created_at).toLocaleString('fr-FR'),
          note: p.note_expert || "Conforme aux attentes techniques.",
          expert: p.nom_expert || "Expert Technique",
          img: base64
        };
      } catch (e) {
        return { date: "N/A", note: "Erreur image", expert: "N/A", img: null };
      }
    }));

    autoTable(doc, {
      startY: 65,
      head: [['Constat Visuel', 'Date & Heure', 'Analyse de l\'Expert']],
      body: rows.map(r => ['', r.date, `${r.note}\n\nValidé par : ${r.expert}`]),
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 50 }, 2: { fontSize: 10 } },
      styles: { minCellHeight: 45, valign: 'middle', overflow: 'linebreak' }, 
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const rowIndex = data.row.index;
          const base64Img = rows[rowIndex].img;
          if (base64Img) {
            doc.addImage(base64Img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 46, 40);
          }
        }
      },
    });

    doc.save(`Rapport_Expertise_${projet.nom_villa}.pdf`);
    setIsExporting(false);
  };

  const currentPhaseIndex = PHASES.findIndex(p => projet?.etape_actuelle?.includes(p)) || 0;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin mb-4 text-emerald-500" size={40} />
      <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase">Initialisation...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      
      {/* HEADER PREMIUM */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="bg-emerald-500 p-2 rounded-lg">
                <HardHat size={20} className="text-black" />
             </div>
             <div>
                <h1 className="text-white font-black uppercase text-xs tracking-tighter">Prestige <span className="text-emerald-500 text-[10px]">OS</span></h1>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Client Dashboard</p>
             </div>
          </div>
          <div className="flex gap-4">
            <button onClick={downloadPDF} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all">
               {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Rapport PDF
            </button>
            <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-2 text-slate-500 hover:text-white transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-12">
        
        {/* VILLA HERO & PROGRESSION */}
        <div className="grid lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-10">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-full md:w-48 h-48 rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl">
                    <img src={projet.lien_photo || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Villa" />
                 </div>
                 <div className="text-left flex-1">
                    <h2 className="text-6xl font-black tracking-tighter text-white mb-2">{projet.nom_villa}</h2>
                    <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                       <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500"/> {projet.ville}</span>
                       <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-500"/> Certifié Conforme</span>
                    </div>
                 </div>
              </div>

              {/* BARRE DE PROGRESSION DESIGN */}
              <div className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                 <div className="flex justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Progression du Chantier</h3>
                    <span className="text-[10px] font-black text-white">{Math.round((currentPhaseIndex / 12) * 100)}%</span>
                 </div>
                 <div className="relative flex justify-between">
                    <div className="absolute top-4 left-0 w-full h-[2px] bg-white/5 z-0"></div>
                    <div className="absolute top-4 left-0 h-[2px] bg-emerald-500 z-0 transition-all duration-1000" style={{ width: `${(currentPhaseIndex / 12) * 100}%` }}></div>
                    
                    {PHASES.map((phase, idx) => (
                       <div key={idx} className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${idx <= currentPhaseIndex ? 'bg-emerald-500 text-black scale-110' : 'bg-[#1E293B] text-slate-600'}`}>
                             {idx < currentPhaseIndex ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-bold">{idx}</span>}
                          </div>
                          <span className={`text-[8px] font-bold uppercase mt-3 tracking-tighter ${idx === currentPhaseIndex ? 'text-white' : 'text-slate-600'}`}>
                             {phase}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* DOCUMENTS & CASHBACK */}
           <div className="space-y-6">
              <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-black shadow-lg shadow-emerald-500/10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Cashback Avantages</p>
                 <div className="text-5xl font-black tracking-tighter">{projet.montant_cashback?.toLocaleString() || "0"} €</div>
              </div>

              <div className="bg-[#0F172A] rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-64">
                 <h3 className="text-[10px] font-black uppercase text-white mb-6 flex items-center gap-2">
                    <FileText size={16} className="text-emerald-500"/> Documents Officiels
                 </h3>
                 <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar text-left">
                    {documents.map((doc) => (
                       <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500 transition-all group">
                          <span className="text-[10px] font-bold truncate flex-1 pr-4">{doc.nom_fichier}</span>
                          <Download size={14} className="text-slate-500 group-hover:text-emerald-500" />
                       </a>
                    ))}
                    {documents.length === 0 && <p className="text-[10px] text-slate-600 italic">Aucun document partagé.</p>}
                 </div>
              </div>
           </div>
        </div>

        {/* JOURNAL DES RAPPORTS */}
        <div className="space-y-8 pt-10 text-left">
           <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Journal Expert</h2>
              <div className="h-[1px] flex-1 bg-white/5"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photos.map((p) => (
                 <div key={p.id} className="group bg-[#0F172A] rounded-[2rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all">
                    <div className="h-64 relative overflow-hidden">
                       <img src={p.url_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Constat" />
                       <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase">Rapport #{p.id.toString().slice(-4)}</div>
                    </div>
                    <div className="p-6 space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> {new Date(p.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
                       </div>
                       <p className="text-slate-300 text-sm italic leading-relaxed">"{p.note_expert || "Analyse technique en cours..."}"</p>
                       <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-emerald-500">Expert: {p.nom_expert || "Bureau Technique"}</span>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}