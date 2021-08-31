module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
  corePlugins: [
    'alignContent',
    'alignItems',
    'backgroundColor',
    'display',
    'flex',
    'flexDirection',
    'flexGrow',
    'flexShrink',
    'flexWrap',
    'fontSize',
    'justifyContent',
    'justifyItems',
    'justifySelf',
    'margin',
    'maxWidth',
    'minWidth',
    'padding',
    'width',
  ]
}
