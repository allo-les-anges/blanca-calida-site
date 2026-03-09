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
    // On nettoie agressivement les styles en ligne qui pourraient forcer une couleur sombre
    return html
      .replace(/style="[^"]*"/gi, '')
      .replace(/color="[^"]*"/gi, '')
      .replace(/face="[^"]*"/gi, '')
      .replace(/size="[^"]*"/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/ /g, ' ');
  };

  if (!mounted) return null;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-[#FFE7C2]">
      <Loader2 className="animate-spin mb-4" size={40} />
      Chargement de l'exception...
    </div>
  );

  if (!property) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617] p-6 text-center">
      <h1 className="text-2xl text-white mb-4">Propriété non trouvée</h1>
      <Link href="/" className="px-6 py-3 bg-[#FFE7C2] text-black rounded-full font-bold">
        Retour au catalogue
      </Link>
    </div>
  );

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);

  return (
    <main id="property-detail-root" className="bg-[#020617] min-h-screen transition-colors duration-500">
      <style jsx global>{`
        /* FORÇAGE ABSOLU DES COULEURS */
        #property-detail-root h1, 
        #property-detail-root h2, 
        #property-detail-root p, 
        #property-detail-root span,
        #property-detail-root .forced-white-text * {
          color: #ffffff !important;
          fill: #ffffff !important;
        }

        #property-detail-root .text-gold-custom {
          color: #FFE7C2 !important;
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
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold-custom font-bold">
          <ArrowLeft size={14} /> Retour à la sélection
        </Link>
      </div>

      {/* --- GALERIE --- */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[550px]">
          <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#111] h-[400px] md:h-full group border border-white/5">
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-700" style={{ opacity: activeImage === idx ? 1 : 0, zIndex: activeImage === idx ? 10 : 0 }}>
                  <img src={img} className="w-full h-full object-cover brightness-90" alt="" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => { setActiveImage(idx); scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' }); }} 
                className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D4AF37] scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
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
          
          <h1 className="text-4xl md:text-7xl font-serif mb-8 leading-[1.1] font-bold">
            {property.titre || "Villa d'Exception"}
          </h1>
          
          <div className="flex items-center gap-3 text-gold-custom mb-8 text-[11px] uppercase tracking-[0.2em] font-bold">
            <MapPin size={18} className="text-[#D4AF37]" />
            {property.town || property.ville} • {property.region}
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 text-[9px] uppercase font-bold tracking-wider">
              <ShieldCheck size={14} className="text-[#D4AF37]" /> Amaru Certified
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 text-[9px] uppercase font-bold tracking-wider">
              <Car size={14} className="text-[#D4AF37]" /> Parking Inclus
            </div>
          </div>

          {/* GRILLE TECHNIQUE */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {[
              { icon: Bed, val: property.beds, label: "Chambres" },
              { icon: Bath, val: property.baths, label: "Bains" },
              { icon: Maximize, val: property.surface_built, label: "Bâti m²" },
              { icon: Home, val: property.surface_plot, label: "Terrain m²" },
              { icon: Waves, val: (property.pool === "Oui" ? "Privée" : "Non"), label: "Piscine" },
              { icon: Car, val: "Privé", label: "Parking" }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-3xl text-center border border-white/10 shadow-xl">
                <item.icon className="mx-auto mb-2 text-[#D4AF37]" size={22} />
                <p className="text-2xl font-serif font-bold">{item.val || "0"}</p>
                <p className="text-[8px] uppercase opacity-60 font-bold tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="max-w-none mb-20 pt-10 border-t border-white/10">
            <h2 className="text-3xl font-serif italic mb-8">L'Art de Vivre</h2>
            <div 
              className="forced-white-text text-lg leading-relaxed opacity-90"
              dangerouslySetInnerHTML={{ 
                __html: cleanDescription(property.description || "Description en cours de rédaction...") 
              }} 
            />
          </div>
        </div>

        {/* SIDEBAR PRIX */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 space-y-6">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-2xl backdrop-blur-md">
              <p className="text-[10px] uppercase text-gold-custom opacity-70 mb-2 font-bold tracking-widest">Prix de vente</p>
              <p className="text-5xl font-serif leading-none mb-10 font-bold">
                {numericPrice.toLocaleString("fr-FR")} €
              </p>
              
              <button className="w-full bg-[#D4AF37] text-black py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:scale-[1.02] transition-transform mb-4">
                Réserver une visite
              </button>
              
              <a 
                href={`https://wa.me/34627768233?text=Info ref: ${property.ref || property.id_externe}`} 
                target="_blank" 
                className="w-full border border-white/20 flex items-center justify-center gap-3 py-6 rounded-2xl font-bold uppercase text-[11px] text-gold-custom hover:bg-white/5 transition-all"
              >
                <MessageCircle size={20} className="text-green-400" /> WhatsApp Direct
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
