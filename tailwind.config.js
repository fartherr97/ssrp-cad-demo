/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        ui:   ['Ubuntu', 'Segoe UI', 'Tahoma', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', '"Lucida Console"', 'Consolas', 'monospace'],
      },
      colors: {
        // App shell backgrounds — refined navy / slate gradient theme
        app: {
          bg:       '#0b1424',
          panel:    '#101d31',
          card:     '#13233b',
          elevated: '#192f4d',
          input:    '#0d1a2c',
          hover:    'rgba(255,255,255,0.04)',
          selected: '#1c3a5e',
          toolbar:  '#0e1c30',
          titlebar: '#0e1c30',
          overlay:  'rgba(3,8,18,0.78)',
        },
        // CAD text tokens
        cad: {
          text:  '#dde6f1',
          dim:   '#93a4bd',
          muted: '#5d6f88',
          data:  '#5aa0e8',
        },
        // CAD borders — soft translucent strokes
        border: {
          faint:  'rgba(255,255,255,0.05)',
          subtle: 'rgba(255,255,255,0.07)',
          base:   'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.14)',
          accent: 'rgba(61,130,240,0.55)',
        },
        // Primary accent (brand blue)
        brand: {
          DEFAULT: '#3d82f0',
          bright:  '#5a97f5',
          dim:     '#1d3a66',
        },
        // Accents
        gold: {
          DEFAULT: '#a07808',
          bright:  '#c09010',
          dim:     '#0e0a00',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.15s ease-out',
        'slide-up':       'slideUp 0.22s cubic-bezier(0.4,0,0.2,1) both',
        'pop-in':         'popIn 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'modal-pop':      'modalPop 0.22s cubic-bezier(0.16,1,0.3,1)',
        'page-enter':     'pageEnter 0.32s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':        'fadeIn 0.15s ease-out',
        'pulse-red':      'pulseRed 1.5s ease-in-out infinite',
        'blink':          'blink 1s step-end infinite',
        'float-y':        'floatY 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
