"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * Composant ThemeProvider corrigé avec l'importation de ReactNode.
 * Le defaultTheme est réglé sur "dark" pour éviter le flash blanc au chargement.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}