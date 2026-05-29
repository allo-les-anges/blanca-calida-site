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
        primary: '#010101',
        secondary: '#171716',
        accent: '#D8C9B6',
        neutral: '#F2EFEA',
        'soft-text': '#171716',
        'gold-light': '#D8C9B6',
        'navy-dark': '#010101',
      },
      fontFamily: {
        'serif': ['"Suisse Int\'l"', '"Suisse Intl"', 'Arial', 'sans-serif'],
        'sans': ['"Suisse Int\'l"', '"Suisse Intl"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
