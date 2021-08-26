import { createTheme } from '@material-ui/core/styles';
import COLORS from './colors';
import Buttons from './Buttons';

/* Fonts */
const theme = createTheme({
  colors: COLORS,
  palette: {
    primary: {
      main: COLORS.blue,
    },
    secondary: {
      main: COLORS.magenta,
    },
    info: {
      main: COLORS.cyan,
    },
    warning: {
      main: COLORS.warning,
    },
    error: {
      main: COLORS.red,
    },
    success: {
      main: COLORS.success,
    },
  },
  anchor: {},
  typography: {
    fontFamily: 'Space Grotesk, Roboto, sans-serif',
    fontSize: 8,
    regular: {
      fontWeight: '300',
    },
    bold: {
      fontWeight: '700',
    },
    medium: {
      fontWeight: '500',
    },
    link: {
      fontWeight: 'normal',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    body1: {
      fontSize: 16,
      fontFamily: "Source Sans Pro",
      fontWeight: 'normal',
      color: COLORS.gray,
    },
    _button: {
      border: "1px solid black",
      borderRadius: "8px",
      fontSize: '22px',
      letterSpacing: '1.5px',
      lineHeight: '28px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    h1: {
      fontFamily: "Space Grotesk",
      fontWeight: 500,
    },
    h2: {},
    h3: {},
    h4: {},
    h5: {},
  },
  overrides: {
    MuiButton: Buttons
  },
});

export default theme;
