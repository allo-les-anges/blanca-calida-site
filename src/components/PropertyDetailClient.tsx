"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, 
  Loader2, Image as ImageIcon, Home, Map as MapIcon, 
  Navigation, Waves, Car, Ship, ShieldCheck
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
      .replace(/face="[^"]*"/gi, '')
      .replace(/size="[^"]*"/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/&nbsp;/g, ' ');
  };

  if (!mounted) return null;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0A0A0A] italic font-serif text-[#FFE7C2]/50">
      <Loader2 className="animate-spin text-[#FFE7C2] mb-4" size={40} />
      Initialisation de la propriété...
    </div>
  );

  if (!property) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center">
      <h1 className="text-2xl font-serif mb-4 text-white">Propriété non trouvée</h1>
      <Link href="/" className="px-6 py-3 bg-[#FFE7C2] text-black text-[10px] uppercase tracking-widest rounded-full font-bold">
        Retour au catalogue
      </Link>
    </div>
  );

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  const mapUrl = property.latitude && property.longitude 
    ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
    : null;

  return (
    <main className="bg-[#E9E3DA] dark:bg-[#0A0A0A] min-h-screen text-[#1A1A1A] dark:text-white transition-colors duration-500">
      <style jsx global>{`
        .property-image-filter {
          filter: brightness(0.95) contrast(0.95) saturate(0.9);
          transition: filter 0.5s ease;
        }
        .dark .property-image-filter {
            filter: brightness(0.7) contrast(1.1) saturate(0.8);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFE7C2; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />
      <div className="h-24 md:h-32" />

      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500 dark:text-[#FFE7C2]/50 hover:text-[#FFE7C2] transition-all">
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>
      </div>

      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[550px]">
          <div className="md:col-span-3 relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#1A1A1A] h-[400px] md:h-full group">
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-700" style={{ opacity: activeImage === idx ? 1 : 0, zIndex: activeImage === idx ? 10 : 0 }}>
                  <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
                  <img src={img} className="w-full h-full object-cover property-image-filter" alt="" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 bg-[#0A0A0A]/70 backdrop-blur-md text-[#FFE7C2] px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20 border border-[#FFE7C2]/20 shadow-lg">
              <ImageIcon size={14} /> {activeImage + 1} / {images.length}
            </div>
          </div>
          
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => { setActiveImage(idx); scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' }); }} 
                className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#FFE7C2] scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover property-image-filter" alt="" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
        <div className="lg:col-span-2">
          <h1 className="text-4xl md:text-6xl font-serif mb-8 leading-[1.1] text-[#1A1A1A] dark:text-white">{property.titre || "Villa d'Exception"}</h1>
          
          <div className="flex items-center gap-3 text-gray-500 dark:text-[#FFE7C2]/60 mb-8 text-[11px] uppercase tracking-[0.2em] font-bold">
            <MapPin size={18} className="text-[#FFE7C2]" />
            {property.town || property.ville} • {property.region}
          </div>

          <div className="flex flex-wrap gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-black/5 dark:border-[#FFE7C2]/10 text-[9px] uppercase font-bold tracking-wider dark:text-[#FFE7C2]">
              <ShieldCheck size={14} className="text-[#FFE7C2]" /> Amaru Certified • Spain
            </div>
            {property.pool === "Oui" && (
              <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-black/5 dark:border-[#FFE7C2]/10 text-[9px] uppercase font-bold tracking-wider dark:text-sky-400">
                <Waves size={14} className="text-sky-400" /> Piscine Privée
              </div>
            )}
            <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-black/5 dark:border-[#FFE7C2]/10 text-[9px] uppercase font-bold tracking-wider dark:text-[#FFE7C2]">
              <Car size={14} className="text-[#FFE7C2]" /> Parking Inclus
            </div>
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
              <div key={i} className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl text-center border border-black/5 dark:border-[#FFE7C2]/5 shadow-sm">
                <item.icon className="mx-auto mb-2 text-[#FFE7C2]" size={22} />
                <p className="text-2xl font-serif text-[#1A1A1A] dark:text-white">{item.val || "0"}</p>
                <p className="text-[8px] uppercase text-gray-400 dark:text-gray-500 font-bold tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-none mb-20 pt-10 border-t border-black/5 dark:border-[#FFE7C2]/10">
            <h2 className="text-3xl font-serif italic mb-8 text-[#1A1A1A] dark:text-white">L'Art de Vivre</h2>
            <div 
              className="description-xml-container text-lg leading-relaxed text-[#1A1A1A] dark:text-gray-300 opacity-90"
              dangerouslySetInnerHTML={{ 
                __html: cleanDescription(property.description || "Description en cours de rédaction...") 
              }} 
            />
          </div>

          <div className="mb-20 pt-10 border-t border-black/5 dark:border-[#FFE7C2]/10">
            <h2 className="text-3xl font-serif italic mb-8 text-[#1A1A1A] dark:text-white">Localisation</h2>
            {mapUrl ? (
              <div className="w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-inner bg-[#1A1A1A] border border-black/5 dark:border-[#FFE7C2]/10">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={mapUrl}></iframe>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-[#FFE7C2]/10 text-gray-400">
                <MapIcon size={32} className="mb-2 opacity-20" />
                <p className="text-sm italic">Carte indisponible</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-40 space-y-6">
            <Link 
              href={`/contact-cashback?Property_ID=${property.id_externe || property.id}`}
              className="group relative block w-full overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] p-[1px] transition-all duration-500 hover:scale-[1.02] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFE7C2] via-transparent to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-[#1A1A1A] rounded-[2.5rem] p-8 flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE7C2]/10 text-[#FFE7C2] border border-[#FFE7C2]/20 group-hover:bg-[#FFE7C2] group-hover:text-black transition-all duration-500">
                  <ShieldCheck size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#FFE7C2] mb-1">Offre Exclusive Amaru</span>
                  <span className="text-xl font-serif italic text-white leading-tight">Activer mon Cashback</span>
                </div>
              </div>
            </Link>

            <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-[#FFE7C2]/10 p-10 rounded-[3rem] shadow-2xl">
              <p className="text-[10px] uppercase text-gray-400 dark:text-[#FFE7C2]/40 mb-2 font-bold tracking-widest">Prix de vente</p>
              <p className="text-5xl font-serif text-[#1A1A1A] dark:text-[#FFE7C2] leading-none mb-10">
                {numericPrice.toLocaleString("fr-FR")} €
              </p>
              
              <button className="w-full bg-[#1A1A1A] dark:bg-[#FFE7C2] text-white dark:text-black py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:opacity-90 transition-all mb-4 shadow-xl">
                Réserver une visite
              </button>
              
              <a 
                href={`https://wa.me/34627768233?text=Information sur la villa ref: ${property.ref || property.id_externe}`} 
                target="_blank" 
                className="w-full border border-black/10 dark:border-[#FFE7C2]/20 flex items-center justify-center gap-3 py-6 rounded-2xl font-bold uppercase text-[11px] text-[#1A1A1A] dark:text-[#FFE7C2] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
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