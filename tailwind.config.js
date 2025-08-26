/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#72B334',
        secondary: '#6BB14F',
      },
      fontFamily: {
        cinzel: ['Exo2-Regular'],
      },
    },
  },
  plugins: [],
};
