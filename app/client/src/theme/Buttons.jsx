import COLORS from './colors';

export default {
    root: {
        backgroundColor: COLORS.black,
        [`@media (max-width:600px)`]: {
            backgroundColor: COLORS.green,
            visibility: 'hidden'
          },
  
    },
    outlinedSecondary: {
        backgroundColor: COLORS.red,
        '&:hover': {
            backgroundColor: COLORS.yellow,
        }
    }
}