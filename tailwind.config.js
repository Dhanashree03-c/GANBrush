/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- IMPORTANT: Enables manual dark mode toggle
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      aspectRatio: {
        'portrait': '2 / 3', // This creates the 1:1.5 ratio
      },
      backgroundImage: {
        'cosmos': "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop')",
        'studio': "url('https://www.transparenttextures.com/patterns/cubes.png')", // Subtle pattern for light mode
      }
    },
  },
  plugins: [],
}