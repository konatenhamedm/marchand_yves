// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs Batiflow - Mise à jour avec #0052cc
        batiflow: {
          marine: '#003d99',      // Bleu foncé
          primary: '#0052cc',     // Bleu principal
          light: '#3377dd',       // Bleu clair
          cyan: '#6699ee',        // Cyan clair
          sky: '#99bbff',         // Bleu très clair
          ice: '#cce0ff',         // Bleu glacé
          secondary: '#8B5CF6',   // Violet secondaire
          'secondary-light': '#A78BFA', // Violet clair
          'secondary-dark': '#7C3AED',  // Violet foncé
        },
        // Extension des couleurs Tailwind existantes
        blue: {
          950: '#003d99',  // Bleu foncé
        },
        sky: {
          200: '#99bbff',  // Pour --tw-gradient-to: var(--color-sky-200)
        }
      },
      backgroundImage: {
        'gradient-batiflow': 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)',
        'gradient-batiflow-light': 'linear-gradient(135deg, #99bbff 0%, #6699ee 100%)',
        'gradient-batiflow-soft': 'linear-gradient(to bottom, #cce0ff, #F8FAFC)',
        'gradient-to-sky-200': 'linear-gradient(to right, transparent, #99bbff)',
        'gradient-secondary': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'gradient-primary-secondary': 'linear-gradient(135deg, #0052cc 0%, #8B5CF6 100%)',
      },
      boxShadow: {
        'batiflow': '0 10px 40px -10px rgba(0, 82, 204, 0.3)',
        'batiflow-lg': '0 20px 50px -15px rgba(0, 82, 204, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;