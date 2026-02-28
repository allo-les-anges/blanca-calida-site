"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, MapPin, ArrowLeft, 
  CheckCircle2, Share2, Mail, Phone, Calendar,
  Waves, Flag, Car, Sun, Layout
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

  // --- EXTRACTION SÉCURISÉE DES DONNÉES JSONB ---
  
  // 1. Images de la galerie
  const allImages = Array.isArray(property.images) 
    ? property.images.map((img: any) => typeof img === 'object' ? img.url : img).filter(Boolean)
    : ["/placeholder.jpg"];

  // 2. Plans techniques (Correction TypeScript pour Vercel)
  const plans = Array.isArray(property.plans) 
    ? property.plans.map((p: any) => {
        if (typeof p === 'string') return p;
        if (typeof p === 'object' && p !== null) return p.url || p.link;
        return null;
      }).filter((url: any): url is string => Boolean(url)) // Correction ici : ajout de : any
    : [];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* GALERIE PHOTO */}
      <section className="pt-24 lg:pt-32 px-4 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <Link href={`/developpement/${property.development_name?.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Retour au programme {property.development_name}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[400px] lg:h-[600px]">
            <div className="lg:col-span-3 rounded-[2.5rem] overflow-hidden relative">
              <img src={allImages[activeImage]} alt={property.titre} className="w-full h-full object-cover" />
              <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest">
                Réf: {property.reference || "UNIT-" + property.id}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {allImages.map((img: string, index: number) => (
                <button key={index} onClick={() => setActiveImage(index)} className={`relative h-28 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* COLONNE GAUCHE (70% Largeur) */}
          <div className="w-full lg:w-2/3">
            <div className="flex flex-wrap gap-3 mb-8">
               <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 text-[10px] font-black uppercase"><Waves size={14} className="text-emerald-500"/> Mer à 5km</span>
               <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 text-[10px] font-black uppercase"><Flag size={14} className="text-emerald-500"/> Golf à 11km</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-8">{property.titre}</h1>

            {/* SPECS */}
            <div className="grid grid-cols-4 gap-4 p-8 bg-slate-50 rounded-[2.5rem] mb-12 border border-slate-100">
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bed size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold">{property.beds}</span>
                <p className="text-[8px] uppercase font-black text-slate-400">Chambres</p>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bath size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold">{property.baths}</span>
                <p className="text-[8px] uppercase font-black text-slate-400">Bains</p>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Maximize size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold">{property.surface_area?.built || property.sqft}</span>
                <p className="text-[8px] uppercase font-black text-slate-400">m² Bâti</p>
              </div>
              <div className="flex flex-col items-center">
                <Sun size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold">Privée</span>
                <p className="text-[8px] uppercase font-black text-slate-400">Piscine</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="prose prose-slate max-w-none mb-16 text-slate-600 leading-relaxed">
              <h2 className="text-3xl font-serif italic text-slate-900 mb-6">L'Art de Vivre</h2>
              <div dangerouslySetInnerHTML={{ __html: property.description_fr || property.description || "Description à venir..." }} />
            </div>

            {/* SECTION PLANS (CORRIGÉE) */}
            {plans.length > 0 && (
              <div className="border-t border-slate-100 pt-16">
                <div className="flex items-center gap-3 mb-8">
                  <Layout className="text-emerald-600" size={24} />
                  <h2 className="text-3xl font-serif italic">Plans de l'unité</h2>
                </div>
                <div className="grid gap-8 bg-slate-50 p-6 md:p-10 rounded-[3rem]">
                  {plans.map((url: string, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm">
                      <img src={url} alt={`Plan ${idx+1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLONNE DROITE (30% Largeur - Sidebar) */}
          <div className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-32 bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-10">
              <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-widest text-center">Prix de vente</p>
              <div className="text-5xl font-serif text-slate-900 mb-10 text-center">
                {Number(property.price).toLocaleString("fr-FR")} €
              </div>
              <div className="space-y-4">
                <button className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-colors">
                  <Mail size={16} /> Demander la brochure
                </button>
                <button className="w-full border border-slate-200 text-slate-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                  <Calendar size={16} /> Réserver une visite
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}