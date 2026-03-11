"use client";

import React, { useEffect } from 'react';

export default function GoogleTranslate() {
  return (
    <div className="google-translate-container">
      {/* C'est ici que Google injectera le menu déroulant */}
      <div id="google_translate_element" className="min-h-[40px]"></div>
      
      <style jsx global>{`
        /* Personnalisation du bouton pour qu'il s'intègre à votre design sombre */
        .goog-te-gadget-simple {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 6px 10px !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .goog-te-gadget-simple span {
          color: #94a3b8 !important; /* Slate-400 */
          font-size: 10px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .goog-te-gadget-icon {
          display: none !important; /* Masque l'icône Google moche */
        }
        .goog-te-menu-value img {
          display: none !important;
        }
      `}</style>
    </div>
  );
}