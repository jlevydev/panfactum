/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: [{
      business: {
        primary: "#000D7D",
        secondary: "#818181",
        accent: "#0e1726",
        "base-100": "#e8e8e8",
        neutral: "#dfe0ea"
      },
    }]
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('@tailwindcss/forms'),
    require("daisyui")
  ],
}
