"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Globe, ChevronDown, Menu, X, Search, User, Euro
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "@/contexts/I18nContext";

// Logo SVG simple pour Data Home
const DataHomeLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text x="10" y="28" fontFamily="sans-serif" fontSize="22" fontWeight="300" fill="currentColor" letterSpacing="-0.02em">data home</text>
  </svg>
);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { t, locale, setLocale } = useTranslation();
  
  // --- DETECTION DU MODE LIGHT ---
  const isLight = searchParams.get('pack') === 'light' || 
                 (typeof document !== 'undefined' && document.documentElement.getAttribute('data-package') === 'light');

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);

  // --- LIENS DE NAVIGATION FILTRÉS ---
  // On ajoute dynamiquement le paramètre ?pack=light aux liens si on est en mode light
  const navLinks = [
    { name: t('nav.home'), href: "/", show: true },
    { name: t('nav.cashbackInfo'), href: "/cashback-info", show: !isLight }, 
    { name: t('nav.contact'), href: "/contact", show: true },
  ].filter(link => link.show).map(link => ({
    ...link,
    href: isLight && link.href !== "#" ? `${link.href}${link.href.includes('?') ? '&' : '?'}pack=light` : link.href
  }));

  const languages = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "nl", label: "NL" },
  ] as const;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from('suivi_chantier').select('pin_code').eq('pin_code', passwordInput).maybeSingle();
    if (data) {
      localStorage.setItem("client_access_pin", data.pin_code);
      setIsLoginModalOpen(false);
      router.push('/project-tracker');
    } else {
      alert(t('errors.pinIncorrect'));
    }
  };

  if (!mounted) return null;

  return (
    <>
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-white/90 dark:bg-[#020617]/90 backdrop-blur-md shadow-xl border-b border-slate-100 dark:border-white/5" : "bg-transparent"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-10 flex justify-between items-center">
          
          {/* LOGO */}
          <Link href={isLight ? "/?pack=light" : "/"} className="z-[110] flex items-center group">
            <DataHomeLogo className="h-10 w-auto text-slate-900 dark:text-white transition-colors group-hover:text-[#D4AF37]" />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${pathname === link.href ? "text-[#D4AF37]" : "text-slate-600 dark:text-white/70 hover:text-[#D4AF37]"}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full ${pathname === link.href ? 'w-full' : ''}`} />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 z-[110]">
            {/* Dark Mode désactivé en Light (selon tes instructions précédentes) */}
            {!isLight && <ThemeToggle />}

            {/* Sélecteur de Langue */}
            <div className="relative hidden xl:block" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-slate-900 dark:text-white hover:text-[#D4AF37]">
                <Globe size={14} className="text-[#D4AF37]" /> <span>{locale.toUpperCase()}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-4 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/10 rounded-xl p-2 min-w-[100px] shadow-2xl">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l.code as any); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 ${
                        locale === l.code ? 'text-[#D4AF37]' : 'text-slate-600 dark:text-slate-300 hover:text-[#D4AF37]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BOUTON LOGIN (MASQUÉ EN LIGHT) */}
            {!isLight && (
              <button onClick={() => setIsLoginModalOpen(true)} className="hidden sm:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-slate-900 dark:text-white hover:bg-[#D4AF37] hover:text-black transition-all">
                <User size={14} /> <span className="hidden lg:inline">{t('nav.clientAccess')}</span>
              </button>
            )}

            {/* MENU BURGER MOBILE */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-900 dark:text-white p-2">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[500] md:hidden">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-8 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <DataHomeLogo className="h-8 w-auto text-slate-900 dark:text-white" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900 dark:text-white">
                <X size={32} />
              </button>
            </div>

            <nav className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif italic text-slate-900 dark:text-white hover:text-[#D4AF37] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              {!isLight && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                  className="text-left text-2xl font-serif italic text-slate-900 dark:text-white hover:text-[#D4AF37]"
                >
                  {t('nav.clientAccess')}
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* MODAL LOGIN (GOLD SEULEMENT) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLoginModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 p-8 md:p-12 max-w-md w-full border border-[#D4AF37]/20">
            <h3 className="text-2xl font-serif italic mb-6 text-slate-900 dark:text-white">{t('nav.clientAccess')}</h3>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="PIN" 
                className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#D4AF37] transition-all"
              />
              <button type="submit" className="w-full bg-[#D4AF37] text-black py-4 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all">
                {t('common.access')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}