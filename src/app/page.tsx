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
  // 1. L'état pour stocker toutes les propriétés du XML
  const [allProperties, setAllProperties] = useState([]);
  
  // 2. L'état pour les filtres (avec les bons champs)
  const [filters, setFilters] = useState({
    type: "",
    town: "",
    beds: "",
    minPrice: "",  // Ajouté
    maxPrice: "",
    reference: "" 
  });

  // 3. Récupération des données au chargement de la page
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/properties"); // Ton API qui lit le XML
        const data = await res.json();
        setAllProperties(data);
      } catch (err) {
        console.error("Erreur chargement properties:", err);
      }
    }
    loadData();
  }, []);

  return (
    <main className="bg-white">
      <Navbar />
      
      {/* SECTION HERO (Vidéo seule) */}
      <Hero />
      
      {/* BARRE DE RECHERCHE (On lui passe les propriétés pour qu'elle soit dynamique) */}
      <AdvancedSearch 
        properties={allProperties} 
        onSearch={(newFilters) => {
          setFilters(newFilters);
          document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h2 className="text-brand-secondary text-[10px] uppercase tracking-[0.5em] font-bold mb-6">
          Villas de luxe
        </h2>
        <h3 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight mb-10">
          Sélection de propriétés à vendre sur la Costa Blanca
        </h3>
      </section>

      <RegionGrid />

      {/* GRILLE DE BIENS (Elle reçoit les filtres pour filtrer l'affichage) */}
      <div id="collection" className="bg-white py-20">
        <PropertyGrid activeFilters={filters} />
      </div>

      <Testimonials />
      <Footer />
    </main>
  );
}