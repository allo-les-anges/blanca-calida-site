"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, Loader2, Image as ImageIcon, Globe } from "lucide-react";
import Link from "next/link";

// 1. DICTIONNAIRE DE TRADUCTION
const i18n: any = {
  fr: { back: "Retour à la sélection", rooms: "Chambres", baths: "Bains", surface: "Surface", config: "Configurations disponibles", selected: "Sélectionné", from: "Dès", contact: "Réserver une visite", delivery: "Livraison", loading: "Chargement...", notFound: "Non trouvé", priceModel: "Prix du modèle" },
  en: { back: "Back to selection", rooms: "Bedrooms", baths: "Baths", surface: "Surface", config: "Available configurations", selected: "Selected", from: "From", contact: "Book a viewing", delivery: "Delivery", loading: "Loading...", notFound: "Not found", priceModel: "Model price" },
  es: { back: "Volver a la selección", rooms: "Dormitorios", baths: "Baños", surface: "Superficie", config: "Configuraciones disponibles", selected: "Seleccionado", from: "Desde", contact: "Reservar visita", delivery: "Entrega", loading: "Cargando...", notFound: "No encontrado", priceModel: "Precio del modelo" },
  nl: { back: "Terug naar selectie", rooms: "Slaapkamers", baths: "Badkamers", surface: "Oppervlakte", config: "Beschikbare configuraties", selected: "Geselecteerd", from: "Vanaf", contact: "Bezoek plannen", delivery: "Oplevering", loading: "Laden...", notFound: "Niet gevonden", priceModel: "Model prijs" }
};

export default function PropertyDetailClient({ id }: { id: string }) {
  const [property, setProperty] = useState<any>(null);
  const [relatedUnits, setRelatedUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  // LOGIQUE DE LANGUE
  const [lang, setLang] = useState("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("preferred_lang");
    if (savedLang && i18n[savedLang]) {
      setLang(savedLang);
    }

    async function fetchData() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        const propertiesArray = Array.isArray(data) ? data : (data.properties || []);
        const current = propertiesArray.find((p: any) => String(p.id) === String(id));
        if (current) {
          setProperty(current);
          if (current.development_name) {
            const related = propertiesArray.filter((p: any) => p.development_name === current.development_name);
            setRelatedUnits(related.sort((a: any, b: any) => a.price - b.price));
          }
        }
      } catch (err) { console.error("Erreur Fetch:", err); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, [id]);

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("preferred_lang", newLang);
  };

  // Sécurité Hydratation (SSR)
  if (!mounted) return null;

  const t = i18n[lang];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white italic font-serif text-slate-400">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      {t.loading}
    </div>
  );

  if (!property) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-serif mb-4">{t.notFound}</h1>
      <Link href="/" className="px-6 py-3 bg-black text-white text-[10px] uppercase tracking-widest rounded-full">{t.back}</Link>
    </div>
  );

  const images = property.images || [];

  return (
    // La clé key={lang} force React à rafraîchir tout l'affichage lors du changement de langue
    <main key={lang} className="bg-white min-h-screen text-slate-900">
      <Navbar />

      {/* SÉLECTEUR DE LANGUE FLOTTANT */}
      <div className="fixed top-24 right-6 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-slate-100">
        <Globe size={14} className="ml-2 mr-1 text-slate-400" />
        {['fr', 'en', 'es', 'nl'].map((l) => (
          <button 
            key={l} 
            onClick={() => handleLangChange(l)}
            className={`w-8 h-8 rounded-full text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="h-24 md:h-32" />

      {/* BOUTON RETOUR */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all">
          <ArrowLeft size={14} /> {t.back}
        </Link>
      </div>

      {/* GALERIE PHOTOS */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
          <div className="md:col-span-3 relative rounded-[2.5rem] overflow-hidden group shadow-2xl bg-slate-100">
            <img 
              src={images[activeImage]} 
              className="w-full h-full object-cover" 
              alt={property.title}
              key={activeImage}
            />
            <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> {activeImage + 1} / {images.length}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-emerald-500 scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* INFOS PRINCIPALES */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
        <div className="lg:col-span-2">
          <h1 className="text-5xl md:text-6xl font-serif mb-8 text-slate-900 leading-[1.1]">
            {property.title}
          </h1>
          
          <div className="flex items-center gap-3 text-gray-400 mb-12 text-[11px] uppercase tracking-[0.2em] font-bold">
            <MapPin size={18} className="text-emerald-500" />
            {property.town} • {property.province}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-16">
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Bed className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.beds}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">{t.rooms}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Bath className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.baths}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">{t.baths}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <Maximize className="mx-auto mb-2 text-emerald-600" size={22} />
              <p className="text-2xl font-serif">{property.surface_area?.built}</p>
              <p className="text-[8px] uppercase text-gray-400 font-bold tracking-widest">{t.surface} m²</p>
            </div>
          </div>

          {/* TABLEAU DES CONFIGURATIONS */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif italic mb-8">{t.config}</h2>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl">
              <table className="w-full text-left bg-white text-sm">
                <thead className="bg-slate-900 text-white text-[9px] uppercase tracking-widest">
                  <tr>
                    <th className="py-5 px-8">Modèle</th>
                    <th className="py-5 px-4 text-center">{t.rooms}</th>
                    <th className="py-5 px-8 text-right">{t.from}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {relatedUnits.map((unit: any) => (
                    <tr key={unit.id} className={unit.id === property.id ? 'bg-emerald-50/50' : ''}>
                      <td className="py-6 px-8 font-medium">{unit.title}</td>
                      <td className="py-6 px-4 text-center text-gray-600">{unit.beds}</td>
                      <td className="py-6 px-8 text-right font-serif text-lg">
                        {unit.id === property.id ? (
                          <span className="text-emerald-600 font-bold">{t.selected}</span>
                        ) : (
                          <Link href={`/property/${unit.id}`} className="text-slate-900 underline decoration-slate-200">
                            {Number(unit.price).toLocaleString(lang === 'fr' ? "fr-FR" : "en-US")} €
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-gray-600 text-lg mb-20 pt-10 border-t border-slate-100">
              <div dangerouslySetInnerHTML={{ __html: property.description }} />
          </div>
        </div>

        {/* SIDEBAR DE PRIX */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl">
            <p className="text-[10px] uppercase text-gray-400 mb-2 font-bold tracking-widest">{t.priceModel}</p>
            <p className="text-5xl font-serif text-slate-900 leading-none mb-10">
              {Number(property.price).toLocaleString(lang === 'fr' ? "fr-FR" : "en-US")} €
            </p>
            <button className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-800 transition-all mb-4">
              {t.contact}
            </button>
            <a 
              href={`https://wa.me/34627768233?text=Information: ${property.title}`}
              target="_blank" 
              className="w-full border border-slate-200 flex items-center justify-center gap-3 py-6 rounded-2xl font-bold uppercase text-[11px] text-slate-700 hover:bg-slate-50 transition-all"
            >
              <MessageCircle size={20} className="text-green-500" /> WhatsApp
            </a>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="text-gray-300">{t.delivery}</span>
                <span className="text-slate-900 font-bold">{property.key_date}</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}