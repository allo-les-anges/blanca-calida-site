"use client";

import React, { useEffect, useState } from 'react';
import { Bed, Bath, Maximize, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PropertyGrid({ activeFilters }: { activeFilters: any }) {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      });
  }, []);

  useEffect(() => {
    let result = [...allProperties];

    // Filtrage robuste
    if (activeFilters.type) {
      result = result.filter((p: any) => p.type.toLowerCase().trim() === activeFilters.type.toLowerCase().trim());
    }
    if (activeFilters.town) {
      result = result.filter((p: any) => p.town.toLowerCase().trim() === activeFilters.town.toLowerCase().trim());
    }
    if (activeFilters.beds) {
      result = result.filter((p: any) => (p.features?.beds || 0) >= parseInt(activeFilters.beds));
    }
    if (activeFilters.minPrice) {
      result = result.filter((p: any) => p.price >= parseInt(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      result = result.filter((p: any) => p.price <= parseInt(activeFilters.maxPrice));
    }
    if (activeFilters.reference) {
      result = result.filter((p: any) => p.ref?.toLowerCase().includes(activeFilters.reference.toLowerCase().trim()));
    }

    setFilteredProps(result);
    setVisibleCount(12);
  }, [activeFilters, allProperties]);

  if (loading) return <div className="text-center py-40 font-serif uppercase tracking-widest text-brand-primary animate-pulse">Curating your selection...</div>;

  const displayedProps = filteredProps.slice(0, visibleCount);

  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="mb-10 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
        {filteredProps.length} propriétés correspondent à votre recherche
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {displayedProps.map((prop: any) => (
          <div key={prop.id} className="group bg-white border border-gray-50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img src={prop.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-0 right-0 bg-brand-primary text-white px-6 py-3 font-serif text-lg">
                {Number(prop.price).toLocaleString('fr-FR')} €
              </div>
            </div>
            
            <div className="p-8">
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                {prop.town} • {prop.type}
              </span>
              <h3 className="font-serif text-2xl text-brand-primary mt-2 mb-4 line-clamp-1">{prop.title}</h3>
              <div className="flex gap-6 mb-8 text-slate-500 border-b border-gray-50 pb-6">
                <span className="flex items-center gap-2 text-xs font-light"><Bed size={14} className="text-brand-secondary"/> {prop.features.beds} Ch.</span>
                <span className="flex items-center gap-2 text-xs font-light"><Bath size={14} className="text-brand-secondary"/> {prop.features.baths} Sdb.</span>
                <span className="flex items-center gap-2 text-xs font-light"><Maximize size={14} className="text-brand-secondary"/> {prop.features.surface} m²</span>
              </div>
              <Link href={`/property/${prop.id}`} className="flex items-center justify-between w-full py-2 group/btn">
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary group-hover/btn:text-brand-secondary">Voir le bien</span>
                <ArrowRight size={16} className="text-brand-primary group-hover/btn:translate-x-2 transition-all" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < filteredProps.length && (
        <div className="flex justify-center mt-20">
          <button onClick={() => setVisibleCount(prev => prev + 12)} className="px-12 py-5 border border-brand-primary text-brand-primary uppercase text-[10px] font-bold tracking-widest hover:bg-brand-primary hover:text-white transition-all">
            Charger plus de propriétés
          </button>
        </div>
      )}

      {filteredProps.length === 0 && (
        <div className="text-center py-20 font-serif text-2xl text-gray-400 italic">
          Aucun bien ne correspond à vos critères.
        </div>
      )}
    </section>
  );
}