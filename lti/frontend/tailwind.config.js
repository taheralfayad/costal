/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    plugins: [require('@tailwindcss/typography')],
    theme: {
      extend: {
        fontFamily: {
          serif: ['Georgia', 'serif'],
          monospace: ['Courier New', 'monospace'],
        },
        fontSize: {
          'extra-small': '0.75rem', // For ql-size-small
          'extra-large': '1.5rem',  // For ql-size-large
        },
      },
    },
  }
  