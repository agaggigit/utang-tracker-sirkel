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
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        'surface-muted': 'var(--color-surface-muted)',
        border: 'var(--color-border)',
        'text-main': 'var(--color-text-main)',
        'text-muted': 'var(--color-text-muted)',
        error: 'var(--color-error)',
        'error-hover': 'var(--color-error-hover)',
        'error-bg': 'var(--color-error-bg)',
        'error-border': 'var(--color-error-border)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
        'success-text': 'var(--color-success-text)',
      }
    },
  },
  plugins: [],
}

