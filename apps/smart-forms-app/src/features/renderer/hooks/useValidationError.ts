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

function useValidationError(
  input: string,
  focused: boolean,
  regexValidation: RegExp | null,
  maxLength: number | null
): { feedback: string } {
  let feedback = '';

  if (input && !focused) {
    // Test regex
    if (regexValidation) {
      if (!regexValidation.test(input)) {
        feedback = 'Input format invalid.';
      }
    }

    // Test max character limit
    if (maxLength) {
      if (input.length > maxLength) {
        feedback = 'Input exceeds maximum character limit.';
      }
    }
  }

  return { feedback };
}

export default useValidationError;
