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

import { wrappedValueClass } from './AutocompleteWrappedValue.styles';

/**
 * Wrapping copy of an Autocomplete's text, shown while the field is not focused.
 *
 * MUI Autocomplete needs a single-line <input>, which cannot wrap a long selected value. Place this
 * element in the input's startAdornment and add `autocompleteWrappedValueSx` from
 * AutocompleteWrappedValue.styles to the input root. While the field is not focused, the input is
 * visually hidden and this copy shows the text on as many lines as it needs. While focused, the
 * input is shown over the copy's first line, so typing, keyboard selection and clearing work as
 * usual. The input keeps its value throughout, so screen readers read the input and this copy is
 * aria-hidden.
 */
function AutocompleteWrappedValue(props: { text: string }) {
  const { text } = props;

  if (!text) {
    return null;
  }

  return (
    <span aria-hidden="true" className={wrappedValueClass} data-test="q-item-autocomplete-value">
      {text}
    </span>
  );
}

export default AutocompleteWrappedValue;
