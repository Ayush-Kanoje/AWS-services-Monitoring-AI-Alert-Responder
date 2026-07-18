/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        canvas: {
          DEFAULT: '#F5F7FA',
          dark: '#0A0F1A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#121A2A',
        },
        raised: {
          DEFAULT: '#FFFFFF',
          dark: '#161F33',
        },
        border: {
          DEFAULT: '#DDE3ED',
          dark: '#24314A',
        },
        ink: {
          DEFAULT: '#101826',
          dark: '#E7ECF4',
        },
        muted: {
          DEFAULT: '#5C6B85',
          dark: '#8B98B3',
        },
        // Signal palette (status + accents)
        signal: {
          teal: '#0F9C8E',
          'teal-dark': '#4FD1C5',
          blue: '#3A6FE0',
          'blue-dark': '#5B8DEF',
          amber: '#B8790B',
          'amber-dark': '#F2B84B',
          red: '#D6473D',
          'red-dark': '#F0645A',
          green: '#158F5F',
          'green-dark': '#3ED598',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 38, 0.04), 0 1px 12px rgba(16, 24, 38, 0.04)',
        'card-dark': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 12px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        },
        flowDotH: {
          '0%': { left: '0%', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { left: '100%', opacity: 0 },
        },
        flowDotV: {
          '0%': { top: '0%', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { top: '100%', opacity: 0 },
        },
      },
      animation: {
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        flowDotH: 'flowDotH 2.4s linear infinite',
        flowDotV: 'flowDotV 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
