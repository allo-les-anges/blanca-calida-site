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

    const section = document.getElementById("collection");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />

      {/* 🔍 BARRE DE RECHERCHE */}
      <AdvancedSearch
        properties={allProperties}
        onSearch={handleSearch}
        activeFilters={filters}
      />

      {/* 🗺️ GRID DES RÉGIONS (comme avant) */}
      <RegionGrid
        properties={allProperties}
        onRegionClick={(town) =>
          setFilters((prev) => ({ ...prev, town }))
        }
      />

      {/* SECTION TITRE */}
      <section className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-4">
          Sélection Exclusive
        </h2>
        <h3 className="text-4xl md:text-5xl font-serif text-brand-primary leading-tight">
          Propriétés sur la Costa Blanca
        </h3>
      </section>

      {/* COLLECTION */}
      <div id="collection" className="bg-white pb-20">
        <PropertyGrid activeFilters={filters} />
      </div>

      <Footer />
    </main>
  );
}
