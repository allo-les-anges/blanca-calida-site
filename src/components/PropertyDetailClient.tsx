"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, 
  Loader2, Image as ImageIcon, Home, Map as MapIcon, 
  Waves, Car, ShieldCheck
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
      .replace(/ /g, ' ');
  };

  if (!mounted) return null;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] italic font-serif text-[#FFE7C2]/70">
      <Loader2 className="animate-spin text-[#FFE7C2] mb-4" size={40} />
      AMARU Excellence • Chargement...
    </div>
  );

  if (!property) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] p-6 text-center">
      <h1 className="text-2xl font-serif mb-4 text-slate-900 dark:text-white">Propriété non trouvée</h1>
      <Link href="/" className="px-6 py-3 bg-[#FFE7C2] text-black text-[10px] uppercase tracking-widest rounded-full font-bold">
        Retour au catalogue
      </Link>
    </div>
  );

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  // Correction URL Google Maps sécurisée
  const mapUrl = property.latitude && property.longitude 
    ? `https://www.google.com/maps/embed/v1/place?key=VOTRE_CLE_API&q=${property.latitude},${property.longitude}`
    : null;

  return (
    <main className="bg-white dark:bg-[#020617] min-h-screen text-slate-900 dark:text-white selection:bg-[#FFE7C2]/30 font-sans overflow-x-hidden transition-colors duration-500">
      <style jsx global>{`
        /* 1. Correction Filtre Images : naturelles au survol */
        .property-image-filter {
          transition: filter 0.5s ease;
        }
        .dark .property-image-filter {
            filter: brightness(0.9);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />
      <div className="h-24 md:h-32" />

      {/* --- RETOUR --- */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-[#FFE7C2]/70 hover:text-[#FFE7C2] transition-all font-bold">
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>
      </div>

      {/* --- GALERIE PHOTO (Lumineuse) --- */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[550px]">
          <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-[#1A1A1A] h-[400px] md:h-full group">
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-700" style={{ opacity: activeImage === idx ? 1 : 0, zIndex: activeImage === idx ? 10 : 0 }}>
                  <img src={img} className="w-full h-full object-cover property-image-filter" alt="" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20 border border-white/20 shadow-lg">
              <ImageIcon size={14} /> {activeImage + 1} / {images.length}
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => { setActiveImage(idx); scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' }); }} 
                className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D4AF37] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
          
          {/* 2. CORRECTION TITRE : Adaptatif Noir -> Blanc */}
          <h1 className="text-4xl md:text-7xl font-serif mb-8 leading-[1.1] text-slate-900 dark:text-white italic transition-colors duration-500">
            {property.titre || "Villa d'Exception"}
          </h1>
          
          {/* 3. CORRECTION LOCALISATION : Gris foncé -> Gris clair */}
          <div className="flex items-center gap-3 text-slate-600 dark:text-[#FFE7C2]/80 mb-8 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors duration-500">
            <MapPin size={18} className="text-[#D4AF37]" />
            {property.town || property.ville} • {property.region}
          </div>

          {/* 4. CORRECTION BADGES : Fond s'adapte au mode sombre */}
          <div className="flex flex-wrap gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-[9px] uppercase font-bold tracking-wider dark:text-[#FFE7C2] shadow-sm">
              <ShieldCheck size={14} className="text-[#D4AF37]" /> Amaru Certified
            </div>
            {property.pool === "Oui" && (
              <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-[9px] uppercase font-bold tracking-wider text-sky-600 dark:text-sky-300 shadow-sm">
                <Waves size={14} /> Piscine Privée
              </div>
            )}
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-[9px] uppercase font-bold tracking-wider dark:text-slate-300 shadow-sm">
              <Car size={14} className="text-[#D4AF37]" /> Parking Inclus
            </div>
          </div>

          {/* 5. CORRECTION GRILLE TECHNIQUE : Contrastée */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {[
              { icon: Bed, val: property.beds, label: "Chambres" },
              { icon: Bath, val: property.baths, label: "Bains" },
              { icon: Maximize, val: property.surface_built, label: "Bâti m²" },
              { icon: Home, val: property.surface_plot, label: "Terrain m²" },
              { icon: Waves, val: (property.pool === "Oui" ? "Privée" : "Non"), label: "Piscine" },
              { icon: Car, val: "Privé", label: "Parking" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-white/5 p-6 rounded-3xl text-center border border-slate-200 dark:border-white/10 shadow-lg">
                <item.icon className="mx-auto mb-2 text-[#D4AF37]" size={22} />
                <p className="text-2xl font-serif text-slate-900 dark:text-white transition-colors">{item.val || "0"}</p>
                <p className="text-[8px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          {/* --- DESCRIPTION (Art de Vivre) : Contrastée --- */}
          <div className="max-w-none mb-20 pt-10 border-t border-slate-200 dark:border-white/10 transition-colors">
            <h2 className="text-3xl font-serif italic mb-8 text-slate-900 dark:text-white">L'Art de Vivre</h2>
            <div 
              className="description-xml-container text-lg leading-relaxed text-slate-800 dark:text-slate-200 opacity-90 transition-colors"
              dangerouslySetInnerHTML={{ 
                __html: cleanDescription(property.description || "Description en cours de rédaction...") 
              }} 
            />
          </div>

          {/* --- LOCALISATION --- */}
          <div className="mb-20 pt-10 border-t border-slate-200 dark:border-white/10 transition-colors">
            <h2 className="text-3xl font-serif italic mb-8 text-slate-900 dark:text-white">Localisation</h2>
            {mapUrl ? (
              <div className="w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-inner bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 transition-colors">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={mapUrl}></iframe>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center bg-white dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10 text-slate-400">
                <MapIcon size={32} className="mb-2 opacity-20" />
                <p className="text-sm italic">Carte indisponible</p>
              </div>
            )}
          </div>
        </div>

        {/* --- SIDEBAR DE PRIX (Stickée) --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 space-y-6">
            
            {/* CASHBACK */}
            <Link 
              href={`/contact-cashback?Property_ID=${property.id_externe || property.id}`}
              className="group relative block w-full overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] p-[1px] transition-all duration-500 hover:scale-[1.02] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-transparent to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-[#1A1A1A] rounded-[2.5rem] p-8 flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500">
                  <ShieldCheck size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-1">Offre Exclusive Amaru</span>
                  <span className="text-xl font-serif italic text-white leading-tight">Activer mon Cashback</span>
                </div>
              </div>
            </Link>

            {/* PRIX ET ACTIONS */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl transition-colors">
              <p className="text-[10px] uppercase text-slate-400 dark:text-[#FFE7C2]/60 mb-2 font-bold tracking-widest">Prix de vente</p>
              <p className="text-5xl font-serif text-slate-900 dark:text-[#FFE7C2] leading-none mb-10 transition-colors">
                {numericPrice.toLocaleString("fr-FR")} €
              </p>
              
              <button className="w-full bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-black py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:opacity-90 transition-all mb-4 shadow-xl">
                Réserver une visite
              </button>
              
              <a 
                href={`https://wa.me/34627768233?text=Information sur la villa ref: ${property.ref || property.id_externe}`} 
                target="_blank" 
                className="w-full border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 py-6 rounded-2xl font-bold uppercase text-[11px] text-slate-900 dark:text-[#FFE7C2] hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
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