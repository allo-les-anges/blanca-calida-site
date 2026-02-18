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
  const [initialProperties, setInitialProperties] = useState<Property[]>([]);

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
        setInitialProperties(data.slice(0, 12)); // 👉 Limite à 12
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

  // 👉 Détection si un filtre est actif
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  // 👉 Propriétés à afficher
  const propertiesToShow = hasActiveFilters
    ? allProperties
    : initialProperties;

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />

      <AdvancedSearch
        properties={allProperties}
        onSearch={handleSearch}
        activeFilters={filters}
      />

      <RegionGrid
        properties={initialProperties}
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
      </div>

      <Footer />
    </main>
  );
}
