/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cute pastel palette 🐰
        cream: '#FFF8F0',
        blush: '#FFE4EC',
        rose: '#F4A7BB',
        lavender: '#C8A2E8',
        lilac: '#E8D5F5',
        sky: '#A7D8F0',
        mint: '#B8E8D0',
        peach: '#FFD4B8',
        honey: '#FFE5A0',
        berry: '#D46A9E',
        plum: '#8B5E9B',
        cocoa: '#6B4E4E',
        // Dark mode
        'dark-bg': '#1a1625',
        'dark-surface': '#2d2640',
        'dark-card': '#362e4a',
        'dark-border': '#4a3f6b',
        'dark-text': '#e8e0f0',
      },
      fontFamily: {
        display: ['Quicksand', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        writing: ['Georgia', 'serif'],
      },
      borderRadius: {
        'cute': '1rem',
        'bubble': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(212, 106, 158, 0.15)',
        'card': '0 4px 20px rgba(200, 162, 232, 0.2)',
        'glow': '0 0 20px rgba(244, 167, 187, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
