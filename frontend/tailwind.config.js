/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'ccnb-blue': '#003366',
        'ccnb-blue-light': '#004080',
        'ccnb-blue-dark': '#002244',
        'ccnb-red': '#CC0000',
        'ccnb-red-light': '#E60000',
        'ccnb-red-dark': '#990000',
        'ccnb-gold': '#FFD700',
        'ccnb-gray': '#6B7280',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'spin-slow': 'spinSlow 3s linear infinite',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'slide-up-fade': 'slideUpFade 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'refresh-spin': 'refreshSpin 1s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', maxHeight: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', maxHeight: '1000px', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUpFade: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px) scale(0.9)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.8)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
        },
        refreshSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

