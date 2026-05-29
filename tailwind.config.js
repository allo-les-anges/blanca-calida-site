/** @type {import('tailwindcss').Config} */
export default {
  // On s'assure que Tailwind ne regarde QUE la classe .dark sur le HTML
  darkMode: 'class',
  
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    // Si tu as un dossier src/ à la racine, garde la ligne suivante, sinon retire-la
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#1A1A1A',
        accent: '#FFE7C2',
        neutral: '#E9E3DA',
        'soft-text': '#1A1A1A',
        'gold-light': '#F5E8D0',
        'navy-dark': '#0A0A0A',
      },
      fontFamily: {
        'serif': ['"Suisse Int\'l"', '"Suisse Intl"', 'Arial', 'sans-serif'],
        'sans': ['"Suisse Int\'l"', '"Suisse Intl"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
