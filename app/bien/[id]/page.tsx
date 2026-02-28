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

  if (!property) return <div className="h-screen flex items-center justify-center">Bien introuvable.</div>;

  // Gestion des images et des plans (JSONB)
  const allImages = Array.isArray(property.images) 
    ? property.images.map((img: any) => typeof img === 'object' ? img.url : img)
    : ["/placeholder.jpg"];

  const plans = Array.isArray(property.plans) 
    ? property.plans.map((p: any) => typeof p === 'object' ? p.url : p) 
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[500px] lg:h-[700px]">
            <div className="lg:col-span-3 rounded-[2.5rem] overflow-hidden relative group">
              <img src={allImages[activeImage]} alt={property.titre} className="w-full h-full object-cover" />
              <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Réf: {property.reference}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {allImages.map((img: string, index: number) => (
                <button key={index} onClick={() => setActiveImage(index)} className={`relative h-32 rounded-3xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-emerald-500' : 'border-transparent opacity-60'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            
            {/* BADGES TECHNIQUES */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 text-xs font-bold">
                <Waves size={16} className="text-emerald-500" /> Plage à 5000m
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 text-xs font-bold">
                <Flag size={16} className="text-emerald-500" /> Golf à 11000m
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 text-xs font-bold">
                <Car size={16} className="text-emerald-500" /> Parking Inclus
              </div>
            </div>

            <h1 className="text-5xl font-serif italic text-slate-900 mb-8">{property.titre}</h1>

            {/* SPECS */}
            <div className="grid grid-cols-4 gap-4 p-8 bg-slate-50 rounded-[2.5rem] mb-12">
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bed size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold">{property.beds}</span>
                <span className="text-[9px] uppercase font-black text-slate-400">Chambres</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bath size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold">{property.baths}</span>
                <span className="text-[9px] uppercase font-black text-slate-400">Bains</span>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Maximize size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold">{property.surface_area?.built || property.sqft}</span>
                <span className="text-[9px] uppercase font-black text-slate-400">m² Bâti</span>
              </div>
              <div className="flex flex-col items-center">
                <Sun size={24} className="text-slate-400 mb-2" />
                <span className="text-xl font-bold">Privée</span>
                <span className="text-[9px] uppercase font-black text-slate-400">Piscine</span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="prose prose-slate max-w-none mb-20">
              <h2 className="text-3xl font-serif italic mb-6">L'Art de Vivre</h2>
              <div className="text-slate-600 text-lg leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: property.description_fr || property.description }} />
            </div>

            {/* SECTION PLANS (VOTRE DEMANDE) */}
            {plans.length > 0 && (
              <div className="border-t border-slate-100 pt-16 mb-20">
                <div className="flex items-center gap-3 mb-10">
                  <Layout className="text-emerald-600" />
                  <h2 className="text-3xl font-serif italic text-slate-900">Plans de l'unité</h2>
                </div>
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-dashed border-slate-200">
                  {plans.map((planUrl, idx) => (
                    <img key={idx} src={planUrl} alt="Plan" className="w-full h-auto rounded-2xl" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR STICKY */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-10">
              <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-widest">Prix du modèle</p>
              <div className="text-5xl font-serif text-slate-900 mb-10">
                {Number(property.price).toLocaleString("fr-FR")} €
              </div>
              <div className="space-y-4">
                <button className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                  <Mail size={16} /> Demander la brochure
                </button>
                <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-emerald-200">
                  <Phone size={16} /> WhatsApp
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