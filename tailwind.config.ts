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
        // Modern Islamic Luxury — Emerald & Warm Brown (V3.1 Master Spec)
        forest: {
          DEFAULT: "#355C46",
          dark: "#284635",
          light: "#437458",
        },
        olive: {
          DEFAULT: "#667B55",
          dark: "#526344",
          light: "#7c9568",
          50: "#f5f6f4",
          100: "#e8ebe6",
          200: "#d3d9ce",
          300: "#b5c1ae",
          400: "#92a288",
          500: "#667b55",
          600: "#57624d",
          700: "#464f3e",
          800: "#3a4134",
          900: "#31382d",
        },
        warmBrown: {
          DEFAULT: "#806044",
          dark: "#684d36",
          light: "#9c7757",
        },
        lightBrown: {
          DEFAULT: "#C6A47B",
          dark: "#b28e62",
          light: "#d5ba96",
        },
        cream: {
          DEFAULT: "#F7F4ED",
          dark: "#ede8db",
          light: "#faf9f5",
        },
        espresso: {
          DEFAULT: "#30291F",
          dark: "#241e17",
          light: "#42392c",
        },
        syariah: {
          bg: "#F7F4ED",
          bgSecondary: "#E7D8C5",
          brown: "#806044",
          espresso: "#30291F",
          forest: "#355C46",
          olive: "#667B55",
          lightBrown: "#C6A47B",
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
          900: "#30291f",
          950: "#241a13",
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
