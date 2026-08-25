/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1a1a',
        periwinkle: '#5d6cb1',
        gold: '#ffc107',
        cream: '#f5f3ee',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'drift': 'drift 45s infinite linear',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateX(0) scale(1)' },
          '50%': { transform: 'translateX(-3px) scale(1.01)' },
        }
      }
    },
  },
  plugins: [],
}