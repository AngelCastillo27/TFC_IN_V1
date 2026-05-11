/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: '#F5F4F1',        // Fondo principal
        dark: '#0E0E0E',         // Texto principal (negro)
        gold: '#C6A75E',         // Líneas/UI
        'gold-light': '#D8C48A', // Hover suave
        'stone-gray': '#8A8A8A', // Soporte
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        soft: '0 2px 4px rgba(0, 0, 0, 0.08)',
        md: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        250: '250ms',
      }
    },
  },
  plugins: [],
}
