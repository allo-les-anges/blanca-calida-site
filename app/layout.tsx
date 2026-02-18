import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Import des polices Luxe
import "./globals.css";

// Police pour le texte courant (propre et moderne)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

// Police pour les titres (Serif élégant style Costa Houses)
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
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}