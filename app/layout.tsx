import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif" 
});

export const metadata: Metadata = {
  title: "Luxury Estates Spain | Agence Immobilière de Prestige",
  description: "Découvrez notre sélection exclusive de villas et appartements de luxe sur la Costa Blanca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <style>{`
          /* 1. Suppression radicale de la barre grise Google Translate */
          .goog-te-banner-frame.skiptranslate, .goog-te-banner-frame { 
            display: none !important; 
            visibility: hidden !important;
          }
          
          /* 2. Empêcher le décalage du haut de page */
          body { 
            top: 0px !important; 
            position: static !important;
          }

          /* 3. Cacher le widget original */
          #google_translate_element, .goog-te-gadget {
            display: none !important;
          }
          
          /* 4. Supprimer l'infobulle et le surlignage au survol */
          #goog-gt-tt, .goog-te-balloon-frame {
            display: none !important;
            visibility: hidden !important;
          }
          .goog-text-highlight {
            background-color: transparent !important;
            box-shadow: none !important;
          }
        `}</style>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}
      >
        <div id="google_translate_element"></div>

        {children}

        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              // Détection automatique de la langue du visiteur
              const userLang = navigator.language.split('-')[0];
              const supportedLangs = ['en', 'es', 'nl', 'de', 'fr'];
              
              // On vérifie si l'utilisateur n'a pas déjà un cookie de traduction
              const hasCookie = document.cookie.includes('googtrans');
              
              // Si c'est un nouveau visiteur et que sa langue est supportée (et pas fr)
              if (!hasCookie && supportedLangs.includes(userLang) && userLang !== 'fr') {
                document.cookie = "googtrans=/fr/" + userLang + "; path=/";
                // On recharge discrètement pour appliquer la langue détectée
                window.location.reload();
              }

              new google.translate.TranslateElement({
                pageLanguage: 'fr',
                includedLanguages: 'en,es,nl,de,fr',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}