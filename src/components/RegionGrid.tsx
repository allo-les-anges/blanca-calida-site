"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (townName: string) => void;
}

/**
 * Utilisation des 4 photos spécifiques téléchargées.
 * Assure-toi qu'elles sont dans public/images/regions/
 */
const landscapeImages = [
  "/images/regions/luke-seretis-uACGfkIJ7kE-unsplash.jpg",
  "/images/regions/frames-for-your-heart-SbFZZbcWAJU-unsplash.jpg",
  "/images/regions/silviya-nenova-hmywLfPzMeI-unsplash.jpg",
  "/images/regions/martijn-vonk-PHw1_9YRJ4g-unsplash - Copie.jpg",
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  const getTopRegions = () => {
    const counts: { [key: string]: number } = {};
    
    properties.forEach(p => {
      if (p.town) {
        const name = p.town.trim();
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count], index) => ({
        name,
        count,
        // On utilise l'index pour piocher dans tes 4 photos
        img: landscapeImages[index % landscapeImages.length]
      }));
  };

  const topRegions = getTopRegions();

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {topRegions.map((region) => (
          <div 
            key={region.name} 
            className="group cursor-pointer"
            onClick={() => onRegionClick(region.name)}
          >
            {/* Conteneur de l'image format portrait */}
            <div className="relative h-[550px] overflow-hidden mb-6 shadow-xl">
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
              <h3 className="font-serif text-3xl text-brand-primary mb-2">
                Villas à {region.name}
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