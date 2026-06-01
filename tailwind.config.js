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
        // App shell backgrounds — deep dark navy
        app: {
          bg:       '#030810',
          panel:    '#040c1a',
          card:     '#050e1c',
          elevated: '#07111e',
          input:    '#030810',
          hover:    '#071426',
          selected: '#0c2848',
          toolbar:  '#0a1c34',
          titlebar: '#0c2040',
          overlay:  'rgba(0,0,0,0.82)',
        },
        // CAD text tokens
        cad: {
          text:  '#b8ccd8',
          dim:   '#5878a0',
          muted: '#2e4258',
          data:  '#4890c0',
        },
        // CAD borders
        border: {
          faint:  '#0a1a2c',
          subtle: '#0d2038',
          base:   '#14304a',
          strong: '#1a3c58',
          accent: '#0d4a80',
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
