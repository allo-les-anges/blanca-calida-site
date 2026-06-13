"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Instagram, Facebook, MapPin, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

interface FooterProps {
  isLight?: boolean;
}

const footerCopy = {
  fr: {
    menu: "Menu",
    home: "Accueil",
    properties: "Propriétés",
    about: "À propos",
    contact: "Contact",
    follow: "Suivez-nous",
    internal: "Accès interne",
    login: "Connexion",
    admin: "Admin",
    superAdmin: "Super Admin",
    rights: "Tous droits réservés",
    powered: "Site propulsé par data-home",
  },
  en: {
    menu: "Menu",
    home: "Home",
    properties: "Properties",
    about: "About",
    contact: "Contact",
    follow: "Follow us",
    internal: "Internal access",
    login: "Login",
    admin: "Admin",
    superAdmin: "Super Admin",
    rights: "All rights reserved",
    powered: "Site powered by data-home",
  },
  es: {
    menu: "Menú",
    home: "Inicio",
    properties: "Propiedades",
    about: "Sobre nosotros",
    contact: "Contacto",
    follow: "Síguenos",
    internal: "Acceso interno",
    login: "Conexión",
    admin: "Admin",
    superAdmin: "Super Admin",
    rights: "Todos los derechos reservados",
    powered: "Sitio impulsado por data-home",
  },
  nl: {
    menu: "Menu",
    home: "Home",
    properties: "Panden",
    about: "Over ons",
    contact: "Contact",
    follow: "Volg ons",
    internal: "Interne toegang",
    login: "Inloggen",
    admin: "Admin",
    superAdmin: "Super Admin",
    rights: "Alle rechten voorbehouden",
    powered: "Site aangedreven door data-home",
  },
  pl: {
    menu: "Menu",
    home: "Strona główna",
    properties: "Nieruchomości",
    about: "O nas",
    contact: "Kontakt",
    follow: "Obserwuj nas",
    internal: "Dostęp wewnętrzny",
    login: "Logowanie",
    admin: "Admin",
    superAdmin: "Super Admin",
    rights: "Wszelkie prawa zastrzeżone",
    powered: "Strona obsługiwana przez data-home",
  },
  ar: {
    menu: "القائمة",
    home: "الرئيسية",
    properties: "العقارات",
    about: "من نحن",
    contact: "اتصال",
    follow: "تابعونا",
    internal: "دخول داخلي",
    login: "تسجيل الدخول",
    admin: "المدير",
    superAdmin: "المدير العام",
    rights: "جميع الحقوق محفوظة",
    powered: "الموقع مدعوم من data-home",
  },
  ka: {
    menu: "მენიუ",
    home: "მთავარი",
    properties: "უძრავი ქონება",
    about: "ჩვენ შესახებ",
    contact: "კონტაქტი",
    follow: "გამოგვყევით",
    internal: "შიდა წვდომა",
    login: "შესვლა",
    admin: "ადმინისტრაცია",
    superAdmin: "სუპერ ადმინისტრაცია",
    rights: "ყველა უფლება დაცულია",
    powered: "საიტი მუშაობს data-home-ის მხარდაჭერით",
  },
} as const;

export default function Footer({ isLight = false }: FooterProps) {
  const { t, locale } = useTranslation();
  const copy = footerCopy[locale as keyof typeof footerCopy] || footerCopy.en;

  const bgColor = isLight ? "bg-slate-50 border-t border-slate-200" : "bg-[#010101] border-t border-white/5";
  const textColor = isLight ? "text-slate-900" : "text-white";
  const mutedText = isLight ? "text-slate-500" : "text-slate-400";
  const iconColor = "text-[#D8C9B6]";

  return (
    <footer className={`${bgColor} py-20 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <h3 className={`text-2xl font-serif italic ${textColor}`}>Amaru-Homes</h3>
            <p className={`${mutedText} text-xs leading-relaxed uppercase tracking-widest`}>
              {t("footer.description")}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>{copy.menu}</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li><Link href="/" className="hover:text-[#D8C9B6] transition-colors">{copy.home}</Link></li>
              <li><Link href="/properties" className="hover:text-[#D8C9B6] transition-colors">{copy.properties}</Link></li>
              <li><Link href="/about" className="hover:text-[#D8C9B6] transition-colors">{copy.about}</Link></li>
              <li><Link href="/contact" className="hover:text-[#D8C9B6] transition-colors">{copy.contact}</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>{copy.contact}</h4>
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

          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>{copy.follow}</h4>
            <div className="flex gap-6">
              <a href="#" className={`${mutedText} hover:text-[#D8C9B6] transition-colors`}><Instagram size={20} /></a>
              <a href="#" className={`${mutedText} hover:text-[#D8C9B6] transition-colors`}><Facebook size={20} /></a>
            </div>

            <div className={`border-t pt-6 ${isLight ? "border-slate-200" : "border-white/5"}`}>
              <h4 className={`mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>
                <ShieldCheck size={14} className={iconColor} />
                {copy.internal}
              </h4>
              <ul className={`space-y-3 text-[10px] uppercase tracking-widest ${mutedText}`}>
                <li><Link href="/login" className="hover:text-[#D8C9B6] transition-colors">{copy.login}</Link></li>
                <li><Link href="/login" className="hover:text-[#D8C9B6] transition-colors">{copy.admin}</Link></li>
                <li><Link href="/login" className="hover:text-[#D8C9B6] transition-colors">{copy.superAdmin}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`mt-20 pt-8 border-t ${isLight ? "border-slate-200" : "border-white/5"} text-center`}>
          <p className={`${mutedText} text-[9px] uppercase tracking-[0.5em]`}>
            © {new Date().getFullYear()} Amaru-Homes — {copy.rights}
          </p>
          <p className={`${mutedText} mt-4 text-[8px] uppercase tracking-[0.4em]`}>
            {copy.powered}
          </p>
        </div>
      </div>
    </footer>
  );
}
