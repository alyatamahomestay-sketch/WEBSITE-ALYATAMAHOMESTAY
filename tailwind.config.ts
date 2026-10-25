import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Islamic Luxury Hospitality Design Tokens
        syariah: {
          bg: "#F6F0E7",
          bgSecondary: "#E7D8C5",
          brown: "#806044",
          espresso: "#392B21",
          olive: "#65715A",
          surface: "#FFFFFF",
          muted: "#756A5F",
          border: "#E5DCD0",
        },
        brand: {
          50: "#faf6f0",
          100: "#f6f0e7",
          200: "#e7d8c5",
          300: "#cfbba2",
          400: "#a98b6f",
          500: "#806044",
          600: "#6e5239",
          700: "#59422e",
          800: "#493526",
          900: "#392b21",
          950: "#241a13",
        },
        olive: {
          50: "#f5f6f4",
          100: "#e8ebe6",
          200: "#d3d9ce",
          300: "#b5c1ae",
          400: "#92a288",
          500: "#65715a",
          600: "#57624d",
          700: "#464f3e",
          800: "#3a4134",
          900: "#31382d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
