/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'text-main': 'rgb(var(--color-text-main) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'error-hover': 'rgb(var(--color-error-hover) / <alpha-value>)',
        'error-bg': 'rgb(var(--color-error-bg) / <alpha-value>)',
        'error-border': 'rgb(var(--color-error-border) / <alpha-value>)',
        'success-bg': 'rgb(var(--color-success-bg) / <alpha-value>)',
        'success-border': 'rgb(var(--color-success-border) / <alpha-value>)',
        'success-text': 'rgb(var(--color-success-text) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}

