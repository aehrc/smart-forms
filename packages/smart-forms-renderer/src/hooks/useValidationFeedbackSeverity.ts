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

import { useContext } from 'react';
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
import {
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useRendererConfigStore
} from '../stores';
import { interpolate } from '../i18n';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { RepeatGroupInstanceContext } from '../contexts/RepeatGroupInstanceContext';
import { getValidationErrorKey } from '../utils/validateErrorKey';

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
  const rendererStrings = useRendererConfigStore.use.rendererStrings();

  // Path of enclosing repeating group instance indices (empty when not inside a repeating group).
  // Used to look up this specific instance's validation errors rather than a shared linkId key.
  const repeatInstancePath = useContext(RepeatGroupInstanceContext);

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

  // Feedback from current item from QR invalidItems, keyed by this repeat instance (if any)
  const invalidOperationOutcome =
    invalidItems[getValidationErrorKey(qItem.linkId, repeatInstancePath)];

  // No invalid items — no feedback
  if (!invalidOperationOutcome) {
    return { feedback: '', feedbackSeverity: 'error' };
  }

  // OperationOutcome present but no issues — internal error, should never happen
  if (!invalidOperationOutcome.issue || invalidOperationOutcome.issue.length === 0) {
    return { feedback: rendererStrings.validationUnknownIssue, feedbackSeverity: 'error' };
  }

  // Required-based validation — user must manually invoke required highlighting
  if (requiredItemsIsHighlighted) {
    const requiredIssue = invalidOperationOutcome.issue.find((issue) => issue.code === 'required');
    if (requiredIssue) {
      const requiredFeedback = getRequiredFeedback(qItem);
      const severity: FeedbackSeverity = requiredIssue.severity === 'warning' ? 'warning' : 'error';
      return {
        feedback: requiredFeedback ?? rendererStrings.fieldRequired,
        feedbackSeverity: severity
      };
    }
  }

  // Iterate through issues; return the first recognisable validation feedback together with
  // the severity stored on that issue (set by createValidationOperationOutcomeIssue).
  for (const issue of invalidOperationOutcome.issue) {
    const validationCode = issue?.details?.coding?.[0].code;

    if (!validationCode) {
      return { feedback: rendererStrings.validationUnknownIssue, feedbackSeverity: 'error' };
    }

    const severity: FeedbackSeverity = issue.severity === 'warning' ? 'warning' : 'error';

    // http://hl7.org/fhir/StructureDefinition/regex
    if (validationCode === 'regex') {
      const regexValidation = getRegexValidation(qItem);
      if (regexValidation) {
        return {
          feedback: interpolate(rendererStrings.regexMismatchWithExpression, {
            regex: `${regexValidation.expression}`
          }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.regexMismatch, feedbackSeverity: severity };
    }

    // http://hl7.org/fhir/StructureDefinition/minLength
    if (validationCode === 'minLength') {
      const minLength = structuredDataCapture.getMinLength(qItem);
      if (typeof minLength === 'number') {
        return {
          feedback: interpolate(rendererStrings.minLengthWithLimit, { minLength: `${minLength}` }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.minLengthFallback, feedbackSeverity: severity };
    }

    // Questionnaire.item.maxLength
    if (validationCode === 'maxLength') {
      const maxLength = qItem.maxLength;
      if (typeof maxLength === 'number') {
        return {
          feedback: interpolate(rendererStrings.maxLengthWithLimit, { maxLength: `${maxLength}` }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.maxLengthFallback, feedbackSeverity: severity };
    }

    // http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces
    if (validationCode === 'maxDecimalPlaces') {
      const maxDecimalPlaces = structuredDataCapture.getMaxDecimalPlaces(qItem);
      if (typeof maxDecimalPlaces === 'number') {
        return {
          feedback: interpolate(rendererStrings.maxDecimalPlacesWithLimit, {
            maxDecimalPlaces: `${maxDecimalPlaces}`
          }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.maxDecimalPlacesFallback, feedbackSeverity: severity };
    }

    // http://hl7.org/fhir/StructureDefinition/minValue
    if (validationCode === 'minValue') {
      const minValueFeedback = getMinValueFeedback(qItem);
      if (minValueFeedback) {
        return { feedback: minValueFeedback, feedbackSeverity: severity };
      }

      const minValue = getMinValue(qItem);
      if (typeof minValue === 'string' || typeof minValue === 'number') {
        return {
          feedback: interpolate(rendererStrings.minValueWithLimit, { minValue: `${minValue}` }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.minValueFallback, feedbackSeverity: severity };
    }

    // http://hl7.org/fhir/StructureDefinition/maxValue
    if (validationCode === 'maxValue') {
      const maxValueFeedback = getMaxValueFeedback(qItem);
      if (maxValueFeedback) {
        return { feedback: maxValueFeedback, feedbackSeverity: severity };
      }

      const maxValue = getMaxValue(qItem);
      if (typeof maxValue === 'string' || typeof maxValue === 'number') {
        return {
          feedback: interpolate(rendererStrings.maxValueWithLimit, { maxValue: `${maxValue}` }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.maxValueFallback, feedbackSeverity: severity };
    }

    // http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity
    if (validationCode === 'minQuantityValue') {
      const minQuantityFeedback = getMinQuantityValueFeedback(qItem);
      if (minQuantityFeedback) {
        return { feedback: minQuantityFeedback, feedbackSeverity: severity };
      }

      const minQuantityValue = getMinQuantityValue(qItem);
      if (typeof minQuantityValue === 'number') {
        return {
          feedback: interpolate(rendererStrings.minQuantityWithLimit, {
            minQuantityValue: `${minQuantityValue}`
          }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.minQuantityFallback, feedbackSeverity: severity };
    }

    // http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity
    if (validationCode === 'maxQuantityValue') {
      const maxQuantityFeedback = getMaxQuantityValueFeedback(qItem);
      if (maxQuantityFeedback) {
        return { feedback: maxQuantityFeedback, feedbackSeverity: severity };
      }

      const maxQuantityValue = getMaxQuantityValue(qItem);
      if (typeof maxQuantityValue === 'number') {
        return {
          feedback: interpolate(rendererStrings.maxQuantityWithLimit, {
            maxQuantityValue: `${maxQuantityValue}`
          }),
          feedbackSeverity: severity
        };
      }

      return { feedback: rendererStrings.maxQuantityFallback, feedbackSeverity: severity };
    }

    // No specific issue code, continue to the next issue
  }

  // No specific issue code from all issues, fallback to empty string
  return { feedback: '', feedbackSeverity: 'error' };
}

export default useValidationFeedbackSeverity;
