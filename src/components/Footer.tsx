"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Instagram, Facebook, MapPin, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

// 1. Définition de l'interface pour TypeScript
interface FooterProps {
  isLight?: boolean;
}

export default function Footer({ isLight = false }: FooterProps) {
  const { t } = useTranslation();

  // 2. Adaptation des couleurs
  const bgColor = isLight ? "bg-slate-50 border-t border-slate-200" : "bg-[#010101] border-t border-white/5";
  const textColor = isLight ? "text-slate-900" : "text-white";
  const mutedText = isLight ? "text-slate-500" : "text-slate-400";
  const iconColor = "text-[#D8C9B6]";

  return (
    <footer className={`${bgColor} py-20 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* LOGO & DESCRIPTION */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <h3 className={`text-2xl font-serif italic ${textColor}`}>Amaru-Homes</h3>
            <p className={`${mutedText} text-xs leading-relaxed uppercase tracking-widest`}>
              {t('footer.description')}
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Menu</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li><Link href="/" className="hover:text-[#D8C9B6] transition-colors">Accueil</Link></li>
              <li><Link href="/properties" className="hover:text-[#D8C9B6] transition-colors">Propriétés</Link></li>
              <li><Link href="/about" className="hover:text-[#D8C9B6] transition-colors">À Propos</Link></li>
              <li><Link href="/contact" className="hover:text-[#D8C9B6] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Contact</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li className="flex items-center gap-3">
                <Mail size={14} className={iconColor} /> info@amaru-homes.com
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className={iconColor} /> +34 000 000 000
              </li>
              <li className="flex items-center gap-3 italic">
                <MapPin size={14} className={iconColor} /> Costa Blanca, España
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Suivez-nous</h4>
            <div className="flex gap-6">
              <a href="#" className={`${mutedText} hover:text-[#D8C9B6] transition-colors`}><Instagram size={20} /></a>
              <a href="#" className={`${mutedText} hover:text-[#D8C9B6] transition-colors`}><Facebook size={20} /></a>
            </div>

            <div className={`border-t pt-6 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
              <h4 className={`mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>
                <ShieldCheck size={14} className={iconColor} />
                Accès interne
              </h4>
              <ul className={`space-y-3 text-[10px] uppercase tracking-widest ${mutedText}`}>
                <li><Link href="/login" className="hover:text-[#D8C9B6] transition-colors">Connexion</Link></li>
                <li><Link href="/login" className="hover:text-[#D8C9B6] transition-colors">Admin</Link></li>
                <li><Link href="/login" className="hover:text-[#D8C9B6] transition-colors">Super Admin</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className={`mt-20 pt-8 border-t ${isLight ? 'border-slate-200' : 'border-white/5'} text-center`}>
          <p className={`${mutedText} text-[9px] uppercase tracking-[0.5em]`}>
            © {new Date().getFullYear()} Amaru-Homes — All Rights Reserved
          </p>
          <p className={`${mutedText} mt-4 text-[8px] uppercase tracking-[0.4em]`}>
            Site powered by data-home
          </p>
        </div>
      </div>
    </footer>
  );
}
