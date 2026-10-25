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
        brand: {
          50: "#fdf8f4",
          100: "#f8ede2",
          200: "#f1dac4",
          300: "#e6c19f",
          400: "#d7a075",
          500: "#ca8454",
          600: "#bc6f45",
          700: "#9c5737",
          800: "#7e4731",
          900: "#663b2a",
          950: "#381d14",
        },
        stone: {
          850: "#22201e",
          925: "#141312",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
