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

import { getInputInvalidType, ValidationResult } from '../utils/validateQuestionnaire';
import type { QuestionnaireItem } from 'fhir/r4';
import { getMaxValue, getMinValue, getRegexValidation } from '../utils/itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';

function useValidationFeedback(qItem: QuestionnaireItem, input: string): string {
  const regexValidation = getRegexValidation(qItem);
  const minLength = structuredDataCapture.getMinLength(qItem);
  const maxLength = qItem.maxLength;
  const maxDecimalPlaces = structuredDataCapture.getMaxDecimalPlaces(qItem);
  const minValue = getMinValue(qItem);
  const maxValue = getMaxValue(qItem);

  const invalidType = getInputInvalidType({
    qItem,
    input,
    regexValidation,
    minLength,
    maxLength,
    maxDecimalPlaces,
    minValue,
    maxValue
  });

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

  // Test min value
  if (
    invalidType === ValidationResult.minValue &&
    (typeof minValue === 'string' || typeof minValue === 'number')
  ) {
    return `Input is lower than the expected minimum value of ${minValue}.`;
  }

  // Test max value
  if (
    invalidType === ValidationResult.maxValue &&
    (typeof maxValue === 'string' || typeof maxValue === 'number')
  ) {
    return `Input exceeds permitted maximum value of ${maxValue}.`;
  }

  return '';
}

export default useValidationFeedback;
