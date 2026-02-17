"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function PropertyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        const found = data.find((p: any) => String(p.id) === String(id));

        if (found) {
          setProperty(found);
        }
      } catch (err) {
        console.error("Erreur detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  // --- LOADER GLOBAL ---
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
        <p className="font-serif text-3xl text-brand-primary">
          Propriété introuvable
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-brand-primary text-white text-[10px] uppercase tracking-widest font-bold"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      <div className="h-24 md:h-28"></div>

      {/* RETOUR */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-brand-primary transition-colors group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Retour à la collection
        </Link>
      </div>

      {/* GALERIE */}
      <section className="relative h-[65vh] md:h-[80vh] bg-black overflow-hidden group/gallery">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        <img
          src={property.images[activeImage]}
          alt={property.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain md:object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />

        {/* NAVIGATION GAUCHE / DROITE */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-500">
          <button
            onClick={() =>
              setActiveImage((prev) =>
                prev > 0 ? prev - 1 : property.images.length - 1
              )
            }
            className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white hover:text-brand-primary transition-all shadow-2xl"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() =>
              setActiveImage((prev) =>
                prev < property.images.length - 1 ? prev + 1 : 0
              )
            }
            className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white hover:text-brand-primary transition-all shadow-2xl"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* COMPTEUR */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-5 py-2 text-[9px] tracking-[0.3em] font-bold border border-white/10 uppercase">
          {activeImage + 1} / {property.images.length} Photos
        </div>
      </section>

      {/* CONTENU */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-20">
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-2">
          <span className="text-brand-secondary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
            {property.title?.split(" ")[0]} en vente
          </span>

          <h1 className="text-4xl md:text-6xl font-serif text-brand-primary mb-8 leading-tight">
            {property.title}
          </h1>

          <div className="flex items-center gap-3 text-gray-500 mb-12 border-b border-gray-100 pb-10">
            <MapPin size={18} className="text-brand-secondary" />
            <span className="uppercase tracking-[0.2em] text-[11px] font-medium">
              {property.town} • Costa Blanca
            </span>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-3 gap-1 md:gap-4 mb-16">
            <FeatureCard icon={<Bed />} label="Chambres" value={property.features.beds} />
            <FeatureCard icon={<Bath />} label="Bains" value={property.features.baths} />
            <FeatureCard icon={<Maximize />} label="Habitable" value={`${property.features.surface} m²`} />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-2xl font-serif text-brand-primary uppercase tracking-widest border-l-2 border-brand-secondary pl-6">
                Description
              </h2>

              <div className="text-gray-600 leading-relaxed text-lg font-light space-y-6">
                <p>
                  Découvrez cette propriété située à{" "}
                  <strong>{property.town}</strong>. Ce bien de type{" "}
                  {property.title?.split(" ")[0].toLowerCase()} a été sélectionné
                  pour sa situation privilégiée.
                </p>

                <p className="text-sm text-gray-400 font-medium">
                  Référence : {property.ref}
                </p>
              </div>
            </div>

            {/* CARTE */}
            <div className="pt-16 border-t border-gray-100">
              <h2 className="text-2xl font-serif text-brand-primary uppercase tracking-widest border-l-2 border-brand-secondary pl-6 mb-8">
                Localisation
              </h2>

              <div className="h-[400px] w-full bg-gray-100 grayscale contrast-125 border border-gray-200 shadow-inner overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={
                    property.lat && property.lng
                      ? `https://maps.google.com/maps?q=${property.lat},${property.lng}&z=14&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(
                          property.town + ", Spain"
                        )}&z=13&output=embed`
                  }
                  className="filter saturate-0 contrast-110"
                />
              </div>

              <p className="mt-4 text-[9px] text-gray-400 uppercase tracking-widest text-center italic">
                {property.lat
                  ? "* Localisation exacte du bien"
                  : `* Zone de ${property.town} (Localisation précise sur demande)`}
              </p>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-white border border-gray-100 p-10 shadow-xl shadow-gray-100/50">
            <div className="mb-10 text-center lg:text-left">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 font-bold">
                Prix de présentation
              </p>
              <p className="text-5xl font-serif text-brand-primary">
                {Number(property.price).toLocaleString("fr-FR")} €
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-brand-primary text-white py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-brand-secondary transition duration-500 shadow-lg shadow-gray-200">
                Planifier une visite
              </button>

              <a
                href={`https://wa.me/34627768233?text=${encodeURIComponent(
                  `Bonjour Blanca Calida, je souhaite obtenir plus d'informations sur la propriété : ${property.title} (Référence : ${property.ref}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-gray-200 text-brand-primary py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-brand-primary hover:text-white transition duration-500 flex items-center justify-center gap-3 group"
              >
                <MessageCircle
                  size={18}
                  className="text-green-500 group-hover:text-white transition-colors"
                />
                Contacter via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* --- PETIT COMPOSANT POUR LES FEATURES --- */
function FeatureCard({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <div className="bg-gray-50/50 p-8 border border-gray-100 text-center">
      <div className="mx-auto mb-4 text-brand-primary">{icon}</div>
      <p className="text-2xl font-serif text-brand-primary">{value}</p>
      <p className="text-[9px] uppercase text-gray-400 tracking-[0.2em] mt-1 font-bold">
        {label}
      </p>
    </div>
  );
}
