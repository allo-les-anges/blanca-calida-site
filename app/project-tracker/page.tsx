"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, 
  Loader2, FileText, LogOut,
  Clock, ShieldCheck, User, X, ChevronRight
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Conversion URL -> Base64 avec gestion d'erreur robuste
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
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject("Erreur de chargement image");
    img.src = url;
  });
};

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agentResponsable, setAgentResponsable] = useState<string>("Chargement...");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();

      if (projectData) {
        setProjet(projectData);
        const { data: staff } = await supabase.from("staff_prestataires").select("nom").eq("pin_code", savedPin).maybeSingle();
        setAgentResponsable(staff?.nom || "Expert Technique");

        const { data: ph } = await supabase.from("constats-photos").select("*").eq("id_projet", projectData.id).order("created_at", { ascending: false });
        if (ph) setPhotos(ph);

        const { data: doc } = await supabase.from("documents_projets").select("id, nom_fichier, url_fichier").eq("projet_id", projectData.id);
        if (doc) setDocuments(doc);
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

  // --- GÉNÉRATION DU PDF EXPERT (PHOTO + TEXTE EN DESSOUS) ---
  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT DE VISITE TECHNIQUE`, 14, 15);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`PROJET : ${projet.nom_villa.toUpperCase()}`, 14, 23);
    doc.text(`VISITE DU : ${date}`, 14, 28);
    doc.text(`EXPERT RÉFÉRENT : ${agentResponsable}`, 120, 23);

    // Préparation des données avec conversion Base64
    const bodyData = await Promise.all(dailyPhotos.map(async (p) => {
      let b64 = "";
      try { b64 = await getBase64ImageFromURL(p.url_image); } catch (e) { console.error(e); }
      return {
        remarque: `CONSTAT\n${new Date(p.created_at).toLocaleTimeString()}`,
        description: p.note_expert || "Aucun commentaire.",
        responsable: agentResponsable,
        img: b64
      };
    }));

    autoTable(doc, {
      startY: 40,
      head: [['REMARQUE', 'DESCRIPTION & ANALYSE VISUELLE', 'RESPONSABLE']],
      body: bodyData.map(d => [d.remarque, "", d.responsable]), // On laisse la colonne milieu vide pour dessiner manuellement
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 5, valign: 'top' },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 120 },
        2: { cellWidth: 35, halign: 'center' }
      },
      didParseCell: (data) => {
        // On force une hauteur de 100mm pour laisser la place (Photo 60mm + Texte)
        if (data.section === 'body') { data.cell.styles.minCellHeight = 90; }
      },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const rowData = bodyData[data.row.index];
          
          // 1. On dessine la photo
          if (rowData.img) {
            try {
              doc.addImage(rowData.img, 'JPEG', data.cell.x + 10, data.cell.y + 5, 100, 65);
            } catch (e) { console.error("Image PDF fail"); }
          }

          // 2. On dessine le texte sous la photo
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          const textY = data.cell.y + 75; // Position après la photo
          const splitText = doc.splitTextToSize(rowData.description, 110);
          doc.text(splitText, data.cell.x + 5, textY);
        }
      }
    });

    doc.save(`Rapport_${projet.nom_villa}_${date.replace(/ /g, '_')}.pdf`);
    setIsExporting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* HEADER DASHBOARD */}
        <div className="flex justify-between items-center bg-[#0F172A] p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl"><HardHat className="text-black" /></div>
            <div className="text-left">
              <h1 className="text-xl font-black uppercase">Prestige OS</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Expert : {agentResponsable}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-3 text-slate-400 hover:text-white"><LogOut /></button>
        </div>

        {/* GRILLE DES JOURS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="h-48 relative overflow-hidden">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <h3 className="text-2xl font-bold text-white">{date}</h3>
                </div>
              </div>
              <div className="p-6 flex justify-between items-center text-slate-400 group-hover:text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest">Voir les rapports</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DÉTAIL */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center text-left">
              <div>
                <h2 className="text-3xl font-black text-white">{selectedDay}</h2>
                <p className="text-xs text-emerald-500 font-bold uppercase italic">Signé par {agentResponsable}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  disabled={isExporting}
                  className="bg-white text-black px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {isExporting ? "Chargement des images..." : "Générer Rapport Expert"}
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-3 text-slate-400 hover:text-white"><X size={24}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col md:flex-row text-left">
                  <div className="md:w-1/2 h-80 md:h-auto"><img src={p.url_image} className="w-full h-full object-cover" /></div>
                  <div className="p-10 md:w-1/2 space-y-4">
                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> {new Date(p.created_at).toLocaleTimeString()}</span>
                    <p className="text-xl italic text-slate-200 leading-relaxed font-medium">"{p.note_expert || "RAS"}"</p>
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