"use client";

import React from 'react';
import Image from 'next/image';
import { 
  Globe, 
  ShieldCheck, 
  Zap, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  MapPin,
  TrendingUp
} from 'lucide-react';

export default function DataHomeSolution() {
  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-blue-500/30">
      
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">DH</div>
          <span className="text-xl font-black tracking-tighter uppercase">Data-Home<span className="text-blue-500">.io</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#concept" className="hover:text-blue-400 transition-colors">Concept</a>
          <a href="#le-pont" className="hover:text-blue-400 transition-colors">Le Pont</a>
          <a href="#temoignages" className="hover:text-blue-400 transition-colors">Clients</a>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
          Demander une démo
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="concept" className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SaaS Engine v1.2 — Ready for International
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
            Propulsez votre agence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 italic">sans frontières.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-light leading-relaxed mb-12">
            L'infrastructure technologique qui permet aux agences locales de capturer le marché de l'expatriation et de l'investissement étranger.
          </p>
        </div>
      </section>

      {/* --- SECTION LE PONT --- */}
      <section id="le-pont" className="py-24 px-6 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                Ne perdez plus vos clients <br />
                <span className="text-blue-500 font-light italic tracking-normal">à la frontière.</span>
              </h2>
              <div className="space-y-6 text-slate-400 font-light leading-relaxed text-lg">
                <p>
                  Lorsqu'un client vend en Belgique pour acheter à l'étranger, <span className="text-white font-medium">le lien se brise.</span> Faute de données et d'outils de suivi, vous perdez votre commission.
                </p>
                <div className="flex gap-4 items-start p-6 bg-blue-600/5 border border-blue-600/20 rounded-2xl">
                  <TrendingUp className="text-blue-500 shrink-0" />
                  <p className="text-sm text-slate-300">
                    <strong className="text-white">Data-Home.io</strong> rétablit ce lien. Notre Master Template connecte votre agence aux bases de données internationales et offre un Dashboard de suivi de chantier à vos clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-slate-800 shadow-2xl">
                {/* Espace pour l'image 1 de Nano Banana */}
                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-slate-500">Visual_Impasse_Placeholder</div>
                <div className="absolute bottom-4 left-4 bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Le Gouffre Actuel</div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-blue-500/30 bg-slate-800 shadow-2xl shadow-blue-500/10">
                {/* Espace pour l'image 2 de Nano Banana */}
                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-slate-500 text-blue-400">Visual_Bridge_Solution</div>
                <div className="absolute bottom-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Le Pont Data-Home</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- TECH SPECS --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-4 mb-20">
          {[
            { icon: <Zap size={20}/>, t: "Performance", d: "Temps de réponse < 100ms" },
            { icon: <Database size={20}/>, t: "Infrastructure", d: "Architecture Multi-Tenant" },
            { icon: <Globe size={20}/>, t: "Global", d: "Multilingue I18N Natif" },
            { icon: <ShieldCheck size={20}/>, t: "Sécurité", d: "Chiffrement AES-256" }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">{item.t}</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{item.d}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Personnalisation <br /> <span className="text-blue-500">Algorithmique.</span></h2>
            <ul className="space-y-6">
              {[
                "Injection dynamique de votre charte graphique (Couleurs & Typographies).",
                "Modules activables : Cashback, Suivi de chantier, Portfolio.",
                "Synchronisation directe avec vos données Supabase.",
                "Déploiement sur votre domaine propriétaire."
              ].map((item, index) => (
                <li key={index} className="flex gap-4 items-center text-slate-300 font-light text-sm border-b border-white/5 pb-4">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full aspect-square bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[80px] absolute -right-40 -z-10" />
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="temoignages" className="py-24 px-6 bg-blue-600 text-blue-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-black text-center mb-20 uppercase tracking-tighter leading-[0.8]">
            Ils opèrent <br /> sans frontières.
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
              <p className="text-xl italic leading-relaxed mb-10 relative z-10">
                "Avec Data-Home.io, nous gardons la main. Le client suit son chantier depuis Bruxelles, et nous encaissons notre commission d'apporteur d'affaires en toute transparence."
              </p>
              <div className="flex items-center gap-4 border-t border-slate-100 pt-8">
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div>
                  <p className="font-black uppercase text-sm">Marc D.</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-50">Directeur Agence - Knokke</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-12 rounded-[40px] shadow-2xl">
              <p className="text-slate-300 text-xl italic leading-relaxed mb-10">
                "Enfin une solution IT qui comprend l'immobilier. En 24h, j'ai injecté ma charte graphique. L'interface 'tracker de chantier' donne une image de marque incroyablement sérieuse."
              </p>
              <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                <div className="w-10 h-10 bg-slate-800 rounded-full" />
                <div>
                  <p className="font-black uppercase text-sm text-white">Sophie V.</p>
                  <p className="text-blue-500 text-[10px] font-bold tracking-widest uppercase">Immo Prestige - Liège</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center font-bold text-[8px]">DH</div>
          <span className="text-sm font-black tracking-tighter uppercase">Data-Home.io</span>
        </div>
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.5em] font-medium">
          © 2026 Enterprise Real Estate SaaS Engine
        </p>
      </footer>

    </div>
  );
}