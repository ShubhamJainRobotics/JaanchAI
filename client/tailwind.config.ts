import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
        },
        foreground: 'var(--color-foreground)',
        muted: {
          DEFAULT: 'var(--color-surface-raised)',
          foreground: 'var(--color-muted-foreground)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
        },
        ring: 'var(--color-ring)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          pressed: 'var(--color-primary-pressed)',
          foreground: 'var(--color-primary-foreground)',
          tint: 'var(--color-primary-tint)',
          'tint-border': 'var(--color-primary-tint-border)',
        },
        highlight: 'var(--color-highlight)',
        'gradient-accent-from': 'var(--color-gradient-accent-from)',
        'gradient-accent-to': 'var(--color-gradient-accent-to)',
        link: {
          DEFAULT: 'var(--color-link)',
          hover: 'var(--color-link-hover)',
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          hover: 'var(--color-destructive-hover)',
          foreground: 'var(--color-destructive-foreground)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',

        status: {
          verified: {
            bg: 'var(--status-verified-bg)',
            border: 'var(--status-verified-border)',
            fg: 'var(--status-verified-fg)',
            icon: 'var(--status-verified-icon)',
          },
          likely: {
            bg: 'var(--status-likely-bg)',
            border: 'var(--status-likely-border)',
            fg: 'var(--status-likely-fg)',
            icon: 'var(--status-likely-icon)',
          },
          review: {
            bg: 'var(--status-review-bg)',
            border: 'var(--status-review-border)',
            fg: 'var(--status-review-fg)',
            icon: 'var(--status-review-icon)',
          },
          'high-risk': {
            bg: 'var(--status-high-risk-bg)',
            border: 'var(--status-high-risk-border)',
            fg: 'var(--status-high-risk-fg)',
            icon: 'var(--status-high-risk-icon)',
          },
          'confirmed-scam': {
            bg: 'var(--status-confirmed-scam-bg)',
            border: 'var(--status-confirmed-scam-border)',
            fg: 'var(--status-confirmed-scam-fg)',
            icon: 'var(--status-confirmed-scam-icon)',
          },
        },

        outcome: {
          pass: {
            bg: 'var(--outcome-pass-bg)',
            border: 'var(--outcome-pass-border)',
            fg: 'var(--outcome-pass-fg)',
          },
          fail: {
            bg: 'var(--outcome-fail-bg)',
            border: 'var(--outcome-fail-border)',
            fg: 'var(--outcome-fail-fg)',
          },
          unknown: {
            bg: 'var(--outcome-unknown-bg)',
            border: 'var(--outcome-unknown-border)',
            fg: 'var(--outcome-unknown-fg)',
          },
          'none-found': {
            bg: 'var(--outcome-none-found-bg)',
            border: 'var(--outcome-none-found-border)',
            fg: 'var(--outcome-none-found-fg)',
          },
          'not-run': {
            bg: 'var(--outcome-not-run-bg)',
            border: 'var(--outcome-not-run-border)',
            fg: 'var(--outcome-not-run-fg)',
          },
          'user-attested': {
            bg: 'var(--outcome-user-attested-bg)',
            border: 'var(--outcome-user-attested-border)',
            fg: 'var(--outcome-user-attested-fg)',
          },
        },

        severity: {
          critical: {
            bg: 'var(--severity-critical-bg)',
            border: 'var(--severity-critical-border)',
            fg: 'var(--severity-critical-fg)',
          },
          high: {
            bg: 'var(--severity-high-bg)',
            border: 'var(--severity-high-border)',
            fg: 'var(--severity-high-fg)',
          },
          medium: {
            bg: 'var(--severity-medium-bg)',
            border: 'var(--severity-medium-border)',
            fg: 'var(--severity-medium-fg)',
          },
          low: {
            bg: 'var(--severity-low-bg)',
            border: 'var(--severity-low-border)',
            fg: 'var(--severity-low-fg)',
          },
          info: {
            bg: 'var(--severity-info-bg)',
            border: 'var(--severity-info-border)',
            fg: 'var(--severity-info-fg)',
          },
        },

        /* Preserve existing brand palette for backward compatibility during migration */
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
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
