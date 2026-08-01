/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./*.html', './src/*.page.html', './main.js'],
  theme: {
    extend: {
      colors: {
        'background': 'rgb(var(--bg) / <alpha-value>)',
        'surface': 'rgb(var(--surface) / <alpha-value>)',
        'surface-container': 'rgb(var(--surface-container) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--surface-container-low) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--surface-container-highest) / <alpha-value>)',
        'surface-variant': 'rgb(var(--surface-variant) / <alpha-value>)',
        'on-surface': 'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--on-surface-variant) / <alpha-value>)',
        'primary': 'rgb(var(--primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        'secondary': 'rgb(var(--secondary) / <alpha-value>)',
        'error': 'rgb(var(--error) / <alpha-value>)',
        'tertiary': 'rgb(var(--tertiary) / <alpha-value>)',
        'outline-variant': 'rgb(var(--outline-variant) / <alpha-value>)',
        'surface-tint': 'rgb(var(--primary) / <alpha-value>)',
        'slate-50': 'rgb(var(--slate-50) / <alpha-value>)',
        'slate-100': 'rgb(var(--slate-100) / <alpha-value>)',
        'slate-200': 'rgb(var(--slate-200) / <alpha-value>)',
        'slate-300': 'rgb(var(--slate-300) / <alpha-value>)',
        'slate-400': 'rgb(var(--slate-400) / <alpha-value>)',
        'slate-500': 'rgb(var(--slate-500) / <alpha-value>)',
        'slate-600': 'rgb(var(--slate-600) / <alpha-value>)',
        'slate-700': 'rgb(var(--slate-700) / <alpha-value>)',
        'slate-800': 'rgb(var(--slate-800) / <alpha-value>)',
        'slate-900': 'rgb(var(--slate-900) / <alpha-value>)',
        'slate-950': 'rgb(var(--slate-950) / <alpha-value>)',
        'orange-50': 'rgb(var(--orange-50) / <alpha-value>)',
        'orange-100': 'rgb(var(--orange-100) / <alpha-value>)',
        'orange-200': 'rgb(var(--orange-200) / <alpha-value>)',
        'orange-300': 'rgb(var(--orange-300) / <alpha-value>)',
        'orange-400': 'rgb(var(--orange-400) / <alpha-value>)',
        'orange-500': 'rgb(var(--orange-500) / <alpha-value>)',
        'orange-600': 'rgb(var(--orange-600) / <alpha-value>)',
        'orange-700': 'rgb(var(--orange-700) / <alpha-value>)',
        'purple-50': 'rgb(var(--purple-50) / <alpha-value>)',
        'purple-100': 'rgb(var(--purple-100) / <alpha-value>)',
        'purple-200': 'rgb(var(--purple-200) / <alpha-value>)',
        'purple-600': 'rgb(var(--purple-600) / <alpha-value>)',
        'emerald-50': 'rgb(var(--emerald-50) / <alpha-value>)',
        'emerald-100': 'rgb(var(--emerald-100) / <alpha-value>)',
        'emerald-200': 'rgb(var(--emerald-200) / <alpha-value>)',
        'emerald-600': 'rgb(var(--emerald-600) / <alpha-value>)',
        'amber-500': 'rgb(var(--amber-500) / <alpha-value>)'
      },
      fontFamily: {
        'headline-lg': ['Ubuntu Mono'],
        'body-lg': ['Ubuntu'],
        'body-md': ['Ubuntu'],
        'display-lg': ['Ubuntu Mono'],
        'code-sm': ['Ubuntu Mono'],
        'label-md': ['Ubuntu Mono']
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
        'gutter': '16px',
        'margin-desktop': '64px'
      }
    }
  }
};
