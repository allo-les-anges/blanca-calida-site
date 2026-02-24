"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  Lock, 
  Gift, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- STATES ---
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("FR");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURATION ---
  const ADMIN_EMAIL = "ton-email@exemple.com"; // À remplacer par ton email admin
  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" },
  ];

  // --- GOOGLE TRANSLATE LOGIC ---
  useEffect(() => {
    // Ajout du script Google Translate
    const addScript = document.createElement("script");
    addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
    document.body.appendChild(addScript);
    
    // @ts-ignore
    window.googleTranslateElementInit = () => {
      // @ts-ignore
      new window.google.translate.TranslateElement({
        pageLanguage: 'fr',
        includedLanguages: 'fr,en,es,nl',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      }, 'google_translate_element');
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(langCode.toUpperCase());
      setShowLangMenu(false);
    }
  };

  // --- AUTH LOGIC ---
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      setIsLoginModalOpen(false);
      router.push('/project-tracker');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // --- UI HELPERS ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage = pathname === "/";
  const isCashbackPage = pathname === "/cashback-info";
  const showStickyCashback = !isHomePage && !isCashbackPage;

  return (
    <>
      {/* CSS POUR MASQUER LA BARRE GOOGLE (Injecté ici ou dans globals.css) */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      `}</style>

      {/* --- BOUTON STICKY CASHBACK --- */}
      {showStickyCashback && (
        <a 
          href="/contact-cashback"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-emerald-600 text-white px-3 py-6 rounded-l-2xl shadow-2xl hover:bg-emerald-700 transition-all flex flex-col items-center gap-3 group border-l border-t border-b border-emerald-500/20"
          style={{ writingMode: 'vertical-rl' }}
        >
          <Gift size={18} className="rotate-90 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Réclamer mon Cashback</span>
        </a>
      )}

      <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
        
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

        <div className="flex items-center space-x-3 md:space-x-6 text-white group-hover:text-slate-900 transition-colors z-[110]">
          
          {/* SÉLECTEUR DE LANGUE */}
          <div className="relative" ref={langMenuRef}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1 text-[10px] font-bold tracking-widest hover:text-emerald-500 transition-colors"
            >
              <Globe size={14} />
              <span>{currentLang}</span>
              <ChevronDown size={10} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-4 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 min-w-[140px] animate-in fade-in zoom-in duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors text-slate-900"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AUTH / DASHBOARD */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.email === ADMIN_EMAIL && (
                <Link href="/admin-blanca" className="bg-slate-900 text-white px-4 py-2.5 rounded-full hover:bg-slate-700 transition shadow-lg">
                  <ShieldCheck size={14} />
                </Link>
              )}
              <Link href="/project-tracker" className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 shadow-lg shadow-emerald-900/20">
                <LayoutDashboard size={14} />
                <span>Mon Projet</span>
              </Link>
              <button onClick={handleLogout} className="p-2 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 group-hover:bg-slate-900 text-white px-5 py-2.5 rounded-full border border-white/10 group-hover:border-slate-900 transition-all"
            >
              <User size={14} />
              <span>Login</span>
            </button>
          )}

          <button className="lg:hidden p-2 text-white group-hover:text-slate-900" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* ELEMENT GOOGLE CACHÉ */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* --- MODAL DE LOGIN --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28}/></div>
              <h2 className="text-2xl font-serif text-slate-900 lowercase italic">project tracker</h2>
              <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.2em]">Accès sécurisé propriétaire</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Email" className="w-full px-6 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none text-sm text-slate-900 focus:border-emerald-500 transition-colors" required />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Mot de passe" className="w-full px-6 py-4 rounded-xl border border-slate-100 bg-slate-50 outline-none text-sm text-slate-900 focus:border-emerald-500 transition-colors" required />
              <button type="submit" disabled={authLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                {authLoading ? "Vérification..." : "Accéder à mon suivi"}
                {!authLoading && <ArrowRight size={14} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MENU MOBILE --- */}
      <div className={`fixed inset-0 bg-white z-[999] transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-50">
            <span className="text-slate-900 text-lg font-serif italic tracking-wide">Luxury Estates</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900"><X size={32} /></button>
        </div>
        <div className="flex flex-col h-[calc(100vh-80px)] px-10 pt-12 pb-10 justify-between">
          <div className="flex flex-col space-y-8">
            {["Propriétés", "Confidentiel", "Investissement", "Contact"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif text-slate-900 flex items-center justify-between">
                {item} <ArrowRight className="text-emerald-500 opacity-30" size={24} />
              </Link>
            ))}
          </div>
          <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className="w-full border border-slate-200 text-slate-900 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
            <User size={16} /><span>{user ? "Mon Compte" : "Accès Client"}</span>
          </button>
        </div>
      </div>
    </>
  );
}