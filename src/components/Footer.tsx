export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white py-20 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 text-left">
          <h3 className="font-serif text-3xl mb-6 italic">Blanca Calida</h3>
          <p className="text-gray-400 font-light max-w-sm leading-relaxed">
            Spécialiste de l'immobilier d'exception sur la Costa Blanca. 
            Nous sélectionnons pour vous les villas les plus exclusives entre Altea et Dénia.
          </p>
        </div>

        <div className="text-left">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Navigation</h4>
          <ul className="space-y-4 text-sm text-gray-400 font-light">
            <li><a href="#" className="hover:text-brand-secondary transition">Villas de Luxe</a></li>
            <li><a href="#" className="hover:text-brand-secondary transition">Programmes Neufs</a></li>
            <li><a href="/login" className="hover:text-white transition">Suivi Client</a></li>
          </ul>
        </div>

        <div className="text-left">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-emerald-500/80">Espace Pro</h4>
          <ul className="space-y-4 text-sm text-gray-500 font-light">
            {/* Lien pour ton équipe terrain */}
            <li>
              <a href="/admin/chantier" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Suivi Terrain
              </a>
            </li>
            {/* Lien pour toi (Gaëtan) */}
<li>
  <a 
    href="/login"  /* CHANGE CECI : remplace /super-admin par /login */
    className="hover:text-white transition flex items-center gap-2"
  >
    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
    Superviseur
  </a>
</li>

{/* Lien pour les agences partenaires */}
<li>
  <a 
    href="/login" /* C'est déjà bon ici */
    className="hover:text-white transition flex items-center gap-2"
  >
    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
    Partenaires
  </a>
</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 flex justify-between items-center text-[9px] uppercase tracking-widest text-gray-500">
        <p>© 2026 Blanca Calida Estates</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">Mentions Légales</a>
          <p className="text-gray-700">v1.0.4</p>
        </div>
      </div>
    </footer>
  );
}