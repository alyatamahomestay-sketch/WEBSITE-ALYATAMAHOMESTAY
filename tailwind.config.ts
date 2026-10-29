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
        // Palet Acuan Resmi ALYATAMA HOMESTAY
        beige: {
          DEFAULT: "#F6F0E7",
          light: "#FAF7F2",
          dark: "#E7D8C5",
        },
        espresso: {
          DEFAULT: "#392B21",
          dark: "#2A1F17",
          light: "#4D3B2E",
          900: "#221912",
        },
        brown: {
          DEFAULT: "#806044",
          dark: "#684D36",
          light: "#9C7757",
        },
        olive: {
          DEFAULT: "#65715A",
          dark: "#525C48",
          light: "#7B8A6E",
        },
        gold: {
          DEFAULT: "#C9A84C",
          dark: "#B39239",
          light: "#D8BC6B",
        },
        // Backward compatibility mappings
        warmBrown: {
          DEFAULT: "#806044",
          dark: "#684D36",
          light: "#9C7757",
        },
        lightBrown: {
          DEFAULT: "#C6A47B",
          dark: "#B28E62",
          light: "#D5BA96",
        },
        cream: {
          DEFAULT: "#F6F0E7",
          dark: "#E7D8C5",
          light: "#FAF7F2",
        },
        forest: {
          DEFAULT: "#355C46",
          dark: "#284635",
          light: "#437458",
        },
        syariah: {
          bg: "#F6F0E7",
          bgSecondary: "#E7D8C5",
          brown: "#806044",
          espresso: "#392B21",
          forest: "#355C46",
          olive: "#65715A",
          gold: "#C9A84C",
          surface: "#FFFFFF",
          muted: "#756A5F",
          border: "#E5DCD0",
        },
        brand: {
          50: "#FAF7F2",
          100: "#F6F0E7",
          200: "#E7D8C5",
          300: "#CFBBA2",
          400: "#A98B6F",
          500: "#806044",
          600: "#6E5239",
          700: "#59422E",
          800: "#493526",
          900: "#392B21",
          950: "#221912",
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
