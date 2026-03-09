"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" // <--- C'est cela qui ajoute la classe .dark à <html>
      defaultTheme="light" 
      enableSystem={true}
    >
      {children}
    </NextThemesProvider>
  );
}