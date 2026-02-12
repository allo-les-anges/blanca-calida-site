const reviews = [
  { name: "Isabelle Dupont", text: "Excellente expérience avec Blanca Calida ! Ils connaissent parfaitement le marché et savent conseiller en fonction des besoins spécifiques.", stars: 5 },
  { name: "Sarah Williams", text: "Professional team, they helped us navigate every detail of the buying process. Highly recommended!", stars: 5 },
  { name: "Michael Ford", text: "Sehr guter Service, von der Besichtigung bis zur Kaufabwicklung. Alles war perfekt organisiert.", stars: 5 },
];

export default function Testimonials() {
  return (
    <section className="bg-[#fcfaf7] py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-serif text-4xl md:text-5xl text-slate-800 mb-4 italic">La confiance est une valeur fondamentale</h2>
        <p className="text-center text-slate-500 mb-16 max-w-2xl mx-auto">La satisfaction de nos clients est notre plus belle réussite.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="flex text-yellow-400 mb-6 text-sm">{"★".repeat(r.stars)}</div>
              <p className="text-slate-600 italic leading-relaxed mb-8 flex-grow">"{r.text}"</p>
              <p className="font-serif text-lg text-slate-900 border-t border-slate-100 pt-6 w-full">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}