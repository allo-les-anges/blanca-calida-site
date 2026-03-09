import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider"; // Assurez-vous que le chemin est correct

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
    // AJOUT DE suppressHydrationWarning : Indispensable pour next-themes
    <html lang="fr" className="scroll-smooth notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <style>{`
          .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, .goog-te-banner, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame, iframe.goog-te-banner-frame { 
            display: none !important; 
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
          }
          html { margin-top: 0px !important; }
          body { top: 0px !important; position: static !important; }
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
            /* On enlève le color: #4b5563 !important; pour laisser le dark mode gérer la couleur du texte */
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased transition-colors duration-300`}>
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
