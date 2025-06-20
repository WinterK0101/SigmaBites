/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "baloo-regular": ['Baloo-Regular', 'sans-serif'],
        "lexend-bold": ['Lexend-Bold', 'sans-serif'],
        "lexend-regular": ['Lexend-Regular', 'sans-serif'],
        "lexend-variable": ['Lexend-Variable', 'sans-serif'],
      },
      colors: {
        offwhite: "#fafafa",
        accent: "#FE724C",
        grey: "#D9D9D9"
      }
    },
  },
  plugins: [],
}
