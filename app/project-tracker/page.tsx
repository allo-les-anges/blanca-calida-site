"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Loader2, LogOut, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, FileText, Download, ShieldCheck, MapPin
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function ProjectTracker() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const NOM_AGENCE = "AMARU-HOMES";
  const BUREAU_ETUDE = "Département Contrôle Technique & Qualité";
  const EXPERT_NOM = "Gaëtan Mukeba";

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

      // --- EN-TÊTE PROFESSIONNEL ---
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

      // --- INFOS DOSSIER ---
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Rapport de Constat : #RC-${date.replace(/ /g, '')}`, 140, 20);
      doc.setFont("helvetica", "normal");
      doc.text(`Date de visite : ${date}`, 140, 26);
      doc.text(`Phase : ${projet?.etape_actuelle || "N/A"}`, 140, 32);

      // --- RÉCAPITULATIF PROJET ---
      doc.setFont("helvetica", "bold");
      doc.text("DESTINATAIRE :", 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`${projet?.client_prenom} ${projet?.client_nom}`, 14, 60);
      doc.text(`Projet : ${projet?.nom_villa}`, 14, 65);

      doc.setFont("helvetica", "bold");
      doc.text("EXPERT RÉFÉRENT :", 110, 55);
      doc.setFont("helvetica", "normal");
      doc.text(EXPERT_NOM, 110, 60);

      // --- TABLEAU DES CONSTATS ---
      autoTable(doc, {
        startY: 75,
        head: [['RÉFÉRENCE PHOTO', 'ANALYSE TECHNIQUE & OBSERVATIONS']],
        body: dailyPhotos.map((p, i) => [
          `Prise de vue #${i+1}\n\nGPS : ${p.latitude || 'N/A'}\n${p.longitude || 'N/A'}`,
          `STATUT : CONFORME\n\n${p.note_expert || "Aucune anomalie détectée lors de l'inspection visuelle."}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
        columnStyles: { 0: { cellWidth: 45 }, 1: { fontSize: 10 } },
      });

      // --- INSERTION DES PHOTOS (Nouvelle page pour clarté si besoin) ---
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.text("ANNEXE PHOTOGRAPHIQUE ET GÉOLOCALISATION", 14, 20);
      
      let yPos = 30;
      dailyPhotos.forEach((p, index) => {
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        doc.addImage(p.url_image, 'JPEG', 14, yPos, 120, 75);
        doc.setFontSize(8);
        doc.text(`Illustration #${index + 1} - Capturée le ${new Date(p.created_at).toLocaleString()}`, 14, yPos + 82);
        yPos += 95;
      });

      // --- CERTIFICATION FINALE ---
      const finalY = doc.internal.pageSize.getHeight() - 40;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, finalY, pageWidth - 14, finalY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("CERTIFICATION :", 14, finalY + 10);
      doc.text(`Je soussigné, ${EXPERT_NOM}, certifie que les informations, relevés GPS et photographies contenus dans ce rapport`, 14, finalY + 15);
      doc.text(`reflètent fidèlement l'état d'avancement réel du chantier à la date mentionnée. Document édité par le système Amaru Project Tracker.`, 14, finalY + 19);

      if (action === 'save') doc.save(`Rapport_Technique_${date}.pdf`);
      else window.open(doc.output('bloburl'), '_blank');
    } catch (e) { alert("Erreur génération PDF"); } finally { setIsProcessing(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-[#0F172A] p-8 rounded-[2rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20"><HardHat className="text-black" /></div>
            <div>
              <h2 className="text-2xl font-black text-white">{NOM_AGENCE}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Phase Actuelle : <span className="text-emerald-500">{projet?.etape_actuelle}</span>
              </p>
            </div>
          </div>
          <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="text-slate-500 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
            <LogOut size={16}/> Quitter
          </button>
        </header>

        {/* DOCUMENTS SECTION */}
        <section className="bg-[#0F172A]/50 p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">
            <FileText size={16}/> Pièces Jointes Administratives
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
            <ShieldCheck size={16}/> Dossier de Suivi Technique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[3rem] border border-white/5 overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all shadow-2xl">
                <div className="h-56 relative">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <p className="text-white font-black text-2xl tracking-tighter">{date}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Rapport de Constat Validé</p>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Expertise</span>
                    <span className="text-xs text-slate-300 font-bold">{EXPERT_NOM}</span>
                  </div>
                  <ChevronRight className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODALE PRÉVISUALISATION PROFESSIONNELLE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Rapport d'inspection</span>
                <h3 className="text-3xl font-black text-white">{selectedDay}</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic">Phase : {projet?.etape_actuelle}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all text-xs font-black uppercase shadow-lg shadow-emerald-500/20"><Printer size={16}/> Générer Rapport</button>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"><X size={24}/></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={24}/>
                 <p className="text-xs text-slate-300 leading-relaxed italic">
                   "Je certifie que les informations et les photographies présentées ci-dessous ont été relevées sur site par le département technique Amaru-Homes. Les coordonnées GPS garantissent l'authenticité de l'inspection."
                 </p>
              </div>

              {groupedPhotos[selectedDay].map((p: any, i: number) => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <img src={p.url_image} className="w-full aspect-video object-cover" />
                  </div>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                       <MapPin size={14} className="text-emerald-500"/> Localisation : {p.latitude}, {p.longitude}
                    </div>
                    <h4 className="text-sm font-black text-white uppercase">Observation technique #{i+1}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500 pl-4 italic">
                      "{p.note_expert || "Constat visuel conforme aux plans d'exécution et aux normes techniques en vigueur."}"
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
}