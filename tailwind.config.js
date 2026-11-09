/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#080808",
          surface1: "#0f0f0f",
          surface2: "#151515",
          surface3: "#1c1c1c",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.2)"
        },
        brand: "#e50914",
        star: "#ffc107",
        cert: {
          u: "#0d9f4c",
          pg: "#f6b400",
          12: "#f2701f",
          15: "#e4177c",
          18: "#d4172a"
        }
      },
      aspectRatio: {
        poster: "2 / 3",
        still: "16 / 9"
      },
      boxShadow: {
        poster: "0 16px 36px -12px rgba(0, 0, 0, 0.85)",
        glow: "0 12px 40px -10px rgba(255, 255, 255, 0.12)",
        modal: "0 24px 60px -15px rgba(0, 0, 0, 0.95)"
      }
    },
  },
  plugins: [],
};
