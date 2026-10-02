/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // The 2026 rebuild is a single committed light design. No dark variant:
  // the panels carry dark text on paper everywhere, which removes the whole
  // class of white-on-white legibility bugs the themed version suffered from.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper:  '#F7F9FB',
        panel:  '#FFFFFF',
        sunk:   '#EDF1F5',
        ink: {
          DEFAULT: '#0F1A20',
          2: '#44575F',
          3: '#6F838D',
        },
        line: {
          DEFAULT: '#DCE4EA',
          soft:    '#E9EEF2',
        },
        accent: {
          DEFAULT: '#0E6B7A',
          deep:    '#0A4F5A',
          mid:     '#128C9E',
          soft:    '#E4F0F2',
        },
        good: '#0F766E',
        warn: '#A8620F',
        crit: '#AE2A22',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans:    ['Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10.5px', { lineHeight: '1.3' }],
      },
      maxWidth: {
        shell: '1200px',
        read:  '68ch',
      },
      borderRadius: {
        panel: '10px',
      },
    },
  },
  plugins: [],
}
