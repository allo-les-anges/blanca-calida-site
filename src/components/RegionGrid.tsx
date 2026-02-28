"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (regionName: string) => void;
}

// 1. Dictionnaire des villes par Costa
const COSTA_MAPPING: Record<string, string[]> = {
  "Costa Blanca": ["calpe", "denia", "altea", "moraira", "benidorm", "torrevieja", "alicante", "javea", "villajoyosa", "finestrat"],
  "Costa Calida": ["murcia", "cartagena", "san pedro del pinatar", "los alcazares", "mazarron", "aguilas"],
  "Costa del Sol": ["marbella", "malaga", "estepona", "fuengirola", "mijas", "benalmadena", "nerja", "casares"],
  "Costa Almeria": ["vera", "mojacar", "roquetas de mar", "almeria", "san juan de los terreros"]
};

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
    // 2. Comptage basé sur la ville OU la région
    const count = properties.filter(p => {
      const propTown = (p.town || "").toLowerCase().trim();
      const propRegion = (p.region || "").toLowerCase().trim();
      const targetRegion = name.toLowerCase().trim();

      // Condition A : La colonne région correspond déjà
      if (propRegion === targetRegion) return true;

      // Condition B : La ville appartient à la liste de cette Costa
      const citiesInThisCosta = COSTA_MAPPING[name] || [];
      return citiesInThisCosta.includes(propTown);
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
            <div className="relative h-[550px] overflow-hidden mb-6 shadow-xl rounded-sm bg-slate-100">
              <img 
                src={region.img} 
                alt={`Paysage de ${region.name}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
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