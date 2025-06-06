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

import type { Theme } from '@mui/material/styles';
import { accordionOverride } from './accordionOverride';
import { autocompleteOverride } from './autocompleteOverride';
import { buttonOverride } from './buttonOverride';
import { cardOverride } from './cardOverride';
import { inputOverride } from './inputOverride';
import { paperOverride } from './paperOverride';
import { speedDialOverride } from './speedDialOverride';
import { tableOverride } from './tableOverride';

export function rendererThemeComponentOverrides(theme: Theme) {
  return Object.assign(
    accordionOverride(theme),
    autocompleteOverride(theme),
    buttonOverride(theme),
    cardOverride(theme),
    inputOverride(theme),
    paperOverride(),
    speedDialOverride(theme),
    tableOverride(theme)
  );
}
