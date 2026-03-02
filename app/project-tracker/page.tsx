"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, 
  Loader2, FileText, LogOut,
  Clock, ShieldCheck, User, X, ChevronRight, MapPin, CheckCircle2
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- UTILITAIRE : CONVERSION IMAGE ---
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

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();

      if (projectData) {
        setProjet(projectData);
        // Récupération du nom de l'expert via le PIN
        const { data: staff } = await supabase.from("staff_prestataires").select("nom").eq("pin_code", savedPin).maybeSingle();
        if (staff) setAgentResponsable(staff.nom);

        const { data: ph } = await supabase.from("constats-photos").select("*").eq("id_projet", projectData.id).order("created_at", { ascending: false });
        if (ph) setPhotos(ph);

        // Sélection sécurisée des colonnes pour éviter l'erreur storage_path
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

  // --- GÉNÉRATION DU PDF EXPERT AVEC GÉOLOCALISATION ---
  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    // Header Style Bureau de Contrôle
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT TECHNIQUE GÉOLOCALISÉ`, 14, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`PROJET : ${projet.nom_villa.toUpperCase()}`, 14, 28);
    doc.text(`DATE DE VISITE : ${date.toUpperCase()}`, 14, 33);
    doc.text(`EXPERT RÉFÉRENT : ${agentResponsable}`, 130, 28);
    doc.text(`ID RAPPORT : #REF-${Math.floor(Math.random() * 10000)}`, 130, 33);

    const bodyData = await Promise.all(dailyPhotos.map(async (p) => {
      let b64 = "";
      try { b64 = await getBase64ImageFromURL(p.url_image); } catch (e) { console.error("Image error"); }
      return {
        remarque: `CONSTAT TECHNIQUE\n${new Date(p.created_at).toLocaleTimeString()}`,
        description: p.note_expert || "RAS : Conforme aux prescriptions.",
        gps: p.latitude && p.longitude ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : "Non spécifié",
        mapUrl: p.latitude && p.longitude ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}` : null,
        img: b64
      };
    }));

    autoTable(doc, {
      startY: 45,
      head: [['REMARQUE', 'DESCRIPTION, PHOTOS & GPS', 'VALIDATION']],
      body: bodyData.map(d => [d.remarque, "", "CONFORME"]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 5, valign: 'top' },
      columnStyles: { 
        0: { cellWidth: 35, fontStyle: 'bold' }, 
        1: { cellWidth: 125 }, 
        2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' } 
      },
      didParseCell: (data) => { if (data.section === 'body') data.cell.styles.minCellHeight = 100; },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const row = bodyData[data.row.index];
          // 1. Photo
          if (row.img) doc.addImage(row.img, 'JPEG', data.cell.x + 12, data.cell.y + 5, 100, 65);
          // 2. Texte de l'expert
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text(doc.splitTextToSize(`"${row.description}"`, 115), data.cell.x + 5, data.cell.y + 75);
          // 3. Coordonnées GPS
          doc.setFontSize(7);
          doc.setTextColor(100);
          doc.setFont("helvetica", "normal");
          doc.text(`LOCALISATION GPS : ${row.gps}`, data.cell.x + 5, data.cell.y + 92);
          // 4. Lien vers la carte
          if (row.mapUrl) {
            doc.setTextColor(0, 100, 255);
            doc.text("CONSULTER SUR GOOGLE MAPS", data.cell.x + 85, data.cell.y + 92);
            doc.link(data.cell.x + 85, data.cell.y + 89, 35, 5, { url: row.mapUrl });
          }
          doc.setTextColor(0);
        }
      }
    });

    // Signature en bas de page
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.text(`Fait à Marrakech, le ${new Date().toLocaleDateString()}`, 140, finalY);
    doc.text(`Signature de l'expert : ${agentResponsable}`, 140, finalY + 5);

    doc.save(`Rapport_Technique_${projet.nom_villa}_${date}.pdf`);
    setIsExporting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER PRINCIPAL */}
        <div className="flex justify-between items-center bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
              <HardHat className="text-black" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Prestige OS</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">Agent : {agentResponsable}</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }}
            className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"
          >
            <LogOut size={24} />
          </button>
        </div>

        {/* GRILLE DES RAPPORTS */}
        <div className="space-y-8">
           <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Calendar className="text-emerald-500" size={32} /> Archives des visites
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {Object.keys(groupedPhotos).map((date) => (
               <div 
                 key={date} 
                 onClick={() => setSelectedDay(date)} 
                 className="group bg-[#0F172A] rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xl"
               >
                 <div className="h-56 relative overflow-hidden">
                   <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                   <div className="absolute bottom-8 left-8">
                     <h3 className="text-2xl font-bold text-white tracking-tight">{date}</h3>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-2 inline-block">
                        {groupedPhotos[date].length} Points de contrôle
                     </span>
                   </div>
                 </div>
                 <div className="p-8 flex justify-between items-center text-slate-400 group-hover:text-white transition-colors">
                   <span className="text-[11px] font-black uppercase tracking-widest">Ouvrir le dossier technique</span>
                   <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* SECTION DOCUMENTS RÉGLEMENTAIRES */}
        <div className="bg-[#0F172A] p-12 rounded-[4rem] border border-white/5 shadow-inner">
           <div className="flex items-center gap-4 mb-10">
              <ShieldCheck className="text-emerald-500" size={28} />
              <h3 className="text-sm font-black uppercase text-white tracking-[0.2em]">Coffre-fort numérique du projet</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
                  <div className="flex items-center gap-4 truncate">
                    <FileText className="text-emerald-500 shrink-0" size={20} />
                    <span className="text-[12px] font-bold truncate text-slate-300 group-hover:text-white">{doc.nom_fichier}</span>
                  </div>
                  <Download size={18} className="text-slate-600 group-hover:text-emerald-500 shrink-0" />
                </a>
              ))}
              {documents.length === 0 && <p className="text-slate-500 italic text-sm">Aucun document administratif disponible.</p>}
           </div>
        </div>
      </div>

      {/* MODAL D'EXPERTISE DÉTAILLÉE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[4rem] border border-white/10 overflow-hidden flex flex-col h-[92vh] shadow-2xl relative">
            
            {/* Header Modal */}
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[#0F172A]">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Expertise certifiée par {agentResponsable}</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  disabled={isExporting}
                  className="flex-1 md:flex-none bg-white text-black px-10 py-5 rounded-2xl text-[12px] font-black uppercase flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                  {isExporting ? "Extraction des données..." : "Générer Rapport PDF"}
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-5 bg-white/5 text-slate-500 hover:text-white rounded-2xl transition-all">
                  <X size={28}/>
                </button>
              </div>
            </div>

            {/* Corps Modal */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-black/20 rounded-[3rem] overflow-hidden border border-white/5 flex flex-col md:flex-row hover:border-emerald-500/20 transition-all">
                  <div className="md:w-1/2 h-[450px] md:h-auto overflow-hidden relative">
                    <img src={p.url_image} className="w-full h-full object-cover" alt="Detail" />
                    {p.latitude && (
                       <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Position GPS Capturée</span>
                       </div>
                    )}
                  </div>
                  <div className="p-12 md:w-1/2 flex flex-col justify-center space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/10">
                        <Clock size={20}/>
                      </div>
                      <span className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(p.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-3xl italic text-slate-100 leading-tight font-serif pr-4">
                      "{p.note_expert || "RAS"}"
                    </p>
                    <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={14} /> Expertise Validée
                       </span>
                       <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Prestige OS Secure</span>
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