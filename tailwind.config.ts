import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm pet-friendly primary color (amber/orange)
        primary: {
          50: '#fff8ed',
          100: '#ffefda',
          200: '#ffdbb4',
          300: '#ffc184',
          400: '#ff9d52',
          500: '#ff7e29',
          600: '#f06312',
          700: '#c74a0e',
          800: '#9e3b14',
          900: '#7f3314',
        },
        // Warm accent color (coral/rose)
        accent: {
          50: '#fff5f3',
          100: '#ffe9e5',
          200: '#ffd7cf',
          300: '#ffb9ab',
          400: '#ff8f79',
          500: '#f96a4d',
          600: '#e64d2e',
          700: '#c13d21',
          800: '#a0361f',
          900: '#843320',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
