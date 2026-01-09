/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flame: {
          orange: '#FF6B35',
          red: '#F7444E',
          yellow: '#FFD700',
        },
      },
      animation: {
        'flame': 'flame 1s ease-in-out infinite',
      },
      keyframes: {
        flame: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
