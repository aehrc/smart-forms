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

import type { Theme } from '@mui/material/styles';
import { backdropOverride } from './backdropOverride.ts';
import { dialogOverride } from './dialogOverride.ts';
import { rendererThemeComponentOverrides } from '@aehrc/smart-forms-renderer';

export function combinedComponentOverrides(theme: Theme) {
  // @ts-ignore baffling TS error for the type Theme - could be due to using different MUI versions, last checked both are using v7.1.1 but still giving an error
  const rendererOverrides = rendererThemeComponentOverrides(theme);
  const appOverrides = Object.assign(backdropOverride(theme), dialogOverride(theme));

  return {
    ...rendererOverrides,
    ...appOverrides
  };
}
