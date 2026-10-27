import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        risk: {
          high: {
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#b91c1c',
            badge: '#991b1b',
          },
          needs: {
            bg: '#fffbeb',
            border: '#fde68a',
            text: '#b45309',
            badge: '#92400e',
          },
          none: {
            bg: '#ecfdf5',
            border: '#a7f3d0',
            text: '#047857',
            badge: '#065f46',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
