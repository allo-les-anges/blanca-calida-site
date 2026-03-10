"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, 
  Loader2, Image as ImageIcon, Home, Map as MapIcon, 
  Waves, Car, ShieldCheck, Navigation
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

  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/style="[^"]*"/gi, '')
      .replace(/color="[^"]*"/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/&nbsp;/g, ' ');
  };

  if (!mounted) return null;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-[#D4AF37]">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="font-serif italic text-xl">Chargement de la propriété...</span>
    </div>
  );

  if (!property) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] p-6 text-center">
      <h1 className="text-2xl mb-4 text-slate-900 dark:text-white font-serif">Propriété non trouvée</h1>
      <Link href="/" className="px-8 py-3 bg-[#D4AF37] text-black rounded-full font-bold uppercase text-[10px] tracking-widest">
        Retour au catalogue
      </Link>
    </div>
  );

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  
  // Génération de l'URL Google Maps basée sur la ville et la région
  const mapQuery = encodeURIComponent(`${property.town || ""}, ${property.region || ""}, Espagne`);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=VOTRE_CLE_API_GOOGLE&q=${mapQuery}&language=fr`;
  // Note : Si vous n'avez pas de clé API immédiate, vous pouvez utiliser l'URL de recherche standard :
  const fallbackMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <main className="bg-white dark:bg-[#0A0A0A] min-h-screen transition-colors duration-500">
      <style jsx global>{`
        .smart-text-container, .smart-text-container *, .smart-title { color: #1a1a1a !important; }
        :global(.dark) .smart-text-container, :global(.dark) .smart-text-container *, :global(.dark) .smart-title { color: #ffffff !important; }
        :global(.dark) .map-container { filter: grayscale(1) invert(0.9) contrast(1.2); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <Navbar />
      <div className="h-24 md:h-32" />

      {/* --- NAVIGATION --- */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>
      </div>

      {/* --- GALERIE --- */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[550px]">
          <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-[#111] h-[400px] md:h-full">
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-700" style={{ opacity: activeImage === idx ? 1 : 0, zIndex: activeImage === idx ? 10 : 0 }}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20">
              <ImageIcon size={14} /> {activeImage + 1} / {images.length}
            </div>
          </div>
          
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => { setActiveImage(idx); scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' }); }} 
                className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D4AF37] scale-95' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTENU --- */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
        <div className="lg:col-span-2">
          
          <h1 className="smart-title text-4xl md:text-7xl font-serif mb-8 leading-[1.1]">
            {property.titre || "Villa d'Exception"}
          </h1>
          
          <div className="flex items-center gap-3 text-slate-500 dark:text-[#FFE7C2] mb-8 text-[11px] uppercase tracking-[0.2em] font-bold">
            <MapPin size={18} className="text-[#D4AF37]" />
            {property.town || property.ville} • {property.region}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {[
              { icon: Bed, val: property.beds, label: "Chambres" },
              { icon: Bath, val: property.baths, label: "Bains" },
              { icon: Maximize, val: property.surface_built, label: "Bâti m²" },
              { icon: Home, val: property.surface_plot, label: "Terrain m²" },
              { icon: Waves, val: (property.pool === "Oui" ? "Privée" : "Non"), label: "Piscine" },
              { icon: Car, val: "Privé", label: "Parking" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl text-center border border-slate-200 dark:border-white/10">
                <item.icon className="mx-auto mb-2 text-[#D4AF37]" size={22} />
                <p className="smart-title text-2xl font-serif">{item.val || "0"}</p>
                <p className="text-[8px] uppercase text-slate-400 font-bold tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-none mb-20 pt-10 border-t border-slate-200 dark:border-white/10">
            <h2 className="smart-title text-3xl font-serif italic mb-8">L'Art de Vivre</h2>
            <div 
              className="smart-text-container text-lg leading-relaxed opacity-90 mb-16"
              dangerouslySetInnerHTML={{ __html: cleanDescription(property.description || "") }} 
            />
            
            {/* --- SECTION GÉOLOCALISATION RÉINTÉGRÉE --- */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                   <Navigation size={24} />
                </div>
                <div>
                  <h3 className="smart-title text-2xl font-serif italic">Emplacement Privilégié</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{property.town}, Costa Blanca</p>
                </div>
              </div>
              
              <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 map-container">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={fallbackMapUrl}
                  className="grayscale-[0.5] dark:grayscale-[1]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SIDEBAR --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 space-y-6">
            <Link 
              href={`/contact-cashback?Property_ID=${property.id_externe || property.id}`}
              className="group relative block w-full overflow-hidden rounded-[2.5rem] bg-slate-900 p-[1px] shadow-2xl transition-transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-transparent opacity-30" />
              <div className="relative bg-slate-900 rounded-[2.5rem] p-8 flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  <ShieldCheck size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-1">Privilège Amaru</span>
                  <span className="text-xl font-serif italic text-white leading-tight">Activer mon Cashback</span>
                </div>
              </div>
            </Link>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl">
              <p className="text-[10px] uppercase text-slate-400 dark:text-[#FFE7C2]/60 mb-2 font-bold tracking-widest">Prix de vente</p>
              <p className="smart-title text-5xl font-serif leading-none mb-10">
                {numericPrice.toLocaleString("fr-FR")} €
              </p>
              
              <button className="w-full bg-[#D4AF37] text-black py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:brightness-110 transition-all mb-4">
                Réserver une visite
              </button>
              
              <a href={`https://wa.me/34627768233?text=Info ref: ${property.ref}`} target="_blank" className="w-full border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 py-6 rounded-2xl font-bold uppercase text-[11px] smart-title hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <MessageCircle size={20} className="text-green-500" /> WhatsApp Direct
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}