"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch"; // Nouveau
import RegionGrid from "@/components/RegionGrid";       // Nouveau
import PropertyGrid from "@/components/PropertyGrid";
import Testimonials from "@/components/Testimonials";   // Nouveau
import Footer from "@/components/Footer";

export default function Home() {
  const [filters, setFilters] = useState({
    type: "",
    town: "",
    beds: "",
    maxPrice: "",
    reference: "" // Ajout de la référence
  });

  return (
    <main className="bg-white">
      <Navbar />
      
      {/* 1. HERO (Vidéo) */}
      <Hero />
      
      {/* 2. RECHERCHE AVANCÉE (À cheval sur le Hero) */}
      <AdvancedSearch onSearch={(newFilters) => {
        setFilters(newFilters);
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* 3. VIGNETTES RÉGIONS (Compteur de propriétés) */}
      <RegionGrid />

      {/* 4. SECTION INTRODUCTION (Style Costa Blanca) */}
      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-6">
          Villas de luxe
        </h2>
        <h3 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight mb-10">
          Sélection de propriétés à vendre sur la Costa Blanca
        </h3>
        <p className="text-gray-500 font-light leading-relaxed text-xl italic max-w-3xl mx-auto">
          "Notre équipe <span className="font-bold not-italic text-slate-800">professionnelle</span> et multilingue évolue en permanence pour vous offrir un service personnalisé et une approche qui vous fait sentir guidé et accompagné."
        </p>
      </section>

      {/* 5. COLLECTION DE BIENS */}
      <div id="collection" className="bg-white py-20 border-t border-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-brand-primary uppercase tracking-tight">
            Propriétés à la une
          </h2>
          <div className="w-20 h-0.5 bg-brand-secondary mx-auto mt-4"></div>
        </div>
        
        <PropertyGrid activeFilters={filters} />
      </div>

      {/* 6. TÉMOIGNAGES CLIENTS */}
      <Testimonials />

      {/* 7. SECTION APPEL À L'ACTION (Vendre) */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            className="w-full h-full object-cover brightness-[0.4] scale-105" 
            alt="Vendre sa villa"
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h2 className="text-white font-serif text-4xl md:text-6xl mb-8 leading-tight">
            Vous souhaitez vendre votre propriété ?
          </h2>
          <p className="text-white/80 uppercase tracking-[0.3em] text-xs mb-12 font-light">
            Obtenez une estimation gratuite et professionnelle en 48h.
          </p>
          <button className="bg-transparent border border-white text-white px-12 py-5 uppercase text-[10px] tracking-[0.4em] font-bold hover:bg-white hover:text-brand-primary transition-all duration-700">
            Estimer mon bien
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}