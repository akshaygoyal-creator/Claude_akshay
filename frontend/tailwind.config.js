/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        licious: { 50: '#fff1f2', 100: '#ffe4e6', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
      },
    },
  },
  plugins: [],
};
