import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#eef3fb", 100: "#d8e3f5", 200: "#b3c7ea", 300: "#84a3da", 400: "#557ec6", 500: "#3560ab", 600: "#2f363f", 700: "#22272e", 800: "#171b21", 900: "#0e1116", 950: "#07090c" },
        accent: { 50: "#ecfdf5", 100: "#d1fae5", 500: "#10b981", 600: "#059669", 700: "#047857" },
        warn: { 500: "#f59e0b", 600: "#d97706" },
        danger: { 500: "#ef4444", 600: "#dc2626" }
      },
      fontFamily: { sans: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"] }
    }
  },
  plugins: []
};
export default config;
