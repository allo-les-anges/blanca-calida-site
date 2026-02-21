"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Globe, ChevronDown, Menu, X, ArrowRight, User, Lock, Gift } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname(); // Détecte la page actuelle pour la logique de visibilité
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [currentLang, setCurrentLang] = useState("FR");
  const langMenuRef = useRef<HTMLDivElement>(null);

  // --- LOGIQUE DE VISIBILITÉ DYNAMIQUE ---
  // On identifie si on est sur l'accueil ou la page d'info
  const isHomePage = pathname === "/";
  const isCashbackPage = pathname === "/cashback-info";
  
  // CONDITION DE SÉCURITÉ : On masque le bouton sticky sur la Home et la page Info
  // Cela évite l'erreur 404 Zoho car il n'y a pas d'ID de propriété sur ces pages
  const showStickyCashback = !isHomePage && !isCashbackPage;

  const languages = [
    { code: "FR", label: "Français" },
    { code: "EN", label: "English" },
    { code: "ES", label: "Español" },
    { code: "NL", label: "Nederlands" },
  ];

  // Extraction de l'ID pour Zoho
  const propertyId = params?.id ? String(params.id) : "General_Interest";
  
  // ATTENTION : Remplacez 'VOTRE_LIEN_ZOHO' par l'URL réelle de votre formulaire Zoho
  const zohoBaseUrl = "https://forms.zohopublic.com/VOTRE_LIEN_ZOHO";
  const zohoFullLink = `${zohoBaseUrl}?Property_ID=${propertyId}`;

  const openLoginModal = () => {
    setIsMobileMenuOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "123") {
      setIsLoginModalOpen(false);
      router.push('/project-tracker');
    } else {
      alert("Mot de passe incorrect. (Indice: 123)");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen || isLoginModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen, isLoginModalOpen]);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setShowLangMenu(false);
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleSelect) {
      googleSelect.value = langCode.toLowerCase();
      googleSelect.dispatchEvent(new Event('change'));
    }
  };

  return (
    <>
      {/* --- BOUTON STICKY CASHBACK (Masqué sur Home via showStickyCashback) --- */}
      {showStickyCashback && (
        <a 
          href={zohoFullLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-emerald-600 text-white px-3 py-6 rounded-l-2xl shadow-2xl hover:bg-emerald-700 transition-all flex flex-col items-center gap-3 group border-l border-t border-b border-emerald-500/20 animate-in slide-in-from-right duration-500"
          style={{ writingMode: 'vertical-rl' }}
        >
          <Gift size={18} className="rotate-90 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Réclamer mon Cashback</span>
        </a>
      )}

      <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center z-[110]">
          <span className="text-white text-lg font-serif italic tracking-wide transition-all duration-500 group-hover:text-slate-900">
            Luxury Estates
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex space-x-8 uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 transition-colors font-bold">
          <Link href="/proprietes" className="hover:text-slate-900 transition">Propriétés</Link>
          <Link href="/confidentiel" className="hover:text-slate-900 transition">Confidentiel</Link>
          <Link href="/investissement" className="hover:text-slate-900 transition">Investissement</Link>
          <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
        </div>

        {/* ACTIONS DROITE */}
        <div className="flex items-center space-x-3 md:space-x-6 text-white group-hover:text-slate-900 transition-colors z-[110]">
          
          <div className="relative hidden md:block" ref={langMenuRef}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest outline-none bg-black/10 group-hover:bg-slate-50 px-4 py-2 rounded-full transition-colors"
            >
              <Globe size={14} className="text-white/70 group-hover:text-slate-400" />
              <span>{currentLang}</span>
              <ChevronDown size={10} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-3 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGIN BUTTON */}
          <button 
            onClick={openLoginModal}
            className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 group-hover:bg-slate-900 text-white group-hover:text-white px-5 py-2.5 rounded-full transition-all border border-white/10 group-hover:border-slate-900 active:scale-95"
          >
            <User size={14} />
            <span>Login</span>
          </button>

          {/* BOUTON NAVBAR DYNAMIQUE : Devient 'Investir' sur la Home Page */}
          {isHomePage ? (
            <Link 
              href="/investissement"
              className="hidden sm:block border border-white/20 group-hover:border-slate-900 bg-white/10 group-hover:bg-slate-900 text-white px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-full"
            >
              Investir
            </Link>
          ) : (
            <Link 
              href="/cashback-info"
              className="hidden sm:block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-full"
            >
              Cashback
            </Link>
          )}

          <button 
            className="lg:hidden p-2 text-white group-hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* --- MODAL DE LOGIN --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28}/></div>
              <h2 className="text-2xl font-serif text-slate-900">Project Tracker</h2>
              <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Suivi sécurisé</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input type="text" defaultValue="client@luxury-estates.com" className="w-full px-6 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none text-sm" />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Mot de passe (123)" className="w-full px-6 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none text-sm" />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all">Accéder au Dashboard</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MENU MOBILE DYNAMIQUE --- */}
      <div className={`fixed inset-0 bg-white z-[999] transition-all duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-50">
           <span className="text-slate-900 text-lg font-serif italic tracking-wide">Luxury Estates</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900"><X size={32} /></button>
        </div>
        <div className="flex flex-col h-[calc(100vh-80px)] px-10 pt-12 pb-10 justify-between">
          <div className="flex flex-col space-y-8">
            <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">Navigation</p>
            {["Propriétés", "Confidentiel", "Investissement", "Contact"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif text-slate-900 flex items-center justify-between">
                {item} <ArrowRight className="text-emerald-500 opacity-30" size={24} />
              </Link>
            ))}
          </div>
          <div className="flex flex-col space-y-4">
            <button onClick={openLoginModal} className="w-full border border-slate-200 text-slate-900 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"><User size={16} /><span>Accès Client</span></button>
            <Link 
              href={isHomePage ? "/investissement" : "/cashback-info"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest text-center ${isHomePage ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'}`}
            >
              {isHomePage ? "Opportunités d'Investissement" : "Découvrir le Cashback"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}