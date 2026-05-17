module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teqa: {
          bg: 'var(--teqa-bg)',
          surface: 'var(--teqa-surface)',
          surface2: 'var(--teqa-surface2)',
          surface3: 'var(--teqa-surface3)',
          sidebar: 'var(--teqa-sidebar)',
          border: 'var(--teqa-border)',
          text: 'var(--teqa-text)',
          muted: 'var(--teqa-muted)',
          hint: 'var(--teqa-hint)',
          green: 'var(--teqa-green)',
          blue: 'var(--teqa-blue)',
          red: 'var(--teqa-red)',
        },
        primary: {
          50: 'var(--teqa-green-dim)',
          100: 'var(--teqa-green-dim)',
          200: 'rgba(34, 197, 94, 0.25)',
          300: 'rgba(34, 197, 94, 0.45)',
          400: 'var(--teqa-green)',
          500: 'var(--teqa-green)',
          600: 'var(--teqa-green)',
          700: 'var(--teqa-green-hover)',
          800: 'var(--teqa-green-hover)',
        },
        ink: {
          50: 'var(--teqa-bg)',
          100: 'var(--teqa-surface2)',
          200: 'var(--teqa-border)',
          500: 'var(--teqa-muted)',
          700: 'var(--teqa-text)',
          900: 'var(--teqa-text)',
        },
        accent: 'var(--teqa-green)',
        success: {
          50: 'var(--teqa-green-dim)',
          100: 'var(--teqa-green-dim)',
          200: 'rgba(34, 197, 94, 0.25)',
          300: 'rgba(34, 197, 94, 0.35)',
          400: 'var(--teqa-green)',
          500: 'var(--teqa-green)',
          600: 'var(--teqa-green-hover)',
          700: 'var(--teqa-green-hover)',
          DEFAULT: 'var(--teqa-green)',
        },
        warning: {
          50: 'rgba(245, 158, 11, 0.12)',
          100: 'rgba(245, 158, 11, 0.12)',
          200: 'rgba(245, 158, 11, 0.22)',
          300: 'rgba(245, 158, 11, 0.32)',
          400: 'var(--teqa-warning)',
          500: 'var(--teqa-warning)',
          600: 'var(--teqa-warning)',
          700: 'var(--teqa-warning)',
          DEFAULT: 'var(--teqa-warning)',
        },
        danger: {
          50: 'var(--teqa-red-dim)',
          100: 'var(--teqa-red-dim)',
          200: 'rgba(239, 68, 68, 0.25)',
          300: 'rgba(239, 68, 68, 0.35)',
          400: 'var(--teqa-red)',
          500: 'var(--teqa-red)',
          600: 'var(--teqa-red)',
          700: 'var(--teqa-red)',
          DEFAULT: 'var(--teqa-red)',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '8px',
        '2xl': '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.06)',
        panel: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'slide-up':  'slideUp 0.3s ease both',
        'fade-in':   'fadeIn 0.2s ease both',
        'shimmer':   'shimmer 1.4s ease infinite',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
   plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
            width: '0',
            height: '0',
          }
        }
      })
    }
  ]
}
