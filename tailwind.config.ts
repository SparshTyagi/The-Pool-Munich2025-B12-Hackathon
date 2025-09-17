import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49"
        },
        // Champagne/warm neutrals for sophistication
        champagne: {
          50: "#fefdfb",
          100: "#fef9f1",
          200: "#fdf2e1",
          300: "#fbe8c8",
          400: "#f7d7a3",
          500: "#f2c078",
          600: "#e8a547",
          700: "#d4882a",
          800: "#b06d1f",
          900: "#8f571c"
        },
        // Secondary sophisticated colors
        secondary: {
          50: "#faf9fc",
          100: "#f3f1f8",
          200: "#e8e4f0",
          300: "#d6cfe3",
          400: "#bcb0d1",
          500: "#9d8bb8",
          600: "#826ba0",
          700: "#6b5688",
          800: "#5a4a70",
          900: "#4a3f5c"
        },
        // Refined accent colors
        accent: {
          50: "#fef8f0",
          100: "#fdeedd",
          200: "#fad9b5",
          300: "#f6bf82",
          400: "#f09a4d",
          500: "#ec7c2a",
          600: "#dd611f",
          700: "#b8471c",
          800: "#93391e",
          900: "#76301c"
        },
        // Neutral colors for text and backgrounds
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a"
        },
        // Success, warning, error states
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d"
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f"
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d"
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
        medium: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        strong: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        glow: "0 0 20px rgba(14, 165, 233, 0.15)",
        'inner-subtle': "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)"
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    }
  },
  plugins: []
}
export default config
