import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import "./globals.css";  
import { headers } from "next/headers"; // Ajout crucial

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: 'swap' });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["100", "200"], display: 'swap' });

export const metadata: Metadata = {
  title: "Data Home | Immobilier de Prestige",
  description: "Découvrez notre sélection exclusive de villas et appartements de luxe.",
};

export default async function RootLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  // TECHNIQUE DE DÉTECTION ROBUSTE :
  // On regarde l'URL via les headers pour savoir si on est en pack light
  const headerList = await headers();
  const fullUrl = headerList.get("x-url") || ""; 
  const referer = headerList.get("referer") || "";
  
  // On vérifie si "pack=light" est présent dans l'URL ou le referer
  const isLight = fullUrl.includes('pack=light') || referer.includes('pack=light');

  return (
    <html 
      lang="fr" 
      /* On force le retrait de la classe dark au niveau SSR */
      className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${isLight ? 'light' : 'dark'}`} 
      suppressHydrationWarning
      data-package={isLight ? 'light' : 'gold'}
    >
      <body 
        className="antialiased"
        style={{ 
            backgroundColor: isLight ? '#FFFFFF' : '#020617',
            color: isLight ? '#0f172a' : '#FFFFFF' 
        }}
      >
        <ThemeProvider 
          attribute="class" 
          forcedTheme={isLight ? "light" : undefined}
          defaultTheme={isLight ? "light" : "dark"} 
          enableSystem={!isLight}
        >
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}