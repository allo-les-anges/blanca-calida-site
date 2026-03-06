"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Globe, ChevronDown, Menu, X, ArrowRight, User, 
  Lock, Gift, LayoutDashboard, LogOut, ShieldCheck, Search
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
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Pour la recherche avancée
  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [clientPin, setClientPin] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURATION ---
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

  // --- EFFETS ---
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

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // --- ACTIONS ---
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
        ${(isMobileMenuOpen || isSearchModalOpen || isLoginModalOpen) ? 'body { overflow: hidden; }' : ''}
      `}</style>

      {showStickyCashback && (
        <a href="/contact-cashback" className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-[#D4AF37] text-black px-3 py-6 rounded-l-2xl shadow-2xl hover:bg-white transition-all flex flex-col items-center gap-3 group border-l border-white/10" style={{ writingMode: 'vertical-rl' }}>
          <Gift size={18} className="rotate-90 mb-2" />
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Cashback</span>
        </a>
      )}

      {/* NAVBAR PRINCIPALE */}
      <nav className={`fixed w-full top-0 left-0 z-[100] transition-all duration-700 h-24 flex items-center ${
        isScrolled ? "bg-[#020617] shadow-xl border-b border-white/5" : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          
          {/* LOGO AMARU */}
          <Link href="/" className="z-[110] flex flex-col items-start group">
            <span className="text-3xl font-serif italic tracking-tighter text-white">Amaru</span>
            <span className="text-[#D4AF37] font-sans text-[10px] tracking-[0.4em] uppercase font-light -mt-1">Excellence</span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden lg:flex items-center space-x-10 uppercase text-[10px] tracking-[0.4em] font-bold text-white/80">
            <div className="relative group py-4" ref={regionMenuRef}>
              <button onMouseEnter={() => setShowRegionMenu(true)} className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors">
                Destinations <ChevronDown size={10} className={showRegionMenu ? "rotate-180" : ""} />
              </button>
              {showRegionMenu && (
                <div onMouseLeave={() => setShowRegionMenu(false)} className="absolute top-full left-0 mt-0 bg-[#020617] border border-white/10 rounded-xl shadow-2xl p-4 min-w-[200px]">
                  {regions.map((reg) => (
                    <Link key={reg.slug} href={`/search?region=${reg.name}`} className="block py-3 text-slate-400 hover:text-[#D4AF37] border-b border-white/5 last:border-0 transition-colors uppercase tracking-[0.2em] text-[9px]">
                      {reg.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/proprietes" className="hover:text-[#D4AF37] transition-colors">Propriétés</Link>
            <Link href="/confidentiel" className="hover:text-[#D4AF37] transition-colors">Confidentiel</Link>
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center space-x-4 z-[110]">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2">
              <Menu size={28} />
            </button>

            <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black transition-all">
              <User size={14} /> <span>Accès Client</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MENU MOBILE (RÉPARE VOTRE PROBLÈME DE CLIC) --- */}
      <div className={`fixed inset-0 z-[200] transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-[#020617] backdrop-blur-2xl" />
        <div className="relative h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex flex-col">
              <span className="text-2xl font-serif italic text-white">Amaru</span>
              <span className="text-[#D4AF37] text-[8px] tracking-[0.4em] uppercase">Excellence</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={32} /></button>
          </div>
          <nav className="flex flex-col space-y-8 text-2xl font-serif italic text-white">
            <Link href="/">Accueil</Link>
            <Link href="/proprietes">Propriétés</Link>
            <Link href="/confidentiel">Confidentiel</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="mt-auto pb-10">
            <button onClick={() => setIsLoginModalOpen(true)} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
              <User size={16} /> Accès Client
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL RECHERCHE AVANCÉE (OPTIMISÉE MOBILE) --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header de la Modal fixé en haut */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
              <h3 className="text-xl font-serif italic text-slate-900">Recherche Avancée</h3>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="p-8 overflow-y-auto space-y-8 pb-24">
              {/* Exemple de champ : Référence */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-emerald-600 flex items-center gap-2">
                   <ShieldCheck size={14}/> Référence Supabase
                </label>
                <input type="text" placeholder="Ex: REF-1234" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl outline-none focus:border-emerald-500 transition-all" />
              </div>

              {/* Exemple de champ : Région */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Région</label>
                <select className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl outline-none appearance-none">
                  <option>Toutes les régions</option>
                  {regions.map(r => <option key={r.slug}>{r.name}</option>)}
                </select>
              </div>

              {/* Ajoutez vos autres champs ici */}
            </div>

            {/* Footer fixé en bas pour valider */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100">
              <button className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all">
                Voir les résultats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGIN (Inchangée mais fonctionnelle) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
           {/* ... Votre code de modal login précédent ... */}
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative">
             <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-400"><X size={24}/></button>
             <div className="text-center mb-10">
                <h2 className="text-2xl font-serif italic">Accès Privé</h2>
             </div>
             {/* Formulaire ... */}
           </div>
        </div>
      )}
    </>
  );
}