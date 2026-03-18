"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Globe, ShieldCheck, TrendingUp, Cpu, Layers,
  MapPin, Camera, ChevronDown, Home, ArrowRight,
  Settings, Palette, Languages, Workflow
} from 'lucide-react';

// --- DICTIONNAIRE DE TRADUCTION COMPLET ---
const translations = {
  fr: {
    dir: 'ltr', label: "Français",
    nav: ["Vision", "Fonctionnement", "Master Template", "Commencer"],
    hero: { tag: "OS Immobilier Global v1.2", title1: "L'Immobilier", title2: "Sans Frontières.", desc: "L'infrastructure logicielle qui unifie le marché mondial. Connectez vos clients locaux aux opportunités internationales en un clic." },
    gap: { title1: "Combler la", title2: "Fracture Immobilière.", desc1: "Aujourd'hui, lorsqu'un client vend un bien localement pour s'expatrier, le flux de données s'arrête. L'agence perd le contrôle et le client perd sa confiance.", desc2: "Data-Home.io agit comme une couche d'interopérabilité. Nous sécurisons les commissions cross-border en gardant le client dans votre écosystème." },
    how: {
      title: "Comment ça marche :", subtitle: "Le Flux Global",
      steps: [
        { icon: MapPin, t: "1. Le Besoin Local", d: "Votre client veut vendre pour investir à l'étranger. Initialement, vous n'avez pas de base de données certifiée pour l'accompagner." },
        { icon: Layers, t: "2. Activation Master Template", d: "Vous activez Data-Home.io. Instantanément, vous accédez à un catalogue unifié et vérifié de biens internationaux." },
        { icon: Camera, t: "3. Suivi en Temps Réel", d: "Le chantier est suivi par des pros sur place. Ils envoient des rapports photos et l'état d'avancement directement sur votre plateforme." },
        { icon: ShieldCheck, t: "4. Confiance Totale", d: "Le client accède à son dashboard dédié. Il suit son investissement en temps réel, renforçant son lien avec votre agence." }
      ]
    },
    saas: {
      title: "Le Master Template", subtitle: "Configurable",
      desc: "Prenez le contrôle total de votre interface. Notre environnement SaaS vous permet de configurer chaque aspect de votre plateforme internationale pour qu'elle s'aligne parfaitement sur votre identité.",
      features: [
        { icon: Palette, t: "Branding Total", d: "Personnalisez logos, couleurs et polices pour une expérience 100% marque blanche." },
        { icon: Languages, t: "Multi-langues Automatique", d: "Activez et gérez les traductions pour vos clients internationaux en un instant." },
        { icon: Workflow, t: "Gestion des Étapes", d: "Configurez vos propres jalons de chantier et flux de travail personnalisés." },
        { icon: Settings, t: "Contrôle Data", d: "Administrez vos accès API et la synchronisation des données depuis votre console." }
      ]
    }
  },
  en: { 
    dir: 'ltr', label: "English", 
    nav: ["Vision", "How It Works", "Master Template", "Get Started"], 
    hero: { tag: "Global Real Estate OS v1.2", title1: "Scaling Real Estate", title2: "Beyond Borders.", desc: "The software infrastructure that unifies the global real estate market." }, 
    gap: { title1: "Solving the", title2: "Global Real Estate Gap.", desc1: "When a client sells locally to relocate, data flow stops.", desc2: "We secure cross-border commissions by keeping the client in your ecosystem." }, 
    how: { title: "How It Works:", subtitle: "The Global Flow", steps: [{ icon: MapPin, t: "1. Local Need", d: "Your client wants to invest abroad. You gain access to a certified international database." }, { icon: Layers, t: "2. Activation", d: "Instantly access a unified and verified portfolio of global properties." }, { icon: Camera, t: "3. Real-Time Tracking", d: "On-site pros upload progress reports and photos directly to your platform." }, { icon: ShieldCheck, t: "4. Total Trust", d: "Clients access their dedicated dashboard to follow investments in real-time." }] }, 
    saas: { title: "Configurable", subtitle: "Master Template", desc: "Take full control of your interface. Our SaaS environment allows you to configure every aspect of your international platform.", features: [{ icon: Palette, t: "Full Branding", d: "Customize logos, colors, and fonts for a 100% white-label experience." }, { icon: Languages, t: "Auto Multi-language", d: "Activate and manage translations for your global clients instantly." }, { icon: Workflow, t: "Milestone Management", d: "Configure your own construction milestones and custom workflows." }, { icon: Settings, t: "Data Control", d: "Manage API access and data synchronization from your console." }] } 
  },
  nl: { dir: 'ltr', label: "Nederlands", nav: ["Visie", "Werking", "Master Template", "Starten"], hero: { tag: "Global OS v1.2", title1: "Vastgoed Schalen", title2: "Zonder Grenzen.", desc: "Software-infrastructuur die de wereldwijde markt verenigt." }, gap: { title1: "Het dichten van de", title2: "Vastgoedkloof.", desc1: "Wanneer een klant lokaal verkoopt, stopt de gegevensstroom.", desc2: "Data-Home.io fungeert als een interoperabiliteitslaag." }, how: { title: "Hoe het werkt:", subtitle: "De Global Flow", steps: [{ icon: MapPin, t: "1. Lokale Nood", d: "Uw klant wil internationaal investeren." }, { icon: Layers, t: "2. Activatie", d: "Directe toegang tot een wereldwijd portfolio." }, { icon: Camera, t: "3. Opvolging", d: "Bouwprofessionals uploaden fotoreportages." }, { icon: ShieldCheck, t: "4. Vertrouwen", d: "Klant volgt investering in real-time." }] }, saas: { title: "Configureerbaar", subtitle: "Master Template", desc: "Neem de volledige controle over uw interface. Configureer elk aspect van uw platform.", features: [{ icon: Palette, t: "Full Branding", d: "Personaliseer logo's en kleuren." }, { icon: Languages, t: "Meertaligheid", d: "Beheer vertalingen direct." }, { icon: Workflow, t: "Mijlpalen", d: "Configureer uw eigen workflows." }, { icon: Settings, t: "Data Beheer", d: "Beheer API-toegang." }] } },
  pl: { dir: 'ltr', label: "Polski", nav: ["Wizja", "Jak to działa", "Master Template", "Zacznij"], hero: { tag: "Global OS v1.2", title1: "Skalowanie", title2: "Bez Granic.", desc: "Infrastruktura oprogramowania jednocząca rynek." }, gap: { title1: "Rozwiązanie", title2: "Globalnej Luki.", desc1: "Kiedy klient sprzedaje lokalnie, przepływ danych ustaje.", desc2: "Zabezpieczamy prowizje zagraniczne." }, how: { title: "Jak to działa:", subtitle: "Globalny Przepływ", steps: [{ icon: MapPin, t: "1. Potrzeba", d: "Klient chce inwestować za granicą." }, { icon: Layers, t: "2. Aktywacja", d: "Dostęp do zweryfikowanych ofert." }, { icon: Camera, t: "3. Śledzenie", d: "Raporty foto prosto do Twojej platformy." }, { icon: ShieldCheck, t: "4. Zaufanie", d: "Klient śledzi postępy w czasie irrealsistym." }] }, saas: { title: "Konfigurowalny", subtitle: "Master Template", desc: "Przejmij pełną kontrolę nad interfejsem. Konfiguruj każdy aspekt swojej platformy.", features: [{ icon: Palette, t: "Full Branding", d: "Dostosuj logo i kolory." }, { icon: Languages, t: "Multi-języczność", d: "Zarządzaj tłumaczeniami natychmiast." }, { icon: Workflow, t: "Zarządzanie Etapami", d: "Konfiguruj własne kroki budowy." }, { icon: Settings, t: "Kontrola Danych", d: "Zarządzaj dostępem API." }] } },
  es: { dir: 'ltr', label: "Español", nav: ["Visión", "Funcionamiento", "Master Template", "Empezar"], hero: { tag: "OS Global v1.2", title1: "Inmobiliario", title2: "Sin Fronteras.", desc: "La infraestructura que une el marché inmobiliario mundial." }, gap: { title1: "Cerrando la", title2: "Brecha Inmobiliaria.", desc1: "Cuando un client vende localmente, el flujo de données se rompe.", desc2: "Aseguramos comisiones internacionales." }, how: { title: "Cómo funciona:", subtitle: "Flujo Global", steps: [{ icon: MapPin, t: "1. Necesidad", d: "Su cliente quiere invertir fuera." }, { icon: Layers, t: "2. Activación", d: "Catálogo verificado de propiedades globales." }, { icon: Camera, t: "3. Seguimiento", d: "Fotos del progreso en tiempo real." }, { icon: ShieldCheck, t: "4. Confianza", d: "El cliente sigue su inversión desde su dashboard." }] }, saas: { title: "Master Template", subtitle: "Configurable", desc: "Tome el control total de su interfaz. Configure cada aspecto de su plateforme internationale.", features: [{ icon: Palette, t: "Branding Total", d: "Personalice logos, colores y fuentes." }, { icon: Languages, t: "Multi-idioma", d: "Active traducciones al instante." }, { icon: Workflow, t: "Gestión de Hitos", d: "Configure sus propios pasos de obra." }, { icon: Settings, t: "Control de Datos", d: "Administre accesos y sincronización." }] } },
  ar: { dir: 'rtl', label: "العربية", nav: ["الرؤية", "كيف يعمل", "القالب الرئيسي", "ابدأ"], hero: { tag: "نظام العقارات v1.2", title1: "العقارات", title2: "بلا حدود.", desc: "البنية التحتية البرمجية التي توحد سوق العقارات العالمي." }, gap: { title1: "حل", title2: "الفجوة العقارية.", desc1: "عندما يبيع العميل محلياً، يتوقف تدفق البيانات.", desc2: "تؤمن Data-Home عمولاتك." }, how: { title: "كيف يعمل:", subtitle: "التدفق العالمي", steps: [{ icon: MapPin, t: "1. الحاجة", d: "عميلك يريد الاستثمار دولياً." }, { icon: Layers, t: "2. التفعيل", d: "وصول فوري لمحفظة عقارات عالمية موثقة." }, { icon: Camera, t: "3. المتابعة", d: "تقارير الصور مباشرة إلى منصتك." }, { icon: ShieldCheck, t: "4. الثقة", d: "يتابع العميل استثماره في الوقت الفعلي." }] }, saas: { title: "القالب الرئيسي", subtitle: "القابل للتهيئة", desc: "تحكم بالكامل في واواجهتك. تتيح لك بيئتنا تهيئة كل جانب من جوانب منصتك الدولية.", features: [{ icon: Palette, t: "هوية تجارية كاملة", d: "تخصيص الشعار والألوان والخطوط." }, { icon: Languages, t: "تعدد اللغات", d: "تفعيل وإدارة الترجمات فوراً." }, { icon: Workflow, t: "إدارة المراحل", d: "تهيئة مراحل البناء الخاصة بك." }, { icon: Settings, t: "التحكم في البيانات", d: "إدارة الوصول والمزامنة." }] } }
};

export default function DataHomeSolution() {
  const [lang, setLang] = useState<keyof typeof translations>('fr');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30 overflow-x-hidden relative" dir={t.dir}>
      
      {/* --- BACKGROUND LAYER (Stays fixed) --- */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none">
        <Image src="/1.jpg" alt="Background" fill className="object-cover" priority />
      </div>

      {/* --- NAV --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 bg-[#020617]/90">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-32 md:w-40">
             <Image src="/logo.jpeg" alt="Logo Data-Home" fill className="object-contain object-left" priority />
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#vision" className="hover:text-white transition-colors">{t.nav[0]}</a>
          <a href="#how" className="hover:text-white transition-colors">{t.nav[1]}</a>
          <a href="#saas" className="hover:text-white transition-colors">{t.nav[2]}</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="p-2 hover:bg-white/5 rounded-full flex items-center gap-1 group">
              <Globe size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <ChevronDown size={12} className={`text-slate-600 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto">
                {(Object.keys(translations) as Array<keyof typeof translations>).map((l) => (
                  <button key={l} onClick={() => { setLang(l); setIsLangOpen(false); }} className={`w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-colors ${lang === l ? 'text-[#10B981] bg-white/5' : 'text-slate-400'}`}>
                    {translations[l].label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="bg-[#10B981] hover:bg-[#059669] text-white px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10">
            {t.nav[3]}
          </button>
        </div>
      </nav>

      {/* --- SECTION 1 : HERO WITH VIDEO BACKGROUND --- */}
      <section id="vision" className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-6 text-center z-10 min-h-[80vh] flex items-center justify-center overflow-hidden">
        
        {/* --- BALISE VIDÉO OPTIMISÉE --- */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          // Ajout de image-rendering pour plus de piqué
          style={{ imageRendering: 'crisp-edges' }}
          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/hero_datahome.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* --- OVERLAY SOMBRE SANS FLOU --- 
            J'ai retiré backdrop-blur et ajusté l'opacité (0.5 au lieu de 0.6) 
            pour laisser passer plus de détails de la vidéo.
        */}
        <div className="absolute inset-0 z-1 bg-slate-950/50"></div>

        {/* --- CONTENU --- */}
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[#10B981] text-[10px] font-black uppercase mb-6 md:mb-8 tracking-widest">
            {t.hero.tag}
          </div>
          
          <h1 className="text-[12vw] md:text-[85px] font-black tracking-tighter leading-[0.9] md:leading-[0.85] mb-8 uppercase break-words overflow-hidden text-white">
            <span className="block">{t.hero.title1}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 italic font-light block">
              {t.hero.title2}
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-white/90 text-base md:text-xl font-light italic leading-relaxed px-4 drop-shadow-md">
            {t.hero.desc}
          </p>
        </div>
      </section>

      {/* --- SECTION FRACTURE (16/9) --- */}
      <section className="py-20 md:py-24 px-6 border-y border-white/5 bg-slate-950/50 z-10 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="order-2 md:order-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              {t.gap.title1} <br /> <span className="text-[#10B981] font-light italic">{t.gap.title2}</span>
            </h2>
            <div className="space-y-6 text-slate-400 font-light leading-relaxed text-base md:text-lg text-justify">
              <p>{t.gap.desc1}</p>
              <div className="flex gap-4 items-start p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl italic">
                <TrendingUp className="text-[#10B981] shrink-0" />
                <p className="text-sm text-slate-300">{t.gap.desc2}</p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-emerald-500/20 shadow-2xl">
              <Image src="/2.jpg" alt="Fracture" fill className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/40 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (16/9) --- */}
      <section id="how" className="py-20 md:py-24 px-6 z-10 relative">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-16 md:mb-20">
            {t.how.title} <span className="text-[#10B981] font-light italic">{t.how.subtitle}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {t.how.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all duration-300">
                  <div className="relative w-full aspect-[16/9]">
                    <Image src={`/3.${i+1}.jpg`} alt={step.t} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-[#10B981]">
                       <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-[10px] uppercase tracking-widest text-white group-hover:text-emerald-400 transition-colors">{step.t}</h3>
                      <p className="text-slate-500 text-[10px] italic leading-relaxed mt-2">{step.d}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- SAAS MASTER TEMPLATE (16/9) --- */}
      <section id="saas" className="py-24 md:py-32 px-6 bg-slate-950 border-y border-white/5 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                  {t.saas.title} <br /> <span className="text-[#10B981] font-light italic">{t.saas.subtitle}</span>
                </h2>
                <p className="text-slate-400 font-light text-base md:text-lg leading-relaxed italic border-l-2 border-[#10B981] pl-6">
                  {t.saas.desc}
                </p>
              </div>

              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-500/5 group">
                <Image src="/4.jpg" alt="Console Admin" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-50"></div>
              </div>
              
              <button className="flex items-center gap-2 text-[#10B981] font-black uppercase text-[10px] tracking-widest group">
                Découvrir la console d'administration <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {t.saas.features.map((f, i) => {
                 const Icon = f.icon;
                 return (
                   <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] hover:border-emerald-500/20 transition-all flex flex-col items-start">
                      <Icon className="text-[#10B981] mb-4" size={24} />
                      <h4 className="font-black text-[10px] uppercase tracking-widest mb-2 text-white">{f.t}</h4>
                      <p className="text-slate-500 text-[10px] leading-relaxed">{f.d}</p>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-white/5 text-center opacity-40 z-10 relative bg-[#020617]">
        <div className="flex justify-center mb-6 grayscale hover:grayscale-0 transition-all duration-500 h-6 relative w-24 mx-auto">
           <Image src="/logo.jpeg" alt="Logo Footer" fill className="object-contain" />
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em] px-6">
          © 2026 Data-Home.io / Global Infrastructure / Mons, Belgium
        </p>
      </footer>
    </div>
  );
}