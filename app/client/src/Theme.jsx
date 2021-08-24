/* istanbul ignore file */
import { createTheme } from '@material-ui/core/styles';

export const CONTAINER_MAX_WIDTH = 1184; // px

export const pageIsXs = (theme) => theme.breakpoints.down('sm');

export const COLORS = {
  lightBlue: '#D4E1EF',
  paleLightBlue: '#EFF3F8',
  blue: '#123468',
  darkBlue: '#041834',
  blueItem: '#5F7AAB',
  transparentBlue: 'rgb(18,52,104,0.85)',
  lilac: '#B198C7',
  darkLilac: '#9C80B4',
  light: '#E9F0F7',
  white: '#FFFFFF',
  lightRed: '#F58281',
  red: '#D14157',
  lightOrange: '#FF956E',
  lightGreen: '#25AE88',
  earthGreen: 'rgba(177,217,180,1)',
  paleGreen: '#EAF7F4',
  green: '#25AD88',
  lightGrey: 'rgba(52,72,94,0.54)',
  grey: 'rgba(212,225,239,0.5)',
  paleGrey: 'rgba(255,255,255,0.31)',
  paleBlue: '#8DA5D1',
  paleYellow: '#FAD770',
  coral: '#F17F6E',
  lightCoral: '#FBD571',
  pink: '#FEE9E8',
};

const theme = createTheme({
  colors: COLORS,
  palette: {
    primary: {
      main: COLORS.blue,
      contrastText: COLORS.light,
    },
    secondary: {
      main: COLORS.lilac,
    },
    error: {
      main: COLORS.lightRed,
    },
    background: {
      default: COLORS.lightBlue,
    },
  },
  anchor: {
    textDecoration: 'none',
    color: COLORS.blue,
    fontSize: '14px',
    letterSpacing: 'normal',
    lineHeight: '2.43',
    '&:hover': {
      textDecoration: 'none',
      fontFamily: 'apercu',
      fontWeight: 'bold',
    },
  },
  typography: {
    fontFamily: 'apercu', 
    regular: {
      fontWeight: 'normal',
    },
    bold: {
      fontWeight: 'bold',
    },
    medium: {
      fontWeight: '500',
    },
    lightItalic: {
      fontWeight: 'lighter',
      fontStyle: 'italic',
    },
    link: {
      fontWeight: 'normal',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    body1: {
      fontWeight: 'normal',
      color: COLORS.blue,
      letterSpacing: '0.75px',
      lineHeight: '26px',
      fontSize: '16px',
    },
    button: {
      fontSize: '22px',
      letterSpacing: '1.5px',
      lineHeight: '28px',
      textTransform: 'lowercase',
      fontWeight: 'bold',
    },
    h1: {
      fontSize: '30px',
      lineHeight: '38px',
      letterSpacing: '7px',
      fontWeight: '400',
      textAlign: 'center',
      marginBottom: '20px',
      '&.homepage': {
        letterSpacing: '2px',
      },
    },
    h2: {
      fontSize: '24px',
      lineHeight: '1.33',
      letterSpacing: '2px',
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: '15px',
    },
    h3: {
      fontSize: '16px',
      lineHeight: '26px',
      letterSpacing: '.75px',
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: '10px',
    },
    h4: {
      fontSize: '16px',
      lineHeight: '26px',
      letterSpacing: '.75px',
      fontWeight: '400',
      marginBottom: '10px',
    },
    h5: {
      fontSize: '14px',
      lineHeight: '20px',
      marginBottom: '10px',
    },
  },
  overrides: {
    MuiButtonBase: {
      root: {
        color: COLORS.blue,
      },
    },
    MuiContainer: {
      maxWidthLg: {
        [`@media (min-width:${CONTAINER_MAX_WIDTH}px)`]: {
          maxWidth: `${CONTAINER_MAX_WIDTH}px`,
        },
      },
    },
    MuiCheckbox: {
      colorSecondary: {
        '& svg': {
          color: `${COLORS.lilac} !important`,
        },
      },
    },
    MuiIconButton: {
      label: {
        '&>svg': {
          color: COLORS.blue,
        },
      },
    },
    MuiPickersDay: {
      day: {
        '& p': {
          color: COLORS.blue,
        },
      },
      dayDisabled: {
        '& p': {
          opacity: '0.3',
        },
      },
      daySelected: {
        '& p': {
          color: '#E9F0F7 !important',
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 0,
      },
    },
    MuiInputBase: {
      input: {
        backgroundColor: 'transparent !important',
        color: `${COLORS.blue} !important`,
      },
    },
    MuiFilledInput: {
      root: {
        backgroundColor: `${COLORS.white} !important`,
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: COLORS.white,
        '&$focused': {
          borderColor: COLORS.lilac,
        },
        '&$error': {
          borderColor: COLORS.lightRed,
        },
      },
    },
    MuiInputLabel: {
      shrink: {
        color: '#B6C1D2',
      },
      filled: {
        transform: 'translate(12px, 24px) scale(1)',
        opacity: '0.76',
      },
      root: {
        '&$focused': {
          color: COLORS.lilac,
        },
      },
    },
    MuiFormLabel: {
      root: {
        fontSize: '14px',
        letterSpacing: '1px',
        fontFamily: 'apercu',
        fontWeight: '500',
        '&$error': {
          color: 'inherit',
        },
      },
    },
    MuiLink: {
      root: {
        '&:hover': {
          textDecoration: 'inherit',
          fontFamily: 'apercu',
          fontWeight: 'bold',
        },
      },
      underlineHover: {
        '&:hover': {
          textDecoration: 'inherit',
        },
      },
    },
    MuiStepConnector: {
      alternativeLabel: {
        left: 'calc(-50% + 40px)',
        right: 'calc(50% + 40px)',
        top: '16px',
      },
      lineHorizontal: {
        borderTopWidth: '2px',
      },
      line: {
        borderColor: 'rgba(18,52,104,0.14)',
      },
    },
    MuiStepLabel: {
      label: {
        color: COLORS.blue,
        fontSize: '12px',
      },
      active: {
        fontFamily: 'apercu',
        fontWeight: 'bold',
        color: `${COLORS.blue} !important`,
      },
      completed: {
        color: `${COLORS.blue} !important`,
      },
      root: {
        '&>span': {
          '&>span': {
            marginTop: '4px !important',
          },
        },
      },
      iconContainer: {
        '& text': {
          fill: COLORS.blue,
          opacity: '0.41',
        },
      },
    },
    MuiStepIcon: {
      completed: {
        color: '#202d4f !important',
        transform: 'rotate(-15deg)',
      },
      active: {
        color: '#202d4f !important',
        '& text': {
          fill: `${COLORS.white} !important`,
          opacity: '1 !important',
        },
      },
      root: {
        color: COLORS.white,
        width: '34px',
        height: '34px',
      },
      text: {
        fontSize: '0.68rem',
      },
    },
  },
});

export default theme;
