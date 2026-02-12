"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (townName: string) => void;
}

// Sélection d'images de paysages méditerranéens génériques mais luxueux
const landscapeImages = [
  "https://images.unsplash.com/photo-1506158669146-619067262a00?q=80&w=1200", // Vue mer & falaise
  "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=1200", // Plage paradisiaque
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200", // Architecture blanche & mer
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200", // Piscine à débordement au coucher du soleil
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
        // On attribue une image de paysage différente pour chaque index (0 à 3)
        img: landscapeImages[index]
      }));
  };

  const topRegions = getTopRegions();

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {topRegions.map((region) => (
          <div 
            key={region.name} 
            className="group cursor-pointer"
            onClick={() => onRegionClick(region.name)}
          >
            <div className="relative h-[500px] overflow-hidden mb-6 shadow-2xl">
              <img 
                src={region.img} 
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-white/40 px-6 py-3 backdrop-blur-md">
                    Voir les propriétés
                 </span>
              </div>
            </div>
            
            {/* Style Typographique Luxueux */}
            <h3 className="text-center font-serif text-3xl text-brand-primary">
              Villas à {region.name}
            </h3>
            <p className="text-center text-slate-400 text-[10px] mt-3 tracking-[0.3em] uppercase font-bold">
              {region.count} {region.count > 1 ? 'propriétés' : 'propriété'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}