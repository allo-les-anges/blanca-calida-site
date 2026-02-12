"use client";
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function Hero({ onSearch }: { onSearch: (f: any) => void }) {
  const [localFilters, setLocalFilters] = useState({ type: "", town: "", beds: "", maxPrice: "" });

  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      <video 
  autoPlay 
  muted 
  loop 
  playsInline 
  preload="auto"
  className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
>
  <source 
    src="https://res.cloudinary.com/dcbofid9h/video/upload/v1615471900/luxury-villa_znd6sq.mp4" 
    type="video/mp4" 
  />
  {/* Option de secours si le lien Cloudinary est capricieux */}
  <source 
    src="https://assets.mixkit.co/videos/preview/mixkit-modern-villa-with-a-swimming-pool-at-sunset-28543-large.mp4" 
    type="video/mp4" 
  />
</video>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-4xl md:text-7xl font-serif mb-6 tracking-tight leading-tight">
          Villas de Luxe & <br/> Propriétés d'Exception
        </h1>
        <p className="text-white/80 text-sm md:text-base uppercase tracking-[0.4em] mb-12 font-light">
          COSTA BLANCA | ALICANTE | VALENCIA
        </p>

        {/* Barre de recherche style "Costa Houses" */}
        <div className="bg-white p-2 shadow-2xl max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-2 rounded-sm">
          <select 
            onChange={(e) => setLocalFilters({...localFilters, type: e.target.value})}
            className="p-4 bg-gray-50 text-[11px] font-bold uppercase tracking-widest outline-none border-r border-gray-100"
          >
            <option value="">Type de Bien</option>
            <option value="Villa">Villas</option>
            <option value="Apartment">Appartements</option>
          </select>
          
          <input 
            suppressHydrationWarning
            type="text" 
            placeholder="DESTINATION" 
            onChange={(e) => setLocalFilters({...localFilters, town: e.target.value})}
            className="p-4 bg-gray-50 text-[11px] font-bold uppercase tracking-widest outline-none"
          />

          <select 
            suppressHydrationWarning
            onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
            className="p-4 bg-gray-50 text-[11px] font-bold uppercase tracking-widest outline-none border-l border-gray-100"
          >
            <option value="">Prix Max</option>
            <option value="1000000">1.000.000 €</option>
            <option value="2000000">2.000.000 €</option>
            <option value="5000000">5.000.000 €+</option>
          </select>

          <button 
            suppressHydrationWarning
            onClick={() => onSearch(localFilters)}
            className="bg-brand-primary text-white p-4 font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-brand-secondary transition-all"
          >
            Lancer la recherche
          </button>
        </div>
      </div>
    </section>
  );
}