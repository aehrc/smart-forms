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

import { getInputInvalidType, ValidationResult } from '../utils/validate';
import type { QuestionnaireItem } from 'fhir/r4';
import {
  getMaxQuantityValue,
  getMaxQuantityValueFeedback,
  getMaxValue,
  getMaxValueFeedback,
  getMinQuantityValue,
  getMinQuantityValueFeedback,
  getMinValue,
  getMinValueFeedback,
  getRegexValidation
} from '../utils/itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { useQuestionnaireStore } from '../stores';

function useValidationFeedback(qItem: QuestionnaireItem, input: string): string {
  // Target constraint-based validation
  const targetConstraints = useQuestionnaireStore.use.targetConstraints();
  const targetConstraintLinkIds = useQuestionnaireStore.use.targetConstraintLinkIds();
  const targetConstraintKeys = targetConstraintLinkIds[qItem.linkId];
  if (targetConstraintKeys && targetConstraintKeys.length > 0) {
    for (const targetConstraintKey of targetConstraintKeys) {
      const targetConstraint = targetConstraints[targetConstraintKey];
      if (targetConstraint) {
        const { isEnabled, human } = targetConstraint;
        if (isEnabled) {
          return human;
        }
      }
    }
  }

  // Extension-based validation
  const regexValidation = getRegexValidation(qItem);
  const minLength = structuredDataCapture.getMinLength(qItem);
  const maxLength = qItem.maxLength;
  const maxDecimalPlaces = structuredDataCapture.getMaxDecimalPlaces(qItem);
  const minValue = getMinValue(qItem);
  const maxValue = getMaxValue(qItem);
  const minQuantityValue = getMinQuantityValue(qItem); // gets the minQuantity value from the questionnaire item
  const maxQuantityValue = getMaxQuantityValue(qItem); // gets the maxQuantity value from the questionnaire item

  const invalidType = getInputInvalidType({
    qItem,
    input,
    regexValidation,
    minLength,
    maxLength,
    maxDecimalPlaces,
    minValue,
    maxValue,
    minQuantityValue, // Min Quantity validation type
    maxQuantityValue // Max Quantity validation type
  });

  if (!invalidType) {
    return '';
  } else {
    //invalid type exists, so we proceed
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
    const minValueFeedback = getMinValueFeedback(qItem);
    return minValueFeedback ?? `Input is lower than the expected minimum value of ${minValue}.`;
  }

  // Test max value
  if (
    invalidType === ValidationResult.maxValue &&
    (typeof maxValue === 'string' || typeof maxValue === 'number')
  ) {
    const maxValueFeedback = getMaxValueFeedback(qItem);
    return maxValueFeedback ?? `Input exceeds permitted maximum value of ${maxValue}.`;
  }

  // Test min quantity
  if (invalidType === ValidationResult.minQuantityValue && typeof minQuantityValue === 'number') {
    const minQuantityFeedback = getMinQuantityValueFeedback(qItem); // get the feedback for minQuantity if it exists
    return (
      minQuantityFeedback ??
      `Input is lower than the expected minimum quantity value of ${minQuantityValue}.`
    );
  }

  // Test max quantity
  if (invalidType === ValidationResult.maxQuantityValue && typeof maxQuantityValue === 'number') {
    const maxQuantityFeedback = getMaxQuantityValueFeedback(qItem); // get the feedback for maxQuantity if it exists
    return (
      maxQuantityFeedback ??
      `Input exceeds permitted maximum quantity value of ${maxQuantityValue}.`
    );
  }
  return '';
}

export default useValidationFeedback;
