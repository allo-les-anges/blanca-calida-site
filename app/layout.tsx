import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import "./globals.css";  

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: 'swap' });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["100", "200"], display: 'swap' });

export const metadata: Metadata = {
  title: "Data Home | Immobilier de Prestige",
  description: "Découvrez notre sélection exclusive de villas et appartements de luxe.",
};

export default function RootLayout({ 
  children, 
  agency 
}: { 
  children: React.ReactNode; 
  agency?: { package_level?: string } 
}) {
  // Vérification de sécurité : on s'assure que isLight est bien un booléen
  const isLight = agency?.package_level === 'light';

  return (
    <html 
      lang="fr" 
      /* FORCE la suppression de la classe 'dark' si on est en mode light.
         C'est crucial car Tailwind se base sur la présence de cette classe.
      */
      className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${isLight ? '!light' : ''}`}
      suppressHydrationWarning
      data-package={isLight ? 'light' : 'gold'}
    >
      <body 
        className={`antialiased transition-colors duration-300`}
        style={{ 
            backgroundColor: isLight ? '#FFFFFF' : '#000000',
            color: isLight ? '#0f172a' : '#FFFFFF' 
        }}
      >
        <ThemeProvider 
          attribute="class" 
          /* forcedTheme est l'arme absolue : il ignore les préférences du navigateur 
             et force next-themes à injecter uniquement la classe 'light'.
          */
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