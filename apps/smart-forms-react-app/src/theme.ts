/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
    typography: {
      fontFamily: ['Roboto', 'Arial', '"Helvetica Neue"', '"Helvetica"', 'sans-serif'].join(','),
      body1: {
        fontSize: 13
      },
      subtitle2: {
        fontSize: 11.5
      }
    },
    palette: {
      background: {
        default: '#fbfbfc'
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
    }
  });
};

export default getTheme;
