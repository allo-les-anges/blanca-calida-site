/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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
        'serif': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['"Inter"', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}