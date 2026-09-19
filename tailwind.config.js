/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logotipdan olingan aniq ko'k gradient palitra
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#b8e2ff',
          300: '#84cfff',
          400: '#22b8fe',   // logotipdagi och (yorqin) ko'k
          500: '#0a9bf5',
          600: '#0a5be8',   // logotipdagi asosiy ko'k
          700: '#0a46b8',
          800: '#0e3a8f',
          900: '#0f316f',
        },
        // Fon uchun chuqur, ko'kimtir-qora "surface" rang skalasi (oddiy kulrangdan farqli)
        surface: {
          50: '#f5f8fc',
          100: '#eaf0f9',
          800: '#0d1220',
          900: '#080b14',
          950: '#04060b',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0a5be8 0%, #22b8fe 100%)',
        'brand-gradient-radial': 'radial-gradient(circle, #22b8fe 0%, #0a5be8 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(34, 184, 254, 0.5)',
        'glow-sm': '0 0 20px -5px rgba(34, 184, 254, 0.4)',
        'glow-lg': '0 0 80px -15px rgba(10, 91, 232, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
