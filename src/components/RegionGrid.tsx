"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (regionName: string) => void;
}

/**
 * Chemins vers tes 4 photos spécifiques dans public/images/regions/
 */
const landscapeImages = [
  "/images/regions/1.jpg",
  "/images/regions/2.jpg",
  "/images/regions/3.jpg",
  "/images/regions/4.jpg",
];

/**
 * Noms exacts des régions tels qu'ils apparaissent dans ta colonne 'region' sur Supabase
 */
const regionNames = [
  "Costa Blanca",
  "Costa Calida",
  "Costa del Sol",
  "Costa Almeria"
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  // On construit les 4 vignettes basées sur nos noms de régions fixes
  const regions = regionNames.map((name, index) => {
    // On compte combien de propriétés appartiennent à cette région
    const count = properties.filter(p => 
      p.region?.toLowerCase().trim() === name.toLowerCase().trim()
    ).length;

    return {
      name,
      count,
      img: landscapeImages[index] // Associe 1.jpg à la 1ère région, etc.
    };
  });

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {regions.map((region) => (
          <div 
            key={region.name} 
            className="group cursor-pointer"
            onClick={() => onRegionClick(region.name)}
          >
            {/* Conteneur de l'image format portrait */}
            <div className="relative h-[550px] overflow-hidden mb-6 shadow-xl rounded-sm">
              <img 
                src={region.img} 
                alt={`Paysage de ${region.name}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Overlay avec le bouton au survol */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                 <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold opacity-0 group-hover:opacity-100 border border-white/40 px-6 py-3 backdrop-blur-md">
                   Voir les propriétés
                 </span>
              </div>
            </div>
            
            {/* Titre et compteur */}
            <div className="text-center">
              <h3 className="font-serif text-3xl text-slate-900 mb-2">
                {region.name}
              </h3>
              <p className="text-slate-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                {region.count} {region.count > 1 ? 'propriétés' : 'propriété'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}