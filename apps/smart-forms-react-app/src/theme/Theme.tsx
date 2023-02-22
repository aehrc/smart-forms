import { useMemo } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider
} from '@mui/material/styles';
//
import palette from './palette';
import typography from './typography';
import GlobalStyles from './globalStyles';
import componentsOverride from './overrides/Overrides';
import customShadows from './customShadows';

// ----------------------------------------------------------------------
// Module Augmentation

declare module '@mui/material/styles' {
  // noinspection JSUnusedGlobalSymbols
  interface Theme {
    customShadows: {
      z1: string;
      z4: string;
      z8: string;
      z12: string;
      z16: string;
      z20: string;
      z24: string;
      primary: string;
      info: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      card: string;
      dialog: string;
      dropdown: string;
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface ThemeOptions {
    customShadows: {
      z1: string;
      z4: string;
      z8: string;
      z12: string;
      z16: string;
      z20: string;
      z24: string;
      primary: string;
      info: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      card: string;
      dialog: string;
      dropdown: string;
    };
  }
}
// ----------------------------------------------------------------------

interface Props {
  children: any;
}

function ThemeProvider({ children }: Props) {
  const themeOptions = useMemo(
    () => ({
      palette,
      shape: { borderRadius: 6 },
      typography,
      customShadows: customShadows()
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}

export default ThemeProvider;
