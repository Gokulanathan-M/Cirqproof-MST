/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#050708',
          900: '#0a0d0f',
          800: '#111518',
        },
        accent: {
          emerald: '#34d399',
          cyan: '#67e8f9',
          amber: '#fbbf24',
          red: '#f87171',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(52,211,153,0.18), 0 20px 40px rgba(16,185,129,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slow-float': 'float 7s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
