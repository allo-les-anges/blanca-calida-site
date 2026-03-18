"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Globe, ShieldCheck, Zap, Database, 
  CheckCircle2, TrendingUp, Cpu, Layers,
  MapPin, Camera, CloudSync, LayoutGrid, ArrowRight
} from 'lucide-react';

// --- DICTIONNAIRE DE TRADUCTION COMPLET ---
const translations = {
  fr: {
    dir: 'ltr',
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
    saas: {
      title: "The SaaS", subtitle: "Environment",
      desc: "Data-Home.io is a complete software ecosystem designed for data-driven, cross-border real estate.",
      features: [
        { icon: CloudSync, t: "Data Synchronization", d: "Real-time sync between your local CRM and global databases via API." },
        { icon: LayoutGrid, t: "White-Label CMS", d: "Manage branding, languages, and construction milestones from a single dashboard." },
        { icon: ShieldCheck, t: "Secure Data Vault", d: "GDPR & international standard compliance for storing client documents." },
        { icon: Cpu, t: "Edge Computing", d: "Vercel & Turbopack Core for sub-second page loads worldwide." }
      ]
    }
  },
  nl: {
    dir: 'ltr',
    nav: ["Visie", "Hoe het werkt", "SaaS Omgeving", "Aan de slag"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Vastgoed Schalen", title2: "Zonder Grenzen.", desc: "De software-infrastructuur die de wereldwijde vastgoedmarkt verenigt." },
    gap: { title1: "Het dichten van de", title2: "Vastgoedkloof.", desc1: "Wanneer een klant lokaal verkoopt om naar het buitenland te verhuizen, stopt de gegevensstroom.", desc2: "Data-Home.io fungeert als een wereldwijde interoperabiliteitslaag." },
    how: {
      title: "Hoe het werkt:", subtitle: "De Global Flow",
      steps: [
        { icon: MapPin, t: "1. Lokale Behoefte", d: "Uw klant wil internationaal investeren. U heeft aanvankelijk geen toegang tot een gecertificeerde database." },
        { icon: Layers, t: "2. Activatie", d: "U activeert Data-Home.io en krijgt direct toegang tot een wereldwijd geverifieerd portfolio." },
        { icon: Camera, t: "3. Real-time Opvolging", d: "Bouwprofessionals uploaden fotoreportages rechtstreeks naar uw white-label platform." },
        { icon: ShieldCheck, t: "4. Wereldwijd Vertrouwen", d: "Uw klant volgt zijn investering in real-time via een beveiligd dashboard." }
      ]
    },
    saas: { title: "De SaaS", subtitle: "Omgeving", desc: "Een compleet software-ecosysteem voor grensoverschrijdend vastgoed.", features: [ { icon: CloudSync, t: "Data Sync", d: "Real-time synchronisatie via API." }, { icon: LayoutGrid, t: "White-Label CMS", d: "Beheer branding en mijlpalen." }, { icon: ShieldCheck, t: "Beveiligde Vault", d: "GDPR-conformiteit." }, { icon: Cpu, t: "Edge Computing", d: "Ultrasnelle wereldwijde laadtijden." } ] }
  },
  pl: {
    dir: 'ltr',
    nav: ["Wizja", "Jak to działa", "Środowisko SaaS", "Zacznij"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Skalowanie", title2: "Bez Granic.", desc: "Infrastruktura oprogramowania jednocząca globalny rynek nieruchomości." },
    gap: { title1: "Rozwiązanie", title2: "Globalnej Luki.", desc1: "Kiedy klient sprzedaje lokalnie, by zainwestować za granicą, przepływ danych ustaje.", desc2: "Data-Home.io zapewnia płynność operacji cross-border." },
    how: {
      title: "Jak to działa:", subtitle: "Globalny Przepływ",
      steps: [
        { icon: MapPin, t: "1. Lokalna Potrzeba", d: "Klient chce inwestować za granicą. Brak Ci certyfikowanej bazy danych." },
        { icon: Layers, t: "2. Aktywacja Szablonu", d: "Otrzymujesz natychmiastowy dostęp do zweryfikowanych ofert międzynarodowych." },
        { icon: Camera, t: "3. Śledzenie Budowy", d: "Profesjonaliści przesyłają raporty foto bezpośrednio do Twojego systemu." },
        { icon: ShieldCheck, t: "4. Zaufanie", d: "Klient śledzi postępy w czasie rzeczywistym, ufając Twojej agencji." }
      ]
    },
    saas: { title: "Środowisko", subtitle: "SaaS", desc: "Ekosystem zaprojektowany dla nowoczesnych biur nieruchomości.", features: [ { icon: CloudSync, t: "Sync Danych", d: "Synchronizacja w czasie rzeczywistym." }, { icon: LayoutGrid, t: "White-Label CMS", d: "Zarządzanie marką i etapami budowy." }, { icon: ShieldCheck, t: "Bezpieczeństwo", d: "Zgodność z RODO." }, { icon: Cpu, t: "Edge Computing", d: "Szybkość działania na całym świecie." } ] }
  },
  es: {
    dir: 'ltr',
    nav: ["Visión", "Cómo funciona", "Entorno SaaS", "Empezar"],
    hero: { tag: "OS Inmobiliario Global v1.2", title1: "Escalando el", title2: "Sector Inmobiliario.", desc: "La infraestructura que une el mercado inmobiliario mundial." },
    gap: { title1: "Cerrando la", title2: "Brecha Inmobiliaria.", desc1: "Cuando un cliente vende localmente para mudarse al extranjero, el flujo de datos se rompe.", desc2: "Data-Home.io asegura las comisiones internacionales." },
    how: {
      title: "Cómo funciona:", subtitle: "Flujo Global",
      steps: [
        { icon: MapPin, t: "1. Necesidad Local", d: "Su cliente quiere invertir fuera. Usted no tiene base de datos internacional." },
        { icon: Layers, t: "2. Activación", d: "Acceda al instante a un catálogo verificado de propiedades globales." },
        { icon: Camera, t: "3. Seguimiento Real", d: "Los profesionales suben fotos del progreso directamente a su plataforma." },
        { icon: ShieldCheck, t: "4. Confianza", d: "El cliente sigue su inversión en tiempo real desde su dashboard." }
      ]
    },
    saas: { title: "Entorno", subtitle: "SaaS", desc: "Ecosistema de software diseñado para el mercado inmobiliario global.", features: [ { icon: CloudSync, t: "Sync de Datos", d: "Sincronización en tiempo real." }, { icon: LayoutGrid, t: "CMS Marca Blanca", d: "Gestione su marca y proyectos." }, { icon: ShieldCheck, t: "Bóveda de Datos", d: "Cumplimiento de estándares internacionales." }, { icon: Cpu, t: "Edge Computing", d: "Velocidad máxima en todo el mundo." } ] }
  },
  ar: {
    dir: 'rtl',
    nav: ["الرؤية", "كيف يعمل", "بيئة SaaS", "ابدأ الآن"],
    hero: { tag: "نظام تشغيل العقارات العالمي v1.2", title1: "توسيع العقارات", title2: "بلا حدود.", desc: "البنية التحتية البرمجية التي توحد سوق العقارات العالمي." },
    gap: { title1: "حل", title2: "الفجوة العقارية.", desc1: "عندما يبيع العميل محلياً للاستثمار في الخارج، يتوقف تدفق البيانات.", desc2: "تؤمن Data-Home.io العمولات عبر الحدود." },
    how: {
      title: "كيف يعمل:", subtitle: "التدفق العالمي",
      steps: [
        { icon: MapPin, t: "1. الحاجة المحلية", d: "يريد عميلك الاستثمار دولياً. ليس لديك قاعدة بيانات معتمدة." },
        { icon: Layers, t: "2. التفعيل", d: "احصل على وصول فوري إلى محفظة عقارات عالمية موثقة." },
        { icon: Camera, t: "3. متابعة البناء", d: "يقوم المحترفون برفع تقارير الصور مباشرة إلى منصتك." },
        { icon: ShieldCheck, t: "4. الثقة", d: "يتابع العميل استثماره في الوقت الفعلي عبر لوحة التحكم." }
      ]
    },
    saas: { title: "بيئة", subtitle: "SaaS", desc: "نظام برمجيات متكامل للعقارات العالمية.", features: [ { icon: CloudSync, t: "مزامنة البيانات", d: "مزامنة فورية عبر API." }, { icon: LayoutGrid, t: "نظام الإدارة", d: "إدارة العلامة التجارية والمشاريع." }, { icon: ShieldCheck, t: "أمن البيانات", d: "التوافق مع المعايير الدولية." }, { icon: Cpu, t: "Edge Computing", d: "سرعة تحميل عالمية فائقة." } ] }
  }
};

export default function DataHomeSolution() {
  const [lang, setLang] = useState<'fr' | 'en' | 'nl' | 'pl' | 'es' | 'ar'>('fr');
  const t = translations[lang];

  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30 transition-all duration-500" dir={t.dir}>
      
      {/* --- BARRE DE LANGUES --- */}
      <div className="bg-[#10B981] text-white py-1.5 px-6 flex justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-[60]">
        {Object.keys(translations).map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l as any)}
            className={`transition-all hover:scale-110 ${lang === l ? 'opacity-100 border-b-2 border-white' : 'opacity-50'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-[34px] z-50 bg-[#020617]/80">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-emerald-500/10">
            <Image src="/logo.jpeg" alt="Data-Home Logo" fill className="object-cover" priority />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase font-mono italic">
            Data-Home<span className="text-[#10B981]">.io</span>
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#vision" className="hover:text-[#10B981] transition-colors">{t.nav[0]}</a>
          <a href="#how" className="hover:text-[#10B981] transition-colors">{t.nav[1]}</a>
          <a href="#saas" className="hover:text-[#10B981] transition-colors">{t.nav[2]}</a>
        </div>

        <button className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
          {t.nav[3]}
        </button>
      </nav>

      {/* --- HERO --- */}
      <section id="vision" className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto text-center">
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
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-justify md:text-left">
              {t.gap.title1} <br />
              <span className="text-[#10B981] font-light italic tracking-normal">{t.gap.title2}</span>
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
             <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (STORYTELLING) --- */}
      <section id="how" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              {t.how.title} <span className="text-[#10B981] font-light italic">{t.how.subtitle}</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-32 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent z-0" />
            
            {t.how.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative space-y-6 bg-white/2 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <Icon size={24} />
                  </div>
                  <div className="aspect-[16/10] bg-slate-800 rounded-2xl overflow-hidden border border-white/5 relative shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-600">
                      Step_{i+1}_Visual
                    </div>
                    {/* <Image src={`/how_step_${i+1}.jpg`} alt={step.t} fill className="object-cover opacity-80" /> */}
                  </div>
                  <div>
                    <h3 className="font-black text-[11px] uppercase tracking-widest text-white mb-2">{step.t}</h3>
                    <p className="text-slate-500 text-[11px] italic leading-relaxed">{step.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- SAAS ENVIRONMENT --- */}
      <section id="saas" className="py-24 px-6 bg-slate-950 border-y border-white/5 relative">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
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
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                {t.saas.title} <br /> <span className="text-[#10B981] font-light italic">{t.saas.subtitle}</span>
              </h2>
              <p className="text-slate-400 font-light text-lg leading-relaxed italic border-l-2 border-[#10B981] pl-6 text-justify">
                {t.saas.desc}
              </p>
              <button className="flex items-center gap-2 text-[#10B981] font-black uppercase text-[10px] tracking-widest group">
                Download Technical Spec <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-white/5 opacity-40">
        <div className="flex items-center justify-center gap-2 mb-4 grayscale">
          <div className="relative w-5 h-5 rounded overflow-hidden">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Data-Home.io / Global Engine</span>
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em]">© 2026 World Class Real Estate Infrastructure</p>
      </footer>

    </div>
  );
}