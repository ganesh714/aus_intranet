/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-orange": "#F97316", // Orange
        "custom-blue": "#1E3A8A",   // Blue
        "custom-light-gray": "#F4F7FA",
        "custom-near-black": "#1A1A1A",
        "custom-dark-gray": "#555555",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}