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

import type { RegexValidation } from '../interfaces/regex.interface';
import { getInputInvalidType, ValidationResult } from '../utils/validateQuestionnaire';

function useValidationFeedback(
  input: string,
  regexValidation?: RegexValidation,
  minLength?: number,
  maxLength?: number,
  maxDecimalPlaces?: number
): string {
  const invalidType = getInputInvalidType(
    input,
    regexValidation,
    minLength,
    maxLength,
    maxDecimalPlaces
  );

  if (!invalidType) {
    return '';
  }

  if (invalidType === ValidationResult.regex && regexValidation) {
    return `Input should match the specified regex ${regexValidation.expression}`;
  }

  // Test min character limit
  if (invalidType === ValidationResult.minLength && typeof minLength === 'number') {
    return `Enter at least ${minLength} characters.`;
  }

  // Test max character limit
  if (invalidType === ValidationResult.maxLength && typeof maxLength === 'number') {
    return `Input exceeds maximum character limit of ${maxLength}.`;
  }

  // Test max decimal places limit
  if (invalidType === ValidationResult.maxDecimalPlaces && typeof maxDecimalPlaces === 'number') {
    return `Input exceeds maximum decimal places limit of ${maxDecimalPlaces}.`;
  }

  return '';
}

export default useValidationFeedback;
