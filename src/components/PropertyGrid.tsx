"use client";

import Link from "next/link";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";

export default function PropertyCard({ property }: { property: any }) {
  // On récupère la surface construite
  const surface = property.surface_built || "0";
  const prix = Number(property.price || property.prix || 0);

  return (
    <Link href={`/villas/${property.id_externe || property.id}`}>
      <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
        
        {/* IMAGE */}
        <div className="relative h-72 overflow-hidden">
          <img 
            src={property.images?.[0] || "/images/placeholder.jpg"} 
            alt={property.titre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* CONTENU */}
        <div className="p-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
            <MapPin size={12} /> {property.town || property.ville}
          </div>

          <h3 className="font-serif text-2xl text-slate-900 mb-6 line-clamp-1">
            {property.titre || "Villa Neuve"}
          </h3>

          <p className="text-3xl font-serif text-slate-900 mb-8">
            {prix.toLocaleString("fr-FR")} €
          </p>

          {/* SECTION DES CARACTÉRISTIQUES - C'EST ICI QUE ÇA SE PASSE */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <Bed size={18} className="text-slate-300" />
              <span className="text-sm font-medium text-slate-600">{property.beds || 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <Bath size={18} className="text-slate-300" />
              <span className="text-sm font-medium text-slate-600">{property.baths || 0}</span>
            </div>

            {/* LA LIGNE CI-DESSOUS COMMANDE L'AFFICHAGE DES M2 */}
            <div className="flex items-center gap-2">
              <Maximize size={18} className="text-slate-300" />
              <span className="text-sm font-medium text-slate-600">
                {surface} m²
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}