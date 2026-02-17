"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bed, Bath, Maximize, ArrowLeft } from "lucide-react";
import Link from "next/link";

// 👉 On importe le type Property
import { Property } from "@/types/property";

export default function DevelopmentPage() {
  const { id } = useParams();

  // 👉 On typage correctement le tableau
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  // 👉 TypeScript comprend maintenant development_id
  const devUnits = properties.filter(
    (p) => String(p.development_id) === String(id)
  );

  if (!devUnits.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
        <p className="font-serif text-3xl text-brand-primary">
          Développement introuvable
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

  const dev = devUnits[0];
  const available = devUnits.filter((u) => u.availability === "available");
  const sold = devUnits.filter((u) => u.availability !== "available");

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

      {/* TITRE */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl md:text-6xl font-serif text-brand-primary mb-2">
          {dev.development_name}
        </h1>
        <p className="text-gray-600 text-lg">{dev.development_location}</p>

        {dev.development_description && (
          <p className="text-gray-600 leading-relaxed text-lg font-light mt-8 max-w-3xl">
            {dev.development_description}
          </p>
        )}
      </section>

      {/* IMAGES DU DÉVELOPPEMENT */}
      {dev.development_images?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dev.development_images.map((img: string, i: number) => (
              <div key={i} className="relative h-40 bg-gray-200 overflow-hidden rounded-lg">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <img
                  src={img}
                  alt={dev.development_name}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* UNITÉS DISPONIBLES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif text-brand-primary mb-10">
          Unités disponibles ({available.length})
        </h2>

        {available.length === 0 && (
          <p className="text-gray-500 mb-10">Aucune unité disponible.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {available.map((unit) => (
            <UnitCard key={unit.id} unit={unit} available />
          ))}
        </div>
      </section>

      {/* UNITÉS VENDUES */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-serif text-brand-primary mb-10">
          Unités vendues ({sold.length})
        </h2>

        {sold.length === 0 && (
          <p className="text-gray-500">Aucune unité vendue.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {sold.map((unit) => (
            <UnitCard key={unit.id} unit={unit} available={false} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* --- CARTE D’UNITÉ (DISPONIBLE / VENDUE) --- */
function UnitCard({
  unit,
  available,
}: {
  unit: Property;
  available: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm transition-all ${
        available ? "opacity-100" : "opacity-60"
      }`}
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        <img
          src={unit.images?.[0]}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      </div>

      <div className="p-6 space-y-3">
        <h3 className="font-serif text-xl text-brand-primary leading-tight">
          {unit.title}
        </h3>

        <p className="text-gray-500">{unit.town}</p>

        <p className="text-2xl font-serif text-brand-primary">
          {Number(unit.price).toLocaleString("fr-FR")} €
        </p>

        <div className="flex items-center gap-6 text-gray-500 text-sm pt-2">
          <span className="flex items-center gap-2">
            <Bed size={16} /> {unit.features.beds}
          </span>
          <span className="flex items-center gap-2">
            <Bath size={16} /> {unit.features.baths}
          </span>
          <span className="flex items-center gap-2">
            <Maximize size={16} /> {unit.features.surface} m²
          </span>
        </div>

        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 pt-2">
          Ref : {unit.ref}
        </p>

        <p
          className={`text-[10px] uppercase font-bold mt-2 ${
            available ? "text-green-600" : "text-red-600"
          }`}
        >
          {available ? "Disponible" : "Non disponible"}
        </p>
      </div>
    </div>
  );
}
