"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, Loader2, FileText, LogOut,
  Clock, ShieldCheck, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, Globe, ExternalLink
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Correction 1 : Sécurisation de l'initialisation Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [documents, setDocuments] = useState<any[]>([]);
  const [agentResponsable, setAgentResponsable] = useState<string>("Expert en charge");
  const [nomAgence, setNomAgence] = useState<string>("Agence Partenaire");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedPin = localStorage.getItem("client_access_pin");
        if (!savedPin) { window.location.href = "/"; return; }

        const { data: projectData } = await supabase
          .from("suivi_chantier")
          .select("*")
          .eq("pin_code", savedPin)
          .maybeSingle();
        
        if (projectData) {
          setProjet(projectData);

          const { data: staff } = await supabase
            .from("staff_prestataires")
            .select(`
              nom,
              profiles:admin_id (company_name)
            `)
            .eq("pin_code", savedPin)
            .maybeSingle();

          if (staff) {
            setAgentResponsable(staff.nom);
            // @ts-ignore
            const company = staff.profiles?.company_name;
            if (company) setNomAgence(company);
          }

          const { data: ph } = await supabase.from("constats-photos")
            .select("*")
            .eq("id_projet", projectData.id)
            .order("created_at", { ascending: false });
          if (ph) setPhotos(ph);

          const { data: docs } = await supabase.from("documents_projets")
            .select("id, nom_fichier, url_fichier")
            .eq("projet_id", projectData.id);
          if (docs) setDocuments(docs);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc: any, photo: any) => {
      const date = new Date(photo.created_at).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  // Correction 2 : Gestion optimisée du PDF pour Mobile/iOS
  const handlePDFAction = async (date: string, dailyPhotos: any[], action: 'save' | 'print' | 'preview') => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 55, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(nomAgence.toUpperCase(), 14, 22);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`RAPPORT DE SUIVI TECHNIQUE`, 14, 30);
      doc.setTextColor(150, 150, 150);
      doc.text(`PROJET : ${projet?.nom_villa || "Villa Client"}`, 14, 38);
      doc.text(`EXPERT RÉFÉRENT : ${agentResponsable}`, 14, 44);
      doc.text(`DATE DE VISITE : ${date}`, 150, 44);

      const tableData = dailyPhotos.map((p) => ({
        time: new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        note: p.note_expert || "RAS - Conforme aux normes.",
        imageUrl: p.url_image
      }));

      autoTable(doc, {
        startY: 60,
        head: [['ANALYSE EXPERTISE', 'CONSTAT PHOTO']],
        body: tableData.map(d => [`OBSERVATION (${d.time}) :\n\n${d.note}`, ""]),
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], fontSize: 10 },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110, minCellHeight: 80 } },
        didDrawCell: (data) => {
          if (data.column.index === 1 && data.section === 'body') {
            try {
              const row = tableData[data.row.index];
              // On force le format JPEG et on réduit un peu la qualité si besoin
              doc.addImage(row.imageUrl, 'JPEG', data.cell.x + 5, data.cell.y + 5, 100, 70, undefined, 'FAST');
            } catch (e) {
              console.warn("Image impossible à charger dans le PDF");
            }
          }
        }
      });

      if (action === 'save') {
        doc.save(`${nomAgence}_${date}.pdf`);
      } else {
        // Correction iOS : On utilise le flux direct au lieu de window.open qui est bloqué
        const blob = doc.output('bloburl');
        window.location.href = blob; 
      }
    } catch (error) {
      console.error("Erreur PDF:", error);
      alert("Erreur lors de la génération du document. Les photos sont peut-être trop lourdes pour la mémoire du téléphone.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617] gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Sécurisation de la connexion...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12 text-left font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
              <HardHat className="text-black" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                {nomAgence}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Expert : {agentResponsable}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 relative z-10">
            <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="flex items-center gap-3 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/10">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>

        {/* PROGRESSION */}
        <div className="bg-[#0F172A] p-8 md:p-12 rounded-[3rem] border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 text-center">État d'avancement du projet</h3>
          <div className="relative flex justify-between items-center max-w-4xl mx-auto">
            <div className="absolute h-[2px] w-full bg-slate-800 top-5 z-0" />
            {CHANTIER_STEPS.map((step, index) => {
              const isPassed = index + 1 <= (projet?.current_step || 1);
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isPassed ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30 text-black" : "bg-slate-900 border-slate-800 text-slate-600"}`}>
                    {isPassed ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-bold">{step.id}</span>}
                  </div>
                  <span className={`mt-4 text-[8px] font-black uppercase tracking-widest text-center max-w-[60px] leading-tight ${isPassed ? "text-white" : "text-slate-600"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRILLE DES RAPPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/30 hover:translate-y-[-4px] transition-all cursor-pointer">
              <div className="h-48 relative">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Visite" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent" />
                <div className="absolute bottom-5 left-6">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Rapport de visite</p>
                  <div className="text-white font-black text-xl tracking-tight">{date}</div>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center text-slate-500 group-hover:text-white transition-colors">
                <span className="text-[9px] font-black uppercase tracking-widest">{groupedPhotos[date].length} Photos réalisées</span>
                <div className="bg-white/5 p-2 rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DOCUMENTS */}
        <div className="bg-[#0F172A] p-10 rounded-[3rem] border border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <ShieldCheck className="text-emerald-500" size={20} />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Coffre-fort Documents</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length > 0 ? documents.map((doc) => (
              <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/20 transition-all group">
                <div className="flex items-center gap-3 truncate">
                  <FileText className="text-slate-500 group-hover:text-emerald-500" size={18} />
                  <span className="text-[10px] font-bold truncate text-slate-400 group-hover:text-white uppercase tracking-tight">{doc.nom_fichier}</span>
                </div>
                <Download size={14} className="text-slate-600 group-hover:text-white" />
              </a>
            )) : (
              <div className="col-span-full py-10 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-slate-600 italic text-xs">Aucun document administratif disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh] shadow-3xl">
            <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                    <CheckCircle2 size={14}/> Rapport certifié par {nomAgence}
                  </p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 transition-colors"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  disabled={isProcessing}
                  onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} 
                  className="bg-white/5 hover:bg-emerald-500 hover:text-black p-5 rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Eye size={18} />} Aperçu
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'save')} 
                  className="bg-white/5 hover:bg-emerald-500 hover:text-black p-5 rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  <Save size={18} /> Télécharger
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'print')} 
                  className="bg-white/5 hover:bg-emerald-500 hover:text-black p-5 rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  <Printer size={18} /> Imprimer
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden group">
                  <div className="aspect-video relative">
                    <img src={p.url_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                      {new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Note de l'expert</p>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{p.note_expert || "Aucune observation particulière."}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
      `}</style>
    </div>
  );
}