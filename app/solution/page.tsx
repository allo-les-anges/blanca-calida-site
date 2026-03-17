"use client";

import React from 'react';
import Image from 'next/image';
import { 
  Globe, 
  ShieldCheck, 
  Zap, 
  Database, 
  CheckCircle2, 
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export default function DataHomeSolution() {
  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30">
      
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-[#020617]/80">
        <div className="flex items-center gap-3">
          {/* Logo intégré depuis ton fichier */}
          <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-white/10">
            <Image 
              src="/data_home_logo.jpg" 
              alt="Data Home Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase font-mono">
            Data-Home<span className="text-[#10B981]">.io</span>
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#vision" className="hover:text-[#10B981] transition-colors">Vision</a>
          <a href="#infrastructure" className="hover:text-[#10B981] transition-colors">Infrastructure</a>
          <a href="#global" className="hover:text-[#10B981] transition-colors">Global-Flow</a>
        </div>
        <button className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
          Get Started
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="vision" className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Halo de couleur basé sur la charte (Emeraude) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[#10B981] text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            International SaaS Engine v1.2
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
            Scaling Real Estate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 italic">Beyond Borders.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-light leading-relaxed mb-12">
            L'infrastructure logicielle qui unifie le marché immobilier mondial. Connectez vos clients locaux aux opportunités internationales en un clic.
          </p>
        </div>
      </section>

      {/* --- SECTION GLOBAL FLOW --- */}
      <section id="global" className="py-24 px-6 bg-emerald-950/10 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                Résoudre la fracture <br />
                <span className="text-[#10B981] font-light italic tracking-normal">immobilière mondiale.</span>
              </h2>
              <div className="space-y-6 text-slate-400 font-light leading-relaxed text-lg text-justify">
                <p>
                  Aujourd'hui, lorsqu'un client vend un actif sur son marché local pour se réexporter, <span className="text-white font-medium italic">le flux de données s'interrompt.</span> L'agence d'origine perd le contrôle, et le client perd sa confiance.
                </p>
                <div className="flex gap-4 items-start p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <TrendingUp className="text-[#10B981] shrink-0" />
                  <p className="text-sm text-slate-300">
                    <strong className="text-white italic">Data-Home.io</strong> agit comme une couche d'interopérabilité mondiale. Nous sécurisons les commissions cross-border en gardant le client dans votre écosystème.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col items-center justify-center group shadow-2xl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <Layers className="w-12 h-12 text-slate-700 mb-2 group-hover:text-red-500/50 transition-colors" />
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Fragmented Markets</div>
                <div className="absolute bottom-4 left-4 bg-red-600/20 backdrop-blur-md border border-red-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-red-400">The Global Gap</div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-900 flex flex-col items-center justify-center group shadow-2xl shadow-emerald-500/10">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10B981_1px,transparent_1px),linear-gradient(to_bottom,#10B981_1px,transparent_1px)] [background-size:40px_40px]"></div>
                <Cpu className="w-12 h-12 text-[#10B981]/50 mb-2 animate-pulse" />
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#10B981]">Unified Infrastructure</div>
                <div className="absolute bottom-4 left-4 bg-emerald-600/40 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-100 italic">Data-Home Solution</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CORE FEATURES --- */}
      <section id="infrastructure" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-4 mb-20 text-center md:text-left">
          {[
            { icon: <Zap size={20}/>, t: "Engine Speed", d: "Next.js Core Optimization" },
            { icon: <Database size={20}/>, t: "Data Sync", d: "Supabase Real-time Cloud" },
            { icon: <Globe size={20}/>, t: "Worldwide", d: "Multi-currency & I18N" },
            { icon: <ShieldCheck size={20}/>, t: "Compliance", d: "International Standards" }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="text-[#10B981] mb-4 inline-block">{item.icon}</div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">{item.t}</h4>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter italic">{item.d}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-20 items-center border-t border-white/5 pt-20">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
              Customization <br /> <span className="text-[#10B981] text-5xl">by API.</span>
            </h2>
            <ul className="space-y-6">
              {[
                "White-label total pour votre marque.",
                "Multilingue natif avec détection IP.",
                "Dashboard de suivi de chantier haute fidélité.",
                "Connecteurs API universels."
              ].map((item, index) => (
                <li key={index} className="flex gap-4 items-center text-slate-300 font-light text-sm">
                  <CheckCircle2 size={18} className="text-[#10B981] shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative p-12 bg-emerald-600/5 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
             <div className="font-mono text-[10px] text-emerald-400 leading-relaxed opacity-60">
                <code>
                  {`// Data-Home.io International Setup`} <br/>
                  {`const AgencySystem = {`} <br/>
                  {`  identity: "Localeo Styled",`} <br/>
                  {`  primaryColor: "#10B981",`} <br/>
                  {`  markets: ["GLOBAL_WIDE"],`} <br/>
                  {`  architecture: "Multi-Tenant"`} <br/>
                  {`};`}
                </code>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-center gap-3 mb-8 opacity-40 grayscale hover:grayscale-0 transition-all">
          <div className="relative w-6 h-6 rounded overflow-hidden">
             <Image src="/data_home_logo.jpg" alt="Logo Footer" fill className="object-cover" />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase font-mono">Data-Home.io</span>
        </div>
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.5em] font-medium">
          © 2026 World Class Real Estate Infrastructure
        </p>
      </footer>

    </div>
  );
}