/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wa: '#25D366',
        'wa-dark': '#128C7E',
      },
    },
  },
  plugins: [],
};
