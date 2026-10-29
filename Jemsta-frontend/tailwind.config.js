/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            primary: "#1E234B",
            "primary-600": "#485194",
            primaryGreen: "#205B28",
            lightGreen: "#499448"
      },
    },
  },
  plugins: [],
}