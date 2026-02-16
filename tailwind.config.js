/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Palette - "Cosmic Blue"
        // A richer, slightly more electric blue that stands out against dark backgrounds
        primary: {
          DEFAULT: '#2563EB',    // Royal Blue (Vibrant)
          dark: '#1E40AF',       // Deep Blue
          medium: '#3B82F6',     // Bright Blue
          light: '#60A5FA',      // Sky Blue
          lighter: '#93C5FD',    // Ice Blue
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',        // Standard Tailwind Blue 500
          600: '#2563EB',        // Standard Tailwind Blue 600
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Accent Palette - "Electric Teal"
        // Higher contrast teal for call-to-actions
        accent: {
          DEFAULT: '#0D9488',    // Teal 600
          dark: '#0F766E',       // Teal 700
          medium: '#14B8A6',     // Teal 500
          light: '#2DD4BF',      // Teal 400
          lighter: '#99F6E4',    // Teal 200
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Dark Mode - "Deep Space"
        // A sophisticated near-black palette for maximum depth without blue tint
        dark: {
          DEFAULT: '#070710',
          surface: '#0E0E1A',
          elevated: '#141428',
          border: '#252548',
          accent: '#0B0B16',
        },
        // Light Mode - "Clean Paper"
        light: {
          DEFAULT: '#fefffbff',
          gray: '#F8FAFC',       // Slate 50
          dark: '#F1F5F9',       // Slate 100
        },
        // Success - Emerald
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        // Warning - Amber
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        // Error - Rose
        error: {
          DEFAULT: '#E11D48',
          light: '#F43F5E',
          dark: '#BE123C',
        },
        // Text Colors
        text: {
          primary: '#0F172A',    // Slate 900
          secondary: '#334155',  // Slate 700
          light: '#64748B',      // Slate 500
          white: '#FFFFFF',
          'primary-dark': '#F8FAFC', // Slate 50
          'secondary-dark': '#CBD5E1', // Slate 300
          'light-dark': '#94A3B8',   // Slate 400
        },
        // Grays - Slate Scale (Cooler gray for tech feel)
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        // Modern enterprise fonts
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        heading: [
          'Outfit',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        // Custom shadows for the app
        'glow': '0 0 8px rgba(255, 255, 255, 0.5)',
        'soft': '0 10px 25px -3px rgba(0, 0, 0, 0.05)',
        'card': '0 15px 35px rgba(0, 0, 0, 0.03)',
        'elevation': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'dark-soft': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 12px 28px -10px rgba(0, 0, 0, 0.75), 0 0 24px rgba(20, 184, 166, 0.05)',
        'dark-card': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -14px rgba(0, 0, 0, 0.8), 0 0 36px rgba(167, 139, 250, 0.06)',
        'dark-elevation': '0 0 0 1px rgba(255, 255, 255, 0.07), 0 30px 70px -24px rgba(0, 0, 0, 0.85), 0 0 50px rgba(20, 184, 166, 0.07)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slow-spin': 'spin 20s linear infinite',
        'hue': 'hue 10s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        hue: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      }
    },
  },
  plugins: [],
}
