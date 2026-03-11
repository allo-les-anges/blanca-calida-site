"use client";

import React from "react";
import { Instagram, Linkedin, Facebook, MapPin, Mail, Phone } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

// --- DÉFINITION DU COMPOSANT LOGO SVG ---
const DataHomeLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 150 35" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text 
      x="10" 
      y="28" 
      fontFamily="sans-serif" 
      fontSize="22" 
      fontWeight="300" 
      fill="currentColor" 
      letterSpacing="-0.02em"
    >
      data home
    </text>
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#020617] text-white pt-32 pb-12 px-6 lg:px-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-24">
          
          {/* LOGO & BRAND DESCRIPTION */}
          <div className="col-span-1 lg:col-span-1 space-y-8">
            <div className="space-y-2">
               <DataHomeLogo className="h-10 md:h-12 w-auto text-white transition-colors hover:text-[#D4AF37]" />
               <span className="text-[#D4AF37] font-sans font-light text-[10px] tracking-[0.3em] uppercase block mt-2 ml-1">
                 {t('footer.excellence')}
               </span>
            </div>
            <p className="text-slate-500 font-light leading-relaxed text-sm max-w-xs italic">
              {t('footer.description')}
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
              {t('footer.collections')}
            </h4>
            <ul className="space-y-5 text-[13px] text-slate-400 font-light">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">{t('footer.villasSignature')}</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">{t('footer.domainsPrestige')}</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">{t('footer.newDevelopments')}</a></li>
              <li>
                <a href="/login" className="text-white hover:text-[#D4AF37] transition-colors duration-300 italic flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
                  {t('footer.privateClientAccess')}
                </a>
              </li>
            </ul>
          </div>

          {/* ESPACE PROFESSIONNEL */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold mb-10 text-slate-500">
              {t('footer.proSpace')}
            </h4>
            <ul className="space-y-5 text-[13px] text-slate-400 font-light">
              <li>
                <a href="/admin-chantier" className="hover:text-white transition-all flex items-center gap-3 group">
                  <span className="w-2 h-[1px] bg-[#D4AF37] group-hover:w-4 transition-all"></span>
                  {t('footer.siteTracking')}
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-all flex items-center gap-3 group">
                  <span className="w-2 h-[1px] bg-slate-700 group-hover:bg-[#D4AF37] group-hover:w-4 transition-all"></span>
                  {t('footer.supervisor')}
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-all flex items-center gap-3 group">
                  <span className="w-2 h-[1px] bg-slate-700 group-hover:bg-[#D4AF37] group-hover:w-4 transition-all"></span>
                  {t('footer.partnerPortal')}
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT & HQ */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold mb-10 text-slate-500">
              {t('footer.socialHeadquarters')}
            </h4>
            <div className="space-y-6 text-[13px] text-slate-400 font-light">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-[#D4AF37] mt-1 flex-shrink-0 opacity-80" />
                <p className="leading-relaxed">{t('footer.address')}<br /><span className="text-white font-medium">{t('footer.city')}</span></p>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={18} className="text-[#D4AF37] flex-shrink-0 opacity-80" />
                <p className="hover:text-white transition-colors cursor-pointer">{t('footer.email')}</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={18} className="text-[#D4AF37] flex-shrink-0 opacity-80" />
                <p className="text-white font-medium">{t('footer.phone')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">
                © 2026 Data Home Estates
              </p>
              <div className="flex gap-8 text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                <a href="#" className="hover:text-[#D4AF37] transition-all">{t('footer.privacy')}</a>
                <a href="#" className="hover:text-[#D4AF37] transition-all">{t('footer.legal')}</a>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-800">
              {t('footer.eliteEdition')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}