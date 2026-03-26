"use client";

import React, { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

interface ContactFormProps {
  agency: {
    id: string;
    package_level: string;
    name: string;
  };
  propertyRef?: string;
  isLight?: boolean; // Prop optionnelle pour forcer le mode
}

export default function ContactForm({ agency, propertyRef, isLight: forcedLight }: ContactFormProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  
  // On est en mode light si le package est 'light' OU si la prop isLight est vraie
  const isLight = agency.package_level === "light" || forcedLight === true;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    // Logique de simulation d'envoi
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  if (status === "success") {
    return (
      <div className={`p-10 text-center rounded-[2.5rem] border animate-in fade-in zoom-in duration-500 ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
      }`}>
        <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-[#D4AF37]" size={32} />
        </div>
        <h3 className={`text-2xl font-serif italic mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
          {t('propertyDetail.messageSent') || "Message envoyé"}
        </h3>
        <p className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          {t('propertyDetail.weWillContactYou') || "Nous reviendrons vers vous rapidement."}
        </p>
      </div>
    );
  }

  // Styles dynamiques
  const containerStyle = isLight 
    ? "bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]" 
    : "bg-[#0A0A0A]/40 border-white/5 backdrop-blur-xl";

  const titleStyle = isLight ? "text-slate-900" : "text-white";
  
  const inputBaseStyle = `w-full p-4 text-[10px] tracking-widest uppercase outline-none border transition-all duration-300 rounded-xl`;
  const inputThemeStyle = isLight 
    ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-black placeholder:text-slate-400" 
    : "bg-white/5 border-white/10 text-white focus:border-[#D4AF37] placeholder:text-white/20";

  return (
    <div className={`p-8 md:p-10 rounded-[2.5rem] border ${containerStyle}`}>
      <div className="mb-8">
        <h3 className={`text-2xl md:text-3xl font-serif italic mb-2 ${titleStyle}`}>
          {isLight ? "Demander des informations" : "Contacter un Expert"}
        </h3>
        <p className={`text-[9px] font-bold uppercase tracking-[0.3em] ${isLight ? 'text-slate-400' : 'text-[#D4AF37]/60'}`}>
          Réf: {propertyRef || 'Général'} — {agency.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="NOM COMPLET"
            className={`${inputBaseStyle} ${inputThemeStyle}`}
          />
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="VOTRE EMAIL"
            className={`${inputBaseStyle} ${inputThemeStyle}`}
          />
          <textarea 
            name="message" 
            rows={4} 
            placeholder="VOTRE MESSAGE..."
            className={`${inputBaseStyle} ${inputThemeStyle} resize-none`}
          ></textarea>
        </div>

        {/* Hidden Fields pour CRM */}
        <input type="hidden" name="agency_id" value={agency.id} />
        <input type="hidden" name="source" value={isLight ? "Pack_Light" : "Pack_Gold"} />

        <button 
  type="submit" 
  disabled={status === "sending"}
  className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-500 shadow-lg ${
    isLight 
      ? "bg-black text-white hover:bg-[#D4AF37] hover:text-black" 
      : "bg-[#D4AF37] text-black hover:bg-white hover:text-black"
  }`}
>
  {status === "sending" ? (
    <Loader2 className="animate-spin" size={16} />
  ) : (
    <>
      <span>ENVOYER LA DEMANDE</span>
      <Send size={14} />
    </>
  )}
</button>
      </form>
      
      <p className={`text-center mt-6 text-[8px] uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/20'}`}>
        Vos données sont protégées par le secret professionnel
      </p>
    </div>
  );
}