/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./blog/**/*.html",
    "./js/*.js",
    "./_layouts/**/*.html",
    "./_includes/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a66c2',
        secondary: '#283e4a',
        textColor: '#333',
        lightGray: '#f3f2ef',
        borderColor: '#e0e0e0',
        highlight: '#0073b1',
        github: '#2b3137',
        githubHover: '#22262c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              fontFamily: 'Fira Code, monospace',
              fontWeight: '400',
              backgroundColor: '#f1f5f9',
              borderRadius: '0.25rem',
              padding: '0.2em 0.4em',
              fontSize: '0.875em',
            },
            pre: {
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              fontSize: '0.875em',
              lineHeight: '1.7',
              fontFamily: 'Fira Code, monospace',
            },
          },
        },
        dark: {
          css: {
            color: '#f8fafc',
            a: { color: '#38bdf8' },
            strong: { color: '#f1f5f9' },
            h1: { color: '#f1f5f9' },
            h2: { color: '#f1f5f9' },
            h3: { color: '#f1f5f9' },
            h4: { color: '#f1f5f9' },
            h5: { color: '#f1f5f9' },
            h6: { color: '#f1f5f9' },
            code: { color: '#f43f5e', backgroundColor: '#1e293b' },
            'pre code': { color: '#f1f5f9', backgroundColor: 'transparent' },
            pre: { backgroundColor: '#0f172a', color: '#f1f5f9' },
            blockquote: { color: '#cbd5e1' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}