"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import RegionGrid from "@/components/RegionGrid";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import { Property } from "@/types/property";

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- LOGIQUE DE FILTRAGE CALCULÉE ---
  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      // 1. Développement
      const matchDev = !filters.development || 
        p.development_name?.toLowerCase().trim() === filters.development.toLowerCase().trim();

      // 2. Disponibilité (CORRECTION TYPE ERROR VERCEL)
      // On utilise (p as any) pour éviter l'erreur de propriété manquante sur le type Property
      const hasUnits = (p as any).units !== undefined && Number((p as any).units) > 0;
      const matchAvailable = !filters.availableOnly || hasUnits;

      // 3. Ville
      const matchTown = !filters.town || p.town === filters.town;

      // 4. Type
      const matchType = !filters.type || 
        p.type?.toLowerCase().includes(filters.type.toLowerCase());

      // 5. Chambres
      const matchBeds = !filters.beds || Number(p.beds) >= Number(filters.beds);

      // 6. Prix
      const price = Number(p.price);
      const matchMin = !filters.minPrice || price >= Number(filters.minPrice);
      const matchMax = !filters.maxPrice || price <= Number(filters.maxPrice);

      // 7. Référence
      const matchRef = !filters.reference || 
        p.ref?.toLowerCase().includes(filters.reference.toLowerCase());

      return matchDev && matchAvailable && matchTown && matchType && matchBeds && matchMin && matchMax && matchRef;
    });
  }, [allProperties, filters]);

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== false
  );

  const propertiesToShow = hasActiveFilters
    ? filteredProperties
    : filteredProperties.slice(0, visibleCount);

  const handleSearch = (newFilters: any) => {
    setFilters({ ...newFilters });
    setVisibleCount(12);

    const section = document.getElementById("collection");
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleRegionClick = (town: string) => {
    setFilters({
      type: "",
      town,
      beds: "",
      minPrice: "",
      maxPrice: "",
      reference: "",
      development: "",
      availableOnly: false,
    });

    const section = document.getElementById("collection");
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  if (loading) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-slate-900"></div>
      </main>
    );
  }

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
        properties={allProperties}
        onRegionClick={handleRegionClick}
      />

      <section className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-gray-400 text-[10px] uppercase tracking-[0.5em] font-bold mb-4">
          Sélection Exclusive
        </h2>
        <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
          Propriétés sur la Costa Blanca
        </h3>
      </section>

      <div id="collection" className="bg-white pb-20">
        <PropertyGrid activeFilters={filters} properties={propertiesToShow} />

        {!hasActiveFilters && visibleCount < filteredProperties.length && (
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