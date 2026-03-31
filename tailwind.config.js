/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'space-bg': '#0a0a1a',
        'space-mid': '#1a1a3e',
        'vector-red': '#ff6b6b',
        'vector-teal': '#4ecdc4',
        'vector-yellow': '#ffe66d',
        'vector-green': '#c7f464',
        'highlight': '#ff006e',
        'text-soft': '#e0e0e0',
      },
    },
  },
  plugins: [],
};
