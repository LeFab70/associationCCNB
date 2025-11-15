/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'ccnb-blue': '#003366',
        'ccnb-red': '#CC0000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

