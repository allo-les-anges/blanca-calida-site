"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";

export default function Home() {
  const [allProperties, setAllProperties] = useState([]);
  const [filters, setFilters] = useState({
    type: "", town: "", beds: "", minPrice: "", maxPrice: "", reference: "" 
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
    // LE LOG INDISPENSABLE
    console.log("=== ACTION: RECHERCHE LANCÉE ===", newFilters);
    setFilters({ ...newFilters }); // On crée un nouvel objet pour forcer React à réagir
    
    // Scroll fluide vers les résultats
    const section = document.getElementById('collection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      
      {/* Passage des props avec vérification */}
      <AdvancedSearch 
        properties={allProperties} 
        onSearch={handleSearch} 
        activeFilters={filters} 
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
        {/* On passe filters ici, PropertyGrid réagira à chaque changement */}
        <PropertyGrid activeFilters={filters} />
      </div>

      <Footer />
    </main>
  );
}