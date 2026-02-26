"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck 
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  // --- STATES ---
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null); // Pour l'Admin (Supabase Auth)
  const [clientPin, setClientPin] = useState<string | null>(null); // Pour le Client (PIN)
  const [authLoading, setAuthLoading] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURATION ---
  const ADMIN_EMAIL = "ton-email@exemple.com"; 
  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" },
  ];

  // --- AUTH LOGIC (Hybride Admin/Client) ---
  useEffect(() => {
    // 1. Vérifier si un Admin est connecté
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    checkUser();

    // 2. Vérifier si un Client est déjà connecté via PIN
    const savedPin = localStorage.getItem("client_access_pin");
    if (savedPin) setClientPin(savedPin);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    // Tentative de connexion via PIN (Table suivi_chantier)
    const { data, error } = await supabase
      .from('suivi_chantier')
      .select('pin_code')
      .eq('pin_code', passwordInput) 
      .maybeSingle();

    if (data) {
      localStorage.setItem("client_access_pin", data.pin_code);
      setClientPin(data.pin_code);
      setIsLoginModalOpen(false);
      setPasswordInput("");
      router.push('/project-tracker');
    } else {
      alert("Code PIN incorrect. Veuillez vérifier vos documents.");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("client_access_pin");
    setClientPin(null);
    setUser(null);
    router.push('/');
  };

  // --- GOOGLE TRANSLATE ---
  useEffect(() => {
    const addScript = document.createElement("script");
    addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
    document.body.appendChild(addScript);
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google?.translate) {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,es,nl',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        }, 'google_translate_element');
      }
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

  const isHomePage = pathname === "/";
  const isCashbackPage = pathname === "/cashback-info";
  const showStickyCashback = !isHomePage && !isCashbackPage;

  return (
    <>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
        body { top: 0px !important; }
        .goog-tooltip { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      `}</style>

      {showStickyCashback && (
        <a href="/contact-cashback" className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-emerald-600 text-white px-3 py-6 rounded-l-2xl shadow-2xl hover:bg-emerald-700 transition-all flex flex-col items-center gap-3 group border-l border-white/10" style={{ writingMode: 'vertical-rl' }}>
          <Gift size={18} className="rotate-90 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Réclamer mon Cashback</span>
        </a>
      )}

      <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-10 py-6 transition-all duration-500 bg-black/20 backdrop-blur-sm hover:bg-white group border-b border-transparent hover:border-gray-100">
        
        <Link href="/" className="z-[110]">
          <span className="text-white text-lg font-serif italic tracking-wide transition-all duration-500 group-hover:text-slate-900">
            Luxury Estates
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex space-x-8 uppercase text-[10px] tracking-[0.4em] text-white/90 group-hover:text-slate-600 font-bold transition-colors">
          <Link href="/proprietes" className="hover:text-slate-900">Propriétés</Link>
          <Link href="/confidentiel" className="hover:text-slate-900">Confidentiel</Link>
          <Link href="/investissement" className="hover:text-slate-900">Investissement</Link>
          <Link href="/contact" className="hover:text-slate-900">Contact</Link>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6 text-white group-hover:text-slate-900 z-[110]">
          {/* LANGUE */}
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-1 text-[10px] font-bold tracking-widest">
              <Globe size={14} /> <span>{currentLang}</span> <ChevronDown size={10} className={showLangMenu ? 'rotate-180' : ''} />
            </button>
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-4 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 min-w-[140px]">
                {languages.map((l) => (
                  <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 text-slate-900 rounded-xl">
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGIN / DASHBOARD (Logique Hybride) */}
          {(user || clientPin) ? (
            <div className="flex items-center gap-3">
              {user?.email === ADMIN_EMAIL && (
                <Link href="/admin-blanca" className="bg-slate-900 text-white px-4 py-2.5 rounded-full hover:bg-slate-700 shadow-lg">
                  <ShieldCheck size={14} />
                </Link>
              )}
              <Link href="/project-tracker" className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 shadow-lg shadow-emerald-900/20">
                <LayoutDashboard size={14} /> <span>Mon Projet</span>
              </Link>
              <button onClick={handleLogout} className="p-2 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 group-hover:bg-slate-900 text-white px-5 py-2.5 rounded-full border border-white/10 transition-all">
              <User size={14} /> <span>Accès Client</span>
            </button>
          )}

          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}><Menu size={28} /></button>
        </div>
      </nav>

      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* MODAL DE LOGIN (Simplifiée pour PIN) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"><Lock size={28}/></div>
              <h2 className="text-2xl font-serif text-slate-900 italic lowercase">project tracker</h2>
              <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Entrez votre code confidentiel</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="Votre Code PIN" 
                className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50 outline-none text-center text-xl tracking-[0.5em] font-black text-slate-900 focus:border-emerald-500 transition-all" 
                required 
              />
              <button type="submit" disabled={authLoading} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                {authLoading ? "Validation..." : "Accéder à ma villa"}
                {!authLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}