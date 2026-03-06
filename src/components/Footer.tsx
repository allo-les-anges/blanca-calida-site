"use client";

import { Instagram, Linkedin, Facebook, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020617] text-white pt-32 pb-12 px-6 lg:px-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-24">
          
          {/* LOGO & BRAND DESCRIPTION */}
          <div className="col-span-1 lg:col-span-1 space-y-8">
            <div className="space-y-2">
               <h3 className="font-serif text-4xl italic tracking-tighter text-white">
                 Amaru <span className="text-[#D4AF37] not-italic font-sans font-light text-2xl tracking-[0.3em] uppercase block mt-1">Excellence</span>
               </h3>
            </div>
            <p className="text-slate-500 font-light leading-relaxed text-sm max-w-xs italic">
              L'art de l'immobilier d'exception. Nous forgeons des passerelles entre vos ambitions et les propriétés les plus prestigieuses de la côte.
            </p>
            <div className="flex gap-6 mt-10">
              <Instagram size={20} className="text-[#D4AF37] hover:text-white cursor-pointer transition-all duration-300" />
              <Linkedin size={20} className="text-[#D4AF37] hover:text-white cursor-pointer transition-all duration-300" />
              <Facebook size={20} className="text-[#D4AF37] hover:text-white cursor-pointer transition-all duration-300" />
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold mb-10 text-[#D4AF37]">
              Collections
            </h4>
            <ul className="space-y-5 text-[13px] text-slate-400 font-light">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">Villas Signature</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">Domaines de Prestige</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">Nouveaux Développements</a></li>
              <li>
                <a href="/login" className="text-white hover:text-[#D4AF37] transition-colors duration-300 italic flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
                  Accès Privé Client
                </a>
              </li>
            </ul>
          </div>

          {/* ESPACE PROFESSIONNEL */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold mb-10 text-slate-500">
              Espace Pro
            </h4>
            <ul className="space-y-5 text-[13px] text-slate-400 font-light">
              <li>
                <a href="/admin-chantier" className="hover:text-white transition-all flex items-center gap-3 group">
                  <span className="w-2 h-[1px] bg-[#D4AF37] group-hover:w-4 transition-all"></span>
                  Suivi de Terrain
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-all flex items-center gap-3 group">
                  <span className="w-2 h-[1px] bg-slate-700 group-hover:bg-[#D4AF37] group-hover:w-4 transition-all"></span>
                  Superviseur
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-all flex items-center gap-3 group">
                  <span className="w-2 h-[1px] bg-slate-700 group-hover:bg-[#D4AF37] group-hover:w-4 transition-all"></span>
                  Portail Partenaires
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT & HQ */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold mb-10 text-slate-500">
              Siège Social
            </h4>
            <div className="space-y-6 text-[13px] text-slate-400 font-light">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-[#D4AF37] mt-1 flex-shrink-0 opacity-80" />
                <p className="leading-relaxed">Calle Mayor, 42<br /><span className="text-white font-medium">Alicante, Espagne</span></p>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={18} className="text-[#D4AF37] flex-shrink-0 opacity-80" />
                <p className="hover:text-white transition-colors cursor-pointer">contact@amaru-excellence.com</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={18} className="text-[#D4AF37] flex-shrink-0 opacity-80" />
                <p className="text-white font-medium">+34 627 76 82 33</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">
                © 2026 Amaru Excellence Estates
              </p>
              <div className="flex gap-8 text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                <a href="#" className="hover:text-[#D4AF37] transition-all">Confidentialité</a>
                <a href="#" className="hover:text-[#D4AF37] transition-all">Mentions Légales</a>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-800">
              Elite Edition v2.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}