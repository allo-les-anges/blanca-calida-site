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
    <html lang="fr" className="scroll-smooth">
      <head>
        <style>{`
          /* 1. CACHER TOUS LES ÉLÉMENTS GOOGLE TRANSLATE */
          .goog-te-banner-frame, 
          .goog-te-banner-frame.skiptranslate,
          .goog-te-banner,
          .skiptranslate,
          #goog-gt-tt,
          .goog-te-balloon-frame,
          iframe.goog-te-banner-frame { 
            display: none !important; 
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
          }
          
          /* 2. FORCER LE CONTENU À RESTER EN HAUT */
          html {
            margin-top: 0px !important;
          }
          body { 
            top: 0px !important; 
            position: static !important;
          }

          /* 3. NETTOYAGE DES EFFETS DE SURVOL */
          .goog-text-highlight {
            background-color: transparent !important;
            box-shadow: none !important;
          }

          /* 4. MASQUER LE WIDGET ORIGINAL */
          #google_translate_element {
            display: none !important;
          }
        `}</style>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}
      >
        {/* Point d'ancrage Google obligatoire mais caché */}
        <div id="google_translate_element"></div>

        {children}

        {/* SCRIPT DE NETTOYAGE ET INITIALISATION */}
        <Script id="google-translate-logic" strategy="afterInteractive">
          {`
            // Fonction pour supprimer les traces de la barre Google
            function cleanGoogleTranslate() {
              document.documentElement.style.marginTop = '0px';
              document.body.style.top = '0px';
              const frame = document.querySelector('.goog-te-banner-frame');
              if (frame) frame.remove();
            }

            // Initialisation Google Translate
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'fr',
                includedLanguages: 'en,es,nl,de,fr',
                autoDisplay: false
              }, 'google_translate_element');

              // Détection automatique de la langue du navigateur
              const userLang = navigator.language.split('-')[0];
              const supportedLangs = ['en', 'es', 'nl', 'de', 'fr'];
              const hasCookie = document.cookie.includes('googtrans');
              
              if (!hasCookie && supportedLangs.includes(userLang) && userLang !== 'fr') {
                document.cookie = "googtrans=/fr/" + userLang + "; path=/";
                window.location.reload();
              }
            }

            // Surveillance active du DOM pour bloquer la barre dès qu'elle apparaît
            const observer = new MutationObserver(() => {
              cleanGoogleTranslate();
            });

            observer.observe(document.documentElement, { 
              attributes: true, 
              attributeFilter: ['style'] 
            });

            // Sécurité supplémentaire : intervalle régulier
            setInterval(cleanGoogleTranslate, 1000);
          `}
        </Script>

        {/* CHARGEMENT DU SCRIPT GOOGLE */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}