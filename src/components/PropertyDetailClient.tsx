"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Ajout de Waves (piscine) et Car (parking) dans les imports
import { 
  Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, 
  Loader2, Image as ImageIcon, Home, Map as MapIcon, 
  Navigation, Waves, Car, Ship 
} from "lucide-react";
import Link from "next/link";

export default function PropertyDetailClient({ id }: { id: string }) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        const propertiesArray = Array.isArray(data) ? data : (data.properties || []);
        
        const current = propertiesArray.find((p: any) => 
          String(p.id_externe) === String(id) || String(p.id) === String(id)
        );
        
        if (current) setProperty(current);
      } catch (err) { 
        console.error("Erreur Fetch:", err); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchData();
  }, [id]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeImage) setActiveImage(newIndex);
    }
  };

  if (!mounted) return null;
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white italic font-serif text-slate-400">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      Chargement de la villa...
    </div>
  );

  if (!property) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-serif mb-4">Propriété non trouvée</h1>
      <Link href="/" className="px-6 py-3 bg-black text-white text-[10px] uppercase tracking-widest rounded-full">
        Retour à la sélection
      </Link>
    </div>
  );

  const images = property.images || [];
  const mapUrl = property.latitude && property.longitude 
    ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
    : null;

  return (
    <main className="bg-white min-h-screen text-slate-900">
      <Navbar />
      <div className="h-24 md:h-32" />

      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all">
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>
      </div>

      {/* GALERIE PHOTOS */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[550px]">
          <div className="md:col-span-3 relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 h-[400px] md:h-full">
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-500" style={{ opacity: activeImage === idx ? 1 : 0, zIndex: activeImage === idx ? 10 : 0 }}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20">
              <ImageIcon size={14} /> {activeImage + 1} / {images.length}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => { setActiveImage(idx); scrollContainerRef.current?.scrollTo({ left: idx * scrollContainerRef.current.clientWidth, behavior: 'smooth' }); }} className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-emerald-500 scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" alt="" /></button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
        <div className="lg:col-span-2">
          <h1 className="text-4xl md:text-6xl font-serif mb-8 text-slate-900 leading-[1.1]">{property.titre || "Villa Moderne"}</h1>
          
          <div className="flex items-center gap-3 text-gray-400 mb-8 text-[11px] uppercase tracking-[0.2em] font-bold">
            <MapPin size={18} className="text-emerald-500" />
            {property.town || property.ville} • {property.region}
          </div>

          {/* BADGES ÉQUIPEMENTS DYNAMIQUES */}
          <div className="flex flex-wrap gap-3 mb-12">
            {property.pool === "Oui" && (
              <div className="flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full border border-sky-100 text-[9px] uppercase font-bold tracking-wider">
                <Waves size={14} /> Piscine Privée
              </div>
            )}
            {/* Si distance plage > 0 */}
            {property.distance_beach && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-100 text-[9px] uppercase font-bold tracking-wider">
                <Ship size={14} /> Mer à {property.distance_beach}m
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-full border border-slate-100 text-[9px] uppercase font-bold tracking-wider">
              <Car size={14} /> Parking inclus
            </div>
          </div>

          {/* QUICK STATS (4 colonnes) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Bed className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.beds || "0"}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">Chambres</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Bath className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.baths || "0"}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">Salles de bain</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Maximize className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.surface_built || "0"}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">Surface m²</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Home className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.surface_plot || "0"}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">Terrain m²</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="prose prose-slate max-w-none text-gray-600 text-lg mb-20 pt-10 border-t border-slate-100">
            <h2 className="text-3xl font-serif italic mb-8 text-slate-800">L'Art de Vivre</h2>
            <div dangerouslySetInnerHTML={{ __html: property.description || "Description en cours de rédaction..." }} />
          </div>

          {/* LOCALISATION */}
          <div className="mb-20 pt-10 border-t border-slate-100">
            <h2 className="text-3xl font-serif italic mb-8 text-slate-800">Localisation</h2>
            {property.adresse && (
              <div className="flex items-center gap-4 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600"><Navigation size={20}/></div>
                <div>
                  <p className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Situation</p>
                  <p className="font-medium text-slate-700">{property.adresse}</p>
                </div>
              </div>
            )}
            {mapUrl ? (
              <div className="w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={mapUrl}></iframe>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                <MapIcon size={32} className="mb-2 opacity-20" />
                <p className="text-sm italic">Carte indisponible</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR PRIX */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl">
            <p className="text-[10px] uppercase text-gray-400 mb-2 font-bold tracking-widest">Prix du modèle</p>
            <p className="text-5xl font-serif text-slate-900 leading-none mb-10">
              {Number(property.price || property.prix || 0).toLocaleString("fr-FR")} €
            </p>
            <button className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-800 transition-all mb-4">
              Réserver une visite
            </button>
            <a 
              href={`https://wa.me/34627768233?text=Information sur la villa ref: ${property.ref || property.id_externe}`} 
              target="_blank" 
              className="w-full border border-slate-200 flex items-center justify-center gap-3 py-6 rounded-2xl font-bold uppercase text-[11px] text-slate-700 hover:bg-slate-50 transition-all"
            >
              <MessageCircle size={20} className="text-green-500" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}