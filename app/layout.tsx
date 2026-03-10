import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";  

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
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Plus besoin de meta notranslate puisque nous gérons nos propres textes */}
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased transition-colors duration-300`}>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </ThemeProvider>
</body>
    </html>
  );
}