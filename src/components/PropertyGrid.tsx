"use client";

import React, { useEffect, useState } from 'react';
import { Bed, Bath, Maximize, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PropertyGrid({ activeFilters }: { activeFilters: any }) {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProps, setFilteredProps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // PAGINATION : On commence par afficher 12 biens
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProperties(data);
          setFilteredProps(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  // LOGIQUE DE FILTRAGE ET PAGINATION
  useEffect(() => {
    let result = allProperties;

    // Filtre par type
    if (activeFilters.type) {
      result = result.filter((p: any) => p.type.includes(activeFilters.type));
    }
    // Filtre par ville
    if (activeFilters.town) {
      result = result.filter((p: any) => 
        p.town.toLowerCase().includes(activeFilters.town.toLowerCase())
      );
    }
    // Filtre par chambres (Min)
    if (activeFilters.beds) {
      result = result.filter((p: any) => p.features.beds >= parseInt(activeFilters.beds));
    }
    // Filtre par prix (Max)
    if (activeFilters.maxPrice) {
      result = result.filter((p: any) => p.price <= parseInt(activeFilters.maxPrice));
    }

    setFilteredProps(result);
    setVisibleCount(12); // On reset à 12 dès qu'un filtre est appliqué
  }, [activeFilters, allProperties]);

  if (loading) return (
    <div className="text-center py-40 font-serif uppercase tracking-[0.3em] text-brand-primary animate-pulse">
      Curating your selection...
    </div>
  );

  // Les propriétés réellement affichées
  const displayedProps = filteredProps.slice(0, visibleCount);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Grille de propriétés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {displayedProps.map((prop: any) => (
          <div key={prop.id} className="group bg-white border border-gray-50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            
           <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
  <img src={prop.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
  
  {/* Badge de prix style Costa Houses */}
  <div className="absolute bottom-0 right-0 bg-brand-primary text-white px-6 py-3 font-serif text-lg">
    {Number(prop.price).toLocaleString('fr-FR')} €
  </div>

  {/* Badge dynamique du XML */}
  {prop.isNew && (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-primary px-3 py-1 text-[9px] font-bold tracking-widest uppercase">
      Nouveau Projet
    </div>
  )}
</div>
            
            <div className="p-8">
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em]">
                {prop.town} • {prop.type}
              </span>
              <h3 className="font-serif text-2xl text-brand-primary mt-2 mb-4 line-clamp-1">
                {prop.title}
              </h3>
              
              <div className="flex gap-6 mb-8 text-slate-500 border-b border-gray-50 pb-6">
                <span className="flex items-center gap-2 text-xs font-light"><Bed size={14} className="text-brand-secondary"/> {prop.features.beds} Ch.</span>
                <span className="flex items-center gap-2 text-xs font-light"><Bath size={14} className="text-brand-secondary"/> {prop.features.baths} Sdb.</span>
                <span className="flex items-center gap-2 text-xs font-light"><Maximize size={14} className="text-brand-secondary"/> {prop.features.surface} m²</span>
              </div>

              <Link 
                href={`/property/${prop.id}`} 
                className="flex items-center justify-between w-full group/btn py-2 border-b border-brand-primary/10 hover:border-brand-secondary transition-all"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-primary group-hover/btn:text-brand-secondary transition-colors">
                  Voir le bien
                </span>
                <ArrowRight size={16} className="text-brand-primary group-hover/btn:translate-x-2 group-hover/btn:text-brand-secondary transition-all" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* BOUTON CHARGER PLUS */}
      {visibleCount < filteredProps.length && (
        <div className="flex justify-center mt-20">
          <button 
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="group relative px-12 py-5 border border-brand-primary text-brand-primary overflow-hidden transition-all duration-500 hover:text-white"
          >
            <div className="absolute inset-0 w-0 bg-brand-primary transition-all duration-500 group-hover:w-full -z-10"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
              Charger plus de propriétés
            </span>
          </button>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredProps.length === 0 && (
        <div className="text-center py-20">
          <p className="font-serif text-2xl text-gray-400 italic">Aucun bien ne correspond à vos critères.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-brand-secondary underline text-sm uppercase tracking-widest"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </section>
  );
}