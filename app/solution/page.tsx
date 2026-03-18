"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Globe, ShieldCheck, Zap, Database, 
  CheckCircle2, TrendingUp, Cpu, Layers, ChevronDown 
} from 'lucide-react';

// --- DICTIONNAIRE DE TRADUCTION ---
const translations = {
  en: {
    dir: 'ltr',
    nav: ["Vision", "Infrastructure", "Global-Flow", "Get Started"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Scaling Real Estate", title2: "Beyond Borders.", desc: "The software infrastructure that unifies the global real estate market. Connect your local clients to international opportunities in one click." },
    gap: { title1: "Solving the", title2: "Global Real Estate Gap.", desc1: "Today, when a client sells an asset in their local market to relocate, the data flow stops. The original agency loses control, and the client loses trust.", desc2: "Data-Home.io acts as a global interoperability layer. We secure cross-border commissions by keeping the client in your ecosystem.", problem: "The Global Gap", solution: "Data-Home Solution" },
    specs: ["Engine Speed", "Data Sync", "Worldwide", "Compliance"],
    custom: { title1: "Customization", title2: "by API.", items: ["Total white-label for your brand.", "Native multilingual with IP detection.", "High-fidelity construction tracking dashboard.", "Universal API connectors."] }
  },
  nl: {
    dir: 'ltr',
    nav: ["Visie", "Infrastructuur", "Global-Flow", "Aan de slag"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Vastgoed Schalen", title2: "Zonder Grenzen.", desc: "De software-infrastructuur die de wereldwijde vastgoedmarkt verenigt. Verbind uw lokale klanten in één klik met internationale kansen." },
    gap: { title1: "Het dichten van de", title2: "Wereldwijde Vastgoedkloof.", desc1: "Wanneer een klant een actief op zijn lokale markt verkoopt om te verhuizen, stopt de datastroom. Het oorspronkelijke bureau verliest de controle.", desc2: "Data-Home.io fungeert als een wereldwijde interoperabiliteitslaag. Wij stellen grensoverschrijdende commissies veilig door de klant in uw ecosysteem te houden.", problem: "De Kloof", solution: "Data-Home Oplossing" },
    specs: ["Snelheid", "Data Sync", "Wereldwijd", "Naleving"],
    custom: { title1: "Aanpassing", title2: "via API.", items: ["Volledige white-label voor uw merk.", "Native meertalig met IP-detectie.", "High-fidelity dashboard voor bouwopvolging.", "Universele API-connectoren."] }
  },
  pl: {
    dir: 'ltr',
    nav: ["Wizja", "Infrastruktura", "Global-Flow", "Zacznij teraz"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Skalowanie Nieruchomości", title2: "Bez Granic.", desc: "Infrastruktura oprogramowania jednocząca globalny rynek nieruchomości. Połącz swoich lokalnych klientów z międzynarodowymi możliwościami jednym kliknięciem." },
    gap: { title1: "Rozwiązanie", title2: "Globalnej Luki Nieruchomości.", desc1: "Kiedy klient sprzedaje aktywa na lokalnym rynku w celu relokacji, przepływ danych ustaje. Agencja traci kontrolę.", desc2: "Data-Home.io działa jako globalna warstwa interoperacyjności. Zabezpieczamy prowizje zagraniczne, zatrzymując klienta w Twoim ekosystemie.", problem: "Globalna Luka", solution: "Rozwiązanie Data-Home" },
    specs: ["Prędkość silnika", "Synchronizacja danych", "Światowy zasięg", "Zgodność"],
    custom: { title1: "Personalizacja", title2: "przez API.", items: ["Pełna biała etykieta dla Twojej marki.", "Natywna wielojęzyczność z detekcją IP.", "Panel śledzenia budowy wysokiej jakości.", "Uniwersalne złącza API."] }
  },
  es: {
    dir: 'ltr',
    nav: ["Visión", "Infraestructura", "Flujo Global", "Empezar"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Escalando Inmuebles", title2: "Sin Fronteras.", desc: "La infraestructura de software que unifica el mercado inmobiliario global. Conecte a sus clientes locales con oportunidades internacionales en un clic." },
    gap: { title1: "Resolviendo la", title2: "Brecha Inmobiliaria Global.", desc1: "Hoy, cuando un cliente vende un activo en su mercado local para reubicarse, el flujo de datos se detiene. La agencia original pierde el control.", desc2: "Data-Home.io actúa como una capa de interoperabilidad global. Aseguramos comisiones transfronterizas manteniendo al cliente en su ecosistema.", problem: "La Brecha Global", solution: "Solución Data-Home" },
    specs: ["Velocidad", "Sincro de Datos", "Mundial", "Cumplimiento"],
    custom: { title1: "Personalización", title2: "por API.", items: ["Marca blanca total para su empresa.", "Multilingüe nativo con detección de IP.", "Panel de seguimiento de construcción de alta fidelidad.", "Conectores API universales."] }
  },
  ar: {
    dir: 'rtl',
    nav: ["الرؤية", "البنية التحتية", "التدفق العالمي", "ابدأ الآن"],
    hero: { tag: "نظام تشغيل العقارات العالمي v1.2", title1: "توسيع نطاق العقارات", title2: "عبر الحدود.", desc: "بنية تحتية برمجية توحد سوق العقارات العالمي. اربط عملائك المحليين بالفرص الدولية بنقرة واحدة." },
    gap: { title1: "حل", title2: "الفجوة العقارية العالمية.", desc1: "اليوم، عندما يبيع العميل عقاراً في سوقه المحلي للانتقال، يتوقف تدفق البيانات. تفقد الوكالة الأصلية السيطرة.", desc2: "Data-Home.io يعمل كطبقة توافق عالمية. نحن نؤمن العمولات عبر الحدود من خلال إبقاء العميل في نظامك البيئي.", problem: "الفجوة العالمية", solution: "حل Data-Home" },
    specs: ["سرعة المحرك", "مزامنة البيانات", "عالمي", "الامتثال"],
    custom: { title1: "التخصيص", title2: "عبر API.", items: ["علامة تجارية بيضاء بالكامل لشركتك.", "متعدد اللغات مع الكشف عن الموقع.", "لوحة متابعة البناء عالية الدقة.", "موصلات API عالمية."] }
  }
};

export default function DataHomeSolution() {
  const [lang, setLang] = useState<'en' | 'nl' | 'pl' | 'es' | 'ar'>('en');
  const t = translations[lang];

  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30 transition-all duration-500" dir={t.dir}>
      
      {/* --- TOP BAR LANGUAGE --- */}
      <div className="bg-[#10B981] text-white py-1 px-6 flex justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em]">
        {Object.keys(translations).map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l as any)}
            className={`transition-all ${lang === l ? 'scale-110 underline decoration-2 underline-offset-4' : 'opacity-60 hover:opacity-100'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-[#020617]/80">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-emerald-500/10">
            <Image 
              src="/logo.jpeg" 
              alt="Data-Home Logo" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase font-mono italic">
            Data-Home<span className="text-[#10B981]">.io</span>
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {t.nav.slice(0, 3).map((item, i) => (
            <a key={i} href="#" className="hover:text-[#10B981] transition-colors">{item}</a>
          ))}
        </div>

        <button className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
          {t.nav[3]}
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[#10B981] text-[10px] font-black uppercase mb-8 tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
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

      {/* --- GAP SECTION --- */}
      <section className="py-24 px-6 bg-emerald-950/10 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-justify">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              {t.gap.title1} <br />
              <span className="text-[#10B981] font-light italic tracking-normal">{t.gap.title2}</span>
            </h2>
            <div className="space-y-6 text-slate-400 font-light leading-relaxed text-lg">
              <p>{t.gap.desc1}</p>
              <div className="flex gap-4 items-start p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl italic">
                <TrendingUp className="text-[#10B981] shrink-0" />
                <p className="text-sm text-slate-300">{t.gap.desc2}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]"></div>
              <Layers className="w-12 h-12 text-slate-700 mb-2" />
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{t.gap.problem}</div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-900 flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/10">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10B981_1px,transparent_1px),linear-gradient(to_bottom,#10B981_1px,transparent_1px)] [background-size:40px_40px]"></div>
              <Cpu className="w-12 h-12 text-[#10B981]/50 mb-2 animate-pulse" />
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#10B981]">{t.gap.solution}</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE SPECS --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-4 gap-4">
        {t.specs.map((item, i) => {
          const Icons = [Zap, Database, Globe, ShieldCheck];
          const Icon = Icons[i];
          return (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all text-center group">
              <Icon className="text-[#10B981] mb-4 mx-auto group-hover:scale-110 transition-transform" size={20} />
              <h4 className="font-black text-[10px] uppercase tracking-widest">{item}</h4>
            </div>
          );
        })}
      </section>

      {/* --- CUSTOMIZATION / API --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-20 items-center">
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            {t.custom.title1} <br /> <span className="text-[#10B981] text-6xl tracking-normal font-light">{t.custom.title2}</span>
          </h2>
          <ul className="space-y-6">
            {t.custom.items.map((item, index) => (
              <li key={index} className="flex gap-4 items-center text-slate-300 font-light text-sm italic border-b border-white/5 pb-4">
                <CheckCircle2 size={18} className="text-[#10B981] shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 relative p-12 bg-[#10B981]/5 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl font-mono text-[10px] text-emerald-400 opacity-60">
           <code>
            {`// Data-Home.io Config`} <br/>
            {`const Engine = {`} <br/>
            {`  active_lang: "${lang}",`} <br/>
            {`  direction: "${t.dir}",`} <br/>
            {`  white_label: true,`} <br/>
            {`  global_sync: "ENABLED"`} <br/>
            {`};`}
           </code>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-white/5 opacity-40">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="relative w-5 h-5 grayscale">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Data-Home.io / Global Engine</span>
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em]">© 2026 International Real Estate Infrastructure</p>
      </footer>

    </div>
  );
}