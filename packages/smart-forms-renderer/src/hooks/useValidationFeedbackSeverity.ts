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

export type FeedbackSeverity = 'error' | 'warning';

export interface ValidationFeedbackWithSeverity {
  feedback: string;
  feedbackSeverity: FeedbackSeverity;
}

/**
 * Returns both the human-readable validation feedback message and its severity
 * (`'error'` or `'warning'`), allowing field components to style advisory warnings
 * differently from blocking errors.
 *
 * Use this hook in place of the deprecated {@link useValidationFeedback}.
 */
function useValidationFeedbackSeverity(
  qItem: QuestionnaireItem,
  feedbackFromParent: string | undefined
): ValidationFeedbackWithSeverity {
  const invalidItems = useQuestionnaireResponseStore.use.invalidItems();
  const requiredItemsIsHighlighted = useQuestionnaireResponseStore.use.requiredItemsIsHighlighted();

  // Target constraint-based validation — severity comes from the constraint definition
  const targetConstraints = useQuestionnaireStore.use.targetConstraints();
  const targetConstraintLinkIds = useQuestionnaireStore.use.targetConstraintLinkIds();
  const targetConstraintKeys = targetConstraintLinkIds[qItem.linkId];
  if (targetConstraintKeys && targetConstraintKeys.length > 0) {
    for (const targetConstraintKey of targetConstraintKeys) {
      const targetConstraint = targetConstraints[targetConstraintKey];
      if (targetConstraint) {
        const { isInvalid, human, severityCode } = targetConstraint;
        if (isInvalid) {
          return { feedback: human, feedbackSeverity: severityCode ?? 'error' };
        }
      }
    }
  }

  // Feedback from parent — parent groups don't carry a severity, treat as error
  if (feedbackFromParent) {
    return { feedback: feedbackFromParent, feedbackSeverity: 'error' };
  }

  // Feedback from current item from QR invalidItems
  const invalidOperationOutcome = invalidItems[qItem.linkId];

  // No invalid items — no feedback
  if (!invalidOperationOutcome) {
    return { feedback: '', feedbackSeverity: 'error' };
  }

  // OperationOutcome present but no issues — internal error, should never happen
  if (!invalidOperationOutcome.issue || invalidOperationOutcome.issue.length === 0) {
    return {
      feedback:
        'Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.',
      feedbackSeverity: 'error'
    };
  }

  // Required-based validation — user must manually invoke required highlighting
  if (requiredItemsIsHighlighted) {
    const requiredIssue = invalidOperationOutcome.issue.find((issue) => issue.code === 'required');
    if (requiredIssue) {
      const requiredFeedback = getRequiredFeedback(qItem);
      const severity: FeedbackSeverity = requiredIssue.severity === 'warning' ? 'warning' : 'error';
      return {
        feedback: requiredFeedback ?? 'This field is required.',
        feedbackSeverity: severity
      };
    }
  }

  // Iterate through issues; return the first recognisable validation feedback together with
  // the severity stored on that issue (set by createValidationOperationOutcomeIssue).
  for (const issue of invalidOperationOutcome.issue) {
    const validationCode = issue?.details?.coding?.[0].code;

    if (!validationCode) {
      return {
        feedback:
          'Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.',
        feedbackSeverity: 'error'
      };
    }

    const severity: FeedbackSeverity = issue.severity === 'warning' ? 'warning' : 'error';

    if (validationCode === 'regex') {
      const regexValidation = getRegexValidation(qItem);
      if (regexValidation) {
        return {
          feedback: `Input should match the specified regex: ${regexValidation.expression}`,
          feedbackSeverity: severity
        };
      }
      return { feedback: 'Input should match the specified regex.', feedbackSeverity: severity };
    }

    if (validationCode === 'minLength') {
      const minLength = structuredDataCapture.getMinLength(qItem);
      if (typeof minLength === 'number') {
        return {
          feedback: `Enter at least ${minLength} characters.`,
          feedbackSeverity: severity
        };
      }
      return {
        feedback: 'Input is below the minimum character limit.',
        feedbackSeverity: severity
      };
    }

    if (validationCode === 'maxLength') {
      const maxLength = qItem.maxLength;
      if (typeof maxLength === 'number') {
        return {
          feedback: `Enter no more than ${maxLength} characters.`,
          feedbackSeverity: severity
        };
      }
      return {
        feedback: 'Input is above the maximum character limit.',
        feedbackSeverity: severity
      };
    }

    if (validationCode === 'maxDecimalPlaces') {
      const maxDecimalPlaces = structuredDataCapture.getMaxDecimalPlaces(qItem);
      if (typeof maxDecimalPlaces === 'number') {
        return {
          feedback: `Enter a number with no more than ${maxDecimalPlaces} decimal places.`,
          feedbackSeverity: severity
        };
      }
      return { feedback: 'Input has too many decimal places.', feedbackSeverity: severity };
    }

    if (validationCode === 'minValue') {
      const minValueFeedback = getMinValueFeedback(qItem);
      if (minValueFeedback) {
        return { feedback: minValueFeedback, feedbackSeverity: severity };
      }
      const minValue = getMinValue(qItem);
      if (typeof minValue === 'string' || typeof minValue === 'number') {
        return {
          feedback: `Enter a value greater than or equal to ${minValue}.`,
          feedbackSeverity: severity
        };
      }
      return {
        feedback: 'Input is less than the minimum value allowed.',
        feedbackSeverity: severity
      };
    }

    if (validationCode === 'maxValue') {
      const maxValueFeedback = getMaxValueFeedback(qItem);
      if (maxValueFeedback) {
        return { feedback: maxValueFeedback, feedbackSeverity: severity };
      }
      const maxValue = getMaxValue(qItem);
      if (typeof maxValue === 'string' || typeof maxValue === 'number') {
        return {
          feedback: `Enter a value less than or equal to ${maxValue}.`,
          feedbackSeverity: severity
        };
      }
      return {
        feedback: 'Input exceeds the maximum value allowed.',
        feedbackSeverity: severity
      };
    }

    if (validationCode === 'minQuantityValue') {
      const minQuantityFeedback = getMinQuantityValueFeedback(qItem);
      if (minQuantityFeedback) {
        return { feedback: minQuantityFeedback, feedbackSeverity: severity };
      }
      const minQuantityValue = getMinQuantityValue(qItem);
      if (typeof minQuantityValue === 'number') {
        return {
          feedback: `Enter a quantity greater than or equal to ${minQuantityValue}.`,
          feedbackSeverity: severity
        };
      }
      return {
        feedback: 'Input is less than the minimum quantity allowed.',
        feedbackSeverity: severity
      };
    }

    if (validationCode === 'maxQuantityValue') {
      const maxQuantityFeedback = getMaxQuantityValueFeedback(qItem);
      if (maxQuantityFeedback) {
        return { feedback: maxQuantityFeedback, feedbackSeverity: severity };
      }
      const maxQuantityValue = getMaxQuantityValue(qItem);
      if (typeof maxQuantityValue === 'number') {
        return {
          feedback: `Enter a quantity less than or equal to ${maxQuantityValue}.`,
          feedbackSeverity: severity
        };
      }
      return {
        feedback: 'Input exceeds the maximum quantity allowed.',
        feedbackSeverity: severity
      };
    }
  }

  return { feedback: '', feedbackSeverity: 'error' };
}

export default useValidationFeedbackSeverity;
