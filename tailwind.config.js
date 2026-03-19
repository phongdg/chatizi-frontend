/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { 600: '#4F46E5', 500: '#6366F1', 700: '#4338CA' },
        cyan: { 400: '#22D3EE', 500: '#06B6D4' },
        surface: { DEFAULT: '#0F0F13', 1: '#16161D', 2: '#1C1C26', 3: '#23232F' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
