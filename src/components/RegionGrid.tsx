"use client";

interface RegionGridProps {
  properties: any[]; // On reçoit les données du XML ici
  onRegionClick: (townName: string) => void; // La fonction pour filtrer au clic
}

// On ne garde ici que les noms et les photos
const regionSettings = [
  { name: "Javea", img: "https://images.unsplash.com/photo-1506158669146-619067262a00?q=80&w=800" },
  { name: "Moraira", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800" },
  { name: "Benissa", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800" },
  { name: "Dénia", img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800" },
];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  // Cette fonction compte combien de villas correspondent à la ville
  const getCount = (townName: string) => {
    return properties.filter(p => p.town?.toLowerCase() === townName.toLowerCase()).length;
  };

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {regionSettings.map((region) => {
          const count = getCount(region.name);
          
          return (
            <div 
              key={region.name} 
              className="group cursor-pointer"
              onClick={() => onRegionClick(region.name)} // QUAND ON CLIQUE : on envoie le nom de la ville
            >
              <div className="relative h-[400px] overflow-hidden mb-4">
                <img 
                  src={region.img} 
                  alt={region.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                   <span className="text-white text-[10px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-white/40 px-4 py-2 backdrop-blur-sm">
                      Voir les propriétés
                   </span>
                </div>
              </div>
              <h3 className="text-center font-serif text-2xl text-slate-800">Villas à {region.name}</h3>
              <p className="text-center text-slate-400 text-[10px] mt-2 tracking-widest uppercase font-bold">
                {count} {count > 1 ? 'propriétés' : 'propriété'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}