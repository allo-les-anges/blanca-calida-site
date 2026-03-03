"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  HardHat, Loader2, LogOut, X, ChevronRight, CheckCircle2,
  Printer, Eye, Save, FileText, Download, MapPin, Globe
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Import pour la carte (nécessite 'react-leaflet' et 'leaflet')
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction icône Leaflet par défaut
const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41] });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function ProjectTracker() {
  const [projet, setProjet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration statique issue de vos tables (Amaru-Homes / Gaëtan Mukeba)
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
          
          // Documents
          const { data: docs } = await supabase.from("documents_projets").select("*").eq("projet_id", projectData.id);
          setDocuments(docs || []);

          // Photos avec Géo-data
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
      // Design de l'en-tête
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(NOM_AGENCE, 14, 25);
      doc.setFontSize(10);
      doc.text(`Expert : ${EXPERT_NOM}`, 14, 35);
      doc.text(`Date : ${date}`, 14, 42);
      doc.text(`Projet : ${projet?.nom_villa}`, 14, 49);

      // Liste des photos et commentaires
      let yPos = 70;
      dailyPhotos.forEach((p, index) => {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.addImage(p.url_image, 'JPEG', 14, yPos, 100, 65);
        yPos += 75;
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text(`Observation : ${p.note_expert || "Conforme"}`, 14, yPos);
        // Ajout des coordonnées dans le PDF
        if(p.latitude) {
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Coordonnées GPS : ${p.latitude}, ${p.longitude}`, 14, yPos + 5);
        }
        yPos += 20;
      });

      if (action === 'save') doc.save(`Rapport_${date}.pdf`);
      else window.open(doc.output('bloburl'), '_blank');
    } catch (e) { alert("Erreur génération PDF"); } finally { setIsProcessing(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0F172A] p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20"><HardHat className="text-black" /></div>
            <div>
              <h1 className="text-2xl font-black text-white">{NOM_AGENCE}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Client : {projet?.client_prenom} {projet?.client_nom} • {projet?.nom_villa}
              </p>
            </div>
          </div>
          <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-xs uppercase tracking-tighter transition-colors">
            <LogOut size={16}/> Déconnexion
          </button>
        </header>

        {/* SECTION DOCUMENTS */}
        <section className="bg-[#0F172A]/50 p-8 rounded-[2rem] border border-white/5">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">
            <FileText size={16}/> Documents Administratifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <a key={doc.id} href={doc.url_fichier} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-emerald-500/10 transition-all group">
                <span className="text-xs font-bold truncate pr-4">{doc.nom_fichier}</span>
                <Download size={16} className="text-slate-500 group-hover:text-emerald-500" />
              </a>
            ))}
          </div>
        </section>

        {/* SECTION RAPPORTS (Vignettes) */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 flex items-center gap-2">
            <Globe size={16}/> Suivi de Chantier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(groupedPhotos).map((date) => (
              <div key={date} onClick={() => setSelectedDay(date)} className="group bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl">
                <div className="h-56 relative">
                  <img src={groupedPhotos[date][0].url_image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <p className="text-white font-black text-xl">{date}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Etape : {projet?.etape_actuelle}</p>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14}/> <span className="text-[10px] font-bold uppercase">Géolocalisé</span>
                  </div>
                  <ChevronRight className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODALE DE PRÉVISUALISATION DU RAPPORT */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-6xl rounded-[3rem] border border-white/10 flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
            
            {/* Header Modale */}
            <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/[0.01]">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">{selectedDay}</h3>
                <p className="text-xs text-emerald-500 font-bold uppercase mt-2">Signé par {EXPERT_NOM} • {NOM_AGENCE}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handlePDFAction(selectedDay, groupedPhotos[selectedDay], 'preview')} className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-xl hover:bg-emerald-500 hover:text-black transition-all text-[10px] font-black uppercase"><Eye size={16}/> Aperçu</button>
                <button onClick={() => setSelectedDay(null)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white"><X size={20}/></button>
              </div>
            </div>

            {/* Contenu Modale */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Liste des photos + Commentaires */}
                <div className="space-y-8">
                  {groupedPhotos[selectedDay].map((p: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-[2rem] overflow-hidden border border-white/5 shadow-lg">
                      <img src={p.url_image} className="w-full aspect-video object-cover" />
                      <div className="p-6 bg-white/[0.02]">
                        <p className="text-[10px] text-emerald-500 font-black uppercase mb-2 tracking-widest">Commentaire Expert</p>
                        <p className="text-slate-300 italic text-sm leading-relaxed">"{p.note_expert || "Aucun commentaire pour cette photo."}"</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CARTE DE GÉOLOCALISATION */}
                <div className="sticky top-0 h-[600px] rounded-[2rem] overflow-hidden border border-white/10 shadow-inner">
                  <MapContainer center={[groupedPhotos[selectedDay][0].latitude || 0, groupedPhotos[selectedDay][0].longitude || 0]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {groupedPhotos[selectedDay].map((p: any, i: number) => (
                      p.latitude && <Marker key={i} position={[p.latitude, p.longitude]} icon={icon}>
                        <Popup><img src={p.url_image} className="w-20 h-20 object-cover rounded" /><p className="text-[10px] mt-2 font-bold">{p.note_expert}</p></Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}