/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0B5394',
        'primary-green': '#2E8B57',
        'primary-yellow': '#FFD700',
        'blue-dark': '#083E6B',
        'green-dark': '#1B5E20'
      }
    },
  },
  plugins: [],
}
