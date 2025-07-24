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

import type { PaletteOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const SECONDARY = {
  light: '#7ac298',
  main: '#229954',
  dark: '#145c32',
  contrastText: '#fff'
};

const palette: PaletteOptions = {
  common: { black: '#000', white: '#fff' },
  secondary: SECONDARY,
  divider: alpha(grey['500'], 0.24),
  text: {
    primary: grey['800'],
    secondary: grey['600'],
    disabled: grey['500']
  },
  background: {
    paper: '#fff',
    default: '#fafafa'
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
};

export default palette;
