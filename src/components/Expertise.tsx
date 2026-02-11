import { Award, ShieldCheck, Map } from 'lucide-react';

export default function Expertise() {
  const items = [
    { icon: <Award size={30}/>, title: "Expertise Luxe", desc: "Sélection rigoureuse des biens les plus exclusifs." },
    { icon: <ShieldCheck size={30}/>, title: "Accompagnement", desc: "Conseils juridiques et fiscaux personnalisés." },
    { icon: <Map size={30}/>, title: "Localisation", desc: "Le meilleur de Javea, Moraira et Altea." },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
        {items.map((item, i) => (
          <div key={i} className="text-center group">
            <div className="mb-6 inline-block text-brand-secondary group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-serif text-xl mb-4 text-brand-primary uppercase tracking-wider">{item.title}</h3>
            <p className="text-gray-500 text-sm font-light leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}