"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bed, Bath, Maximize, ArrowLeft, Building2, MapPin, ChevronRight, Hash, CheckCircle } from "lucide-react";
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
    text?.toString().toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const devUnits = properties.filter((p) => {
    const nameInJson = slugify(p.development_name || "");
    const idInUrl = String(devId).toLowerCase();
    return nameInJson === idInUrl;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Chargement...</p>
    </div>
  );

  if (!devUnits.length) return <div>Projet introuvable.</div>;

  const dev = devUnits[0];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      
      {/* HEADER DU PROGRAMME */}
      <section className="relative pt-40 pb-24 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 text-[10px] uppercase font-black tracking-widest">
            <ArrowLeft size={12} /> Retour à la sélection
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="flex items-center gap-3 text-emerald-400 mb-4">
                <Building2 size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Développement Exclusif</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif italic leading-tight">{dev.development_name}</h1>
              <p className="text-xl text-slate-400 mt-4 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-500" /> {dev.town}, {dev.province}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] min-w-[240px] text-center">
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Disponibilité</p>
              <p className="text-4xl font-serif italic">{devUnits.length} Unités</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION PRÉSENTATION (L'Art de Vivre) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-emerald-600"></span> L'Art de Vivre
            </h2>
            <div 
              className="prose prose-slate prose-lg max-w-none text-slate-600 font-light leading-relaxed"
              dangerouslySetInnerHTML={{ __html: dev.description_fr || dev.description }}
            />
          </div>
          <div className="space-y-8">
             {/* Box Infos Techniques Rapides */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-slate-50 rounded-[2rem]">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Distance Mer</p>
                  <p className="text-2xl font-serif">5 000 m</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem]">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Aéroport</p>
                  <p className="text-2xl font-serif">38 km</p>
                </div>
             </div>
             {/* Image de style/ambiance */}
             <div className="rounded-[3rem] overflow-hidden h-80 shadow-2xl">
                <img src={Array.isArray(dev.images) ? dev.images[0]?.url || dev.images[0] : "/placeholder.jpg"} className="w-full h-full object-cover" alt="Lifestyle" />
             </div>
          </div>
        </div>
      </section>

      {/* GRILLE DE SÉLECTION DES UNITÉS (LE STOCK REEL) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif italic text-slate-900 mb-4">Unités disponibles & Plans</h2>
            <p className="text-slate-500 text-sm uppercase font-bold tracking-widest">Sélectionnez un lot pour voir les détails et plans d'étage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {devUnits.map((unit) => (
              <div key={unit.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={Array.isArray(unit.images) ? (unit.images[0]?.url || unit.images[0]) : "/placeholder.jpg"} 
                    alt={unit.titre} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} className="text-emerald-400" /> {unit.reference}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{unit.titre}</h3>
                  <div className="flex justify-between items-end mb-8">
                    <p className="text-3xl font-serif text-slate-900">{Number(unit.price).toLocaleString("fr-FR")} €</p>
                    <span className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                      <CheckCircle size={12} /> Disponible
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-6 mb-8 text-slate-500">
                    <div className="text-center">
                      <Bed size={18} className="mx-auto mb-1 text-slate-300" />
                      <span className="text-xs font-bold text-slate-900">{unit.beds}</span>
                    </div>
                    <div className="text-center border-x border-slate-50">
                      <Bath size={18} className="mx-auto mb-1 text-slate-300" />
                      <span className="text-xs font-bold text-slate-900">{unit.baths}</span>
                    </div>
                    <div className="text-center">
                      <Maximize size={18} className="mx-auto mb-1 text-slate-300" />
                      <span className="text-xs font-bold text-slate-900">{unit.surface_area?.built || unit.sqft}m²</span>
                    </div>
                  </div>

                  {/* LIEN VERS LE DÉTAIL (PLANS, etc.) */}
                  <Link href={`/bien/${unit.id}`} className="w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 group-hover:bg-emerald-600 transition-colors text-[10px] font-black uppercase tracking-widest">
                    Voir les plans & détails <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}