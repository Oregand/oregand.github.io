/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./blog/**/*.html",
    "./js/*.js"
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
    },
  },
  plugins: [],
}