/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stripe-inspired palette
        canvas: '#F8FAFC',
        obsidian: '#0A2540',
        indigo: {
          brand: '#635BFF',
          light: '#7B74FF',
          dark: '#4B44CC',
        },
        coral: '#FF5E5B',
        amber: { brand: '#F59E0B' },
        teal: { brand: '#00D4B6' },
        slate: {
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'mesh-gradient': 'meshGradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        meshGradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
};

