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

// Fonction pour convertir l'URL en Base64 (nécessaire pour le PDF)
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
  const [agentResponsable, setAgentResponsable] = useState<string>("Expert Prestige OS");
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
        if (staff) setAgentResponsable(staff.nom);

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

  // --- GÉNÉRATION DU PDF AVEC PHOTOS ET TEXTES CÔTE À CÔTE ---
  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT TECHNIQUE DU ${date.toUpperCase()}`, 14, 25);
    
    doc.setFontSize(10);
    doc.text(`Expert Responsable : ${agentResponsable}`, 130, 25);
    doc.text(`Villa : ${projet.nom_villa}`, 14, 33);

    // Préparation des données (conversion images)
    const tableBody = await Promise.all(dailyPhotos.map(async (p) => {
      try {
        const base64 = await getBase64ImageFromURL(p.url_image);
        return {
          img: base64,
          text: `HEURE DU CONSTAT : ${new Date(p.created_at).toLocaleTimeString()}\n\nOBSERVATIONS :\n${p.note_expert || "Aucune observation particulière."}\n\nSTATUT : CONFORME`,
        };
      } catch (e) {
        return { img: null, text: p.note_expert };
      }
    }));

    autoTable(doc, {
      startY: 50,
      head: [['APERÇU VISUEL', 'ANALYSE TECHNIQUE']],
      body: tableBody.map(row => ['', row.text]),
      styles: { minCellHeight: 60, valign: 'middle', fontSize: 10 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110 } },
      headStyles: { fillColor: [16, 185, 129] },
      didDrawCell: (data) => {
        // Dessiner l'image dans la première colonne
        if (data.section === 'body' && data.column.index === 0) {
          const imgData = tableBody[data.row.index].img;
          if (imgData) {
            doc.addImage(imgData, 'JPEG', data.cell.x + 2, data.cell.y + 5, 65, 50);
          }
        }
      },
    });

    doc.save(`Rapport_${projet.nom_villa}_${date}.pdf`);
    setIsExporting(false);
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
              <h1 className="text-xl font-black uppercase">Prestige OS</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Expert : {agentResponsable}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-2 text-slate-500 hover:text-white"><LogOut /></button>
        </div>

        {/* GRILLE PAR DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="h-48 relative">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="Day Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <h3 className="text-2xl font-bold text-white tracking-tighter">{date}</h3>
                </div>
              </div>
              <div className="p-6 flex justify-between items-center text-slate-400 group-hover:text-emerald-400">
                <span className="text-[10px] font-bold uppercase tracking-widest">Consulter les {groupedPhotos[date].length} rapports</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL : DÉTAIL D'UNE JOURNÉE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0F172A]">
              <div>
                <h2 className="text-3xl font-black text-white">{selectedDay}</h2>
                <p className="text-xs text-emerald-500 font-bold uppercase">Signé par {agentResponsable}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  disabled={isExporting}
                  className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} 
                  {isExporting ? "Traitement..." : "Générer PDF"}
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-2 text-slate-400 hover:text-white"><X size={28}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-white/5 rounded-3xl overflow-hidden border border-white/5 flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-64 md:h-auto"><img src={p.url_image} className="w-full h-full object-cover" /></div>
                  <div className="p-8 md:w-1/2 space-y-4">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                      <span className="flex items-center gap-2 text-emerald-500"><Clock size={14}/> {new Date(p.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-lg italic text-slate-200 leading-relaxed">"{p.note_expert || "RAS"}"</p>
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