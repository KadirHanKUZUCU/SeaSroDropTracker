/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Anek Latin', 'system-ui', 'sans-serif'],
      },
      colors: {
        panel: {
          DEFAULT: '#0f1419',
          elevated: '#161b22',
          border: '#2a3142',
        },
        accent: {
          gold: '#c9a227',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
}
