"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";

import { Property } from "@/types/property";

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [visibleCount, setVisibleCount] = useState(12); // 👉 nombre de propriétés visibles

  const [filters, setFilters] = useState({
    type: "",
    town: "",
    beds: "",
    minPrice: "",
    maxPrice: "",
    reference: "",
    development: "",
    availableOnly: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setAllProperties(data);
      } catch (err) {
        console.error("Erreur API:", err);
      }
    }
    loadData();
  }, []);

  const handleSearch = (newFilters: any) => {
    setFilters({ ...newFilters });
    setVisibleCount(12); // 👉 reset du compteur lors d’une recherche

    const section = document.getElementById("collection");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // 👉 Détection correcte des filtres actifs
  const hasActiveFilters =
    filters.type !== "" ||
    filters.town !== "" ||
    filters.beds !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.reference !== "" ||
    filters.development !== "";

  // 👉 Propriétés affichées (12, puis +12, etc.)
  const propertiesToShow = hasActiveFilters
    ? allProperties // si filtres → tout
    : allProperties.slice(0, visibleCount); // sinon → pagination

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />

      <AdvancedSearch
        properties={allProperties}
        onSearch={handleSearch}
        activeFilters={filters}
      />

      {/* RégionGrid toujours basé sur les 12 premières */}
      <RegionGrid
        properties={allProperties.slice(0, 12)}
        onRegionClick={(town) =>
          setFilters((prev) => ({ ...prev, town }))
        }
      />

      <section className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-4">
          Sélection Exclusive
        </h2>
        <h3 className="text-4xl md:text-5xl font-serif text-brand-primary leading-tight">
          Propriétés sur la Costa Blanca
        </h3>
      </section>

      <div id="collection" className="bg-white pb-20">
        <PropertyGrid 
          activeFilters={filters} 
          properties={propertiesToShow} 
        />

        {/* 👉 Bouton SHOW MORE (uniquement si pas de filtres) */}
        {!hasActiveFilters && visibleCount < allProperties.length && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="px-10 py-4 bg-slate-900 text-white uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-slate-800 transition-all"
            >
              Voir plus
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
