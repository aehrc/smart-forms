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
import { combinedComponentOverrides } from './overrides/combinedComponentOverrides.ts';
import { grey } from '@mui/material/colors';

const transparent = alpha(grey[500], 0.16);

const appThemeOptions: ThemeOptions = {
  palette,
  shape: { borderRadius: 6 },
  typography: typography,
  // Mapped to Tailwind CSS shadow utility
  // 0 - shadow-none
  // 1-3 - shadow-2xs
  // 4-7 - shadow-xs
  // 8-11 - shadow-sm
  // 12-15 - shadow-md
  // 16-19 - shadow-lg
  // 20-23 - shadow-xl
  // 24 - shadow-2xl
  shadows: [
    'none', // 0 - shadow-none
    `0 1px 2px 0 ${transparent}`, // 1 - shadow-2xs
    `0 1px 2px 0 ${transparent}`, // 2 - shadow-2xs
    `0 1px 2px 0 ${transparent}`, // 3 - shadow-2xs
    `0 4px 8px 0 ${transparent}`, // 4 - shadow-xs
    `0 4px 8px 0 ${transparent}`, // 5 - shadow-xs
    `0 4px 8px 0 ${transparent}`, // 6 - shadow-xs
    `0 4px 8px 0 ${transparent}`, // 7 - shadow-xs
    `0 8px 16px 0 ${transparent}`, // 8 - shadow-sm
    `0 8px 16px 0 ${transparent}`, // 9 - shadow-sm
    `0 8px 16px 0 ${transparent}`, // 10 - shadow-sm
    `0 8px 16px 0 ${transparent}`, // 11 - shadow-sm
    `0 12px 24px -4px ${transparent}`, // 12 - shadow-md
    `0 12px 24px -4px ${transparent}`, // 13 - shadow-md
    `0 12px 24px -4px ${transparent}`, // 14 - shadow-md
    `0 12px 24px -4px ${transparent}`, // 15 - shadow-md
    `0 16px 32px -4px ${transparent}`, // 16 - shadow-lg
    `0 16px 32px -4px ${transparent}`, // 17 - shadow-lg
    `0 16px 32px -4px ${transparent}`, // 18 - shadow-lg
    `0 16px 32px -4px ${transparent}`, // 19 - shadow-lg
    `0 20px 40px -4px ${transparent}`, // 20 - shadow-xl
    `0 20px 40px -4px ${transparent}`, // 21 - shadow-xl
    `0 20px 40px -4px ${transparent}`, // 22 - shadow-xl
    `0 20px 40px -4px ${transparent}`, // 23 - shadow-xl
    `0 24px 48px 0 ${transparent}` // 24 - shadow-2xl
  ]
};

function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme = createTheme(appThemeOptions);
  theme.components = combinedComponentOverrides(theme);

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

export default AppThemeProvider;
