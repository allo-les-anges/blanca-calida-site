import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="fr" className="scroll-smooth notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        {/* Ces styles forcent le fond sombre même si Google Translate essaie d'injecter du blanc */}
        <style>{`
          .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, .goog-te-banner, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame, iframe.goog-te-banner-frame { 
            display: none !important; 
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
          }
          html { margin-top: 0px !important; }
          
          /* Modification critique ici pour le fond */
          body { 
            top: 0px !important; 
            position: static !important; 
            background-color: transparent !important; 
          }
          
          html.dark body {
            background-color: #020617 !important;
            color: #ffffff !important;
          }

          .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
          #google_translate_element { display: none !important; }

          .description-xml-container, 
          .description-xml-container *, 
          .description-xml-container p, 
          .description-xml-container span,
          .description-xml-container div,
          .description-xml-container font {
            font-family: var(--font-sans), ui-sans-serif, system-ui, -apple-system, sans-serif !important;
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
          }
        `}</style>
      </head>
      {/* Suppression de bg-white ici pour laisser le CSS de globals et du head gérer le fond */}
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="notranslate">
            <div id="google_translate_element"></div>
          </div>
          {children}
        </ThemeProvider>

        <Script id="google-translate-logic" strategy="afterInteractive">
          {`
            function cleanGoogleTranslate() {
              document.documentElement.style.marginTop = '0px';
              document.body.style.top = '0px';
            }
            window.googleTranslateElementInit = function() {
              if (window.google && google.translate) {
                new google.translate.TranslateElement({
                  pageLanguage: 'fr',
                  includedLanguages: 'en,es,nl,de,fr',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            }
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