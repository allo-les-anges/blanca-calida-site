"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Globe, ShieldCheck, Zap, Database, 
  CheckCircle2, TrendingUp, Cpu, Layers,
  MapPin, Camera, CloudSync, LayoutGrid, ArrowRight, ChevronDown
} from 'lucide-react';

// --- DICTIONNAIRE DE TRADUCTION COMPLET ---
const translations = {
  fr: {
    dir: 'ltr',
    label: "Français",
    nav: ["Vision", "Fonctionnement", "Environnement SaaS", "Commencer"],
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
      title: "L'Environnement", subtitle: "SaaS",
      desc: "Data-Home.io est un écosystème logiciel complet conçu pour l'immobilier piloté par la donnée (Data-Driven).",
      features: [
        { icon: CloudSync, t: "Sync de Données", d: "Synchronisation en temps réel entre votre CRM local et les bases mondiales." },
        { icon: LayoutGrid, t: "CMS Marque Blanche", d: "Gérez votre branding, langues et étapes de chantier depuis un seul tableau de bord." },
        { icon: ShieldCheck, t: "Data Vault Sécurisé", d: "Conformité RGPD et standards internationaux pour les documents et paiements." },
        { icon: Cpu, t: "Edge Computing", d: "Propulsé par Vercel & Turbopack pour une vitesse de chargement mondiale ultra-rapide." }
      ]
    }
  },
  en: {
    dir: 'ltr',
    label: "English",
    nav: ["Vision", "How It Works", "SaaS Environment", "Get Started"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Scaling Real Estate", title2: "Beyond Borders.", desc: "The software infrastructure that unifies the global real estate market. Connect your local clients to international opportunities in one click." },
    gap: { title1: "Solving the", title2: "Global Real Estate Gap.", desc1: "Today, when a client sells an asset in their local market to relocate, the data flow stops. The original agency loses control, and the client loses trust.", desc2: "Data-Home.io acts as a global interoperability layer. We secure cross-border commissions by keeping the client in your ecosystem." },
    how: {
      title: "How It Works:", subtitle: "The Global Flow",
      steps: [
        { icon: MapPin, t: "1. The Local Need", d: "Your client wants to sell locally to invest internationally. Initially, you have no access to a certified international database." },
        { icon: Layers, t: "2. Master Template Activation", d: "You activate Data-Home.io. Instantly, you gain access to a unified, verified portfolio of global properties." },
        { icon: Camera, t: "3. Real-Time Project Tracking", d: "Construction progress is managed by professionals. They upload photo reports directly to your white-label platform." },
        { icon: ShieldCheck, t: "4. Global Trust", d: "Your client receives access to a secure dashboard. They follow their investment in real-time, maintaining trust in your agency." }
      ]
    },
    saas: { title: "The SaaS", subtitle: "Environment", desc: "Software ecosystem for data-driven real estate.", features: [{ icon: CloudSync, t: "Data Sync", d: "Real-time sync via API." }, { icon: LayoutGrid, t: "CMS", d: "White-label management." }, { icon: ShieldCheck, t: "Vault", d: "International security." }, { icon: Cpu, t: "Edge", d: "Ultra-fast loading." }] }
  },
  nl: { dir: 'ltr', label: "Nederlands", nav: ["Visie", "Hoe het werkt", "SaaS Omgeving", "Starten"], hero: { tag: "Global OS v1.2", title1: "Vastgoed Schalen", title2: "Zonder Grenzen.", desc: "Software-infrastructuur die de wereldwijde markt verenigt." }, gap: { title1: "Het dichten van", title2: "de Vastgoedkloof.", desc1: "Wanneer een klant lokaal verkoopt, stopt de gegevensstroom.", desc2: "Data-Home.io fungeert als een interoperabiliteitslaag." }, how: { title: "Hoe het werkt:", subtitle: "De Global Flow", steps: [{ icon: MapPin, t: "1. Lokale Nood", d: "Uw klant wil internationaal investeren." }, { icon: Layers, t: "2. Activatie", d: "Toegang tot een geverifieerd wereldwijd portfolio." }, { icon: Camera, t: "3. Real-time", d: "Bouwprofessionals uploaden fotoreportages." }, { icon: ShieldCheck, t: "4. Vertrouwen", d: "Volg de investering in real-time." }] }, saas: { title: "SaaS", subtitle: "Omgeving", desc: "Software-ecosysteem voor vastgoed.", features: [{ icon: CloudSync, t: "Data Sync", d: "API-synchronisatie." }, { icon: LayoutGrid, t: "CMS", d: "White-label beheer." }, { icon: ShieldCheck, t: "Vault", d: "Beveiliging." }, { icon: Cpu, t: "Edge", d: "Snelheid." }] } },
  pl: { dir: 'ltr', label: "Polski", nav: ["Wizja", "Jak to działa", "Środowisko SaaS", "Zacznij"], hero: { tag: "Global OS v1.2", title1: "Skalowanie", title2: "Bez Granic.", desc: "Infrastruktura oprogramowania jednocząca rynek." }, gap: { title1: "Rozwiązanie", title2: "Globalnej Luki.", desc1: "Kiedy klient sprzedaje lokalnie, przepływ danych ustaje.", desc2: "Zabezpieczamy prowizje zagraniczne." }, how: { title: "Jak to działa:", subtitle: "Globalny Przepływ", steps: [{ icon: MapPin, t: "1. Potrzeba", d: "Klient chce inwestować za granicą." }, { icon: Layers, t: "2. Aktywacja", d: "Dostęp do ofert międzynarodowych." }, { icon: Camera, t: "3. Śledzenie", d: "Raporty foto prosto do systemu." }, { icon: ShieldCheck, t: "4. Zaufanie", d: "Śledzenie postępów w czasie rzeczywistym." }] }, saas: { title: "Środowisko", subtitle: "SaaS", desc: "Ekosystem zaprojektowany dla biur nieruchomości.", features: [{ icon: CloudSync, t: "Sync", d: "Synchronizacja danych." }, { icon: LayoutGrid, t: "CMS", d: "Zarządzanie marką." }, { icon: ShieldCheck, t: "Bezpieczeństwo", d: "Zgodność." }, { icon: Cpu, t: "Edge", d: "Szybkość." }] } },
  es: { dir: 'ltr', label: "Español", nav: ["Visión", "Cómo funciona", "Entorno SaaS", "Empezar"], hero: { tag: "OS Global v1.2", title1: "Escalando el", title2: "Sector Inmobiliario.", desc: "La infraestructura que une el mercado inmobiliario mundial." }, gap: { title1: "Cerrando la", title2: "Brecha Inmobiliaria.", desc1: "Cuando un cliente vende localmente, el flujo se rompe.", desc2: "Aseguramos comisiones internacionales." }, how: { title: "Cómo funciona:", subtitle: "Flujo Global", steps: [{ icon: MapPin, t: "1. Necesidad", d: "Su cliente quiere invertir fuera." }, { icon: Layers, t: "2. Activación", d: "Catálogo verificado de propiedades globales." }, { icon: Camera, t: "3. Seguimiento", d: "Fotos del progreso en tiempo real." }, { icon: ShieldCheck, t: "4. Confianza", d: "Siga su inversión desde su dashboard." }] }, saas: { title: "Entorno", subtitle: "SaaS", desc: "Ecosistema diseñado para el mercado global.", features: [{ icon: CloudSync, t: "Sync", d: "Sincronización real." }, { icon: LayoutGrid, t: "CMS", d: "Marca blanca." }, { icon: ShieldCheck, t: "Bóveda", d: "Seguridad." }, { icon: Cpu, t: "Edge", d: "Velocidad." }] } },
  ar: { dir: 'rtl', label: "العربية", nav: ["الرؤية", "كيف يعمل", "بيئة SaaS", "ابدأ"], hero: { tag: "نظام العقارات v1.2", title1: "توسيع العقارات", title2: "بلا حدود.", desc: "البنية التحتية البرمجية التي توحد السوق العالمي." }, gap: { title1: "حل", title2: "الفجوة العقارية.", desc1: "عندما يبيع العميل محلياً، يتوقف تدفق البيانات.", desc2: "تؤمن Data-Home العمولات." }, how: { title: "كيف يعمل:", subtitle: "التدفق العالمي", steps: [{ icon: MapPin, t: "1. الحاجة", d: "يريد عميلك الاستثمار دولياً." }, { icon: Layers, t: "2. التفعيل", d: "وصول فوري لمحفظة عقارات عالمية." }, { icon: Camera, t: "3. متابعة", d: "تقارير الصور مباشرة إلى منصتك." }, { icon: ShieldCheck, t: "4. الثقة", d: "يتابع العميل استثماره في الوقت الفعلي." }] }, saas: { title: "بيئة", subtitle: "SaaS", desc: "نظام برمجيات متكامل للعقارات.", features: [{ icon: CloudSync, t: "مزامنة", d: "مزامنة فورية." }, { icon: LayoutGrid, t: "الإدارة", d: "إدارة العلامة التجارية." }, { icon: ShieldCheck, t: "الأمن", d: "التوافق الدولي." }, { icon: Cpu, t: "Edge", d: "سرعة عالمية." }] } }
};

export default function DataHomeSolution() {
  const [lang, setLang] = useState<keyof typeof translations>('fr');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Fermer le menu si clic à l'extérieur
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
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30 transition-all duration-500" dir={t.dir}>
      
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-[#020617]/80">
        
        {/* LOGO SEUL */}
        <div className="flex items-center">
          <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-emerald-500/10">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" priority />
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#vision" className="hover:text-[#10B981] transition-colors">{t.nav[0]}</a>
          <a href="#how" className="hover:text-[#10B981] transition-colors">{t.nav[1]}</a>
          <a href="#saas" className="hover:text-[#10B981] transition-colors">{t.nav[2]}</a>
        </div>

        <div className="flex items-center gap-4">
          {/* BOUTON GLOBE (SÉLECTEUR DE LANGUE) */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 hover:bg-white/5 rounded-full transition-all flex items-center gap-1 group"
            >
              <Globe size={20} className="text-slate-400 group-hover:text-[#10B981] transition-colors" />
              <ChevronDown size={12} className={`text-slate-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENU DÉROULANT */}
            {isLangOpen && (
              <div className="absolute right-0 mt-3 w-40 bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                {Object.keys(translations).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l as any);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-colors ${lang === l ? 'text-[#10B981] bg-white/5' : 'text-slate-400'}`}
                  >
                    {translations[l as keyof typeof translations].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
            {t.nav[3]}
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section id="vision" className="relative pt-24 pb-16 px-6 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[#10B981] text-[10px] font-black uppercase mb-8 tracking-widest">
            {t.hero.tag}
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
            {t.hero.title1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 italic font-light">{t.hero.title2}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-light mb-12 italic leading-relaxed">
            {t.hero.desc}
          </p>
        </div>
      </section>

      {/* --- SECTION FRACTURE --- */}
      <section className="py-24 px-6 bg-emerald-950/10 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              {t.gap.title1} <br />
              <span className="text-[#10B981] font-light italic">{t.gap.title2}</span>
            </h2>
            <div className="space-y-6 text-slate-400 font-light leading-relaxed text-lg text-justify">
              <p>{t.gap.desc1}</p>
              <div className="flex gap-4 items-start p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl italic">
                <TrendingUp className="text-[#10B981] shrink-0" />
                <p className="text-sm text-slate-300">{t.gap.desc2}</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-900 flex items-center justify-center">
             <Cpu className="w-16 h-16 text-[#10B981]/20 animate-pulse" />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-20">
            {t.how.title} <span className="text-[#10B981] font-light italic">{t.how.subtitle}</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {t.how.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white/2 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all text-left group">
                  <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-6">
                    <Icon size={24} />
                  </div>
                  <div className="aspect-[16/10] bg-slate-800 rounded-2xl overflow-hidden border border-white/5 relative mb-6">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-600">Visual_Step_{i+1}</div>
                  </div>
                  <h3 className="font-black text-[11px] uppercase tracking-widest text-white mb-2">{step.t}</h3>
                  <p className="text-slate-500 text-[11px] italic leading-relaxed">{step.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- SAAS ENVIRONMENT --- */}
      <section id="saas" className="py-24 px-6 bg-slate-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center relative z-10">
          <div className="flex-1 grid grid-cols-2 gap-4">
            {t.saas.features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-emerald-500/20 transition-all">
                  <Icon className="text-[#10B981] mb-4" size={24} />
                  <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">{f.t}</h4>
                  <p className="text-slate-500 text-[10px] leading-relaxed">{f.d}</p>
                </div>
              );
            })}
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              {t.saas.title} <br /> <span className="text-[#10B981] font-light italic">{t.saas.subtitle}</span>
            </h2>
            <p className="text-slate-400 font-light text-lg leading-relaxed italic border-l-2 border-[#10B981] pl-6 text-justify">
              {t.saas.desc}
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-white/5 opacity-40">
        <div className="flex items-center justify-center mb-4 grayscale">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
          </div>
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em]">© 2026 Data-Home.io / Infrastructure Engine</p>
      </footer>

    </div>
  );
}