/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F2937",
        secondary: "#111827",
        "off-white": "#f7f7f7",
        accent: "#5d8c72"
      },
      spacing: {
        "header-height-lg": "4rem",
        "sidebar-width-lg": "16rem",
        "sidebar-width-sm": "3.5rem",
        "content-width-lg": "calc(100vw - 16rem - (100vw - 100%))", // See https://stackoverflow.com/questions/33606565/is-it-possible-to-calculate-the-viewport-width-vw-without-scrollbar
        "content-width-sm": "calc(100vw - 3.5rem - (100vw - 100%))",
        "content-2col-width-lg": "calc((100vw - 16rem - (100vw - 100%)) * 2 / 3)"
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
