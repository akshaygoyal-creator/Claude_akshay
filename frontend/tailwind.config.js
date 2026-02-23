/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        licious: {
          red: '#E31837',
          dark: '#1A1A1A',
          light: '#FFF5F5',
        },
      },
    },
  },
  plugins: [],
};
