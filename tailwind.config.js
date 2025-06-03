/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "15px",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
    },
    extend: {
      colors: {
        'gradient-start': '#e6f0fa', // Gradient start color
        'gradient-end': '#f9e6f0',   // Gradient end color
        'pink-accent': '#ff4d8d',    // Pink for buttons and accents
        'text-dark': '#333',         // Dark text color
        'text-medium': '#666',       // Medium gray text color
      }
    },
  },
  plugins: [],
}