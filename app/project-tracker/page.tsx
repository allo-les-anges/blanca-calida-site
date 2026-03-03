"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Download, Calendar, Loader2, FileText, LogOut,
  Clock, ShieldCheck, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, Globe, ExternalLink, Activity
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const CHANTIER_STEPS = [
  { id: 1, label: "Fondations" },
  { id: 2, label: "Gros Œuvre" },
  { id: 3, label: "Hors d'Eau" },
  { id: 4, label: "Finitions" },
  { id: 5, label: "Livraison" }
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

        // 1. Récupération du projet et de la progression
        const { data: projectData, error: pError } = await supabase
          .from("suivi_chantier")
          .select("*")
          .eq("pin_code", savedPin)
          .maybeSingle();
        
        if (projectData) {
          setProjet(projectData);

          // 2. Récupération du Staff ET de l'Agence (Jointure Profiles)
          const { data: staffData } = await supabase
            .from("staff_prestataires")
            .select(`
              nom,
              admin_id,
              profiles!inner (
                company_name
              )
            `)
            .eq("pin_code", savedPin)
            .maybeSingle();

          if (staffData) {
            setAgentResponsable(staffData.nom);
            // @ts-ignore
            const company = staffData.profiles?.company_name;
            if (company) setNomAgence(company);
          }

          // 3. Photos et Documents
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
        console.error("Erreur générale:", error);
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

  const handlePDFAction = async (date: string, dailyPhotos: any[], action: 'save' | 'print' | 'preview') => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const currentStepLabel = CHANTIER_STEPS.find(s => s.id === projet?.current_step)?.label || "N/A";
      
      // HEADER DESIGN
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 65, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(nomAgence.toUpperCase(), 14, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 255, 180); // Emerald color
      doc.text(`RAPPORT OFFICIEL DE SUIVI DE CHANTIER`, 14, 32);
      
      doc.setTextColor(200, 200, 200);
      doc.text(`PROJET : ${projet?.nom_villa || "Non spécifié"}`, 14, 45);
      doc.text(`EXPERT : ${agentResponsable}`, 14, 51);
      doc.text(`DATE DU RAPPORT : ${date}`, 14, 57);

      // BLOC PROGRESSION DANS LE PDF
      doc.setFillColor(30, 41, 59);
      doc.rect(140, 35, 55, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("PROGRESSION GLOBALE", 143, 41);
      doc.setFontSize(14);
      doc.text(`${projet?.progression_pourcentage || 0}%`, 143, 49);
      doc.setFontSize(7);
      doc.text(`ETAPE : ${currentStepLabel.toUpperCase()}`, 143, 54);

      const tableData = dailyPhotos.map((p) => ({
        time: new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        note: p.note_expert || "RAS - Conforme aux normes.",
        imageUrl: p.url_image
      }));

      autoTable(doc, {
        startY: 75,
        head: [['ANALYSE TECHNIQUE', 'PREUVE VISUELLE']],
        body: tableData.map(d => [`HEURE : ${d.time}\n\nOBSERVATION :\n${d.note}`, ""]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110, minCellHeight: 80 } },
        didDrawCell: (data) => {
          if (data.column.index === 1 && data.section === 'body') {
            const row = tableData[data.row.index];
            try {
              doc.addImage(row.imageUrl, 'JPEG', data.cell.x + 5, data.cell.y + 5, 100, 70, undefined, 'FAST');
            } catch (e) {
              doc.text("Image non disponible", data.cell.x + 5, data.cell.y + 10);
            }
          }
        }
      });

      if (action === 'save') {
        doc.save(`Rapport_${nomAgence}_${date}.pdf`);
      } else {
        const blob = doc.output('bloburl');
      window.location.href = blob.toString();
      }
    } catch (error) {
      alert("Erreur lors de la génération. Vérifiez la taille des photos.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617] gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Initialisation des données sécurisées...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER DYNAMIQUE */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-emerald-500 p-4 rounded-2xl">
              <HardHat className="text-black" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white">{nomAgence}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase">Expert référent : {agentResponsable}</p>
              </div>
            </div>
          </div>
          
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} className="inline mr-2" /> Déconnexion
          </button>
        </div>

        {/* PROGRESSION RÉELLE (Base de données) */}
        <div className="bg-[#0F172A] p-8 md:p-12 rounded-[3rem] border border-white/5">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Avancement du chantier</h3>
              <p className="text-3xl font-black text-white mt-2">{projet?.progression_pourcentage || 0}% <span className="text-emerald-500 text-sm">Terminé</span></p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-500">Étape actuelle</p>
                <p className="text-white font-bold">{CHANTIER_STEPS.find(s => s.id === projet?.current_step)?.label || "Initialisation"}</p>
            </div>
          </div>
          
          <div className="relative flex justify-between items-center max-w-4xl mx-auto">
            <div className="absolute h-[2px] w-full bg-slate-800 top-5 z-0" />
            <div 
                className="absolute h-[2px] bg-emerald-500 top-5 z-0 transition-all duration-1000" 
                style={{ width: `${((projet?.current_step - 1) / (CHANTIER_STEPS.length - 1)) * 100}%` }}
            />
            {CHANTIER_STEPS.map((step, index) => {
              const isPassed = index + 1 <= (projet?.current_step || 1);
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isPassed ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20" : "bg-slate-900 border-slate-800 text-slate-600"}`}>
                    {isPassed ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-bold">{step.id}</span>}
                  </div>
                  <span className={`mt-4 text-[8px] font-black uppercase tracking-widest text-center max-w-[70px] ${isPassed ? "text-white" : "text-slate-600"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRILLE DES RAPPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer">
              <div className="h-48 relative">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover" alt="Visite" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-5 left-6">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Rapport de visite</p>
                  <div className="text-white font-black text-xl">{date}</div>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center text-slate-500 group-hover:text-white">
                <span className="text-[9px] font-black uppercase">{groupedPhotos[date].length} Photos</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL RAPPORT (PDF) */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase mt-2">Document certifié par {nomAgence}</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button disabled={isProcessing} onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
                   <Eye size={16}/> Aperçu
                </button>
                <button disabled={isProcessing} onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'save')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
                   <Save size={16}/> PDF
                </button>
                <button disabled={isProcessing} onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'print')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
                   <Printer size={16}/> Imprimer
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
                  <img src={p.url_image} className="w-full aspect-video object-cover" />
                  <div className="p-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Note de l'expert ({new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</p>
                    <p className="text-sm text-slate-300 italic">"{p.note_expert || "Aucune observation."}"</p>
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