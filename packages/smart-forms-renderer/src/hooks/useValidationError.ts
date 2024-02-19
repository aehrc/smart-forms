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

import type { RegexValidation } from '../interfaces/regex.interface';
import { InvalidType } from '../utils/validateRequired';

function useValidationError(
  input: string,
  regexValidation: RegexValidation | null,
  minLength: number | null,
  maxLength: number | null
): { invalidType: InvalidType; feedback: string } {
  const invalidStatus: { invalidType: InvalidType; feedback: string } = {
    invalidType: null,
    feedback: ''
  };

  if (input) {
    // Test regex
    if (regexValidation) {
      if (!regexValidation.expression.test(input)) {
        invalidStatus.invalidType = 'regex';
        invalidStatus.feedback = `Input should match the specified regex ${regexValidation.expression}`;
      }
    }

    // Test min character limit
    if (minLength) {
      if (input.length < minLength) {
        invalidStatus.invalidType = 'minLength';
        invalidStatus.feedback = `Enter at least ${minLength} characters.`;
      }
    }

    // Test max character limit
    if (maxLength) {
      if (input.length > maxLength) {
        invalidStatus.invalidType = 'maxLength';
        invalidStatus.feedback = `Input exceeds maximum character limit of ${maxLength}.`;
      }
    }
  }

  return invalidStatus;
}

export default useValidationError;
