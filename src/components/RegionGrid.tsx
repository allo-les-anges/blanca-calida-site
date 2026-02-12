const regions = [
  { name: "Javea", count: 187, img: "https://images.unsplash.com/photo-1506158669146-619067262a00?q=80&w=800" },
  { name: "Moraira", count: 55, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800" },
  { name: "Benissa", count: 31, img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800" },
  { name: "Dénia", count: 35, img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800" },
];

export default function RegionGrid() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {regions.map((region) => (
          <div key={region.name} className="group cursor-pointer">
            <div className="relative h-[400px] overflow-hidden mb-4">
              <img 
                src={region.img} 
                alt={region.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
            <h3 className="text-center font-serif text-2xl text-slate-800">Villas de luxe à {region.name}</h3>
            <p className="text-center text-slate-400 text-sm mt-2 tracking-widest uppercase">{region.count} propriétés</p>
          </div>
        ))}
      </div>
    </section>
  );
}