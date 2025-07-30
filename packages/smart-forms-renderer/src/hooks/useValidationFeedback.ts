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
  getRegexValidation,
  getRequiredFeedback
} from '../utils/extensions';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../stores';
import { structuredDataCapture } from 'fhir-sdc-helpers';

function useValidationFeedback(
  qItem: QuestionnaireItem,
  feedbackFromParent: string | undefined
): string {
  const invalidItems = useQuestionnaireResponseStore.use.invalidItems();
  const requiredItemsIsHighlighted = useQuestionnaireResponseStore.use.requiredItemsIsHighlighted();

  // Target constraint-based validation
  const targetConstraints = useQuestionnaireStore.use.targetConstraints();
  const targetConstraintLinkIds = useQuestionnaireStore.use.targetConstraintLinkIds();
  const targetConstraintKeys = targetConstraintLinkIds[qItem.linkId];
  if (targetConstraintKeys && targetConstraintKeys.length > 0) {
    for (const targetConstraintKey of targetConstraintKeys) {
      const targetConstraint = targetConstraints[targetConstraintKey];
      if (targetConstraint) {
        const { isInvalid, human } = targetConstraint;
        if (isInvalid) {
          return human;
        }
      }
    }
  }

  // Feedback from parent
  if (feedbackFromParent) {
    return feedbackFromParent;
  }

  // Feedback from current item from QR invalidItems
  const invalidOperationOutcome = invalidItems[qItem.linkId];

  // Invalid items are not present, so no feedback returned
  if (!invalidOperationOutcome) {
    return '';
  }

  // There is an invalidOperationOutcome but no issues, something is wrong with the validation - should never happen
  if (!invalidOperationOutcome.issue || invalidOperationOutcome.issue.length === 0) {
    return 'Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.';
  }

  // Required-based validation
  // User needs to manually invoke required items to be highlighted
  if (requiredItemsIsHighlighted) {
    const requiredIssue = invalidOperationOutcome.issue.find((issue) => issue.code === 'required');
    if (requiredIssue) {
      const requiredFeedback = getRequiredFeedback(qItem);
      return requiredFeedback ?? 'This field is required.';
    }
  }

  // Iterate through the issues but we only return the first validation feedback we find.
  // Once that's resolved, the subsequent feedbacks will be returned.
  for (const issue of invalidOperationOutcome.issue) {
    const validationCode = issue?.details?.coding?.[0].code;

    // If no validation code is provided, something is wrong with the validation - should never happen
    if (!validationCode) {
      return 'Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.';
    }

    // http://hl7.org/fhir/StructureDefinition/regex
    if (validationCode === 'regex') {
      const regexValidation = getRegexValidation(qItem);
      if (regexValidation) {
        return `Input should match the specified regex: ${regexValidation.expression}`;
      }

      return 'Input should match the specified regex.';
    }

    // http://hl7.org/fhir/StructureDefinition/minLength
    if (validationCode === 'minLength') {
      const minLength = structuredDataCapture.getMinLength(qItem);
      if (typeof minLength === 'number') {
        return `Enter at least ${minLength} characters.`;
      }

      return 'Input is below the minimum character limit.';
    }

    // Questionnaire.item.maxLength
    if (validationCode === 'maxLength') {
      const maxLength = qItem.maxLength;
      if (typeof maxLength === 'number') {
        return `Enter no more than ${maxLength} characters.`;
      }

      return 'Input is above the maximum character limit.';
    }

    // http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces
    if (validationCode === 'maxDecimalPlaces') {
      const maxDecimalPlaces = structuredDataCapture.getMaxDecimalPlaces(qItem);
      if (typeof maxDecimalPlaces === 'number') {
        return `Enter a number with no more than ${maxDecimalPlaces} decimal places.`;
      }

      return 'Input has too many decimal places.';
    }

    // http://hl7.org/fhir/StructureDefinition/minValue
    if (validationCode === 'minValue') {
      const minValueFeedback = getMinValueFeedback(qItem);
      if (minValueFeedback) {
        return minValueFeedback;
      }

      const minValue = getMinValue(qItem);
      if (typeof minValue === 'string' || typeof minValue === 'number') {
        return `Enter a value greater than or equal to ${minValue}.`;
      }

      return 'Input is less than the minimum value allowed.';
    }

    // http://hl7.org/fhir/StructureDefinition/maxValue
    if (validationCode === 'maxValue') {
      const maxValueFeedback = getMaxValueFeedback(qItem);
      if (maxValueFeedback) {
        return maxValueFeedback;
      }

      const maxValue = getMaxValue(qItem);
      if (typeof maxValue === 'string' || typeof maxValue === 'number') {
        return `Enter a value less than or equal to ${maxValue}.`;
      }

      return 'Input exceeds the maximum value allowed.';
    }

    // http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity
    if (validationCode === 'minQuantityValue') {
      const minQuantityFeedback = getMinQuantityValueFeedback(qItem);
      if (minQuantityFeedback) {
        return minQuantityFeedback;
      }

      const minQuantityValue = getMinQuantityValue(qItem);
      if (typeof minQuantityValue === 'number') {
        return `Enter a quantity greater than or equal to ${minQuantityValue}.`;
      }

      return 'Input is less than the minimum quantity allowed.';
    }

    // http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity
    if (validationCode === 'maxQuantityValue') {
      const maxQuantityFeedback = getMaxQuantityValueFeedback(qItem);
      if (maxQuantityFeedback) {
        return maxQuantityFeedback;
      }

      const maxQuantityValue = getMaxQuantityValue(qItem);
      if (typeof maxQuantityValue === 'number') {
        return `Enter a quantity less than or equal to ${maxQuantityValue}.`;
      }

      return 'Input exceeds the maximum quantity allowed.';
    }

    // No specific issue code, continue to the next issue
  }

  // No specific issue code, fallback to a generic invalid input message
  return 'Input is invalid.';
}

export default useValidationFeedback;
