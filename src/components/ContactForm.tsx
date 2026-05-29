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
  isLight?: boolean;
}

export default function ContactForm({ agency, propertyRef, isLight: forcedLight }: ContactFormProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const isLight = agency.package_level === "light" || forcedLight === true;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("success"), 1500);
  };

  if (status === "success") {
    return (
      <div className={`p-10 text-center rounded-[2.5rem] border animate-in fade-in zoom-in duration-500 ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
      }`}>
        <div className="w-16 h-16 bg-[#D8C9B6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-[#D8C9B6]" size={32} />
        </div>
        <h3 className={`text-2xl font-serif italic mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
          {t("propertyDetail.messageSent") || "Message envoye"}
        </h3>
        <p className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          {t("propertyDetail.weWillContactYou") || "Nous reviendrons vers vous rapidement."}
        </p>
      </div>
    );
  }

  const titleStyle = isLight ? "text-slate-900" : "text-white";
  const phoneShellStyle = isLight
    ? "bg-[#010101] shadow-2xl"
    : "bg-[#010101] shadow-2xl ring-1 ring-white/10";
  const phoneScreenStyle = isLight
    ? "bg-[#FAFAFA] border-[#D8C9B6]"
    : "bg-[#171716] border-white/10";
  const inputBaseStyle = "w-full p-4 text-[10px] tracking-widest uppercase outline-none border transition-all duration-300 rounded-xl";
  const inputThemeStyle = isLight
    ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-black placeholder:text-slate-400"
    : "bg-white/5 border-white/10 text-white focus:border-[#D8C9B6] placeholder:text-white/20";

  return (
    <div className={`relative mx-auto w-full max-w-[390px] rounded-[3rem] p-2 ${phoneShellStyle}`}>
      <div className="absolute left-1/2 top-3 z-20 h-1.5 w-20 -translate-x-1/2 rounded-full bg-[#171716] ring-1 ring-[#D8C9B6]/25" />
      <div className="absolute right-12 top-3 z-20 h-2 w-2 rounded-full bg-[#D8C9B6]/70" />

      <div className={`relative overflow-hidden rounded-[2.5rem] border px-5 pb-6 pt-10 ${phoneScreenStyle}`}>
        <div className="pointer-events-none absolute inset-x-12 top-0 h-6 rounded-b-[1.5rem] bg-[#010101]" />

        <div className="mb-7">
          <div className="mb-4 flex items-center justify-between">
            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${isLight ? "text-slate-500" : "text-[#D8C9B6]"}`}>
              Amaru Homes
            </span>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#25D366" }} />
          </div>
          <h3 className={`text-2xl font-serif italic leading-tight ${titleStyle}`}>
            {isLight ? "Demander des informations" : "Contacter un Expert"}
          </h3>
          <p className={`mt-2 text-[8px] font-bold uppercase tracking-[0.25em] ${isLight ? "text-slate-400" : "text-[#D8C9B6]/60"}`}>
            Ref: {propertyRef || "General"} - {agency.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="name" required placeholder="NOM COMPLET" className={`${inputBaseStyle} ${inputThemeStyle}`} />
          <input type="email" name="email" required placeholder="VOTRE EMAIL" className={`${inputBaseStyle} ${inputThemeStyle}`} />
          <textarea name="message" rows={3} placeholder="VOTRE MESSAGE..." className={`${inputBaseStyle} ${inputThemeStyle} resize-none`} />

          <input type="hidden" name="agency_id" value={agency.id} />
          <input type="hidden" name="source" value={isLight ? "Pack_Light" : "Pack_Gold"} />

          <button
            type="submit"
            disabled={status === "sending"}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.35em] flex items-center justify-center gap-4 transition-all duration-500 shadow-lg ${
              isLight
                ? "bg-black text-white hover:bg-[#D8C9B6] hover:text-black"
                : "bg-[#D8C9B6] text-black hover:bg-white hover:text-black"
            }`}
          >
            {status === "sending" ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <span>ENVOYER</span>
                <Send size={14} />
              </>
            )}
          </button>
        </form>

        <p className={`text-center mt-5 text-[7px] uppercase tracking-widest ${isLight ? "text-slate-400" : "text-white/20"}`}>
          Vos donnees sont protegees par le secret professionnel
        </p>
        <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-[#D8C9B6]/70" />
      </div>
    </div>
  );
}
