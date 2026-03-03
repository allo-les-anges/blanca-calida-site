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

// Vos 13 phases exactes
const CHANTIER_STEPS = [
  "0. Signature & Réservation", "1. Terrain / Terrassement", "2. Fondations", 
  "3. Murs / Élévation", "4. Toiture / Charpente", "5. Menuiseries", 
  "6. Électricité / Plomberie", "7. Isolation", "8. Plâtrerie", 
  "9. Sols & Carrelages", "10. Peintures / Finitions", "11. Extérieurs / Jardin", "12. Remise des clés"
];

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [agentResponsable, setAgentResponsable] = useState<string>("Expert Amaru-Homes");
  const [nomAgence, setNomAgence] = useState<string>("Amaru-Homes");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedPin = localStorage.getItem("client_access_pin");
        if (!savedPin) { window.location.href = "/"; return; }

        // 1. Récupération des infos du projet (Table: suivi_chantier)
        const { data: projectData } = await supabase
          .from("suivi_chantier")
          .select("id, client_nom, client_prenom, nom_villa, etape_actuelle, progression_pourcentage, pin_code")
          .eq("pin_code", savedPin)
          .maybeSingle();
        
        if (projectData) {
          setProjet(projectData);

          // 2. Récupération de l'Expert (Table: staff_prestataires)
          const { data: staffData } = await supabase
            .from("staff_prestataires")
            .select("prenom, nom")
            .eq("pin_code", savedPin) // On lie par le code PIN commun
            .maybeSingle();

          if (staffData) {
            setAgentResponsable(`${staffData.prenom} ${staffData.nom}`);
          }

          // 3. Récupération de l'Agence (Table: profiles)
          const { data: profileData } = await supabase
            .from("profiles")
            .select("company_name")
            .eq("role", "admin") // Ou adapter selon votre admin principal
            .limit(1)
            .maybeSingle();
          
          if (profileData?.company_name) setNomAgence(profileData.company_name);

          // 4. Récupération des Photos (Table: constats-photos)
          const { data: ph } = await supabase.from("constats-photos")
            .select("*")
            .eq("id_projet", projectData.id)
            .order("created_at", { ascending: false });
          if (ph) setPhotos(ph);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Groupement des photos par jour
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

  // Calcul de l'index pour la barre de progression
  const currentStepIndex = useMemo(() => {
    if (!projet?.etape_actuelle) return 0;
    const index = CHANTIER_STEPS.findIndex(s => s.includes(projet.etape_actuelle));
    return index !== -1 ? index : 0;
  }, [projet]);

  const handlePDFAction = async (date: string, dailyPhotos: any[], action: 'save' | 'print' | 'preview') => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 65, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(nomAgence.toUpperCase(), 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 255, 180);
      doc.text(`RAPPORT DE SUIVI TECHNIQUE - ${projet?.nom_villa}`, 14, 32);
      
      doc.setTextColor(200, 200, 200);
      doc.text(`CLIENT : ${projet?.client_prenom} ${projet?.client_nom}`, 14, 45);
      doc.text(`EXPERT : ${agentResponsable}`, 14, 51);
      doc.text(`DATE : ${date}`, 14, 57);

      const tableData = dailyPhotos.map((p) => ({
        time: new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        note: p.note_expert || "Analyse conforme aux standards de qualité.",
        imageUrl: p.url_image
      }));

      autoTable(doc, {
        startY: 75,
        head: [['ANALYSE EXPERT', 'VISUEL']],
        body: tableData.map(d => [`HEURE : ${d.time}\n\nOBSERVATION :\n${d.note}`, ""]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110, minCellHeight: 80 } },
        didDrawCell: (data) => {
          if (data.column.index === 1 && data.section === 'body') {
            const row = tableData[data.row.index];
            try {
              doc.addImage(row.imageUrl, 'JPEG', data.cell.x + 5, data.cell.y + 5, 100, 70);
            } catch (e) { doc.text("Image non disponible", data.cell.x + 5, data.cell.y + 10); }
          }
        }
      });

      if (action === 'save') doc.save(`Rapport_${date}.pdf`);
      else window.location.href = doc.output('bloburl').toString();
      
    } catch (e) { alert("Erreur PDF"); } finally { setIsProcessing(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER DYNAMIQUE */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-500 p-4 rounded-2xl"><HardHat className="text-black" size={28} /></div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase">{nomAgence}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                Suivi pour : {projet?.client_prenom} {projet?.client_nom} — {projet?.nom_villa}
              </p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            Déconnexion
          </button>
        </div>

        {/* PROGRESSION (Correction phases) */}
        <div className="bg-[#0F172A] p-8 md:p-12 rounded-[3rem] border border-white/5">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-500">Progression Immobilière</h3>
              <p className="text-3xl font-black text-white mt-2">{projet?.progression_pourcentage || 0}%</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-500">Expert en charge</p>
                <p className="text-emerald-500 font-bold">{agentResponsable}</p>
            </div>
          </div>
          
          <div className="relative flex justify-between items-center overflow-x-auto pb-8 custom-scrollbar">
            <div className="min-w-[1400px] relative flex justify-between items-center px-4">
                <div className="absolute h-[2px] w-[96%] bg-slate-800 top-5 left-8 z-0" />
                <div 
                    className="absolute h-[2px] bg-emerald-500 top-5 left-8 z-0 transition-all duration-1000" 
                    style={{ width: `${(currentStepIndex / (CHANTIER_STEPS.length - 1)) * 96}%` }}
                />
                {CHANTIER_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStepIndex;
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center px-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isPassed ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20" : "bg-slate-900 border-slate-800 text-slate-600"}`}>
                        {isPassed ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-bold">{idx}</span>}
                      </div>
                      <span className={`mt-4 text-[7px] font-black uppercase w-24 text-center leading-tight ${isPassed ? "text-white" : "text-slate-600"}`}>{step}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* GRILLE RAPPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(groupedPhotos).length > 0 ? Object.keys(groupedPhotos).map((date) => (
            <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer">
              <div className="h-48 relative">
                <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover" alt="Visite" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                <div className="absolute bottom-5 left-6">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Rapport technique</p>
                  <div className="text-white font-black text-xl">{date}</div>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center text-slate-500 group-hover:text-white">
                <span className="text-[9px] font-black uppercase">{groupedPhotos[date].length} Photos d'inspection</span>
                <ChevronRight size={14} />
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-[#0F172A] rounded-[2.5rem] border border-dashed border-white/10">
              <Activity className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Aucune photo pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL & STYLE ... (Identiques au précédent) */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-5xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase mt-2">Dossier technique de {nomAgence}</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-3 gap-4 p-8 bg-white/[0.02]">
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all"><Eye size={16}/> Aperçu</button>
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'save')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-4 rounded-xl flex items-center justify-center gap-2 text-[10px) font-black uppercase transition-all"><Save size={16}/> Télécharger</button>
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'print')} className="bg-white/5 hover:bg-emerald-500 hover:text-black p-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all"><Printer size={16}/> Imprimer</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
              {groupedPhotos[selectedDay].map((p: any) => (
                <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                  <img src={p.url_image} className="w-full aspect-video object-cover" />
                  <div className="p-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Observation Expert</p>
                    <p className="text-sm text-slate-300 italic">"{p.note_expert || "RAS - Conforme."}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
}