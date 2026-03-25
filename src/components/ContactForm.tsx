"use client";

import React, { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

interface ContactFormProps {
  agency: {
    id: string;
    package_level: string;
    name: string;
  };
  propertyRef?: string; // Optionnel : l'ID de la villa si on est sur une fiche produit
}

export default function ContactForm({ agency, propertyRef }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const isLight = agency.package_level === "light";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    // Simulation de l'envoi vers ton Zoho / API
    // Plus tard, on remplacera par ton URL de Webform Zoho
    setTimeout(() => setStatus("success"), 1500);
  };

  if (status === "success") {
    return (
      <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={40} />
        <h3 className="text-xl font-serif italic text-green-900">Message envoyé</h3>
        <p className="text-sm text-green-700 mt-2">Nous reviendrons vers vous rapidement.</p>
      </div>
    );
  }

  return (
    <div className={`p-8 rounded-[2.5rem] border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-white/5 border-white/10 backdrop-blur-md"}`}>
      <h3 className={`text-2xl font-serif italic mb-6 ${isLight ? "text-slate-900" : "text-white"}`}>
        {isLight ? "Demander des informations" : "Contacter un Expert Prestige"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- CHAMPS VISIBLES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" name="name" required placeholder="Votre nom"
            className={`w-full p-4 rounded-xl outline-none border transition-all ${isLight ? "bg-slate-50 border-slate-200 focus:border-black" : "bg-black/20 border-white/10 text-white focus:border-[#D4AF37]"}`}
          />
          <input 
            type="email" name="email" required placeholder="Votre email"
            className={`w-full p-4 rounded-xl outline-none border transition-all ${isLight ? "bg-slate-50 border-slate-200 focus:border-black" : "bg-black/20 border-white/10 text-white focus:border-[#D4AF37]"}`}
          />
        </div>

        <textarea 
          name="message" rows={4} placeholder="Comment pouvons-nous vous aider ?"
          className={`w-full p-4 rounded-xl outline-none border transition-all ${isLight ? "bg-slate-50 border-slate-200 focus:border-black" : "bg-black/20 border-white/10 text-white focus:border-[#D4AF37]"}`}
        ></textarea>

        {/* --- CHAMPS INVISIBLES (LE PONT ZOHO) --- */}
        {/* Ces champs permettent à ton CRM de trier les leads automatiquement */}
        <input type="hidden" name="zc_gad" value="" /> {/* Pour le tracking Zoho */}
        <input type="hidden" name="agency_id" value={agency.id} />
        <input type="hidden" name="source_package" value={agency.package_level} />
        {propertyRef && <input type="hidden" name="property_id" value={propertyRef} />}

        <button 
          type="submit" 
          disabled={status === "sending"}
          className={`w-full py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${
            isLight 
            ? "bg-black text-white hover:bg-slate-800" 
            : "bg-[#D4AF37] text-black hover:bg-white"
          }`}
        >
          {status === "sending" ? "Envoi en cours..." : "Envoyer la demande"}
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}