"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (regionName: string) => void;
}

const landscapeImages = [
  "/images/regions/1.jpg",
  "/images/regions/2.jpg",
  "/images/regions/3.jpg",
  "/images/regions/4.jpg",
];

const regionNames = [
  "Costa Blanca",
  "Costa Calida",
  "Costa del Sol",
  "Costa Almeria"
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  const regions = regionNames.map((name, index) => {
    // 1. On nettoie le nom de la région cible
    const targetName = name.toLowerCase().trim();

    // 2. On compte avec une vérification robuste
    const count = properties.filter(p => {
      // On récupère la région de la propriété (colonne 'region' de Supabase)
      const propRegion = p.region || "";
      return propRegion.toLowerCase().trim() === targetName;
    }).length;

    return {
      name,
      count,
      img: landscapeImages[index]
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
            {/* Conteneur de l'image */}
            <div className="relative h-[550px] overflow-hidden mb-6 shadow-xl rounded-sm bg-slate-100">
              <img 
                src={region.img} 
                alt={`Paysage de ${region.name}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                // Sécurité si l'image locale est manquante
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506929197321-4e92628401ba?q=80&w=500&auto=format&fit=crop";
                }}
              />
              
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                 <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold opacity-0 group-hover:opacity-100 border border-white/40 px-6 py-3 backdrop-blur-md">
                    Voir les propriétés
                 </span>
              </div>
            </div>
            
            {/* Titre et compteur dynamique */}
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