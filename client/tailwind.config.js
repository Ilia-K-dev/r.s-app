module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ addVariant }) {
      addVariant('rtl', ['[dir="rtl"] &']);
      addVariant('ltr', ['[dir="ltr"] &']);
    }),
  ],
  // Enable RTL support
  variants: {
    extend: {
      margin: ['rtl'],
      padding: ['rtl'],
      borderRadius: ['rtl'],
      textAlign: ['rtl'],
    },
  },
};
