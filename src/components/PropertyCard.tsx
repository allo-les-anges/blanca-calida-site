"use client";

import { useState } from "react";
import Link from "next/link";
import { Bed, Bath, Maximize } from "lucide-react";

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/property/${property.id}`}
      className="group block border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-white"
    >
      {/* IMAGE */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}

        <img
          src={property.images?.[0]}
          alt={property.title}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } group-hover:scale-110`}
        />
      </div>

      {/* CONTENU */}
      <div className="p-6 space-y-4">

        {/* VILLE + TYPE */}
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">
          {property.town} — {property.title?.split(" ")[0]}
        </p>

        {/* TITRE */}
        <h3 className="font-serif text-xl text-brand-primary leading-tight">
          {property.title}
        </h3>

        {/* PRIX */}
        <p className="text-2xl font-serif text-brand-primary">
          {Number(property.price).toLocaleString("fr-FR")} €
        </p>

        {/* FEATURES */}
        <div className="flex items-center gap-6 text-gray-500 text-sm pt-2">
          <span className="flex items-center gap-2">
            <Bed size={16} /> {property.features.beds}
          </span>
          <span className="flex items-center gap-2">
            <Bath size={16} /> {property.features.baths}
          </span>
          <span className="flex items-center gap-2">
            <Maximize size={16} /> {property.features.surface} m²
          </span>
        </div>

        {/* RÉFÉRENCE */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 pt-2">
          Ref : {property.ref}
        </p>
      </div>
    </Link>
  );
}
