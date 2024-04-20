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

import type {
  OperationOutcome,
  OperationOutcomeIssue,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces';
import { isHiddenByEnableWhen } from './qItem';
import { getRegexString, getRegexValidation, getShortText } from './itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import type { RegexValidation } from '../interfaces/regex.interface';

export enum ValidationResult {
  unknown = 'unknown', // Unknown validation result
  questionnaireNotFound = 'questionnaireNotFound', // The Questionnaire referenced by the QR was not found
  questionnaireInactive = 'questionnaireInactive', // The QuestionnaireResponse.authored is outside the defined Questionnaire.effectivePeriod
  questionnaireDraft = 'questionnaireDraft', // The Questionnaire.status was not active (draft)
  questionnaireRetired = 'questionnaireRetired', // The Questionnaire.status was not active (retired)
  invalidLinkId = 'invalidLinkId', // LinkId was not found in the questionnaire
  invalidType = 'invalidType', // The Question Type should not be included in Response (or Definition) data
  invalidAnswerType = 'invalidAnswerType', // The Answer does not conform to the Item.Type value required (also taking into consideration the fhir-type extension)
  invalidAnswerOption = 'invalidAnswerOption', // A set of valid AnswerOptions were provided in the definition, but the value entered was not in the set
  exclusiveAnswerOption = 'exclusiveAnswerOption', // The selected answer cannot be used in conjunction with other answers in this multi-select choice option
  invalidUrlValue = 'invalidUrlValue', // URL value not formatted correctly as a UUID, or relative/absolute URL
  groupShouldNotHaveAnswers = 'groupShouldNotHaveAnswers', // A Group Item should not use the `answer` child, it should use the `item` child
  required = 'required', // There was no answer provided for a mandatory field
  invariant = 'invariant', // A FHIRPATH validation expression did not pass
  invariantExecution = 'invariantExecution', // A FHIRPATH validation expression failed to execute
  repeats = 'repeats', // There was more than one answer provided for an item with repeats = false (which is the default)
  minCount = 'minCount', // Minimum number of answers required for the item was not provided
  maxCount = 'maxCount', // Number of answers provided exceeded the maximum permitted
  minValue = 'minValue', // Minimum value constraint violated
  maxValue = 'maxValue', // Maximum value constraint violated
  maxDecimalPlaces = 'maxDecimalPlaces', // Maximum decimal places constraint violated
  minLength = 'minLength', // Minimum length constraint violated
  maxLength = 'maxLength', // Maximum length constraint violated
  invalidNewLine = 'invalidNewLine', // 'string' type items cannot include newline characters, use a 'text' type for these
  invalidCoding = 'invalidCoding', // Coding value not valid in the ValueSet
  tsError = 'tsError', // Error accessing the Terminology Server
  maxAttachmentSize = 'maxAttachmentSize', // Maximum attachment size constraint violated
  attachmentSizeInconsistent = 'attachmentSizeInconsistent', // The Size of the attachment data and the reported size are different
  invalidAttachmentType = 'invalidAttachmentType', // Attachment type constraint violated
  displayAnswer = 'displayAnswer', // Display Items should not have an answer provided
  regex = 'regex', // The answer does not match the provided regex expression
  regexTimeout = 'regexTimeout', // Evaluating the regex expression timed out
  invalidRefValue = 'invalidRefValue', // The Reference value was not a valid URL value (relative or absolute)
  invalidRefResourceType = 'invalidRefResourceType', // The Reference value did not refer to a valid FHIR resource type
  invalidRefResourceTypeRestriction = 'invalidRefResourceTypeRestriction', // The Reference value was not
  minValueIncompatUnits = 'minValueIncompatUnits', // The units provided in the Quantity cannot be converted to the min Quantity units
  maxValueIncompatUnits = 'maxValueIncompatUnits', // The units provided in the Quantity cannot be converted to the max Quantity units
  invalidUnit = 'invalidUnit', // The unit provided was not among the list selected (or did not have all the properties defined in the unit coding)
  invalidUnitValueSet = 'invalidUnitValueSet' // The unit provided was not in the provided valueset
}

interface ValidateQuestionnaireParams {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  invalidItems: Record<string, OperationOutcome>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

/**
 * Recursively go through the questionnaireResponse and check for un-filled required qItems
 * At the moment item.required for group items are not checked
 *
 * @author Sean Fong
 */
export function validateQuestionnaire(
  params: ValidateQuestionnaireParams
): Record<string, OperationOutcome> {
  const {
    questionnaire,
    questionnaireResponse,
    invalidItems,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !questionnaireResponse.item ||
    questionnaireResponse.item.length === 0
  ) {
    return invalidItems;
  }

  const qItemsIndexMap = mapQItemsIndex(questionnaire);
  const topLevelQRItemsByIndex = getQrItemsIndex(
    questionnaire.item,
    questionnaireResponse.item,
    qItemsIndexMap
  );

  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    let topLevelQRItem = topLevelQRItemsByIndex[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text
    };

    if (Array.isArray(topLevelQRItem)) {
      topLevelQRItem = {
        linkId: topLevelQItem.linkId,
        text: topLevelQItem.text,
        item: topLevelQRItem
      };
    }

    validateItemRecursive({
      qItem: topLevelQItem,
      qrItem: topLevelQRItem,
      invalidItems: invalidItems,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });
  }

  return invalidItems;
}

interface ValidateItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  invalidItems: Record<string, OperationOutcome>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

function validateItemRecursive(params: ValidateItemRecursiveParams) {
  const {
    qItem,
    qrItem,
    invalidItems,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (
    isHiddenByEnableWhen({
      linkId: qItem.linkId,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    })
  ) {
    return;
  }

  // FIXME repeat groups not working
  if (qItem.type === 'group' && qItem.repeats) {
    return;
  }

  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    const childQrItems = qrItem?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    if (qItem.type === 'group' && qItem.required) {
      if (!qrItem || qrItemsByIndex.length === 0) {
        invalidItems[qItem.linkId] = createValidationOperationOutcome(
          ValidationResult.required,
          qItem,
          qrItem
        );
      }
    }

    for (const [index, childQItem] of childQItems.entries()) {
      let childQRItem = qrItemsByIndex[index] ?? {
        linkId: childQItem.linkId,
        text: childQItem.text
      };

      if (Array.isArray(childQRItem)) {
        childQRItem = {
          linkId: childQItem.linkId,
          text: childQItem.text,
          item: childQRItem
        };
      }

      validateItemRecursive({
        qItem: childQItem,
        qrItem: childQRItem,
        invalidItems: invalidItems,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      });
    }
  }

  validateSingleItem(qItem, qrItem, invalidItems);
}

function validateSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  invalidItems: Record<string, OperationOutcome>
) {
  // Validate item.required first before every other validation check
  if (qItem.type !== 'display') {
    if (qItem.required && !qrItem.answer) {
      invalidItems[qItem.linkId] = createValidationOperationOutcome(
        ValidationResult.required,
        qItem,
        qrItem
      );
      return invalidItems;
    }
  }

  // Validate regex, maxLength and minLength
  if (qrItem.answer) {
    for (const answer of qrItem.answer) {
      if (answer.valueString || answer.valueInteger || answer.valueDecimal || answer.valueUri) {
        const invalidInputType = getInputInvalidType(
          getInputInString(answer),
          getRegexValidation(qItem),
          structuredDataCapture.getMinLength(qItem) ?? null,
          qItem.maxLength ?? null
        );

        if (!invalidInputType) {
          continue;
        }

        // Assign invalid type and break - stop checking other answers if is a repeat item
        switch (invalidInputType) {
          case ValidationResult.regex: {
            invalidItems[qItem.linkId] = createValidationOperationOutcome(
              ValidationResult.regex,
              qItem,
              qrItem
            );
            break;
          }
          case ValidationResult.minLength: {
            invalidItems[qItem.linkId] = createValidationOperationOutcome(
              ValidationResult.minLength,
              qItem,
              qrItem
            );
            break;
          }
          case ValidationResult.maxLength: {
            invalidItems[qItem.linkId] = createValidationOperationOutcome(
              ValidationResult.maxLength,
              qItem,
              qrItem
            );
            break;
          }
        }
        break;
      }
    }

    // Reached the end of the loop and no invalid input type found
    // If a required item is filled, remove the required invalid type
    if (
      qItem.required &&
      invalidItems[qItem.linkId] &&
      invalidItems[qItem.linkId].issue[0].code === 'required'
    ) {
      delete invalidItems[qItem.linkId];
    }
  }

  return invalidItems;
}

function getInputInString(answer: QuestionnaireResponseItemAnswer) {
  if (answer.valueString) {
    return answer.valueString;
  } else if (answer.valueInteger) {
    return answer.valueInteger.toString();
  } else if (answer.valueDecimal) {
    return answer.valueDecimal.toString();
  } else if (answer.valueUri) {
    return answer.valueUri;
  }

  return '';
}

export function getInputInvalidType(
  input: string,
  regexValidation: RegexValidation | null,
  minLength: number | null,
  maxLength: number | null
): ValidationResult | null {
  if (input) {
    if (regexValidation && !regexValidation.expression.test(input)) {
      return ValidationResult.regex;
    }

    if (minLength && input.length < minLength) {
      return ValidationResult.minLength;
    }

    if (maxLength && input.length > maxLength) {
      return ValidationResult.maxLength;
    }
  }

  return null;
}

function createValidationOperationOutcome(
  error: ValidationResult,
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [createValidationOperationOutcomeIssue(error, qItem, qrItem)]
  };
}

function createValidationOperationOutcomeIssue(
  error: ValidationResult,
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem
): OperationOutcomeIssue {
  const errorCodeSystem = 'http://fhir.forms-lab.com/CodeSystem/errors';
  let detailsText = '';
  const location = qrItem.linkId ?? qItem.linkId;
  let fieldDisplayText =
    qrItem?.text ?? getShortText(qItem) ?? qItem?.text ?? qItem.linkId ?? qrItem.linkId;
  if (!fieldDisplayText && fieldDisplayText.endsWith(':')) {
    fieldDisplayText = fieldDisplayText.substring(0, fieldDisplayText.length - 1);
  }

  // create operationOutcomeIssue based on error
  switch (error) {
    case ValidationResult.required: {
      if (qItem.type === 'group') {
        detailsText = `${fieldDisplayText}: Mandatory group does not have answer(s)`;
      } else {
        detailsText = `${fieldDisplayText}: Mandatory field does not have an answer`;
      }

      return {
        severity: 'error',
        code: 'required',
        location: [location],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Required'
            }
          ],
          text: detailsText
        }
      };
    }

    case ValidationResult.regex: {
      detailsText = `${fieldDisplayText}: The value '${qrItem.answer?.[0].valueString}' does not match the defined format.`;
      if (structuredDataCapture.getEntryFormat(qItem)) {
        detailsText += ` ${structuredDataCapture.getEntryFormat(qItem)}`;
      }

      return {
        severity: 'error',
        code: 'invalid',
        location: [location],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Invalid format'
            }
          ],
          text: detailsText
        },
        diagnostics: getRegexString(qItem) ?? undefined
      };
    }

    case ValidationResult.minLength: {
      detailsText = `${fieldDisplayText}: Expected the minimum value ${structuredDataCapture.getMinLength(qItem)} characters, received ${qrItem.answer?.[0].valueString?.length}`;
      return {
        severity: 'error',
        code: 'business-rule',
        location: [location],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too short'
            }
          ],
          text: detailsText
        }
      };
    }

    case ValidationResult.maxLength: {
      detailsText = `${fieldDisplayText}: Exceeded maximum of  ${qItem.maxLength} characters, received ${qrItem.answer?.[0].valueString?.length}`;
      return {
        severity: 'error',
        code: 'business-rule',
        location: [location],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too long'
            }
          ],
          text: detailsText
        }
      };
    }

    // mark unknown issues as fatal
    default: {
      return {
        severity: 'error',
        code: 'unknown',
        location: [location],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: 'unknown',
              display: 'Unknown'
            }
          ]
        }
      };
    }
  }
}
