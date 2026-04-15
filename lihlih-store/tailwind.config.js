/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'surface': '#f5f6f7',
        'surface-container-low': '#eff1f2',
        'surface-container': '#e6e8ea',
        
        // Brand Colors
        'primary': '#ae2900',
        'primary-container': '#ff7855',
        'tertiary-container': '#ffebd9',
        
        // Text & Outlines
        'on-surface': '#2c2f30',
        'on-surface-variant': '#595c5d',
        'outline-variant': '#abadae',
      }
    },
  },
  plugins: [],
}