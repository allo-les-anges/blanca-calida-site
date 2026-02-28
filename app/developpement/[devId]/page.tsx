"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bed, Bath, Maximize, ArrowLeft, Building2, MapPin, ChevronRight, Hash } from "lucide-react";
import Link from "next/link";

export default function DevelopmentPage() {
  const { devId } = useParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const slugify = (text: string) =>
    text
      ?.toString()
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  // FILTRAGE : On récupère toutes les unités appartenant au développement de l'URL
  const devUnits = properties.filter((p) => {
    const nameInJson = slugify(p.development_name || "");
    const idInUrl = String(devId).toLowerCase();
    return nameInJson === idInUrl;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Chargement du projet...</p>
    </div>
  );

  if (!devUnits.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center">
          <p className="text-xl font-serif italic mb-6 text-slate-900">Projet "{devId}" introuvable.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-slate-950 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const dev = devUnits[0];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      
      {/* SECTION HERO DYNAMIQUE */}
      <section className="relative pt-40 pb-24 bg-slate-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 text-[10px] uppercase font-black tracking-[0.2em]">
            <ArrowLeft size={12} /> Tous les développements
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <Building2 size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Programme Neuf</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-serif italic text-white leading-tight">
                {dev.development_name}
              </h1>
              <div className="flex items-center gap-4 text-slate-400">
                <MapPin size={16} className="text-emerald-500" />
                <p className="text-lg">{dev.town}, {dev.province}</p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem]">
               <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2 text-center">Unités disponibles</p>
               <p className="text-4xl font-serif italic text-white text-center">{devUnits.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* GRILLE DES UNITÉS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {devUnits.map((unit) => {
            // Logique d'extraction d'image robuste pour JSONB
            const imageUrl = Array.isArray(unit.images) 
              ? (typeof unit.images[0] === 'object' ? unit.images[0].url : unit.images[0])
              : "/placeholder.jpg";

            return (
              <div key={unit.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-2xl transition-all duration-500">
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={unit.titre} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                    <Hash size={12} className="text-emerald-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">
                      {unit.reference || "UNIT-" + unit.id.toString().slice(0,4)}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  {/* Utilisation de unit.titre (ta colonne DB) */}
                  <h3 className="text-2xl font-serif italic mb-4 text-slate-900 line-clamp-1">{unit.titre}</h3>
                  
                  <div className="flex items-end justify-between mb-8">
                    <div className="space-y-1">
                      <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">À partir de</p>
                      <p className="text-3xl font-serif text-slate-900">
                        {Number(unit.price).toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div className="grid grid-cols-3 border-t border-slate-50 pt-6 text-slate-500">
                    <div className="flex flex-col items-center border-r border-slate-50">
                      <Bed size={18} className="mb-2 text-slate-400" />
                      <span className="text-sm font-bold text-slate-900">{unit.beds}</span>
                      <span className="text-[8px] uppercase font-black text-slate-400">Lits</span>
                    </div>
                    <div className="flex flex-col items-center border-r border-slate-50">
                      <Bath size={18} className="mb-2 text-slate-400" />
                      <span className="text-sm font-bold text-slate-900">{unit.baths}</span>
                      <span className="text-[8px] uppercase font-black text-slate-400">Bains</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Maximize size={18} className="mb-2 text-slate-400" />
                      <span className="text-sm font-bold text-slate-900">
                        {unit.surface_area?.built || unit.sqft || "--"}
                      </span>
                      <span className="text-[8px] uppercase font-black text-slate-400">m²</span>
                    </div>
                  </div>

                  {/* Bouton vers la page détail du bien spécifique */}
                  <Link href={`/bien/${unit.id}`} className="mt-8 w-full flex items-center justify-between bg-slate-50 hover:bg-emerald-600 hover:text-white p-4 rounded-2xl transition-all group/btn">
                    <span className="text-[10px] font-black uppercase tracking-widest ml-2">Détails de l'unité</span>
                    <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-900 group-hover/btn:scale-90 transition-transform shadow-sm">
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}