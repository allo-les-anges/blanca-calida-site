"use client";

import React from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE').format(price) + ' €';
  };

  const isNearBeach = property.distance_beach && parseInt(property.distance_beach) <= 2000;
  const hasPool = property.pool === "Oui" || property.pool === "1";

  return (
    <Link href={`/property/${property.id_externe || property.id}`} className="group flex flex-col bg-white transition-all duration-500">
      <div className="relative h-[420px] overflow-hidden shadow-sm rounded-sm">
        <img 
          src={property.images?.[0] || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[85%]">
          <span className="bg-[#C1A87D] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            REF: {property.ref || property.id_externe}
          </span>
          {isNearBeach && (
            <span className="bg-[#7D917D] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              PROCHE MER
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
             VUE DÉGAGÉE
          </span>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-3">
           <button className="bg-white/90 p-2.5 rounded-full shadow-md">
              <Heart size={18} className="text-slate-400" />
           </button>
           <div className="bg-[#C1A87D] p-2.5 rounded-full text-white shadow-md">
              <ChevronRight size={20} />
           </div>
        </div>
      </div>

      <div className="pt-8 pb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-[26px] text-slate-900 leading-tight">
            {property.type || "Villa"} <span className="text-slate-300 font-sans text-lg ml-1">· {property.town}</span>
          </h3>
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(property.price || property.prix)}
          </span>
        </div>
        <p className="text-slate-400 text-[10px] tracking-[0.3em] uppercase font-bold">
          {property.town} · {property.region || "Costa Blanca"}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-8 flex justify-between items-center text-slate-500 px-1">
        <IconItem icon={<Maximize size={22} />} label={`${property.surface_built || '0'} m²`} />
        <IconItem icon={<Map size={22} />} label={`${property.surface_plot || '0'} m²`} />
        <IconItem icon={<Bed size={22} />} label={property.beds || '0'} />
        <IconItem icon={<Bath size={22} />} label={property.baths || '0'} />
        <IconItem icon={<Waves size={22} />} label={hasPool ? "OUI" : "NON"} />
        <IconItem icon={<Car size={22} />} label="PRIVÉ" />
      </div>
    </Link>
  );
}

function IconItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-slate-400">{icon}</div>
      <span className="text-[10px] font-bold tracking-tight uppercase">{label}</span>
    </div>
  );
}