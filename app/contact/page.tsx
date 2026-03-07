"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sun, Moon, ShieldCheck, Globe, Award, MapPin, 
  Navigation, Languages, Compass
} from "lucide-react";

// --- CONFIGURATION DES AGENTS ---
const teamMembers = [
  {
    id: 1,
    name: "Deborah",
    role: "Expert Immobilier Senior",
    worldRegion: "Europe Francophone & Suisse",
    background: "Accompagne les investisseurs d'Europe de l'Ouest dans la sécurisation de leur patrimoine sur la côte espagnole.",
    skills: ["Négociation", "Conseil fiscal", "Évaluation"],
    market: "Costa Blanca & Valencia",
    photoDay: "/Deborah.jpeg",
  },
  {
    id: 2,
    name: "Gillian",
    role: "Consultant International",
    worldRegion: "Royaume-Uni & Europe du Nord",
    background: "Expert en relocation et en gestion de portefeuilles pour une clientèle anglo-saxonne et scandinave.",
    skills: ["Relocation", "Investissement", "Droit comparé"],
    market: "Costa del Sol & Marbella",
    photoDay: "/Gillian.jpeg",
  },
  {
    id: 3,
    name: "Joanna",
    role: "Chasseuse de Propriétés",
    background: "Spécialiste du 'Off-Market', elle déniche des perles rares avant leur mise sur le marché public.",
    worldRegion: "Pologne & Europe de l'Est",
    skills: ["Sourcing", "Architecture d'intérieur", "Relations publiques"],
    market: "Costa Almeria & Murcie",
    photoDay: "/Joanna.jpeg",
  },
  {
    id: 4,
    name: "Gaëtan",
    role: "Directeur Technique",
    worldRegion: "France & Benelux",
    background: "Expert en suivi de chantier et conformité technique des villas de luxe pour les résidents européens.",
    skills: ["Urbanisme", "Domotique", "Gestion de projet"],
    market: "Toute l'Espagne",
    photoDay: "/Gaëtan.jpeg",
  },
  {
    id: 5,
    name: "Abdou",
    role: "Responsable Grands Comptes",
    worldRegion: "Moyen-Orient & Afrique",
    background: "Ancien analyste financier, il optimise le rendement locatif et la structure d'achat pour les investisseurs institutionnels.",
    skills: ["Finance", "Yield Management", "Stratégie"],
    market: "Madrid & Zones Littorales",
    photoDay: "/Abdou.jpeg",
  }
];

export default function ContactPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isDarkMode ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* SECTION HÉRO AVEC PLANISPHÈRE CORRIGÉ */}
      <section className={`relative h-[70vh] w-full overflow-hidden flex items-center justify-center transition-colors duration-1000 ${isDarkMode ? "bg-[#020617]" : "bg-slate-900"}`}>
        
        {/* LE PLANISPHÈRE (CORRECTION VISIBILITÉ) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <svg 
            viewBox="0 0 1000 500" 
            preserveAspectRatio="xMidYMid slice"
            className={`w-full h-full opacity-40 transition-all duration-1000 ${isDarkMode ? "fill-[#D4AF37]/40" : "fill-white/30"}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Chemins SVG simplifiés et plus visibles pour un planisphère stylisé */}
            <path d="M150,150 Q180,100 250,150 T350,200 T450,150 T550,250 T650,200 T850,150 L850,350 Q750,450 650,350 T450,400 T250,350 Z" opacity="0.4" />
            <path d="M220,120 L280,110 L320,130 L350,180 L330,250 L280,280 L240,240 Z M450,100 L550,80 L620,120 L650,200 L600,300 L500,320 L420,250 Z" />
            
            {/* POINT DORÉ SUR L'ESPAGNE */}
            <circle cx="480" cy="180" r="6" fill="#D4AF37">
                <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* OVERLAY DE GRADIENT POUR LIRE LE TEXTE */}
        <div className={`absolute inset-0 z-10 bg-gradient-to-t ${isDarkMode ? "from-[#020617] via-transparent to-[#020617]/40" : "from-slate-900 via-transparent to-slate-900/40"}`} />

        {/* BOUTON SWITCH JOUR/NUIT */}
        <div className="absolute bottom-12 right-12 z-30">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="group flex items-center gap-4 bg-white/10 backdrop-blur-2xl border border-white/20 p-2 pl-6 rounded-full hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {isDarkMode ? "Mode Jour" : "Mode Nuit"}
            </span>
            <div className="bg-white rounded-full p-3 text-black transition-transform duration-500 group-hover:rotate-12">
              {isDarkMode ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-indigo-600" />}
            </div>
          </button>
        </div>

        {/* TITRES */}
        <div className="relative z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.6em] mb-6 block">
              Présence Globale
            </span>
            <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-6">
              L'Équipe Amaru
            </h1>
            <p className="text-white/70 text-sm md:text-base uppercase tracking-[0.3em] font-light max-w-2xl mx-auto leading-relaxed">
              Un accompagnement sur-mesure pour chaque continent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION ÉQUIPE (CONTENU IDENTIQUE) */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
        
        <div className="xl:col-span-7 space-y-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-serif italic mb-6">Expertise Géographique</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Nous avons sectorisé nos pôles de compétences pour répondre aux spécificités fiscales, juridiques et culturelles de chaque pays d'origine.
            </p>
          </div>

          <div className="space-y-12">
            {teamMembers.map((member) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`p-10 rounded-[3rem] border flex flex-col md:flex-row gap-10 transition-all duration-700 ${
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-xl"
                }`}
              >
                <div className="relative w-full md:w-52 h-64 shrink-0 overflow-hidden rounded-[2.5rem] bg-slate-200">
                  <img 
                    src={member.photoDay} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isDarkMode ? "brightness-[0.5] saturate-[0.5]" : "brightness-100"
                    }`}
                    alt={member.name}
                  />
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-serif italic text-[#D4AF37]">{member.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                      <Compass size={14} className="text-[#D4AF37]" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#D4AF37]">{member.worldRegion}</span>
                    </div>
                  </div>

                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {member.background}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin size={16} className="text-[#D4AF37]" />
                      <span className="opacity-70">{member.market}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                      <Languages size={16} className="text-[#D4AF37]" />
                      <span className="opacity-70">{member.skills.slice(0,2).join(" • ")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE */}
        <div className="xl:col-span-5">
          <div className={`sticky top-32 p-12 rounded-[3.5rem] transition-all duration-700 ${
            isDarkMode 
              ? "bg-[#0f172a] border border-white/5 shadow-2xl" 
              : "bg-white border border-slate-100 shadow-2xl shadow-slate-200/50"
          }`}>
            <h3 className="text-3xl font-serif italic mb-2">Votre projet</h3>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-8">Demande d'informations</p>
            
            <form className="space-y-6">
              <input type="text" placeholder="NOM COMPLET" className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest ${isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"} border-2 focus:border-[#D4AF37]`} />
              <div className="grid grid-cols-2 gap-4">
                <input type="email" placeholder="EMAIL" className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest ${isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"} border-2 focus:border-[#D4AF37]`} />
                <input type="text" placeholder="PAYS" className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest ${isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"} border-2 focus:border-[#D4AF37]`} />
              </div>
              <textarea rows={4} placeholder="DÉTAILS..." className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest resize-none ${isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"} border-2 focus:border-[#D4AF37]`} />
              <button className="w-full bg-[#D4AF37] text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-black hover:text-[#D4AF37] dark:hover:bg-white dark:hover:text-black transition-all">Envoyer</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}