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
  title: "Data Home | Immobilier de Prestige",
  description: "Découvrez notre sélection exclusive de villas et appartements de luxe sur la Costa Blanca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // AJOUT DE "notranslate" ICI : Empêche Google de modifier les balises racines et de faire crash React
    <html lang="fr" className="scroll-smooth notranslate">
      <head>
        {/* Méta-balise pour dire explicitement à Google de ne pas proposer la traduction auto qui casse le site */}
        <meta name="google" content="notranslate" />
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

          .description-xml-container, 
          .description-xml-container *, 
          .description-xml-container p, 
          .description-xml-container span,
          .description-xml-container div,
          .description-xml-container font {
            font-family: var(--font-sans), ui-sans-serif, system-ui, -apple-system, sans-serif !important;
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
            color: #4b5563 !important;
          }
        `}</style>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}
      >
        {/* On enveloppe le contenu dans une div notranslate pour protéger les composants critiques comme la Navbar */}
        <div className="notranslate">
          <div id="google_translate_element"></div>
        </div>

        {children}

        {/* SCRIPT DE NETTOYAGE SÉCURISÉ */}
        <Script id="google-translate-logic" strategy="afterInteractive">
          {`
            function cleanGoogleTranslate() {
              document.documentElement.style.marginTop = '0px';
              document.body.style.top = '0px';
            }

            // Initialisation uniquement si l'objet google existe
            window.googleTranslateElementInit = function() {
              if (window.google && google.translate) {
                new google.translate.TranslateElement({
                  pageLanguage: 'fr',
                  includedLanguages: 'en,es,nl,de,fr',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            }

            // On retire le remove() brutal de la frame qui peut faire crash React
            const observer = new MutationObserver(() => {
              cleanGoogleTranslate();
            });

            observer.observe(document.documentElement, { 
              attributes: true, 
              attributeFilter: ['style'] 
            });

            setInterval(cleanGoogleTranslate, 1000);
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