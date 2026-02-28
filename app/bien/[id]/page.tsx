"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, MapPin, ArrowLeft, 
  CheckCircle2, Share2, Mail, Phone, Calendar 
} from "lucide-react";
import Link from "next/link";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        // On cherche le bien spécifique par son ID
        const found = data.find((p: any) => String(p.id) === String(id));
        setProperty(found);
      } catch (err) {
        console.error("Erreur chargement bien:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!property) return <div className="h-screen flex items-center justify-center font-serif italic text-slate-400">Bien introuvable.</div>;

  // Extraction propre des images du JSONB
  const allImages = Array.isArray(property.images) 
    ? property.images.map((img: any) => typeof img === 'object' ? img.url : img)
    : ["/placeholder.jpg"];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* GALERIE PHOTO LUXE */}
      <section className="pt-24 lg:pt-32 px-4 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <Link href={`/developpement/${property.development_name?.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 text-[10px] uppercase font-black tracking-widest">
            <ArrowLeft size={14} /> Retour au programme {property.development_name}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[500px] lg:h-[700px]">
            {/* Image principale (Grande) */}
            <div className="lg:col-span-3 rounded-[2.5rem] overflow-hidden relative group">
              <img 
                src={allImages[activeImage]} 
                alt={property.titre} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Réf: {property.reference || "UNIT-" + property.id}
              </div>
            </div>

            {/* Miniatures verticales (Scrollable sur desktop) */}
            <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {allImages.slice(0, 6).map((img: string, index: number) => (
                <button 
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-32 rounded-3xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-emerald-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* COLONNE GAUCHE : INFOS & DESCRIPTION */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Disponible Immédiatement</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} />
                <span className="text-sm font-bold uppercase tracking-tighter">{property.town}, {property.province}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-8 leading-tight">
              {property.titre}
            </h1>

            {/* CARACTÉRISTIQUES CLÉS */}
            <div className="grid grid-cols-3 gap-4 p-8 bg-slate-50 rounded-[2.5rem] mb-12">
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bed size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold text-slate-900">{property.beds}</span>
                <span className="text-[10px] uppercase font-black text-slate-400">Chambres</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bath size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold text-slate-900">{property.baths}</span>
                <span className="text-[10px] uppercase font-black text-slate-400">Salles d'eau</span>
              </div>
              <div className="flex flex-col items-center">
                <Maximize size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold text-slate-900">{property.surface_area?.built || property.sqft || "--"}</span>
                <span className="text-[10px] uppercase font-black text-slate-400">m² Hab.</span>
              </div>
            </div>

            {/* DESCRIPTION (Mapping du texte du XML) */}
            <div className="prose prose-slate max-w-none mb-16">
              <h2 className="text-2xl font-serif italic text-slate-900 mb-6">À propos de ce bien</h2>
              <div className="text-slate-600 leading-relaxed text-lg" 
                   dangerouslySetInnerHTML={{ __html: property.description_fr || property.description || "Description à venir..." }} 
              />
            </div>
          </div>

          {/* COLONNE DROITE : PRIX & CONTACT (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.08)] rounded-[3rem] p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Prix de vente</p>
              <div className="text-5xl font-serif text-slate-900 mb-8">
                {Number(property.price).toLocaleString("fr-FR")} €
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Frais de notaire réduits</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Garantie décennale incluse</span>
                </div>
              </div>

              {/* FORMULAIRE SIMPLIFIÉ */}
              <div className="space-y-4">
                <button className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                  <Mail size={16} /> Demander la brochure
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                  <Calendar size={16} /> Réserver une visite
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conseiller dédié</p>
                </div>
                <Share2 size={20} className="text-slate-300 hover:text-emerald-500 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}