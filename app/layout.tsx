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
          /* Masquer la bannière de traduction Google */
          .goog-te-banner-frame.skiptranslate { display: none !important; }
          body { top: 0px !important; }
          
          /* Masquer le widget Google d'origine pour garder votre Navbar propre */
          #google_translate_element, .goog-te-gadget {
            display: none !important;
          }
          
          /* Supprimer l'infobulle Google au survol des textes traduits */
          .goog-text-highlight {
            background-color: transparent !important;
            box-shadow: none !important;
          }
        `}</style>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}
      >
        {/* Le point d'ancrage doit exister quelque part dans le body */}
        <div id="google_translate_element"></div>

        {children}

        {/* Initialisation sécurisée */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
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