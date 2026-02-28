"use client";

interface RegionGridProps {
  properties: any[];
  onRegionClick: (regionName: string) => void;
}

// Bornes GPS approximatives pour sécuriser le comptage (Latitude / Longitude)
const GEO_BOUNDS: Record<string, { minLat: number, maxLat: number, minLng: number, maxLng: number }> = {
  "Costa Blanca": { minLat: 37.8, maxLat: 39.0, minLng: -0.8, maxLng: 0.2 },
  "Costa Calida": { minLat: 37.3, maxLat: 37.9, minLng: -1.8, maxLng: -0.7 },
  "Costa del Sol": { minLat: 36.0, maxLat: 36.9, minLng: -5.6, maxLng: -3.6 },
  "Costa Almeria": { minLat: 36.6, maxLat: 37.5, minLng: -2.3, maxLng: -1.7 }
};

const COSTA_MAPPING: Record<string, string[]> = {
  "Costa Blanca": ["calpe", "denia", "altea", "moraira", "benidorm", "torrevieja", "alicante", "javea", "villajoyosa", "finestrat", "benitachell"],
  "Costa Calida": ["murcia", "cartagena", "san pedro del pinatar", "los alcazares", "mazarron", "aguilas"],
  "Costa del Sol": ["marbella", "malaga", "estepona", "fuengirola", "mijas", "benalmadena", "nerja", "casares"],
  "Costa Almeria": ["vera", "mojacar", "roquetas de mar", "almeria", "san juan de los terreros"]
};

const landscapeImages = ["/images/regions/1.jpg", "/images/regions/2.jpg", "/images/regions/3.jpg", "/images/regions/4.jpg"];
const regionNames = ["Costa Blanca", "Costa Calida", "Costa del Sol", "Costa Almeria"];

export default function RegionGrid({ properties, onRegionClick }: RegionGridProps) {
  
  const regions = regionNames.map((name, index) => {
    const count = properties.filter(p => {
      const propTown = (p.town || "").toLowerCase();
      const propRegion = (p.region || "").toLowerCase();
      const propAddress = (p.adresse || "").toLowerCase();
      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      const target = name.toLowerCase();

      // 1. Check Texte (Région, Adresse, Ville)
      if (propRegion.includes(target) || propAddress.includes(target)) return true;
      if ((COSTA_MAPPING[name] || []).some(city => propTown.includes(city) || propAddress.includes(city))) return true;

      // 2. Check GPS (Si les textes sont vides ou erronés)
      if (!isNaN(lat) && !isNaN(lng)) {
        const bounds = GEO_BOUNDS[name];
        if (lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng) {
          return true;
        }
      }

      return false;
    }).length;

    return { name, count, img: landscapeImages[index] };
  });

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {regions.map((region) => (
          <div key={region.name} className="group cursor-pointer" onClick={() => onRegionClick(region.name)}>
            <div className="relative h-[520px] overflow-hidden mb-8 shadow-2xl rounded-[1rem] bg-slate-50 border border-slate-100">
              <img 
                src={region.img} 
                className="w-full h-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-110" 
                alt={region.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                <span className="text-white text-[10px] uppercase tracking-[0.6em] font-black border-b border-white/50 pb-2">Explorer</span>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="font-serif text-3xl text-slate-900 mb-3 italic tracking-tight">{region.name}</h3>
              <div className="flex items-center justify-center gap-4">
                <span className="h-[1px] w-6 bg-emerald-600/30"></span>
                <p className="text-slate-400 text-[9px] tracking-[0.4em] uppercase font-black">{region.count} Biens</p>
                <span className="h-[1px] w-6 bg-emerald-600/30"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}