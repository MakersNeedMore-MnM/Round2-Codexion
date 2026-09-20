/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#08111D',
          900: '#10243E', // Primary deep navy per design direction
          850: '#152C4B',
          800: '#1B375C',
          700: '#274974',
        },
        steel: {
          700: '#2D4559',
          600: '#3E5C76', // Steel blue primary per design direction
          500: '#527593',
          400: '#7492AB',
          300: '#A1B7C9',
          200: '#CBD7E3',
          100: '#E4ECF2',
          50: '#F0F4F8',
        },
        amber: {
          400: '#FBBF24',
          500: '#F2A104', // Single accent/alert color per design direction
          600: '#D98200',
          700: '#B46500',
        },
        canvas: {
          subtle: '#ECEEF2',
          DEFAULT: '#F4F6F8', // Off-white background
          pure: '#FFFFFF',
          card: '#FFFFFF',
        },
        ink: {
          900: '#0B1320', // Near-black ink text
          800: '#16202C',
          700: '#243242',
          500: '#536579',
          400: '#7E91A6',
          300: '#B2C0D0',
        },
        status: {
          green: '#10B981', // Verified
          greenDark: '#059669',
          red: '#EF4444',   // Blocked
          redDark: '#DC2626',
        }
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Cambria', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', '"Courier Prime"', 'monospace'],
      },
      boxShadow: {
        'control': '0 1px 3px rgba(16, 36, 62, 0.08), 0 1px 2px rgba(16, 36, 62, 0.04)',
        'panel': '0 4px 12px rgba(16, 36, 62, 0.06), 0 1px 3px rgba(16, 36, 62, 0.08)',
        'instrument': 'inset 0 1px 2px rgba(0, 0, 0, 0.15)',
        'perimeter': '0 0 0 1px rgba(242, 161, 4, 0.4), 0 0 12px rgba(242, 161, 4, 0.15)',
      }
    },
  },
  plugins: [],
}
