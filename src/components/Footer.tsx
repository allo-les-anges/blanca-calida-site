"use client";

import { Instagram, Linkedin, Facebook, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white pt-24 pb-12 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">
          
          {/* LOGO & BRAND DESCRIPTION */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="font-serif text-3xl mb-8 italic tracking-tight">
              Master Template
            </h3>
            <p className="text-slate-400 font-light leading-relaxed text-sm max-w-xs">
              L'excellence immobilière redéfinie. Nous accompagnons les investisseurs les plus exigeants dans l'acquisition de propriétés d'exception à travers les zones les plus prisées.
            </p>
            <div className="flex gap-5 mt-8">
              <Instagram size={18} className="text-slate-500 hover:text-emerald-500 cursor-pointer transition-colors" />
              <Linkedin size={18} className="text-slate-500 hover:text-emerald-500 cursor-pointer transition-colors" />
              <Facebook size={18} className="text-slate-500 hover:text-emerald-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-8 text-slate-500">
              Collections
            </h4>
            <ul className="space-y-4 text-[13px] text-slate-300 font-light">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Villas Signature</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Appartements de Prestige</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Nouveaux Développements</a></li>
              <li><a href="/login" className="hover:text-emerald-400 transition-colors italic">Accès Privé Client</a></li>
            </ul>
          </div>

          {/* ESPACE PROFESSIONNEL */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-8 text-emerald-500/60">
              Espace Professionnel
            </h4>
            <ul className="space-y-4 text-[13px] text-slate-300 font-light">
              <li>
                <a href="/admin-chantier" className="hover:text-white transition flex items-center gap-3">
                  <span className="w-1.5 h-[1px] bg-emerald-500"></span>
                  Suivi de Terrain
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition flex items-center gap-3">
                  <span className="w-1.5 h-[1px] bg-slate-600"></span>
                  Superviseur
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition flex items-center gap-3">
                  <span className="w-1.5 h-[1px] bg-slate-600"></span>
                  Portail Partenaires
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT & HQ */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-8 text-slate-500">
              Siège Social
            </h4>
            <div className="space-y-4 text-[13px] text-slate-300 font-light">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                <p>Calle Mayor, 42<br />Alicante, Espagne</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-500 flex-shrink-0" />
                <p>contact@master-template.com</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                <p>+34 627 76 82 33</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
             <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                © 2026 Master Template Estates
             </p>
             <div className="flex gap-6 text-[9px] uppercase tracking-[0.2em] text-slate-600">
                <a href="#" className="hover:text-white transition">Politique de Confidentialité</a>
                <a href="#" className="hover:text-white transition">Mentions Légales</a>
             </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
            Build v1.0.4-Luxe
          </p>
        </div>
      </div>
    </footer>
  );
}