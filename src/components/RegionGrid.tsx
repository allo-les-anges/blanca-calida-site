"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (townName: string) => void;
}

// Images par défaut si la ville n'est pas dans notre liste prédéfinie
const cityImages: { [key: string]: string } = {
  "javea": "https://images.unsplash.com/photo-1506158669146-619067262a00?q=80&w=800",
  "moraira": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800",
  "benissa": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800",
  "denia": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800",
  "calpe": "https://images.unsplash.com/photo-1589779261092-903f362898ad?q=80&w=800",
  "altea": "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=800"
};

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  // --- LOGIQUE D'EXTRACTION DES TOPS RÉGIONS ---
  const getTopRegions = () => {
    const counts: { [key: string]: number } = {};
    
    // 1. On compte les occurrences de chaque ville
    properties.forEach(p => {
      if (p.town) {
        const name = p.town.trim();
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    // 2. On transforme en tableau, on trie par le plus grand nombre, et on prend les 4 premiers
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        img: cityImages[name.toLowerCase()] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800"
      }));
  };

  const topRegions = getTopRegions();

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topRegions.map((region) => (
          <div 
            key={region.name} 
            className="group cursor-pointer"
            onClick={() => onRegionClick(region.name)}
          >
            <div className="relative h-[400px] overflow-hidden mb-4 shadow-sm">
              <img 
                src={region.img} 
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                 <span className="text-white text-[10px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-white/40 px-4 py-2 backdrop-blur-sm">
                    Voir les propriétés
                 </span>
              </div>
            </div>
            <h3 className="text-center font-serif text-2xl text-slate-800 italic">Villas à {region.name}</h3>
            <p className="text-center text-slate-400 text-[10px] mt-2 tracking-widest uppercase font-bold">
              {region.count} {region.count > 1 ? 'propriétés' : 'propriété'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}