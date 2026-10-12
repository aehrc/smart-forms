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

// This module is the package's contract. Everything re-exported here is public API and may be
// relied upon by a form's test suite. Anything not listed here — including the split of helpers
// across files, and any function added to those files without being re-exported below — is an
// internal detail and may change without notice.
//
// Re-exports are named deliberately rather than `export *`, so that adding a helper to a source
// file is not the same act as promising it to consumers.

// -- Harness ---------------------------------------------------------------------------------

export { BehavioralTestWrapper } from './behavioralTestUtils';
export { terminologyServerUrl } from './behavioralTestConstants';
export type { BehavioralTestWrapperProps, RequestDefinition } from './behavioralTestTypes';

// -- Entering answers -----------------------------------------------------------------------

export {
  inputText,
  inputDate,
  inputDateTime,
  inputTime,
  inputDecimal,
  inputInteger,
  inputUrl,
  inputFile,
  inputReference,
  inputOpenChoiceOtherText
} from './testUtils';

// -- Choosing from options ------------------------------------------------------------------

export {
  checkCheckBox,
  checkCheckboxOption,
  checkRadioOption,
  chooseSelectOption,
  chooseQuantityOption
} from './testUtils';

// -- Reading rendered state -----------------------------------------------------------------

export {
  getInputText,
  getRadioValue,
  getSelectText,
  getCqfText,
  getAnswerRecursiveByLabel,
  getVisibleTab
} from './testUtils';

// -- Locating elements ----------------------------------------------------------------------

export { findByLinkIdOrLabel, findAllByLinkIdOrLabel, selectTab } from './testUtils';

// -- Extraction and misc --------------------------------------------------------------------

export { invokeExtract, getBirthDateForAge } from './testUtils';
