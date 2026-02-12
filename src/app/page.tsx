"use client";

import { useState, useEffect, useMemo } from "react";
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

  // Extraire les types dynamiquement pour les boutons
  const propertyTypes = useMemo(() => {
    const types = allProperties.map((p: any) => p.type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [allProperties]);

  const handleSearch = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setTimeout(() => {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      
      <AdvancedSearch 
        properties={allProperties} 
        onSearch={handleSearch} 
        activeFilters={filters} 
      />

      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-6">
          Villas de luxe
        </h2>
        <h3 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight mb-10">
          Sélection de propriétés à vendre sur la Costa Blanca
        </h3>
      </section>

      <RegionGrid 
        properties={allProperties} 
        onRegionClick={(townName) => handleSearch({ town: townName, type: "" })} 
      />

      {/* FILTRES RAPIDES PAR TYPE */}
      <div className="max-w-7xl mx-auto px-6 pt-20 border-t border-slate-100">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <button
            onClick={() => handleSearch({ type: "" })}
            className={`pb-2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all border-b-2 ${
              filters.type === "" ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-400 hover:text-brand-primary"
            }`}
          >
            Tous les types
          </button>
          {propertyTypes.map((type: any) => (
            <button
              key={type}
              onClick={() => handleSearch({ type: type })}
              className={`pb-2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all border-b-2 ${
                filters.type.toLowerCase() === type.toLowerCase() ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-400 hover:text-brand-primary"
              }`}
            >
              {type}{type.toLowerCase().endsWith('s') ? '' : 's'}
            </button>
          ))}
        </div>
      </div>

      <div id="collection" className="bg-white py-20">
        <PropertyGrid activeFilters={filters} />
      </div>

      <Testimonials />
      <Footer />
    </main>
  );
}