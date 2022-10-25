import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteColor, PaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
  // noinspection JSUnusedGlobalSymbols
  interface Palette {
    accent1: PaletteColor;
    accent2: PaletteColor;
    accent3: PaletteColor;
    accent4: PaletteColor;
  }

  // noinspection JSUnusedGlobalSymbols
  interface PaletteOptions {
    accent1?: PaletteColorOptions;
    accent2?: PaletteColorOptions;
    accent3?: PaletteColorOptions;
    accent4?: PaletteColorOptions;
  }
}

const getTheme = (prefersDarkMode: boolean): ThemeOptions => {
  return createTheme({
    palette: {
      background: {
        default: '#fdfefe'
      },
      secondary: {
        main: '#229954',
        light: '#2ecc71',
        dark: '#196f3d'
      },
      accent1: {
        main: '#d6eaf8',
        light: '#ebf5fb',
        dark: '#aed6f1'
      },
      accent2: {
        main: '#d5f5e3',
        light: '#eafaf1',
        dark: '#abebc6'
      }
    },
    components: {
      MuiFormControl: {
        defaultProps: {
          fullWidth: true
        },
        styleOverrides: {
          root: {
            marginTop: 4,
            marginBottom: 32
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            padding: 16,
            textTransform: 'capitalize',
            transition: '0.15s',
            '&:hover': {
              background: '#F8F8F8'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10
          }
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
            color: '#fff',
            transition: '0.3s',
            '&:hover': {
              color: '#8fc9f9'
            }
          }
        }
      }
    }
  });
};

export default getTheme;
