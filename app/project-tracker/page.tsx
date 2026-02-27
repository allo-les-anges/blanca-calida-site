"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Camera, Download, Calendar, 
  MapPin, Loader2, ChevronRight, FileText, LogOut, ArrowLeft
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedPin = localStorage.getItem("client_access_pin");
      if (!savedPin) { window.location.href = "/"; return; }

      const { data: projectData } = await supabase
        .from("suivi_chantier")
        .select("*")
        .eq("pin_code", savedPin)
        .maybeSingle();

      if (projectData) {
        setProjet(projectData);
        const { data: photosData } = await supabase
          .from("constats-photos")
          .select("*")
          .eq("id_projet", projectData.id)
          .order("created_at", { ascending: false });

        if (photosData) setPhotos(photosData);

        const channel = supabase
          .channel('realtime-constats')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'constats-photos', 
            filter: `id_projet=eq.${projectData.id}` 
          }, (payload) => {
            setPhotos((prev) => [payload.new, ...prev]);
          }).subscribe();

        setLoading(false);
        return () => { supabase.removeChannel(channel); };
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const downloadPDF = async () => {
    if (!projet || photos.length === 0) return;
    setIsExporting(true);
    const doc = new jsPDF();
    const dateExport = new Date().toLocaleDateString('fr-FR');

    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("serif", "italic");
    doc.setFontSize(22);
    doc.text(`Rapport Photo : ${projet.nom_villa}`, 14, 25);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date : ${dateExport}`, 14, 50);
    doc.text(`Propriétaire : ${projet.client_prenom} ${projet.client_nom}`, 14, 55);

    const rows = await Promise.all(photos.map(async (p) => {
      try {
        const base64 = await getBase64ImageFromURL(p.url_image);
        return {
          date: new Date(p.created_at).toLocaleDateString('fr-FR'),
          note: p.note_expert || "RAS",
          img: base64
        };
      } catch (e) {
        return { date: new Date(p.created_at).toLocaleDateString('fr-FR'), note: p.note_expert || "RAS", img: null };
      }
    }));

    autoTable(doc, {
      startY: 65,
      head: [['Aperçu', 'Date', 'Observations de l\'expert']],
      body: rows.map(r => ['', r.date, r.note]),
      columnStyles: { 0: { cellWidth: 40 } },
      styles: { minCellHeight: 35, valign: 'middle' }, 
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const rowIndex = data.row.index;
          const base64Img = rows[rowIndex].img;
          if (base64Img) {
            doc.addImage(base64Img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 36, 31);
          }
        }
      },
    });

    doc.save(`Rapport_${projet.nom_villa}.pdf`);
    setIsExporting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("client_access_pin");
    window.location.href = "/";
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin mb-4 text-emerald-600" size={40} />
      <span className="font-serif italic text-xl text-slate-900">Préparation de votre visite...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pt-10 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* NAV BAR CORRIGÉE AVEC LIEN ACCUEIL */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            {/* BOUTON RETOUR ACCUEIL */}
            <button 
              onClick={() => window.location.href = "/"} 
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Accueil</span>
            </button>
            
            <div className="h-4 w-[1px] bg-slate-200 mx-2" /> {/* Séparateur visuel */}

            <div className="flex items-center gap-3">
              <HardHat className="text-emerald-600" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suivi Chantier Premium</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={downloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl transition-all text-xs font-bold disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
              {isExporting ? "Génération..." : "Rapport PDF"}
            </button>
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 rounded-2xl transition-all" title="Se déconnecter">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* HEADER & PROGRESSION */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-slate-200">
               <img src={projet.lien_photo || "/placeholder-villa.jpg"} className="w-full h-full object-cover" alt="Villa" />
            </div>
            <div className="flex-1 w-full text-left">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 block">Votre Propriété</span>
               <h1 className="text-5xl font-serif italic text-slate-900 mb-2 tracking-tight">{projet.nom_villa}</h1>
               <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest gap-2 mb-8">
                 <MapPin size={14} className="text-emerald-500"/> {projet.ville}
               </div>
               
               <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Phase actuelle</span>
                    <span className="text-emerald-600">{projet.etape_actuelle}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl text-left">
            <div className="relative z-10">
                <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Cashback Cumulé</h3>
                <div className="text-6xl font-serif italic mb-4">
                    {projet.montant_cashback ? projet.montant_cashback.toLocaleString() : "0"} €
                </div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Crédité à la livraison</p>
            </div>
            <Download className="absolute -right-10 -bottom-10 opacity-10 rotate-12 text-emerald-500" size={200}/>
          </div>
        </div>

        {/* JOURNAL DE BORD */}
        <div className="space-y-8">
            <div className="flex justify-between items-end px-4">
              <h2 className="text-3xl font-serif italic flex items-center gap-4 text-left">
                  <Camera className="text-emerald-500" size={30} /> Journal du chantier
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {photos.length} Mises à jour
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photos.length > 0 ? photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-4">
                    <div className="h-64 overflow-hidden relative">
                      <img src={photo.url_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Constat" />
                      <div className="absolute top-4 right-4">
                         <span className="text-[9px] font-bold text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest">
                            Rapport Officiel
                         </span>
                      </div>
                    </div>
                    <div className="p-8 text-left">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar size={12}/> {new Date(photo.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                         </span>
                      </div>
                      <p className="text-slate-600 italic text-sm leading-relaxed">
                        "{photo.note_expert || "L'expert n'a ajouté aucun commentaire pour ce constat."}"
                      </p>
                    </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400 font-serif italic">
                  Aucune photo n'est disponible pour le moment.
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}