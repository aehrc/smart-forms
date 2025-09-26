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

import type { ThemeOptions } from '@mui/material';
import { alpha } from '@mui/material/styles';
import typography from './typography';
import { grey } from '@mui/material/colors';

export const rendererThemeOptions: ThemeOptions = {
  palette: {
    secondary: {
      light: '#7ac298',
      main: '#229954',
      dark: '#145c32'
    },
    text: {
      primary: grey['800'],
      secondary: grey['600'],
      disabled: grey['500']
    },
    background: {
      paper: '#fff',
      default: '#fff'
    },
    action: {
      active: grey['600'],
      hover: alpha(grey['500'], 0.08),
      selected: alpha(grey['500'], 0.16),
      disabled: alpha(grey['500'], 0.8),
      disabledBackground: alpha(grey['500'], 0.24),
      focus: alpha(grey['500'], 0.24),
      hoverOpacity: 0.08,
      disabledOpacity: 0.48
    }
  },
  shape: { borderRadius: 6 },
  typography: typography,
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
    '0 1px rgb(0 0 0 / 0.05)', // 1 - shadow-2xs
    '0 1px rgb(0 0 0 / 0.05)', // 2 - shadow-2xs
    '0 1px rgb(0 0 0 / 0.05)', // 3 - shadow-2xs
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // 4 - shadow-xs
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // 5 - shadow-xs
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // 6 - shadow-xs
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // 7 - shadow-xs
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // 8 - shadow-sm
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // 9 - shadow-sm
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // 10 - shadow-sm
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // 11 - shadow-sm
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // 12 - shadow-md
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // 13 - shadow-md
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // 14 - shadow-md
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // 15 - shadow-md
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // 16 - shadow-lg
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // 17 - shadow-lg
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // 18 - shadow-lg
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // 19 - shadow-lg
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // 20 - shadow-xl
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // 21 - shadow-xl
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // 22 - shadow-xl
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // 23 - shadow-xl
    '0 25px 50px -12px rgb(0 0 0 / 0.25)' // 24 - shadow-2xl
  ]
};
