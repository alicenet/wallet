module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    important: true,
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                teal: '#099AAD'
            },
            inset: {
                '1/3': '33.333333%',
                '1/8': '12.5%',
            },
            width: {
                '1/8': '12.5%',
                '7/8': '87.5%',
            },
            maxHeight: {
                '104': '31rem',
            },
            height: {
                '81': '81vh',
            },
            transitionProperty: {
                'left': 'left',
                'width': 'width',
                'height': 'height',
            },
            fontSize: {
                micro: '0.55rem'
            }
        },
    },
    variants: {
        extend: {
            margin: ['last', 'first'],
            rotate: ['group-hover'],
            visibility: ['group-hover'],
        },
        width: ["responsive", "hover", "focus"],
        height: ["responsive", "hover", "focus"],
    },
    plugins: [],
    corePlugins: [
        'animation',
        'alignContent',
        'alignItems',
        'alignSelf',
        'backgroundColor',
        'backgroundOpacity',
        'borderColor',
        'borderRadius',
        'borderStyle',
        'borderWidth',
        'boxShadow',
        'cursor',
        'display',
        'flex',
        'flexDirection',
        'flexShrink',
        'flexWrap',
        'flexGrow',
        'fontSize',
        'fontStyle',
        'fontWeight',
        'fontFamily',
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
        'minHeight',
        'minWidth',
        'outline',
        'overflow',
        'opacity',
        'overscrollBehavior',
        'padding',
        'position',
        'pointerEvents',
        'resize',
        'rotate',
        'textAlign',
        'textColor',
        'textDecoration',
        'textTransform',
        'transform',
        'transitionProperty',
        'transitionDuration',
        'width',
        'wordBreak',
        'zIndex',
    ]
}
