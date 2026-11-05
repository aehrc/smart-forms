/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
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

import type { SxProps, Theme } from '@mui/material/styles';

export const wrappedValueClass = 'SfAutocompleteWrappedValue';

// Styles for the Autocomplete input root that holds an AutocompleteWrappedValue
export const autocompleteWrappedValueSx: SxProps<Theme> = {
  [`& .${wrappedValueClass}`]: {
    flex: '1 1 0',
    minWidth: 0,
    // Same padding as MUI's small Autocomplete input, so the text does not move on focus
    padding: '2.5px 4px 2.5px 8px',
    lineHeight: '1.4375em',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    cursor: 'inherit'
  },
  // While focused, the copy keeps its space so the field does not change height on focus or blur:
  // a click on the next field or button would otherwise land somewhere else once the layout moves
  [`&.Mui-focused .${wrappedValueClass}`]: {
    visibility: 'hidden'
  },
  // The input lies over the copy's first line, and keeps the root's right padding so its text stays
  // clear of the clear and popup buttons. `&&&` outranks MUI's own Autocomplete input styles.
  [`&&& .${wrappedValueClass} ~ input`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    boxSizing: 'border-box',
    height: 'calc(1.4375em + 17px)',
    padding: '8.5px 4px 8.5px 14px',
    paddingRight: 'inherit'
  },
  // While not focused, the input is transparent and covers the whole field, so a click anywhere in
  // the field focuses it. A read-only field has nothing to edit, so it keeps the wrapped copy on focus.
  [`&&&:not(.Mui-focused) .${wrappedValueClass} ~ input, &&&.Mui-readOnly .${wrappedValueClass} ~ input`]:
    {
      height: '100%',
      opacity: 0
    },
  [`&.Mui-readOnly.Mui-focused .${wrappedValueClass}`]: {
    visibility: 'visible'
  }
};
