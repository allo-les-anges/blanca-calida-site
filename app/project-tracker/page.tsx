"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Loader2, LogOut, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, FileText, Download, ShieldCheck, MapPin
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from "@/contexts/I18nContext";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function ProjectTracker() {
  const { t } = useTranslation();
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const NOM_AGENCE = t('projectTracker.agencyName');
  const BUREAU_ETUDE = t('projectTracker.department');
  const EXPERT_NOM = t('projectTracker.expertName');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedPin = localStorage.getItem("client_access_pin");
        if (!savedPin) { window.location.href = "/"; return; }

        const { data: projectData } = await supabase.from("suivi_chantier").select("*").eq("pin_code", savedPin).maybeSingle();
        
        if (projectData) {
          setProjet(projectData);
          const { data: docs } = await supabase.from("documents_projets").select("*").eq("projet_id", projectData.id);
          setDocuments(docs || []);
          const { data: ph } = await supabase.from("constats-photos").select("*").eq("id_projet", projectData.id).order("created_at", { ascending: false });
          setPhotos(ph || []);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
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
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // En-tête professionnel
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(NOM_AGENCE, 14, 20);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(BUREAU_ETUDE, 14, 26);
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.line(14, 32, 60, 32);

      // Infos dossier
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(t('projectTracker.reportRef', { ref: date.replace(/ /g, '') }), 140, 20);
      doc.setFont("helvetica", "normal");
      doc.text(t('projectTracker.visitDate', { date }), 140, 26);
      doc.text(t('projectTracker.phase', { phase: projet?.etape_actuelle || "N/A" }), 140, 32);

      // Destinataire
      doc.setFont("helvetica", "bold");
      doc.text(t('projectTracker.recipient'), 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`${projet?.client_prenom} ${projet?.client_nom}`, 14, 60);
      doc.text(t('projectTracker.project', { name: projet?.nom_villa }), 14, 65);

      // Expert référent
      doc.setFont("helvetica", "bold");
      doc.text(t('projectTracker.expert'), 110, 55);
      doc.setFont("helvetica", "normal");
      doc.text(EXPERT_NOM, 110, 60);

      // Préparation des données du tableau
      const bodyData = dailyPhotos.map((p, i) => {
        const rawNote = p.note_expert || t('projectTracker.defaultObservation');
        const cleanNote = rawNote
          .normalize("NFKD")
          .replace(/[^\x00-\x7F]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const analyse = t('projectTracker.statusConforme') + '\n\n' + cleanNote;
        return [
          t('projectTracker.photoRef', { num: i+1, lat: p.latitude || 'N/A', lng: p.longitude || 'N/A' }),
          analyse
        ];
      });

      // Tableau
      autoTable(doc, {
        startY: 75,
        head: [[t('projectTracker.photoHeader'), t('projectTracker.analysisHeader')]],
        body: bodyData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 120 }
        },
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'top'
        },
        margin: { left: 14, right: 14 }
      });

      // Annexe photo
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.text(t('projectTracker.photoAnnex'), 14, 20);

      let yPos = 30;
      for (let i = 0; i < dailyPhotos.length; i++) {
        const p = dailyPhotos[i];
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        try {
          doc.addImage(p.url_image, 'JPEG', 14, yPos, 120, 75);
        } catch (e) {
          doc.text(t('projectTracker.imageNotAvailable'), 14, yPos + 20);
        }
        doc.setFontSize(8);
        const text = t('projectTracker.imageCaption', { num: i+1, date: new Date(p.created_at).toLocaleString() });
        const lines = doc.splitTextToSize(text, 160);
        doc.text(lines, 14, yPos + 82);
        yPos += 95;
      }

      // Certification finale
      const finalY = doc.internal.pageSize.getHeight() - 40;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, finalY, pageWidth - 14, finalY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(t('projectTracker.certificationTitle'), 14, finalY + 10);
      doc.text(t('projectTracker.certificationText', { expert: EXPERT_NOM }), 14, finalY + 15);
      doc.text(t('projectTracker.certificationText2'), 14, finalY + 19);

      if (action === 'save') doc.save(`Rapport_Technique_${date}.pdf`);
      else window.open(doc.output('bloburl'), '_blank');
    } catch (e) {
      alert(t('projectTracker.pdfError'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#010101]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#010101] text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-[#171716] p-8 rounded-[2rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20"><HardHat className="text-black" /></div>
            <div>
              <h2 className="text-2xl font-black text-white">{NOM_AGENCE}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {t('projectTracker.phaseLabel')} <span className="text-emerald-500">{projet?.etape_actuelle}</span>
              </p>
            </div>
          </div>
          <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="text-slate-500 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
            <LogOut size={16}/> {t('projectTracker.quit')}
          </button>
        </header>

        {/* DOCUMENTS SECTION */}
        <section className="bg-[#171716]/50 p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">
            <FileText size={16}/> {t('projectTracker.documents')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <a key={doc.id} href={doc.url_fichier} target="_blank" className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                <span className="text-xs font-bold truncate pr-4">{doc.nom_fichier}</span>
                <Download size={18} className="text-slate-500 group-hover:text-emerald-500" />
              </a>
            ))}
          </div>
        </section>

        {/* LISTE DES RAPPORTS */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">
            <ShieldCheck size={16}/> {t('projectTracker.technicalReports')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#171716] rounded-[3rem] border border-white/5 overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all shadow-2xl">
                <div className="h-56 relative">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171716] to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <p className="text-white font-black text-2xl tracking-tighter">{date}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">{t('projectTracker.reportValidated')}</p>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase">{t('projectTracker.expertise')}</span>
                    <span className="text-xs text-slate-300 font-bold">{EXPERT_NOM}</span>
                  </div>
                  <ChevronRight className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODALE PRÉVISUALISATION */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#171716] w-full max-w-5xl rounded-[3rem] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{t('projectTracker.inspectionReport')}</span>
                <h3 className="text-3xl font-black text-white">{selectedDay}</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic">{t('projectTracker.phase', { phase: projet?.etape_actuelle })}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all text-xs font-black uppercase shadow-lg shadow-emerald-500/20">
                  <Printer size={16}/> {t('projectTracker.generateReport')}
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"><X size={24}/></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={24}/>
                 <p className="text-xs text-slate-300 leading-relaxed italic">
                   {t('projectTracker.certification')}
                 </p>
              </div>

              {groupedPhotos[selectedDay].map((p: any, i: number) => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <img src={p.url_image} className="w-full aspect-video object-cover" />
                  </div>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                       <MapPin size={14} className="text-emerald-500"/> {t('projectTracker.location', { lat: p.latitude, lng: p.longitude })}
                    </div>
                    <h4 className="text-sm font-black text-white uppercase">{t('projectTracker.observation', { num: i+1 })}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500 pl-4 italic">
                      "{p.note_expert || t('projectTracker.defaultObservation')}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D8C9B6; border-radius: 10px; }
      `}</style>
    </div>
  );
}
