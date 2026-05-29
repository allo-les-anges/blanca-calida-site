"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Globe, Menu, X, User
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "@/contexts/I18nContext";

// Logo SVG
const DataHomeLogo = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text x="10" y="28" fontFamily="Suisse Int'l, Suisse Intl, Arial, sans-serif" fontSize="22" fontWeight="300" fill="currentColor" letterSpacing="-0.02em">data home</text>
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
  
  const [mounted, setMounted] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);

  const isLight = searchParams.get('pack') === 'light';

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

  if (!mounted) return null;

  const isDarkVisual = resolvedTheme === "dark" && !isLight;

  const navLinks = [
    { name: t('nav.home'), href: "/", show: true },
    { name: t('nav.regionGuide'), href: "/guides", show: true },
    { name: t('nav.cashbackInfo'), href: "/cashback-info", show: !isLight }, 
    { name: t('nav.contact'), href: "/contact", show: true },
  ].filter(link => link.show).map(link => ({
    ...link,
    href: isLight ? `${link.href}${link.href.includes('?') ? '&' : '?'}pack=light` : link.href
  }));

  const languages = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "nl", label: "NL" },
  ] as const;

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

  return (
    <>
      <nav 
        className="fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center"
        style={{ 
          backgroundColor: isScrolled 
            ? (isDarkVisual ? 'color-mix(in srgb, #010101 90%, transparent)' : 'color-mix(in srgb, #FAFAFA 95%, transparent)') 
            : 'transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: isScrolled ? `1px solid ${isDarkVisual ? 'color-mix(in srgb, #FAFAFA 5%, transparent)' : 'color-mix(in srgb, #010101 5%, transparent)'}` : 'none',
          boxShadow: isScrolled ? '0 20px 25px -5px color-mix(in srgb, #010101 10%, transparent)' : 'none'
        }}
      >
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-10 flex justify-between items-center">
          
          {/* LOGO */}
          <Link href={isLight ? "/?pack=light" : "/"} className="z-[110] flex items-center group">
            <DataHomeLogo 
              className="h-10 w-auto transition-colors group-hover:text-[#D8C9B6]" 
              style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ 
                  color: pathname === link.href || (pathname === "/" && link.href.startsWith("/?")) 
                    ? '#D8C9B6' 
                    : (isDarkVisual ? 'color-mix(in srgb, #FAFAFA 70%, transparent)' : '#171716') 
                }}
                className="text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group"
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D8C9B6] transition-all duration-300 group-hover:w-full ${pathname === link.href ? 'w-full' : ''}`} />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 z-[110]">
            {!isLight && <ThemeToggle />}

            {/* LANGUE */}
            <div className="relative hidden xl:block" ref={langMenuRef}>
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)} 
                style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
                className="flex items-center space-x-2 text-[10px] font-bold tracking-widest hover:text-[#D8C9B6]"
              >
                <Globe size={14} className="text-[#D8C9B6]" /> <span>{locale.toUpperCase()}</span>
              </button>
              
              {showLangMenu && (
                <div 
                  className="absolute top-full right-0 mt-4 border rounded-xl p-2 min-w-[100px] shadow-2xl"
                  style={{ 
                    backgroundColor: isDarkVisual ? '#171716' : '#FAFAFA',
                    borderColor: isDarkVisual ? 'color-mix(in srgb, #FAFAFA 10%, transparent)' : '#F2EFEA'
                  }}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l.code as any); setShowLangMenu(false); }}
                      style={{ 
                        color: locale === l.code ? '#D8C9B6' : (isDarkVisual ? '#D8C9B6' : '#171716'),
                        backgroundColor: locale === l.code ? 'color-mix(in srgb, #D8C9B6 5%, transparent)' : 'transparent'
                      }}
                      className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors hover:bg-[#D8C9B6]/5"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LOGIN */}
            {!isLight && (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                style={{ 
                  color: isDarkVisual ? '#FAFAFA' : '#171716',
                  backgroundColor: 'color-mix(in srgb, #D8C9B6 5%, transparent)'
                }}
                className="hidden sm:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-[#D8C9B6]/20 transition-all hover:bg-[#D8C9B6] hover:text-black"
              >
                <User size={14} /> <span className="hidden lg:inline">{t('nav.clientAccess')}</span>
              </button>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
              className="md:hidden p-2"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[500] md:hidden">
          <div className="absolute inset-0 bg-[#010101]/95 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />
          <div 
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm shadow-2xl p-8 flex flex-col transition-colors"
            style={{ backgroundColor: isDarkVisual ? '#171716' : '#FAFAFA' }}
          >
            <div className="flex justify-between items-center mb-12">
              <DataHomeLogo 
                className="h-8 w-auto" 
                style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
              />
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}>
                <X size={32} />
              </button>
            </div>

            <nav className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
                  className="text-2xl font-serif italic hover:text-[#D8C9B6] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              {!isLight && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                  style={{ color: isDarkVisual ? '#FAFAFA' : '#171716' }}
                  className="text-left text-2xl font-serif italic hover:text-[#D8C9B6] transition-colors"
                >
                  {t('nav.clientAccess')}
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLoginModalOpen(false)} />
          <div 
            className="relative p-8 md:p-12 max-w-md w-full border border-[#D8C9B6]/20"
            style={{ 
              backgroundColor: isDarkVisual ? '#171716' : '#FAFAFA',
              color: isDarkVisual ? '#FAFAFA' : '#171716'
            }}
          >
            <h3 className="text-2xl font-serif italic mb-6">{t('nav.clientAccess')}</h3>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="PIN" 
                style={{ borderColor: isDarkVisual ? 'color-mix(in srgb, #FAFAFA 10%, transparent)' : '#D8C9B6' }}
                className="w-full bg-transparent border-b py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#D8C9B6] transition-all"
              />
              <button type="submit" className="w-full bg-[#D8C9B6] text-black py-4 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all">
                {t('common.access')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
