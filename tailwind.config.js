/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF7F2',
          100: '#F3EDE1',
          200: '#E6D7BE',
          300: '#D6BE97',
          400: '#C5A472',
          500: '#B68D52', // Accent Luxury Gold
          600: '#9B7440',
          700: '#7B5A33',
          800: '#61462A',
          900: '#4E3823',
        },
        navy: {
          950: '#060B12',
          900: '#0B1320',
          850: '#0F1A2B',
          800: '#15233B',
          700: '#1E3252',
          600: '#2A436C',
        },
        pearl: {
          50: '#FAFAFB',
          100: '#F4F5F7',
          200: '#E8EBEF',
          300: '#D6DCE3',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(11, 19, 32, 0.08), 0 0 1px 1px rgba(182, 141, 82, 0.15)',
        'luxury-hover': '0 30px 60px -12px rgba(182, 141, 82, 0.2), 0 0 1px 1px rgba(182, 141, 82, 0.35)',
        'glow-gold': '0 0 25px rgba(182, 141, 82, 0.35)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.98)' },
        }
      }
    },
  },
  plugins: [],
}
