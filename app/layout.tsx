import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import "./globals.css";  

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: 'swap', 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif",
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Data Home | Immobilier de Prestige",
  description: "Découvrez notre sélection exclusive de villas et appartements de luxe sur la Costa Blanca.",
};

export default function RootLayout({
  children,
  agency, 
}: {
  children: React.ReactNode;
  agency?: { package_level?: string };
}) {
  // Détection du mode Light (Par défaut Gold si agency est indéfini)
  const isLight = agency?.package_level === 'light';

  return (
    <html 
      lang="fr" 
      className={`scroll-smooth ${inter.variable} ${playfair.variable} ${montserrat.variable}`} 
      suppressHydrationWarning
      data-package={isLight ? 'light' : 'gold'}
    >
      <body className={`
        font-sans antialiased transition-colors duration-300
        ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'} 
      `}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme={isLight ? "light" : "dark"} 
          enableSystem={false}
          forcedTheme={isLight ? "light" : undefined}
        >
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}