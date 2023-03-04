import { useMemo } from 'react';
import type { ThemeOptions } from '@mui/material';
import { CssBaseline } from '@mui/material';
import {
  alpha,
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider
} from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import GlobalStyles from './globalStyles';
import componentsOverride from './overrides/Overrides';
import { grey } from '@mui/material/colors';

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
  const transparent = alpha(grey[500], 0.16);
  const themeOptions: ThemeOptions = useMemo(
    () => ({
      palette,
      shape: { borderRadius: 6 },
      typography,
      customShadows: {
        z1: `0 1px 2px 0 ${transparent}`,
        z4: `0 4px 8px 0 ${transparent}`,
        z8: `0 8px 16px 0 ${transparent}`,
        z12: `0 12px 24px -4px ${transparent}`,
        z16: `0 16px 32px -4px ${transparent}`,
        z20: `0 20px 40px -4px ${transparent}`,
        z24: `0 24px 48px 0 ${transparent}`,
        //
        card: `0 0 2px 0 ${alpha(grey[500], 0.2)}, 0 12px 24px -4px ${alpha(grey[500], 0.12)}`,
        dialog: `-40px 40px 80px -8px ${alpha(grey[500], 0.24)}`,
        dropdown: `0 0 2px 0 ${alpha(grey[500], 0.24)}, -20px 20px 40px -4px ${alpha(
          grey[500],
          0.24
        )}`
      }
    }),
    [transparent]
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
