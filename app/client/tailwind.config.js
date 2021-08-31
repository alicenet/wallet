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
        'alignSelf',
        'backgroundColor',
        'display',
        'flex',
        'flexDirection',
        'flexGrow',
        'flexShrink',
        'flexWrap',
        'fontSize',
        'gap',
        'justifyContent',
        'justifyItems',
        'justifySelf',
        'margin',
        'maxWidth',
        'minWidth',
        'padding',
        'textAlign',
        'textColor',
        'textTransform',
        'width',
    ]
}
