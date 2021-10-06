module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    important: true,
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            inset: {
                '1/3': '33.333333%',
                '1/8': '12.5%',
            },
            width: {
                '1/8': '12.5%',
            },
            maxHeight: {
                '104': '31rem',
            },
            transitionProperty: {
                'left': 'left',
                'width': 'width',
            },
        },
    },
    variants: {
        extend: {
            margin: ['last'],
        },
    },
    plugins: [],
    corePlugins: [
        'alignContent',
        'alignItems',
        'alignSelf',
        'backgroundColor',
        'borderColor',
        'borderRadius',
        'borderStyle',
        'borderWidth',
        'cursor',
        'display',
        'flex',
        'flexDirection',
        'flexShrink',
        'flexWrap',
        'fontSize',
        'fontStyle',
        'fontWeight',
        'gap',
        'height',
        'inset',
        'justifyContent',
        'justifyItems',
        'justifySelf',
        'inset',
        'margin',
        'maxHeight',
        'maxWidth',
        'minWidth',
        'outline',
        'overflow',
        'overscrollBehavior',
        'padding',
        'position',
        'pointerEvents',
        'resize',
        'rotate',
        'textAlign',
        'textColor',
        'textTransform',
        'transform',
        'transitionProperty',
        'transitionDuration',
        'width',
        'zIndex',
    ]
}
