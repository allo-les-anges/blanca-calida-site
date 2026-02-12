"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Testimonials from "@/components/Testimonials";
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
        console.error("Erreur chargement properties:", err);
      }
    }
    loadData();
  }, []);

  // 1. Cette fonction centralise la recherche et le scroll
  const handleSearch = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Petit délai pour laisser React mettre à jour les filtres avant de scroller
    setTimeout(() => {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      
      {/* 2. On branche la recherche */}
      <AdvancedSearch 
        properties={allProperties} 
        onSearch={handleSearch} 
      />

      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-6">
          Villas de luxe
        </h2>
        <h3 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight mb-10">
          Sélection de propriétés à vendre sur la Costa Blanca
        </h3>
      </section>

      {/* 3. On branche les régions : on lui donne les données ET la fonction de clic */}
      <RegionGrid 
        properties={allProperties} 
        onRegionClick={(townName) => handleSearch({ town: townName })} 
      />

      <div id="collection" className="bg-white py-20">
        <PropertyGrid activeFilters={filters} />
      </div>

      <Testimonials />
      <Footer />
    </main>
  );
}