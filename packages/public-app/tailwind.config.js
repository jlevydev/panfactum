/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#root',
  corePlugins: {
    preflight: false
  },
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary: "#000D7D",
      secondary: "#818181",
      accent: "#0e1726",
      "base-100": "#f8f8f8",
      "base-300": "#d3d3d3",
      neutral: "#dfe0ea",
      black: "#000000",
      white: "#ffffff",
      red: "#c62f24"
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
