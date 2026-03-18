"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Globe, ShieldCheck, TrendingUp, Cpu, Layers,
  MapPin, Camera, ChevronDown, Home, ArrowRight,
  Settings, Palette, Languages, Workflow,
  Check, X, Zap, Star, Crown
} from 'lucide-react';

// --- DICTIONNAIRE DE TRADUCTION COMPLET ---
const translations = {
  fr: {
    dir: 'ltr', label: "Français",
    nav: ["Vision", "Fonctionnement", "Master Template", "Tarifs", "Commencer"],
    hero: { tag: "OS Immobilier Global v1.2", title1: "L'Immobilier", title2: "Sans Frontières.", desc: "L'infrastructure logicielle qui unifie le marché mondial. Connectez vos clients locaux aux opportunités internationales en un clic." },
    gap: { title1: "Combler la", title2: "Fracture Immobilière.", desc1: "Aujourd'hui, lorsqu'un client vend un bien localement pour s'expatrier, le flux de données s'arrête. L'agence perd le contrôle et le client perd sa confiance.", desc2: "data-home.io agit comme une couche d'interopérabilité. Nous sécurisons les commissions cross-border en gardant le client dans votre écosystème." },
    how: {
      title: "Comment ça marche :", subtitle: "Le Flux Global",
      steps: [
        { icon: MapPin, t: "1. Le Besoin Local", d: "Votre client veut vendre pour investir à l'étranger. Initialement, vous n'avez pas de base de données certifiée pour l'accompagner." },
        { icon: Layers, t: "2. Activation Master Template", d: "Vous activez data-home.io. Instantanément, vous accédez à un catalogue unifié et vérifié de biens internationaux." },
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
    },
    pricing: {
      tag: "Programme Partenaires Fondateurs (20 places)",
      title: "Investissez dans votre",
      subtitle: "Infrastructure.",
      desc: "Bénéficiez d'une réduction de 50% garantie à vie sur votre abonnement en devenant l'une de nos 20 agences références.",
      cta: "Choisir ce pack",
      popular: "Recommandé",
      perMonth: "/mois",
      footer: "* Les tarifs \"Fondateurs\" sont bloqués et n'augmenteront jamais pour votre agence.",
      packs: [
        { name: "Bronze", desc: "Idéal pour les indépendants.", features: ["5 Projets max", "2 Staff", "Suivi chantier", "Cashback", "1 Go Stockage"] },
        { name: "Silver", desc: "Pour les agences en croissance.", features: ["25 Projets max", "5 Staff", "Filtres XML", "Custom Branding", "5 Go Stockage", "PDF Illimités"] },
        { name: "Gold", desc: "Solution réseaux & holdings.", features: ["Projets illimités", "Multi-agences", "API & Webhooks", "White-label", "25 Go Stockage", "Support 24/7"] }
      ]
    }
  },
  en: { 
    dir: 'ltr', label: "English", 
    nav: ["Vision", "How It Works", "Master Template", "Pricing", "Get Started"], 
    hero: { tag: "Global Real Estate OS v1.2", title1: "Scaling Real Estate", title2: "Beyond Borders.", desc: "The software infrastructure that unifies the global real estate market." }, 
    gap: { title1: "Solving the", title2: "Real Estate Gap.", desc1: "When a client sells locally, data flow stops.", desc2: "We secure cross-border commissions by keeping the client in your ecosystem." }, 
    how: { title: "How It Works:", subtitle: "The Global Flow", steps: [{ icon: MapPin, t: "1. Local Need", d: "Your client wants to invest abroad. Access a certified international database." }, { icon: Layers, t: "2. Activation", d: "Instantly access a unified and verified portfolio of properties." }, { icon: Camera, t: "3. Tracking", d: "On-site pros upload progress reports and photos." }, { icon: ShieldCheck, t: "4. Trust", d: "Clients follow investments in real-time." }] }, 
    saas: { title: "Configurable", subtitle: "Master Template", desc: "Take full control. Configure every aspect of your international platform.", features: [{ icon: Palette, t: "Full Branding", d: "Customize logos, colors, and fonts." }, { icon: Languages, t: "Auto Translate", d: "Manage translations for global clients." }, { icon: Workflow, t: "Workflow", d: "Configure your own construction milestones." }, { icon: Settings, t: "Data", d: "Manage API access and data sync." }] },
    pricing: { tag: "Founder Partner Program (20 slots)", title: "Invest in your", subtitle: "Infrastructure.", desc: "Get 50% off for life by becoming one of our 20 reference agencies.", cta: "Choose Plan", popular: "Recommended", perMonth: "/mo", footer: "* Founder rates are locked and will never increase for your agency.", packs: [ { name: "Bronze", desc: "Ideal for freelancers.", features: ["5 Projects max", "2 Staff", "Construction tracking", "Cashback", "1 GB Storage"] }, { name: "Silver", desc: "For growing agencies.", features: ["25 Projects max", "5 Staff", "XML Filters", "Custom Branding", "5 GB Storage", "Unlimited PDF"] }, { name: "Gold", desc: "Network solution.", features: ["Unlimited projects", "Multi-agency", "API & Webhooks", "White-label", "25 GB Storage", "24/7 Support"] } ] }
  },
  nl: { 
    dir: 'ltr', label: "Nederlands", 
    nav: ["Visie", "Werking", "Master Template", "Tarieven", "Starten"], 
    hero: { tag: "Global OS v1.2", title1: "Vastgoed Schalen", title2: "Zonder Grenzen.", desc: "Software-infrastructuur die de wereldwijde markt verenigt." }, 
    gap: { title1: "Het dichten van de", title2: "Vastgoedkloof.", desc1: "Wanneer een klant lokaal verkoopt, stopt de stroom.", desc2: "data-home.io fungeert als een interoperabiliteitslaag." }, 
    how: { title: "Hoe het werkt:", subtitle: "De Global Flow", steps: [{ icon: MapPin, t: "1. Lokale Nood", d: "Uw klant wil internationaal investeren." }, { icon: Layers, t: "2. Activatie", d: "Directe toegang tot een wereldwijd portfolio." }, { icon: Camera, t: "3. Opvolging", d: "Bouwprofessionals uploaden fotoreportages." }, { icon: ShieldCheck, t: "4. Vertrouwen", d: "Klant volgt investering in real-time." }] }, 
    saas: { title: "Configureerbaar", subtitle: "Master Template", desc: "Neem de volledige controle over uw interface.", features: [{ icon: Palette, t: "Branding", d: "Personaliseer logo's en kleuren." }, { icon: Languages, t: "Vertalingen", d: "Beheer vertalingen direct." }, { icon: Workflow, t: "Workflows", d: "Configureer uw eigen mijlpalen." }, { icon: Settings, t: "Data", d: "Beheer API-toegang." }] },
    pricing: { tag: "Oprichters Programma (20 plaatsen)", title: "Investeer in uw", subtitle: "Infrastructuur.", desc: "Ontvang levenslang 50% korting door een van onze 20 referentiebureaus te worden.", cta: "Kies dit pakket", popular: "Aanbevolen", perMonth: "/mnd", footer: "* Oprichterstarieven zijn vastgezet en zullen nooit stijgen.", packs: [ { name: "Brons", desc: "Ideaal voor zzp'ers.", features: ["5 Projecten max", "2 Medewerkers", "Bouw opvolging", "Cashback", "1 GB Opslag"] }, { name: "Zilver", desc: "Voor groeiende bureaus.", features: ["25 Projecten max", "5 Medewerkers", "XML-filters", "Custom Branding", "5 GB Opslag", "Onbeperkt PDF"] }, { name: "Goud", desc: "Netwerkoplossing.", features: ["Onbeperkt projecten", "Multi-agency", "API & Webhooks", "White-label", "25 GB Opslag", "24/7 Support"] } ] }
  },
  pl: { 
    dir: 'ltr', label: "Polski", 
    nav: ["Wizja", "Jak to działa", "Master Template", "Cennik", "Zacznij"], 
    hero: { tag: "Global OS v1.2", title1: "Skalowanie", title2: "Bez Granic.", desc: "Infrastruktura oprogramowania jednocząca rynek." }, 
    gap: { title1: "Rozwiązanie", title2: "Globalnej Luki.", desc1: "Kiedy klient sprzedaje lokalnie, dane przestają płynąć.", desc2: "Zabezpieczamy prowizje zagraniczne." }, 
    how: { title: "Jak to działa:", subtitle: "Globalny Przepływ", steps: [{ icon: MapPin, t: "1. Potrzeba", d: "Klient chce inwestować za granicą." }, { icon: Layers, t: "2. Aktywacja", d: "Dostęp do zweryfikowanych ofert." }, { icon: Camera, t: "3. Śledzenie", d: "Raporty foto prosto do platformy." }, { icon: ShieldCheck, t: "4. Zaufanie", d: "Klient śledzi postępy w czasie rzeczywistym." }] }, 
    saas: { title: "Konfigurowalny", subtitle: "Master Template", desc: "Przejmij pełną kontrolę nad interfejsem.", features: [{ icon: Palette, t: "Branding", d: "Dostosuj logo i kolory." }, { icon: Languages, t: "Tłumaczenia", d: "Zarządzaj językami natychmiast." }, { icon: Workflow, t: "Etapy", d: "Konfiguruj własne kroki budowy." }, { icon: Settings, t: "Dane", d: "Zarządzaj dostępem API." }] },
    pricing: { tag: "Program Partnerski Założycieli (20 miejsc)", title: "Zainwestuj w swoją", subtitle: "Infrastrukturę.", desc: "Otrzymaj 50% zniżki na zawsze, zostając jedną z naszych 20 agencji referencyjnych.", cta: "Wybierz pakiet", popular: "Polecane", perMonth: "/mies.", footer: "* Stawki założycielskie są zablokowane i nigdy nie wzrosną.", packs: [ { name: "Brąz", desc: "Dla freelancerów.", features: ["5 Projektów max", "2 Pracowników", "Śledzenie budowy", "Cashback", "1 GB Miejsca"] }, { name: "Srebro", desc: "Dla rozwijających się agencji.", features: ["25 Projektów max", "5 Pracowników", "Filtry XML", "Custom Branding", "5 GB Miejsca", "PDF bez limitu"] }, { name: "Złoto", desc: "Rozwiązanie sieciowe.", features: ["Projekty bez limitu", "Multi-agencja", "API & Webhooks", "White-label", "25 GB Miejsca", "Support 24/7"] } ] }
  },
  es: { 
    dir: 'ltr', label: "Español", 
    nav: ["Visión", "Funcionamiento", "Master Template", "Precios", "Empezar"], 
    hero: { tag: "OS Global v1.2", title1: "Inmobiliario", title2: "Sin Fronteras.", desc: "La infraestructura que une el marché inmobiliario mundial." }, 
    gap: { title1: "Cerrando la", title2: "Brecha Inmobiliaria.", desc1: "Cuando un client vende localmente, el flujo se rompe.", desc2: "Aseguramos comisiones internacionales." }, 
    how: { title: "Cómo funciona:", subtitle: "Flujo Global", steps: [{ icon: MapPin, t: "1. Necesidad", d: "Su cliente quiere invertir fuera." }, { icon: Layers, t: "2. Activación", d: "Catálogo verificado de propiedades." }, { icon: Camera, t: "3. Seguimiento", d: "Fotos del progreso en tiempo real." }, { icon: ShieldCheck, t: "4. Confianza", d: "El cliente sigue su inversión." }] }, 
    saas: { title: "Master Template", subtitle: "Configurable", desc: "Tome el control total de su interfaz.", features: [{ icon: Palette, t: "Branding", d: "Personalice logos y colores." }, { icon: Languages, t: "Multi-idioma", d: "Active traducciones al instante." }, { icon: Workflow, t: "Hitos", d: "Configure sus propios pasos de obra." }, { icon: Settings, t: "Datos", d: "Administre accesos y sincronización." }] },
    pricing: { tag: "Programa de Socios Fundadores (20 plazas)", title: "Invierta en su", subtitle: "Infraestructura.", desc: "Obtenga un 50% de descuento de por vida al ser una de nuestras 20 agencias de referencia.", cta: "Elegir plan", popular: "Recomendado", perMonth: "/mes", footer: "* Las tarifas de fundador están bloqueadas y nunca subirán.", packs: [ { name: "Bronce", desc: "Ideal para autónomos.", features: ["5 Proyectos max", "2 Usuarios", "Seguimiento obra", "Cashback", "1 GB Almacén"] }, { name: "Plata", desc: "Agencias en crecimiento.", features: ["25 Proyectos max", "5 Usuarios", "Filtros XML", "Branding Custom", "5 GB Almacén", "PDF Ilimitados"] }, { name: "Oro", desc: "Solución para redes.", features: ["Proyectos ilimitados", "Multi-agencia", "API & Webhooks", "Marca Blanca", "25 GB Almacén", "Soporte 24/7"] } ] }
  },
  ar: { 
    dir: 'rtl', label: "العربية", 
    nav: ["الرؤية", "كيف يعمل", "القالب الرئيسي", "الأسعار", "ابدأ"], 
    hero: { tag: "نظام العقارات v1.2", title1: "العقارات", title2: "بلا حدود.", desc: "البنية التحتية البرمجية التي توحد سوق العقارات العالمي." }, 
    gap: { title1: "حل", title2: "الفجوة العقارية.", desc1: "عندما يبيع العميل محلياً، يتوقف تدفق البيانات.", desc2: "تؤمن data-home عمولاتك." }, 
    how: { title: "كيف يعمل:", subtitle: "التدفق العالمي", steps: [{ icon: MapPin, t: "1. الحاجة", d: "عميلك يريد الاستثمار دولياً." }, { icon: Layers, t: "2. التفعيل", d: "وصول فوري لمحفظة عقارات عالمية موثقة." }, { icon: Camera, t: "3. المتابعة", d: "تقارير الصور مباشرة إلى منصتك." }, { icon: ShieldCheck, t: "4. الثقة", d: "يتابع العميل استثماره في الوقت الفعلي." }] }, 
    saas: { title: "القالب الرئيسي", subtitle: "القابل للتهيئة", desc: "تحكم بالكامل في واواجهتك.", features: [{ icon: Palette, t: "هوية كاملة", d: "تخصيص الشعار والألوان." }, { icon: Languages, t: "تعدد اللغات", d: "إدارة الترجمات فوراً." }, { icon: Workflow, t: "المراحل", d: "تهيئة مراحل البناء الخاصة بك." }, { icon: Settings, t: "البيانات", d: "إدارة الوصول والمزامنة." }] },
    pricing: { tag: "برنامج الشركاء المؤسسين (20 مقعداً)", title: "استثمر في", subtitle: "بنيتك التحتية.", desc: "احصل على خصم 50% مدى الحياة بانضمامك لأول 20 وكالة مرجعية.", cta: "اختر الباقة", popular: "موصى به", perMonth: "/شهر", footer: "* أسعار المؤسسين ثابتة ولن ترتفع أبداً لوكالتك.", packs: [ { name: "برونزي", desc: "مثالي للمستقلين.", features: ["5 مشاريع كحد أقصى", "مستخدمين اثنين", "متابعة البناء", "كاش باك", "1 جيجا تخزين"] }, { name: "فضي", desc: "لوكلات متنامية.", features: ["25 مشروع كحد أقصى", "5 مستخدمين", "فلاتر XML", "هوية مخصصة", "5 جيجا تخزين", "تقارير غير محدودة"] }, { name: "ذهبي", desc: "حلول الشبكات.", features: ["مشاريع غير محدودة", "وكالات متعددة", "API و Webhooks", "العلامة البيضاء", "25 جيجا تخزين", "دعم 24/7"] } ] }
  }
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

  const PricingSection = () => {
    const icons = [<Zap size={20} />, <Star size={20} />, <Crown size={20} />];
    // Nouveaux prix stratégiques
    const betaPrices = ["125", "249", "499"];
    const publicPrices = ["249", "499", "999"];

    return (
      <section id="pricing" className="py-24 px-6 bg-[#020617] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              {t.pricing.tag}
            </div>
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">
              {t.pricing.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white italic font-light">{t.pricing.subtitle}</span>
            </h2>
            <p className="mt-4 text-slate-400 italic text-sm max-w-2xl mx-auto">{t.pricing.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.pricing.packs.map((pack, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${i === 1 ? 'bg-emerald-500/5 border-emerald-500/40 scale-105 shadow-2xl' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl ${i === 1 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-400'}`}>
                    {icons[i]}
                  </div>
                  {i === 1 && <span className="text-[9px] font-black bg-emerald-500 px-4 py-1.5 rounded-full uppercase text-white tracking-widest">{t.pricing.popular}</span>}
                </div>
                
                <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">{pack.name}</h3>
                <p className="text-slate-500 text-[11px] mb-6 italic">{pack.desc}</p>
                
                <div className="flex items-baseline gap-3 mb-8">
                  <div className="flex flex-col">
                    <span className="text-slate-500 line-through text-sm opacity-50">{publicPrices[i]}€</span>
                    <span className="text-5xl font-black text-white">{betaPrices[i]}€</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{t.pricing.perMonth}</span>
                </div>

                <div className="space-y-4 mb-10 border-t border-white/5 pt-8">
                  {pack.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[12px] text-slate-300">
                      <Check size={16} className="text-emerald-500 shrink-0" /> {f}
                    </div>
                  ))}
                </div>

                <button className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 1 ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 hover:bg-emerald-400 hover:-translate-y-1' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  {t.pricing.cta}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em]">
              {t.pricing.footer}
            </p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30 overflow-x-hidden relative" dir={t.dir}>
      
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none">
        <Image src="/1.jpg" alt="Background" fill className="object-cover" priority />
      </div>

      <nav className="border-b border-white/5 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 bg-[#020617]/90">
        <div className="flex items-center shrink-0">
          <div className="relative h-10 w-28 md:h-[60px] md:w-60 transition-all duration-300">
             <Image src="/logo_1.png" alt="Logo data-home" fill className="object-contain object-left" priority />
          </div>
        </div>
        
        <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#vision" className="hover:text-white transition-colors">{t.nav[0]}</a>
          <a href="#how" className="hover:text-white transition-colors">{t.nav[1]}</a>
          <a href="#saas" className="hover:text-white transition-colors">{t.nav[2]}</a>
          <a href="#pricing" className="hover:text-white transition-colors">{t.nav[3]}</a>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
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

          <button className="bg-[#10B981] hover:bg-[#059669] text-white px-3 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 whitespace-nowrap">
            {t.nav[4]}
          </button>
        </div>
      </nav>

      <section id="vision" className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-6 text-center z-10 min-h-[85vh] flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none">
          <source src="/hero_datahome.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-1 bg-slate-950/50"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[#10B981] text-[10px] font-black uppercase mb-6 md:mb-8 tracking-widest">
            {t.hero.tag}
          </div>
          <h1 className="text-[12vw] md:text-[85px] font-black tracking-tighter leading-[0.9] md:leading-[0.85] mb-8 uppercase break-words overflow-hidden">
            <span className="block">{t.hero.title1}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 italic font-light block">
              {t.hero.title2}
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-200 text-base md:text-xl font-light italic leading-relaxed px-4 drop-shadow-lg">
            {t.hero.desc}
          </p>
        </div>
      </section>

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
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-[#10B981]">
                       <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-[10px] uppercase tracking-widest text-white">{step.t}</h3>
                      <p className="text-slate-500 text-[10px] italic leading-relaxed mt-2">{step.d}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-emerald-500/20 group">
                <Image src="/4.jpg" alt="Console Admin" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <button className="flex items-center gap-2 text-[#10B981] font-black uppercase text-[10px] tracking-widest group">
                Découvrir la console d'administration <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {t.saas.features.map((f, i) => {
                 const Icon = f.icon;
                 return (
                   <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-emerald-500/20 transition-all flex flex-col items-start">
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

      <PricingSection />

      <footer className="py-20 border-t border-white/5 text-center opacity-40 z-10 relative bg-[#020617]">
        <div className="flex justify-center mb-6 h-6 relative w-24 mx-auto grayscale hover:grayscale-0 transition-all">
           <Image src="/logo_1.png" alt="Logo Footer" fill className="object-contain" />
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em] px-6">
          © 2026 data-home.io / Global Infrastructure / Mons, Belgium
        </p>
      </footer>
    </div>
  );
}