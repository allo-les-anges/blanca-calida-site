/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- IMPORTANT : Permet de basculer manuellement avec une classe .dark
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Ajouté pour Next.js si nécessaire
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vos nouvelles couleurs de marque
        primary: '#0A0A0A',       // Noir Profond (Background Dark)
        secondary: '#1A1A1A',     // Surface Sombre (Cards Dark)
        accent: '#FFE7C2',        // Vanilla/Or (Brand Accent)
        neutral: '#E9E3DA',       // Pierre/Soft Neutral (Background Light)
        'soft-text': '#1A1A1A',   // Texte pour mode clair
        
        // Anciennes couleurs conservées ou adaptées
        'gold-light': '#F5E8D0',
        'navy-dark': '#0A0A0A',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Mise à jour du dégradé avec votre nouvelle couleur Vanilla
        'gradient-gold': 'linear-gradient(135deg, #FFE7C2 0%, #D4A574 100%)',
      },
    },
  },
  plugins: [],
}
