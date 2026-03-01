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

// Fonction de conversion Image URL -> Base64 pour inclusion PDF
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
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // Qualité 0.7 pour éviter un PDF trop lourd
    };
    img.onerror = (error) => reject(error);
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

      // 1. Charger le projet
      const { data: projectData } = await supabase
        .from("suivi_chantier")
        .select("*")
        .eq("pin_code", savedPin)
        .maybeSingle();

      if (projectData) {
        setProjet(projectData);

        // 2. EXTRACTION DU NOM (Lien PIN -> Agent)
        const { data: staffData } = await supabase
          .from("staff_prestataires")
          .select("nom")
          .eq("pin_code", savedPin)
          .maybeSingle();
        
        setAgentResponsable(staffData?.nom || "Expert Technique");

        // 3. Charger les constats
        const { data: ph } = await supabase
          .from("constats-photos")
          .select("*")
          .eq("id_projet", projectData.id)
          .order("created_at", { ascending: false });
        if (ph) setPhotos(ph);

        // 4. Charger documents (Sécurisé sans colonnes manquantes)
        const { data: doc } = await supabase
          .from("documents_projets")
          .select("id, nom_fichier, url_fichier")
          .eq("projet_id", projectData.id);
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

  // --- GÉNÉRATION DU PDF OPTIMISÉE (STYLE BUREAU D'ÉTUDE) ---
  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    // Header Style Épuré
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT DE VISITE DE CHANTIER`, 14, 15);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`PROJET : ${projet.nom_villa.toUpperCase()}`, 14, 23);
    doc.text(`DATE DU RAPPORT : ${date}`, 14, 28);
    doc.text(`EXPERT : ${agentResponsable}`, 130, 23);
    doc.text(`DOCUMENT RÉF : #REV-${new Date().getTime().toString().slice(-5)}`, 130, 28);

    // Préparation des données pour le tableau
    const bodyData = await Promise.all(dailyPhotos.map(async (p) => {
      let base64 = null;
      try { base64 = await getBase64ImageFromURL(p.url_image); } catch (e) { console.error(e); }
      return {
        remarque: `CONSTAT TECHNIQUE\n${new Date(p.created_at).toLocaleTimeString()}`,
        description: p.note_expert || "Observations : Conforme aux plans d'exécution.",
        responsable: agentResponsable,
        img: base64
      };
    }));

    autoTable(doc, {
      startY: 40,
      head: [['REMARQUE', 'DESCRIPTION & PHOTOS', 'RESPONSABLE']],
      body: bodyData.map(d => [d.remarque, d.description, d.responsable]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 5, valign: 'top' },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 110 },
        2: { cellWidth: 40, halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'body') { data.cell.styles.minCellHeight = 85; }
      },
      willDrawCell: (data) => {
        // Insertion de la photo sous le texte dans la colonne Description
        if (data.column.index === 1 && data.section === 'body') {
          const rowData = bodyData[data.row.index];
          if (rowData.img) {
            doc.addImage(rowData.img, 'JPEG', data.cell.x + 5, data.cell.y + 18, 100, 60);
          }
        }
      }
    });

    doc.save(`Rapport_${projet.nom_villa}_${date}.pdf`);
    setIsExporting(false);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Sécurisation de la session...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-[#0F172A] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl"><HardHat className="text-black" /></div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Prestige OS</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Responsable : {agentResponsable}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <LogOut size={20} className="text-slate-400" />
          </button>
        </div>

        {/* GRILLE PAR DATE */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
             <Calendar className="text-emerald-500" size={24} /> Historique des visites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xl">
                <div className="h-48 relative overflow-hidden">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-2xl font-bold text-white tracking-tighter">{date}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{groupedPhotos[date].length} Constats photos</p>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center text-slate-400 group-hover:text-white transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ouvrir le dossier technique</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION DOCUMENTS */}
        <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5">
           <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 text-white">
              <ShieldCheck size={18} className="text-emerald-500"/> Documents Certifiés du Projet
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all group">
                  <span className="text-[11px] font-bold truncate pr-4">{doc.nom_fichier}</span>
                  <Download size={14} className="text-slate-500 group-hover:text-emerald-500" />
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL : DÉTAIL D'UNE JOURNÉE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0F172A]">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <p className="text-xs text-emerald-500 font-bold uppercase">Expert Responsable : {agentResponsable}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  disabled={isExporting}
                  className="bg-white text-black px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                  {isExporting ? "Génération en cours..." : "Télécharger le Rapport PDF"}
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-3 text-slate-400 hover:text-white bg-white/5 rounded-2xl"><X size={24}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col md:flex-row shadow-2xl">
                  <div className="md:w-1/2 h-80 md:h-auto"><img src={p.url_image} className="w-full h-full object-cover" /></div>
                  <div className="p-10 md:w-1/2 space-y-6">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                      <span className="flex items-center gap-2"><Clock size={14} className="text-emerald-500"/> Visite de {new Date(p.created_at).toLocaleTimeString()}</span>
                      <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/10">Expertise Validée</span>
                    </div>
                    <p className="text-xl italic text-slate-200 leading-relaxed font-medium">"{p.note_expert || "Aucun commentaire technique saisi pour ce constat."}"</p>
                    <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold text-xs">{agentResponsable.charAt(0)}</div>
                        <div>
                            <p className="text-[10px] font-bold text-white uppercase">{agentResponsable}</p>
                            <p className="text-[9px] text-slate-500 uppercase">Expert Technique</p>
                        </div>
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