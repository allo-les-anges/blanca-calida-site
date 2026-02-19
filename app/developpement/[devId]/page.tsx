"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bed, Bath, Maximize, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DevelopmentPage() {
  const { devId } = useParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fonction de comparaison ultra-robuste
  const slugify = (text: string) =>
    text
      ?.toString()
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  // FILTRAGE : On cherche Adhara
  const devUnits = properties.filter((p) => {
    const nameInJson = slugify(p.development_name || "");
    const idInUrl = String(devId).toLowerCase();
    return nameInJson === idInUrl;
  });

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

  if (!devUnits.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p>Projet "{devId}" non trouvé.</p>
        <Link href="/">Retour</Link>
      </div>
    );
  }

  const dev = devUnits[0];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      <div className="h-24 md:h-32"></div>

      <div className="max-w-7xl mx-auto px-6">
        {/* EN-TÊTE DYNAMIQUE */}
        <section className="mb-12">
          <h1 className="text-5xl font-serif text-slate-900">{dev.development_name}</h1>
          <p className="text-gray-500">{dev.town}, {dev.province}</p>
          
          <div className="mt-4 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full inline-block text-xs font-bold uppercase">
             {dev.units} unités disponibles
          </div>
        </section>

        {/* GRILLE DES UNITÉS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {devUnits.map((unit) => (
            <div key={unit.id} className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <img 
                src={unit.images?.[0]} 
                alt={unit.title} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2">{unit.title}</h3>
                
                {/* PRIX (Basé sur ton JSON) */}
                <div className="mb-4">
                  <p className="text-2xl font-serif text-slate-900">
                    {unit.price.toLocaleString("fr-FR")} €
                  </p>
                  {unit.price_to && (
                    <p className="text-sm text-gray-400">
                      jusqu'à {unit.price_to.toLocaleString("fr-FR")} €
                    </p>
                  )}
                </div>

                {/* FEATURES (Basé sur ton JSON) */}
                <div className="flex justify-between border-t border-gray-50 pt-4 text-gray-500">
                  <span className="flex items-center gap-1"><Bed size={16}/> {unit.beds}</span>
                  <span className="flex items-center gap-1"><Bath size={16}/> {unit.baths}</span>
                  <span className="flex items-center gap-1">
                    <Maximize size={16}/> {unit.surface_area?.built} m²
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}