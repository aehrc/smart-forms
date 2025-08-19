/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider
} from '@mui/material/styles';
import { rendererThemeComponentOverrides } from './overrides/rendererThemeComponentOverrides';
import { rendererThemeOptions } from './rendererThemeOptions';
import { ScopedCssBaseline } from '@mui/material';

/**
 * Default theme used by the renderer using Material UI. You can customise your own theme by defining a new ThemeProvider.
 * @see {@link https://mui.com/material-ui/customization/theming/}
 *
 * @author Sean Fong
 */
export function RendererThemeProvider({ children }: { children: ReactNode }) {
  const theme = createTheme(rendererThemeOptions);
  theme.components = rendererThemeComponentOverrides(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <ScopedCssBaseline>{children}</ScopedCssBaseline>
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}

export default RendererThemeProvider;
