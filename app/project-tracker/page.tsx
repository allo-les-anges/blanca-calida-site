"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Loader2, LogOut, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, FileText, Download, MapPin
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

const CHANTIER_STEPS = [
  "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
  "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
  "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
  "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", "12. Remise des clés"
];

export default function ProjectTracker() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const NOM_AGENCE = "AMARU-HOMES";
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
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(NOM_AGENCE, 14, 25);
      doc.setFontSize(10);
      doc.text(`Expert : ${EXPERT_NOM}`, 14, 35);
      doc.text(`Date : ${date}`, 14, 42);
      doc.text(`Projet : ${projet?.nom_villa}`, 14, 49);

      let yPos = 70;
      dailyPhotos.forEach((p) => {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.addImage(p.url_image, 'JPEG', 14, yPos, 100, 65);
        yPos += 75;
        doc.setTextColor(50, 50, 50);
        doc.text(`Observation : ${p.note_expert || "Conforme"}`, 14, yPos);
        yPos += 20;
      });

      if (action === 'save') doc.save(`Rapport_${date}.pdf`);
      else window.open(doc.output('bloburl'), '_blank');
    } catch (e) { alert("Erreur génération PDF"); } finally { setIsProcessing(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-[#0F172A] p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-4 rounded-2xl"><HardHat className="text-black" /></div>
            <div>
              <h2 className="text-2xl font-black text-white">{NOM_AGENCE}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Client : {projet?.client_prenom} {projet?.client_nom}</p>
            </div>
          </div>
          <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="text-red-500 font-bold text-xs uppercase tracking-widest">Déconnexion</button>
        </header>

        {/* SECTION DOCUMENTS (Vérifiée présente) */}
        <section className="bg-[#0F172A]/50 p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">
            <FileText size={16}/> Documents Administratifs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length > 0 ? documents.map((doc) => (
              <a key={doc.id} href={doc.url_fichier} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-emerald-500/10 transition-all">
                <span className="text-xs font-bold truncate pr-4">{doc.nom_fichier}</span>
                <Download size={16} className="text-emerald-500" />
              </a>
            )) : <p className="text-slate-600 text-xs italic uppercase">Aucun document disponible</p>}
          </div>
        </section>

        {/* SECTION RAPPORTS */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">Rapports de visite</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all">
                <div className="h-56 relative">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white font-black text-xl">{date}</div>
                </div>
                <div className="p-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{groupedPhotos[date].length} Photos</span>
                  <ChevronRight className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODALE PRÉVISUALISATION */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-4xl rounded-[3rem] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white">{selectedDay}</h3>
              <div className="flex gap-3">
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="p-3 bg-white/5 rounded-xl hover:bg-emerald-500 transition-all"><Eye size={18}/></button>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/10 rounded-xl"><X size={18}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {groupedPhotos[selectedDay].map((p: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-[2rem] overflow-hidden border border-white/5">
                  <img src={p.url_image} className="w-full aspect-video object-cover" />
                  <div className="p-6">
                    <p className="text-[10px] text-emerald-500 font-black uppercase mb-2">Commentaire</p>
                    <p className="text-slate-300 italic text-sm">"{p.note_expert || "RAS"}"</p>
                    {p.latitude && <p className="text-[9px] text-slate-500 mt-4 uppercase">Position GPS : {p.latitude}, {p.longitude}</p>}
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