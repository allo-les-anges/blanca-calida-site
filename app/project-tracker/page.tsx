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

// Conversion URL -> Base64 robuste pour le moteur PDF
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
      // Utilisation de la langue du système pour la date
      const date = new Date(photo.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  // --- GÉNÉRATION DU PDF EXPERT (PHOTO + TEXTE EN DESSOUS DANS LA CASE) ---
  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    // Header Professionnel
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT DE VISITE TECHNIQUE`, 14, 15);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`PROJET : ${projet.nom_villa.toUpperCase()}`, 14, 23);
    doc.text(`VISITE DU : ${date}`, 14, 28);
    doc.text(`EXPERT : ${agentResponsable}`, 130, 23);

    const bodyData = await Promise.all(dailyPhotos.map(async (p) => {
      let b64 = "";
      try { b64 = await getBase64ImageFromURL(p.url_image); } catch (e) { console.error(e); }
      return {
        remarque: `CONSTAT\n${new Date(p.created_at).toLocaleTimeString()}`,
        description: p.note_expert || "Aucun commentaire technique.",
        responsable: agentResponsable,
        img: b64
      };
    }));

    autoTable(doc, {
      startY: 40,
      head: [['REMARQUE', 'ANALYSE VISUELLE & DESCRIPTION', 'RESPONSABLE']],
      body: bodyData.map(d => [d.remarque, "", d.responsable]), 
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 5, valign: 'top' },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 120 },
        2: { cellWidth: 35, halign: 'center' }
      },
      didParseCell: (data) => {
        // Hauteur augmentée pour accommoder la photo (60mm) + le texte
        if (data.section === 'body') { data.cell.styles.minCellHeight = 95; }
      },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const rowData = bodyData[data.row.index];
          
          // Dessin de l'image (Centrée dans la cellule)
          if (rowData.img) {
            try {
              doc.addImage(rowData.img, 'JPEG', data.cell.x + 10, data.cell.y + 5, 100, 65);
            } catch (e) { console.error("PDF Image Error"); }
          }

          // Dessin du texte sous l'image
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          const textY = data.cell.y + 75; // Positionnement sous la photo
          const maxWidth = 110;
          const splitText = doc.splitTextToSize(rowData.description, maxWidth);
          doc.text(splitText, data.cell.x + 5, textY);
        }
      }
    });

    doc.save(`Rapport_${projet.nom_villa}_${date}.pdf`);
    setIsExporting(false);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronisation Expertise</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER DASHBOARD */}
        <div className="flex justify-between items-center bg-[#0F172A] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <HardHat className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Prestige OS</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Expert : {agentResponsable}</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }}
            className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* HISTORIQUE DES VISITES */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-500" size={24} />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Rapports de Chantier</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div 
                key={date} 
                onClick={() => setSelectedDay(date)} 
                className="group bg-[#0F172A] rounded-[3rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <div className="h-52 relative overflow-hidden">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-2xl font-bold text-white tracking-tighter">{date}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">{groupedPhotos[date].length} Constats</p>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center text-slate-400 group-hover:text-white transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ouvrir l'expertise</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="bg-[#0F172A] p-10 rounded-[3rem] border border-white/5">
           <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="text-emerald-500" size={20} />
              <h3 className="text-xs font-black uppercase text-white tracking-widest">Documents Administratifs</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                  <span className="text-[11px] font-bold truncate pr-4 text-slate-300 group-hover:text-white">{doc.nom_fichier}</span>
                  <Download size={16} className="text-slate-500 group-hover:text-emerald-500" />
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL : DÉTAIL D'UNE JOURNÉE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[3.5rem] border border-white/10 overflow-hidden flex flex-col h-[92vh] shadow-2xl">
            {/* Header Modal */}
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <User size={14} className="text-emerald-500" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Expert Responsable : <span className="text-white">{agentResponsable}</span></p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  disabled={isExporting}
                  className="flex-1 md:flex-none bg-white text-black px-10 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
                >
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {isExporting ? "Traitement Images..." : "Télécharger Rapport PDF"}
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl transition-all">
                  <X size={24}/>
                </button>
              </div>
            </div>

            {/* Liste des Constats */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-white/[0.02] rounded-[3rem] overflow-hidden border border-white/5 flex flex-col md:flex-row hover:border-white/10 transition-all shadow-inner">
                  <div className="md:w-1/2 h-96 md:h-auto overflow-hidden">
                    <img src={p.url_image} className="w-full h-full object-cover" alt="Detail" />
                  </div>
                  <div className="p-12 md:w-1/2 flex flex-col justify-center space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                        <Clock size={16}/>
                      </div>
                      <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{new Date(p.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-2xl italic text-slate-100 leading-relaxed font-serif">
                      "{p.note_expert || "Aucune observation particulière notée sur ce point de contrôle."}"
                    </p>
                    <div className="pt-8 border-t border-white/5">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Statut : Conforme</p>
                    </div>
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