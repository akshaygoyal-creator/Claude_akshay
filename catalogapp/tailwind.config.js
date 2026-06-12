/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        cream: '#FAF6EF',
        ink: '#221F35',
        violet: { DEFAULT: '#6B4EFF', soft: '#ECE6FF' },
        coral: { DEFAULT: '#FF6B5E', soft: '#FFE7D6' },
        mint: '#DCF4E5',
        butter: '#FFF1C2',
        wa: '#10b981',
        'wa-dark': '#059669',
      },
    },
  },
  plugins: [],
};
