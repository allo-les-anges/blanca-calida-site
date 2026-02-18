export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white py-20 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-serif text-3xl mb-6">Your Page</h3>
          <p className="text-gray-400 font-light max-w-sm leading-relaxed">
            Spécialiste de l'immobilier d'exception sur la Costa Blanca. 
            Nous sélectionnons pour vous les villas les plus exclusives entre Altea et Dénia.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Navigation</h4>
          <ul className="space-y-4 text-sm text-gray-400 font-light">
            <li><a href="#" className="hover:text-brand-secondary transition">Villas de Luxe</a></li>
            <li><a href="#" className="hover:text-brand-secondary transition">Programmes Neufs</a></li>
            <li><a href="#" className="hover:text-brand-secondary transition">Investissement</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Contact</h4>
          <p className="text-sm text-gray-400 font-light">Alicante, Espagne</p>
          <p className="text-sm text-brand-secondary mt-2">info@blancacalida.com</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 flex justify-between items-center text-[9px] uppercase tracking-widest text-gray-500">
        <p>© 2026 Blanca Calida Estates</p>
        <p>Mentions Légales</p>
      </div>
    </footer>
  );
}