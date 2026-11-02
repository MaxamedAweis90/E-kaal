/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#000100",
          alt: "#0C1610",
        },
        surface: {
          DEFAULT: "#111C15",
          2: "#16241B",
        },
        border: "#213328",
        primary: {
          DEFAULT: "#1fbf55",
          600: "#17a648",
          700: "#05a237",
          soft: "rgba(31, 191, 85, 0.13)",
        },
        accent: "#4ade80",
        text: {
          DEFAULT: "#E8F3EB",
          2: "#C3D3C8",
        },
        muted: "#8FA396",
        in: "#05a237",
        out: "#f87171",
        warning: "#f59e0b",
      },
      borderRadius: {
        badge: "9px",
        btn: "12px",
        card: "16px",
        modal: "20px",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
