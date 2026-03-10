"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, Target, MapPin, Languages, Compass, Sun, Moon 
} from "lucide-react";
import { useTheme } from "next-themes";

// --- IMPORTATION DES COMPOSANTS DE NAVIGATION ---
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const teamMembers = [
  {
    id: 1,
    name: "Deborah",
    role: "Operational Excellence & Client Experience",
    worldRegion: "Global Operations",
    background: "Garante de la fluidité des processus et de la satisfaction client. Elle assure le suivi opérationnel quotidien pour garantir que chaque projet reçoive une attention personnalisée et une rigueur d'exécution maximale.",
    skills: ["Processus", "Expérience Client", "Rigueur"],
    market: "Siège Amaru",
    photoDay: "/Deborah.jpeg",
  },
  {
    id: 2,
    name: "Gillian",
    role: "Benelux, DACH & UK Expert",
    worldRegion: "Europe du Nord & UK",
    background: "Spécialiste des marchés à fort pouvoir d'achat, notamment la Belgique, les Pays-Bas, l'Allemagne et le Royaume-Uni. Il assure le lien stratégique entre les investisseurs d'Europe du Nord et les opportunités internationales.",
    skills: ["Investissement", "DACH Region", "Stratégie"],
    market: "International",
    photoDay: "/Gillian.jpeg",
  },
  {
    id: 3,
    name: "Joanna Pawelek",
    role: "Eastern Europe & Alicante Specialist",
    worldRegion: "Europe de l'Est & anglophone",
    background: "Experte certifiée (ANAI - API) du marché d'Alicante. Elle agit comme un pont stratégique pour les investisseurs d'Europe de l'Est et du monde anglophone grâce à sa maîtrise du polonais, de l'anglais et de l'espagnol.",
    skills: ["Certifiée ANAI-API", "Marché Polonais", "Alicante"],
    market: "Alicante / Costa Blanca",
    photoDay: "/Joanna.jpeg",
  },
  {
    id: 4,
    name: "Abdellah Touati",
    role: "MENA & Americas Expert",
    worldRegion: "Moyen-Orient & Amériques",
    background: "Fort d'un parcours technique en génie civil et d'une expertise sur le marché de Dubaï, il pilote l'expansion vers les marchés émergents et l'Amérique du Nord, connectant les développeurs aux réseaux d'investisseurs globaux.",
    skills: ["Génie Civil", "Dubai Market", "Global Networks"],
    market: "MENA / USA / Canada",
    photoDay: "/Abdou.jpeg",
  },
  {
    id: 5,
    name: "Gaëtan",
    role: "Francophonie & Global Strategy",
    worldRegion: "Monde Francophone",
    background: "Architecte de la stratégie commerciale, il assure la cohérence des partenariats avec les acteurs institutionnels (notaires, avocats, promoteurs) et l'expansion sur le marché francophone mondial, incluant l'Europe et le Canada.",
    skills: ["Partenariats B2B", "Stratégie", "Expansion"],
    market: "Global Francophonie",
    photoDay: "/Gaëtan.jpeg",
  }
];

export default function ContactPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sécurité pour l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  // Classe utilitaire pour les inputs pour centraliser la correction de lisibilité
  const inputClasses = `
    w-full px-8 py-5 rounded-2xl outline-none transition-all 
    text-[10px] font-black tracking-widest 
    bg-white dark:bg-black/60 
    border-2 border-slate-200 dark:border-white/10 
    text-slate-900 dark:text-white 
    placeholder:text-slate-400 dark:placeholder:text-white/30
    focus:border-[#D4AF37] dark:focus:border-[#D4AF37]
    focus:bg-white dark:focus:bg-black
  `;

  return (
    <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
      
      <Navbar />

      <main>
        {/* SECTION HÉRO */}
        <section className="relative h-[65vh] w-full flex items-center justify-center transition-colors duration-1000 bg-slate-900 dark:bg-[#020617]">
          <div className="absolute inset-0 z-0 opacity-50 bg-slate-900 dark:bg-black" />

          <div className="relative z-10 text-center px-6 max-w-5xl pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.6em] mb-6 block">
                🌍 Our Human Edge
              </span>
              <h1 className="text-4xl md:text-7xl font-serif italic text-white mb-8">
                Une Expertise Sans Frontières
              </h1>
              <p className="text-white/70 text-base md:text-lg font-light max-w-3xl mx-auto leading-relaxed italic">
                "Notre force réside dans notre capacité à connecter les marchés locaux aux opportunités mondiales. Chaque membre de notre équipe apporte une connaissance approfondie des dynamiques régionales et des réseaux d'investisseurs."
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION ÉQUIPE */}
        <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
          <div className="xl:col-span-7 space-y-12">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 md:p-12 rounded-[2.5rem] border transition-all duration-700 bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-black/40"
              >
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="relative w-full md:w-48 h-60 shrink-0 overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-white/5">
                    <img 
                      src={member.photoDay} 
                      className={`w-full h-full object-cover transition-all duration-1000 ${isDark ? "brightness-75 grayscale-[0.3]" : "brightness-100"}`}
                      alt={member.name}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md p-2 rounded-xl text-[#D4AF37]">
                      <Target size={16} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-serif italic text-[#D4AF37]">{member.name}</h3>
                        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-1">
                          {member.role}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                        <Globe size={12} className="text-[#D4AF37]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          {member.worldRegion}
                        </span>
                      </div>
                    </div>

                    <p className="text-base leading-relaxed font-light text-slate-600 dark:text-slate-300">
                      {member.background}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {member.skills.map((skill, i) => (
                        <span key={i} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md border border-[#D4AF37]/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* COLONNE FORMULAIRE */}
          <div className="xl:col-span-5">
            <div className="sticky top-32 p-12 rounded-[3.5rem] transition-all duration-700 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-3xl font-serif italic mb-2">Connectons-nous</h3>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-10">L'Excellence Amaru à votre service</p>
              
              <form className="space-y-6">
                <input 
                  type="text" 
                  placeholder="NOM COMPLET" 
                  className={inputClasses} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="email" 
                    placeholder="EMAIL" 
                    className={inputClasses} 
                  />
                  <input 
                    type="text" 
                    placeholder="PAYS / RÉGION" 
                    className={inputClasses} 
                  />
                </div>
                <textarea 
                  rows={4} 
                  placeholder="DÉTAILS DE VOTRE PROJET..." 
                  className={`${inputClasses} resize-none`} 
                />
                <button className="w-full bg-[#D4AF37] text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-black hover:text-[#D4AF37] dark:hover:bg-white dark:hover:text-black transition-all shadow-xl">
                  Contacter l'Expert Dédié
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}