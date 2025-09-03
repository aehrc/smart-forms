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

/**
 * This function monkey-patches `console.warn` to silence a specific warning from MUI Autocomplete when a `<textarea>` is passed instead of an `<input>`.
 *
 * Monkey-patching console methods is not best practice as it hides important warnings/errors and make debugging harder.
 *
 * However, in this case:
 * - The warning only appears in development.
 * - The message cannot be actioned by us (it's internal to the library). See https://github.com/mui/material-ui/pull/41671
 * - It clutters the console without providing useful information.
 */
export function silenceAutocompleteTextareaWarning() {
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('A textarea element was provided to Autocomplete where input was expected')
    ) {
      // ignore this warning
      return;
    }
    originalWarn(...args);
  };
}

/**
 * This function monkey-patches `console.error` to silence a specific warning from react-beautiful-dnd about a soon to be deprecated feature.
 * The project is sunsetted, so it is unlikely to be fixed.
 *
 * Monkey-patching console methods is not best practice as it hides important warnings/errors and make debugging harder.
 *
 * However, in this case:
 * - The warning only appears in development.
 * - The message cannot be actioned by us (it's internal to the library). See https://github.com/atlassian/react-beautiful-dnd/issues/2563
 * - It clutters the console without providing useful information.
 */
export function silenceReactBeautifulDndError() {
  const originalError = console.error;

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes(
        'Warning: Connect(Droppable): Support for defaultProps will be removed from memo components in a future major release.'
      )
    ) {
      // ignore this warning
      return;
    }
    originalError(...args);
  };
}
