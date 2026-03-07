"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, Sun, Moon, 
  ShieldCheck, Globe, Award, Briefcase, GraduationCap
} from "lucide-react";

// --- CONFIGURATION DES AGENTS (ORDRE ET CHEMINS MIS À JOUR) ---
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
      
      {/* SECTION HÉRO */}
      <section className="relative h-[55vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black">
          {/* Remplacer par votre photo de bannière quand disponible */}
          <div className={`w-full h-full bg-slate-800 transition-opacity duration-1000 ${isDarkMode ? "opacity-40" : "opacity-60"}`} />
        </div>

        {/* SWITCHER AMBIANCE */}
        <div className="absolute bottom-12 right-12 z-30">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="group flex items-center gap-4 bg-white/10 backdrop-blur-2xl border border-white/20 p-2 pl-6 rounded-full hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {isDarkMode ? "Switch Jour" : "Switch Nuit"}
            </span>
            <div className="bg-white rounded-full p-3 text-black transition-transform duration-500 group-hover:rotate-12">
              {isDarkMode ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-indigo-600" />}
            </div>
          </button>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.5em] mb-4"
          >
            L'Élite à votre service
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-white">
            Vos conseillers Amaru
          </h1>
        </div>
      </section>

      {/* SECTION PRINCIPALE */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
        
        {/* COLONNE GAUCHE : L'ÉQUIPE (ORDRE DEMANDÉ) */}
        <div className="xl:col-span-7 space-y-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-serif italic mb-6">Expertise & Rayon d'action</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Notre force réside dans la complémentarité de nos parcours. Voici les experts qui vous accompagneront dans votre projet.
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

        {/* COLONNE DROITE : FORMULAIRE FIXE */}
        <div className="xl:col-span-5">
          <div className={`sticky top-32 p-12 rounded-[3.5rem] transition-all duration-700 ${
            isDarkMode 
              ? "bg-[#0f172a] border border-white/5" 
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