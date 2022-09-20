import { createTheme, ThemeOptions } from '@mui/material/styles';

const getTheme = (prefersDarkMode: boolean): ThemeOptions => {
  return createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light'
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
              background: prefersDarkMode ? '#1B1B1B' : '#F8F8F8'
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
      }
    }
  });
};

export default getTheme;
