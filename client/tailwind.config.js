/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "snap-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "snap-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "snap-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "snap-float": "snap-float 8s ease-in-out infinite",
        "snap-spin": "snap-spin 0.8s linear infinite",
        "snap-in": "snap-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
