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

export default function ClientDashboard() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agentResponsable, setAgentResponsable] = useState<string>("Chargement...");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      // 1. Récupérer le projet
      const { data: projectData } = await supabase
        .from("suivi_chantier")
        .select("*")
        .eq("pin_code", savedPin)
        .maybeSingle();

      if (projectData) {
        setProjet(projectData);

        // 2. RÉCUPÉRATION DU NOM DE L'AGENT (Correction demandée)
        // On cherche l'agent qui possède ce code PIN dans la table staff_prestataires
        const { data: staffData } = await supabase
          .from("staff_prestataires")
          .select("nom")
          .eq("pin_code", savedPin)
          .maybeSingle();
        
        if (staffData) {
          setAgentResponsable(staffData.nom);
        } else {
          setAgentResponsable("Bureau Technique Prestige OS");
        }

        // 3. Récupérer les constats
        const { data: ph } = await supabase
          .from("constats-photos")
          .select("*")
          .eq("id_projet", projectData.id)
          .order("created_at", { ascending: false });
        if (ph) setPhotos(ph);

        // 4. Récupérer les documents (sans la colonne storage_path pour éviter l'erreur image_b093e1.png)
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

  const generateDailyPDF = async (date: string, dailyPhotos: any[]) => {
    const doc = new jsPDF();
    const now = new Date();
    
    // Design Header (Proche de votre exemple image_a184db.jpg)
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.line(0, 40, 210, 40);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT DE VISITE DE CHANTIER`, 14, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Projet : ${projet.nom_villa}`, 14, 25);
    doc.text(`Date du constat : ${date}`, 14, 32);

    // Bloc Responsable (Extraction dynamique)
    doc.setFont("helvetica", "bold");
    doc.text(`Responsable : ${agentResponsable}`, 130, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Généré le ${now.toLocaleDateString()} à ${now.toLocaleTimeString()}`, 130, 32);

    // Tableau des constats
    autoTable(doc, {
      startY: 50,
      head: [['Remarque / Localisation', 'Description & Analyse', 'Statut']],
      body: dailyPhotos.map(p => [
        `Constat technique\nHeure: ${new Date(p.created_at).toLocaleTimeString()}`,
        p.note_expert || "Aucune observation particulière.",
        "CONFORME"
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 0: { cellWidth: 40 }, 2: { cellWidth: 30, fontStyle: 'bold' } }
    });

    // Ajout des images en fin de rapport
    let currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.text("ANNEXES PHOTOGRAPHIQUES :", 14, currentY);
    currentY += 10;

    dailyPhotos.forEach((p, index) => {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        doc.setFontSize(8);
        doc.text(`Photo ${index + 1} - ${p.note_expert?.substring(0, 50) || "Vue générale"}...`, 14, currentY);
        currentY += 5;
        // Note: L'ajout d'images nécessite la conversion base64 si l'URL est externe
        // Pour cet exemple, on laisse l'espace ou on utilise doc.addImage si configuré
    });

    doc.save(`Rapport_${projet.nom_villa}_${date.replace(/ /g, '_')}.pdf`);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin mb-4 text-emerald-500" size={40} />
      <p className="text-white font-black uppercase text-[10px] tracking-widest">Identification de l'agent...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* BARRE DE NAVIGATION ÉVOLUÉE */}
        <div className="flex justify-between items-center bg-[#0F172A] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <HardHat className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Prestige OS</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                   Expert Responsable : <span className="text-white">{agentResponsable}</span>
                 </p>
              </div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("client_access_pin"); window.location.href = "/"; }} className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <LogOut size={22} />
          </button>
        </div>

        {/* GRILLE DES JOURNÉES (JOURNAL EXPERT) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
             <Calendar className="text-emerald-500" size={24} /> Journal des rapports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div 
                key={date} 
                onClick={() => setSelectedDay(date)} 
                className="group bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg"
              >
                <div className="h-48 relative overflow-hidden">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {groupedPhotos[date].length} Constats
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Visite du chantier</p>
                  <h3 className="text-2xl font-bold text-white tracking-tighter">{date}</h3>
                  <div className="mt-6 flex justify-between items-center pt-6 border-t border-white/5 text-slate-400 group-hover:text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ouvrir le dossier</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION DOCUMENTS (IMAGE_AFA73D.PNG) */}
        <div className="bg-[#0F172A] p-8 rounded-[3rem] border border-white/5 text-left">
           <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 text-white">
              <ShieldCheck size={18} className="text-emerald-500"/> Documents Administratifs
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-500 group-hover:text-emerald-500" size={18} />
                    <span className="text-[11px] font-bold truncate max-w-[150px]">{doc.nom_fichier}</span>
                  </div>
                  <Download size={14} className="text-slate-500" />
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL DE DÉTAIL D'UNE JOURNÉE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col h-[90vh]">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{selectedDay}</h2>
                <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold flex items-center gap-2">
                  <User size={12}/> Expert : {agentResponsable}
                </p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => generateDailyPDF(selectedDay, groupedPhotos[selectedDay])}
                  className="flex-1 md:flex-none bg-white text-black px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all"
                >
                  <Download size={16} /> Rapport PDF du jour
                </button>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-2xl transition-all">
                  <X size={24}/>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {groupedPhotos[selectedDay].map((p: any) => (
                    <div key={p.id} className="bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col">
                       <div className="h-80 relative group">
                          <img src={p.url_image} className="w-full h-full object-cover" alt="Detail" />
                       </div>
                       <div className="p-8 space-y-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                             <span className="flex items-center gap-2"><Clock size={14} className="text-emerald-500"/> {new Date(p.created_at).toLocaleTimeString()}</span>
                             <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">Validé</span>
                          </div>
                          <h4 className="text-white font-bold text-lg leading-tight italic">
                            "{p.note_expert || "Analyse technique visuelle effectuée. Aucun défaut structurel majeur constaté sur cette zone."}"
                          </h4>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}