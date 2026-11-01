/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          alt: "var(--bg-alt)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          soft: "var(--primary-soft)",
        },
        accent: "var(--accent)",
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
        },
        muted: "var(--muted)",
        in: "var(--in)",
        out: "var(--out)",
        warning: "var(--warning)",
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
