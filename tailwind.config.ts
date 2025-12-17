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
      animation: {
        'shake': 'shake 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'pulse-success': 'pulseSuccess 0.4s ease-out',
        'float-playful': 'floatPlayful 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSuccess: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        floatPlayful: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
