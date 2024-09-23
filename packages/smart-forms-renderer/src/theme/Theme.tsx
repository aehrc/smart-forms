/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { ReactNode } from 'react';
import React from 'react';
import type { ThemeOptions } from '@mui/material/styles';
import {
  alpha,
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider
} from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import CustomGlobalStyles from './customGlobalStyles';
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

const transparent = alpha(grey[500], 0.16);

export const themeOptions: ThemeOptions = {
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
    dropdown: `0 0 2px 0 ${alpha(grey[500], 0.24)}, -20px 20px 40px -4px ${alpha(grey[500], 0.24)}`
  }
};

/**
 * Default theme used by the renderer using Material UI. You can customise your own theme by defining a new ThemeProvider.
 * @see {@link https://mui.com/material-ui/customization/theming/}
 *
 * @author Sean Fong
 */
export function RendererThemeProvider({ children }: { children: ReactNode }) {
  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CustomGlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}

export default RendererThemeProvider;
