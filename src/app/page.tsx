"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import Expertise from "@/components/Expertise"; // À créer (voir étape précédente)
import Footer from "@/components/Footer";

export default function Home() {
  // État pour les filtres (sync avec le Hero)
  const [filters, setFilters] = useState({
    type: "",
    town: "",
    beds: "",
    maxPrice: ""
  });

  return (
    <main className="bg-white">
      <Navbar />
      
      {/* 1. SECTION HERO (Vidéo + Moteur de recherche) */}
      <Hero onSearch={(newFilters) => {
        setFilters(newFilters);
        // Scroll automatique vers la collection lors d'une recherche
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
      }} />
      
      {/* 2. SECTION INTRODUCTION (Style Costa Houses) */}
      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-4">
          Blanca Calida Real Estate
        </h2>
        <h3 className="text-3xl md:text-5xl font-serif text-brand-primary leading-tight mb-8">
          Votre partenaire de confiance pour l'immobilier d'exception sur la Costa Blanca
        </h3>
        <p className="text-gray-500 font-light leading-relaxed text-lg italic">
          "Spécialistes de la vente de propriétés de luxe, nous vous accompagnons dans la recherche de votre villa de rêve, de Javea à Altea."
        </p>
      </section>

      {/* 3. SECTION EXPERTISE (Les 3 points clés) */}
      <Expertise />

      {/* 4. SECTION COLLECTION (Grille de biens) */}
      <div id="collection" className="bg-white py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-brand-primary uppercase tracking-tight">
            Propriétés à la une
          </h2>
          <div className="w-20 h-0.5 bg-brand-secondary mx-auto mt-4"></div>
        </div>
        
        {/* On passe les filtres à la grille */}
        <PropertyGrid activeFilters={filters} />
      </div>

      {/* 5. SECTION "VENDRE" (L'appel à l'action stratégique) */}
      <section className="relative h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            className="w-full h-full object-cover brightness-[0.3]" 
            alt="Vendre sa villa"
          />
        </div>
        <div className="relative z-10 text-center px-6">
          <h2 className="text-white font-serif text-4xl md:text-6xl mb-6">
            Vous souhaitez vendre votre propriété ?
          </h2>
          <p className="text-white/80 uppercase tracking-[0.3em] text-xs mb-10 font-light">
            Obtenez une estimation gratuite et professionnelle en 48h.
          </p>
          <button className="bg-transparent border border-white text-white px-10 py-5 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-white hover:text-brand-primary transition-all duration-500">
            Estimer mon bien
          </button>
        </div>
      </section>

      {/* 6. FOOTER */}
      <Footer />
    </main>
  );
}