import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import "./globals.css";  
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Data Home | Immobilier de Prestige",
  description: "Découvrez notre sélection exclusive de villas et appartements de luxe.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const fullUrl = headerList.get("x-url") || ""; 
  const referer = headerList.get("referer") || "";
  const isLight = fullUrl.includes('pack=light') || referer.includes('pack=light');

  return (
    <html 
      lang="fr" 
      className={isLight ? 'light' : 'dark'} 
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
