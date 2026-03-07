"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, Sun, Moon, 
  ShieldCheck, Globe, Award, Briefcase, GraduationCap
} from "lucide-react";

// --- CONFIGURATION DES AGENTS ---
const teamMembers = [
  {
    id: 1,
    name: "Deborah",
    role: "Expert Immobilier Senior",
    background: "Spécialiste en transactions de prestige avec une expertise pointue du marché résidentiel haut de gamme.",
    skills: ["Négociation", "Conseil fiscal", "Évaluation"],
    market: "Costa Blanca & Valencia",
    photoDay: "/Deborah.jpeg",
  },
  {
    id: 2,
    name: "Gillian",
    role: "Consultant International",
    background: "Expert en accompagnement de la clientèle étrangère et gestion d'actifs immobiliers.",
    skills: ["Relocation", "Investissement", "Droit comparé"],
    market: "Costa del Sol & Marbella",
    photoDay: "/Gillian.jpeg",
  },
  {
    id: 3,
    name: "Joanna",
    role: "Chasseuse de Propriétés",
    background: "Spécialiste du 'Off-Market', elle déniche des perles rares avant leur mise sur le marché public.",
    skills: ["Sourcing", "Architecture d'intérieur", "Relations publiques"],
    market: "Costa Almeria & Murcie",
    photoDay: "/Joanna.jpeg",
  },
  {
    id: 4,
    name: "Gaëtan",
    role: "Directeur Technique",
    background: "Expert en suivi de chantier et conformité technique des villas de luxe.",
    skills: ["Urbanisme", "Domotique", "Gestion de projet"],
    market: "Toute l'Espagne",
    photoDay: "/Gaëtan.jpeg",
  },
  {
    id: 5,
    name: "Abdou",
    role: "Responsable Grands Comptes",
    background: "Ancien analyste financier, il optimise le rendement locatif et la structure d'achat.",
    skills: ["Finance", "Yield Management", "Stratégie"],
    market: "Madrid & Zones Littorales",
    photoDay: "/Abdou.jpeg",
  }
];

export default function ContactPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isDarkMode ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* SECTION HÉRO AVEC PLANISPHÈRE */}
      <section className={`relative h-[60vh] w-full overflow-hidden flex items-center justify-center transition-colors duration-1000 ${isDarkMode ? "bg-[#020617]" : "bg-slate-900"}`}>
        
        {/* PLANISPHÈRE EN ARRIÈRE-PLAN (SVG) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
          <svg 
            viewBox="0 0 1000 500" 
            className={`w-full h-full object-contain p-10 transition-colors duration-1000 ${isDarkMode ? "fill-[#D4AF37]/30" : "fill-white/20"}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Version simplifiée des continents pour l'aspect design */}
            <path d="M150,120 L180,110 L220,130 L250,180 L230,250 L180,280 L140,240 Z M350,100 L450,80 L520,120 L550,200 L500,300 L400,320 L320,250 Z M650,150 L750,140 L820,180 L800,280 L700,350 L620,300 Z M200,350 L280,380 L300,450 L220,480 L150,420 Z M750,380 L850,400 L880,480 L780,460 Z" />
            <circle cx="480" cy="180" r="3" fill="#D4AF37" className="animate-pulse" /> {/* Point Espagne/Europe */}
          </svg>
        </div>

        {/* EFFET DE GRADIENT POUR PROFONDEUR */}
        <div className={`absolute inset-0 z-1 bg-gradient-to-b ${isDarkMode ? "from-transparent via-[#020617]/50 to-[#020617]" : "from-transparent via-slate-900/50 to-slate-900"}`} />

        {/* SWITCHER AMBIANCE */}
        <div className="absolute bottom-12 right-12 z-30">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="group flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2 pl-6 rounded-full hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {isDarkMode ? "Switch Jour" : "Switch Nuit"}
            </span>
            <div className="bg-white rounded-full p-3 text-black transition-transform duration-500 group-hover:rotate-12">
              {isDarkMode ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-indigo-600" />}
            </div>
          </button>
        </div>

        {/* TEXTE HÉRO */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.6em] mb-6 block">
              Rayonnement International
            </span>
            <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-4">
              Vos conseillers Amaru
            </h1>
            <div className="h-[1px] w-32 bg-[#D4AF37] mx-auto mt-8 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* SECTION PRINCIPALE (CONTENU IDENTIQUE) */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
        
        {/* COLONNE GAUCHE : L'ÉQUIPE */}
        <div className="xl:col-span-7 space-y-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-serif italic mb-6">Expertise & Vision</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Chaque conseiller Amaru apporte une pièce unique à l'édifice de votre projet. Notre équipe pluridisciplinaire sécurise vos investissements en Espagne.
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
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"
                }`}
              >
                {/* Photo de l'agent */}
                <div className="relative w-full md:w-52 h-64 shrink-0 overflow-hidden rounded-[2.5rem] bg-slate-200">
                  <img 
                    src={member.photoDay} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isDarkMode ? "brightness-[0.4] saturate-[0.5]" : "brightness-100"
                    }`}
                    alt={member.name}
                  />
                  <div className="absolute top-4 left-4 bg-[#D4AF37] p-2 rounded-xl text-black">
                    <Award size={18} />
                  </div>
                </div>

                <div className="flex-1 space-y-6 text-left">
                  <div>
                    <h3 className="text-3xl font-serif italic text-[#D4AF37]">{member.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">{member.role}</p>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {member.background}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-4 text-[10px] font-bold uppercase tracking-widest">
                      <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
                      <span className="mt-1">{member.skills.join(" • ")}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <Globe size={16} className="text-[#D4AF37] shrink-0" />
                      <span className="opacity-70 font-medium">Rayon d'action : {member.market}</span>
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
              ? "bg-[#0f172a] border border-white/5 shadow-2xl shadow-black/50" 
              : "bg-white border border-slate-100 shadow-2xl"
          }`}>
            <h3 className="text-3xl font-serif italic mb-2">Prendre contact</h3>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-8">Discrétion & Efficacité</p>
            
            <form className="space-y-6">
              <input 
                type="text" 
                placeholder="VOTRE NOM"
                className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest ${
                  isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"
                } border-2 focus:border-[#D4AF37]`}
              />
              <input 
                type="email" 
                placeholder="VOTRE EMAIL"
                className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest ${
                  isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"
                } border-2 focus:border-[#D4AF37]`}
              />
              <textarea 
                rows={5} 
                placeholder="VOTRE PROJET IMMOBILIER..."
                className={`w-full px-8 py-5 rounded-2xl outline-none transition-all text-[10px] font-black tracking-widest resize-none ${
                  isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-100"
                } border-2 focus:border-[#D4AF37]`}
              />

              <button className="w-full bg-[#D4AF37] text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-black hover:text-[#D4AF37] dark:hover:bg-white dark:hover:text-black transition-all">
                Lancer la demande
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}