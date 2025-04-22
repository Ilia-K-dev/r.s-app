module.exports = {
    content: ["./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#0EA5E9',
            600: '#0284C7',
          },
          success: {
            50: '#F0FDF4',
            500: '#22C55E',
          },
          warning: {
            50: '#FEFCE8',
            500: '#EAB308',
          },
        },
        fontFamily: {
          sans: ['Roboto', 'Arial', 'sans-serif'],
        },
        borderRadius: {
          DEFAULT: '0.5rem',
        },
      },
    },
    plugins: [],
  };