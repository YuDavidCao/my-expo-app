/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        thirty: '#fcba62',
        sixty: '#ffffff',
        ten: '#f27127',
      },
    },
  },
  plugins: [],
};
