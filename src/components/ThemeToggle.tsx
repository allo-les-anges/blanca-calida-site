"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Évite les erreurs d'hydratation au rendu
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="p-3 w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 bg-slate-100 dark:bg-white/10 rounded-full text-[#D4AF37] border border-slate-200 dark:border-white/10 hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}