/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Garamond', 'serif'],
        sans: ['Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#0f172a',
          900: '#1e293b',
          100: '#f1f5f9',
        },
        blue: {
          400: '#60a5fa',
        },
        royal: {
          bg: '#07071a',
          surface: '#0f0f2a',
          elevated: '#16163a',
          border: '#2a2a5a',
          gold: '#e4a820',
          'gold-lt': '#f5c842',
          'gold-dk': '#b8840a',
          purple: '#7c3aed',
          muted: '#6666aa',
          text: '#d0d0ec',
        },
      },
    },
  },
  plugins: [],
}
