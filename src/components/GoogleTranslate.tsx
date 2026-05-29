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
          background-color: color-mix(in srgb, #FAFAFA 5%, transparent) !important;
          border: 1px solid color-mix(in srgb, #FAFAFA 10%, transparent) !important;
          padding: 6px 10px !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .goog-te-gadget-simple span {
          color: #D8C9B6 !important; /* Slate-400 */
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