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
        <style>{`
          /* Masquage Google Translate */
          .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, .goog-te-banner, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame, iframe.goog-te-banner-frame { 
            display: none !important; 
            visibility: hidden !important;
          }
          /* On retire les marges parasites de Google Translate sans casser le fond */
          html { margin-top: 0px !important; }
          body { top: 0px !important; position: static !important; }
          .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        `}</style>
      </head>
      {/* On applique le fond ici pour éviter le flash blanc au chargement */}
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
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