/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070A12',
          900: '#0B1020',
        },
        uchicago: {
          maroon: '#800000',
          maroonLight: '#A11B1F',
          gray: '#767676',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 18px 60px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}

