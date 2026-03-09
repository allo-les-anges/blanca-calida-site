// components/ThemeProvider.tsx
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" // <-- Changez "light" par "dark" ici
      enableSystem={false} // Désactivez le système pour forcer votre choix
    >
      {children}
    </NextThemesProvider>
  );
}