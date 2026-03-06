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
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [clientPin, setClientPin] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  const regions = [
    { name: "Costa Blanca", slug: "costa-blanca" },
    { name: "Costa Calida", slug: "costa-calida" },
    { name: "Costa Almeria", slug: "costa-almeria" },
    { name: "Costa del Sol", slug: "costa-del-sol" },
  ];

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    checkUser();
    const savedPin = localStorage.getItem("client_access_pin");
    if (savedPin) setClientPin(savedPin);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("client_access_pin");
    setClientPin(null);
    setUser(null);
    router.push('/');
  };

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(langCode.toUpperCase());
      setShowLangMenu(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { data } = await supabase.from('suivi_chantier').select('pin_code').eq('pin_code', passwordInput).maybeSingle();
    if (data) {
      localStorage.setItem("client_access_pin", data.pin_code);
      setClientPin(data.pin_code);
      setIsLoginModalOpen(false);
      setPasswordInput("");
      router.push('/project-tracker');
    } else {
      alert("Code PIN incorrect.");
    }
    setAuthLoading(false);
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
        ${isMobileMenuOpen ? 'body { overflow: hidden; }' : ''}
      `}</style>

      {showStickyCashback && (
        <a href="/contact-cashback" className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-[#D4AF37] text-black px-3 py-6 rounded-l-2xl shadow-2xl hover:bg-white transition-all flex flex-col items-center gap-3 group border-l border-white/10" style={{ writingMode: 'vertical-rl' }}>
          <Gift size={18} className="rotate-90 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Réclamer mon Cashback</span>
        </a>
      )}

      {/* NAVBAR PRINCIPALE */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled 
        ? "bg-[#020617] shadow-xl border-b border-white/5" 
        : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          
          {/* LOGO AMARU */}
          <Link href="/" className="z-[110] flex flex-col items-start group">
            <span className="text-3xl font-serif italic tracking-tighter text-white">Amaru</span>
            <span className="text-[#D4AF37] font-sans text-[10px] tracking-[0.4em] uppercase font-light -mt-1 group-hover:tracking-[0.5em] transition-all duration-500">Excellence</span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden lg:flex items-center space-x-10 uppercase text-[10px] tracking-[0.4em] font-bold text-white/80">
            <div className="relative group py-4" ref={regionMenuRef}>
              <button onMouseEnter={() => setShowRegionMenu(true)} className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors">
                Destinations <ChevronDown size={10} className={showRegionMenu ? "rotate-180" : ""} />
              </button>
              {showRegionMenu && (
                <div onMouseLeave={() => setShowRegionMenu(false)} className="absolute top-full left-0 mt-0 bg-[#020617] border border-white/10 rounded-xl shadow-2xl p-4 min-w-[200px] animate-in fade-in slide-in-from-top-2">
                  {regions.map((reg) => (
                    <Link key={reg.slug} href={`/search?region=${reg.name}`} className="block py-3 text-slate-400 hover:text-[#D4AF37] border-b border-white/5 last:border-0 transition-colors uppercase tracking-[0.2em] text-[9px]">
                      {reg.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/proprietes" className="hover:text-[#D4AF37] transition-colors">Propriétés</Link>
            <Link href="/confidentiel" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
              <ShieldCheck size={12} className="text-[#D4AF37]" /> Confidentiel
            </Link>
            <Link href="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link>
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center space-x-6 z-[110]">
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-white">
                <Globe size={14} className="text-[#D4AF37]" /> <span>{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-4 bg-[#020617] border border-white/10 rounded-xl shadow-xl p-2 min-w-[140px]">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => changeLanguage(l.code)} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 text-slate-300 hover:text-[#D4AF37] rounded-lg transition-colors">
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2">
              <Menu size={28} />
            </button>

            <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black transition-all duration-500">
              <User size={14} /> <span>Accès Client</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MENU MOBILE (LE RIDEAU) --- */}
      <div className={`fixed inset-0 z-[200] transition-all duration-700 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Background dark avec flou */}
        <div className="absolute inset-0 bg-[#020617]/98 backdrop-blur-2xl" />
        
        <div className="relative h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-16">
            <div className="flex flex-col">
              <span className="text-2xl font-serif italic text-white">Amaru</span>
              <span className="text-[#D4AF37] text-[8px] tracking-[0.4em] uppercase">Excellence</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors">
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col space-y-8 text-2xl font-serif italic">
            <Link href="/" className="text-white hover:text-[#D4AF37] transition-colors">Accueil</Link>
            <div className="space-y-4">
              <p className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-slate-500">Destinations</p>
              <div className="grid grid-cols-1 gap-4 pl-4 border-l border-white/5 font-sans not-italic text-sm uppercase tracking-widest">
                {regions.map(r => (
                  <Link key={r.slug} href={`/search?region=${r.name}`} className="text-slate-300">{r.name}</Link>
                ))}
              </div>
            </div>
            <Link href="/proprietes" className="text-white hover:text-[#D4AF37] transition-colors">Propriétés</Link>
            <Link href="/confidentiel" className="text-white hover:text-[#D4AF37] transition-colors">Confidentiel</Link>
            <Link href="/contact" className="text-white hover:text-[#D4AF37] transition-colors">Contact</Link>
          </div>

          <div className="mt-auto pb-12 space-y-6">
             <button onClick={() => {setIsMobileMenuOpen(false); setIsLoginModalOpen(true);}} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3">
               <User size={16} /> Accès Client
             </button>
             <div className="flex justify-center gap-8">
                {languages.map(l => (
                  <button key={l.code} onClick={() => changeLanguage(l.code)} className={`text-[10px] font-bold ${currentLang === l.code.toUpperCase() ? 'text-[#D4AF37]' : 'text-slate-500'}`}>
                    {l.code.toUpperCase()}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-6">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[3rem] p-12 shadow-2xl relative border border-white/5">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20 shadow-xl"><Lock size={28}/></div>
              <h2 className="text-2xl font-serif text-white italic">Accès Privé</h2>
              <p className="text-[#D4AF37] text-[8px] mt-2 uppercase tracking-[0.3em] font-bold">Project Tracker</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="PIN" className="w-full bg-black/40 border border-white/10 px-6 py-5 rounded-2xl outline-none text-center text-2xl tracking-[0.5em] font-black text-[#D4AF37] focus:border-[#D4AF37]/50 transition-all placeholder:text-slate-800" required />
              <button type="submit" disabled={authLoading} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3">
                {authLoading ? "Validation..." : "Se connecter"}
                {!authLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}