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
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHiddenByEnableWhen } from './qItem';
import {
  getDecimalPrecision,
  getMaxQuantityValue,
  getMaxValue,
  getMinQuantityValue,
  getMinValue,
  getRegexString,
  getRegexValidation,
  getShortText
} from './itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import type { RegexValidation } from '../interfaces/regex.interface';
import { parseDecimalStringToFloat } from './parseInputs';
import dayjs from 'dayjs';
import { questionnaireStore } from '../stores';

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
  invalidUnitValueSet = 'invalidUnitValueSet', // The unit provided was not in the provided valueset
  minQuantityValue = 'minQuantityValue', // Minimum Quantity value constraint violated
  maxQuantityValue = 'maxQuantityValue' // Maximum Quantity value constraint violated
}

export function validateForm(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Record<string, OperationOutcome> {
  const invalidItemsFromQRValidation = validateQuestionnaireResponse({
    questionnaire,
    questionnaireResponse
  });

  const invalidItemsFromTCValidation = validateTargetConstraint();

  return {
    ...invalidItemsFromQRValidation,
    ...invalidItemsFromTCValidation
  };
}

export function validateTargetConstraint(): Record<string, OperationOutcome> {
  const targetConstraints = questionnaireStore.getState().targetConstraints;
  const invalidItems: Record<string, OperationOutcome> = {};
  for (const [, targetConstraint] of Object.entries(targetConstraints)) {
    if (targetConstraint.isInvalid) {
      const locationExpression = targetConstraint.location
        ? `${targetConstraint.valueExpression.expression ?? 'unknown FHIRPath expression'} at ${
            targetConstraint.location
          }`
        : `${targetConstraint.valueExpression.expression ?? 'unknown FHIRPath expression'}`;

      const validationOutcome = createValidationOperationOutcome(
        ValidationResult.invariant,
        null as unknown as QuestionnaireItem, // We don't need a QuestionnaireItem here
        null as unknown as QuestionnaireResponseItem, // We don't need a QuestionnaireResponseItem here
        null,
        locationExpression,
        []
      );

      const invalidItemKey = targetConstraint.linkId ?? `target-constraint-${targetConstraint.key}`;
      invalidItems[invalidItemKey] = validationOutcome;
    }
  }

  return invalidItems;
}

interface ValidateQuestionnaireResponseParams {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
}

/**
 * Recursively go through the questionnaireResponse and check for un-filled required qItems
 * At the moment item.required for group items are not checked
 *
 * @author Sean Fong
 */
export function validateQuestionnaireResponse(
  params: ValidateQuestionnaireResponseParams
): Record<string, OperationOutcome> {
  const { questionnaire, questionnaireResponse } = params;

  const enableWhenIsActivated = questionnaireStore.getState().enableWhenIsActivated;
  const enableWhenItems = questionnaireStore.getState().enableWhenItems;
  const enableWhenExpressions = questionnaireStore.getState().enableWhenExpressions;

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) {
    questionnaireResponse.item = [];
  }

  const qItemsIndexMap = mapQItemsIndex(questionnaire);
  const topLevelQRItemsByIndex = getQrItemsIndex(
    questionnaire.item,
    questionnaireResponse.item,
    qItemsIndexMap
  );

  const invalidItems: Record<string, OperationOutcome> = {};
  let qrItemIndex = 0;
  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    let repeatGroupInstances: number | null = null;
    let topLevelQRItem = topLevelQRItemsByIndex[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text
    };

    // topLevelQRItem being an array means this item is a repeat group
    const isRepeatGroup = Array.isArray(topLevelQRItem);
    if (Array.isArray(topLevelQRItem)) {
      repeatGroupInstances = topLevelQRItem.length;
      topLevelQRItem = {
        linkId: topLevelQItem.linkId,
        text: topLevelQItem.text,
        item: topLevelQRItem
      };
    }

    const locationExpression = `QuestionnaireResponse.item`;
    validateItemRecursive({
      qItem: topLevelQItem,
      qrItem: topLevelQRItem,
      qrItemIndex,
      locationExpression,
      invalidItems,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions,
      isRepeatGroupInstance: false
    });

    // Increment qrItemIndex
    // If it's a repeat group, increment by the number of instances so qrItemIndex is correct once we reach the next item
    if (isRepeatGroup && typeof repeatGroupInstances === 'number') {
      qrItemIndex += repeatGroupInstances;
    } else {
      qrItemIndex++;
    }
  }

  return invalidItems;
}

interface ValidateItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  qrItemIndex: number;
  locationExpression: string;
  invalidItems: Record<string, OperationOutcome>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  isRepeatGroupInstance: boolean;
}

function validateItemRecursive(params: ValidateItemRecursiveParams) {
  const {
    qItem,
    qrItem,
    qrItemIndex,
    invalidItems,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions,
    isRepeatGroupInstance
  } = params;
  let { locationExpression } = params;

  // Skip display items
  if (qItem.type === 'display') {
    return;
  }

  // If item is hidden by enableWhen, skip validation
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

  // Validate repeat groups
  if (qItem.type === 'group' && qItem.repeats) {
    if (!isRepeatGroupInstance) {
      validateRepeatGroupRecursive({
        qItem,
        qrItem,
        qrItemIndex,
        locationExpression,
        invalidItems,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions,
        isRepeatGroupInstance: false
      });
      return;
    }
  }

  locationExpression = `${locationExpression}[${qrItemIndex}]`;

  // Recursively validate groups with child items
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    const childQrItems = qrItem?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // Check if group is required and has no answers
    if (qItem.type === 'group' && qItem.required) {
      if (!qrItem.item || qrItem.item?.length === 0) {
        invalidItems[qItem.linkId] = createValidationOperationOutcome(
          ValidationResult.required,
          qItem,
          qrItem,
          null,
          locationExpression,
          invalidItems[qItem.linkId]?.issue
        );
      }
    }

    // Loop through child items
    for (const [index, childQItem] of childQItems.entries()) {
      const childLocationExpression = `${locationExpression}.item`;
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
        qrItemIndex: index,
        locationExpression: childLocationExpression,
        invalidItems: invalidItems,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions,
        isRepeatGroupInstance: false
      });
    }
  }

  // Stop checking if the item is a group, we have checked previously
  if (qItem.type === 'group') {
    return;
  }

  // Validate the item, note that this can be either a group or a non-group
  validateSingleItem(qItem, qrItem, invalidItems, locationExpression);
}

function validateRepeatGroupRecursive(params: ValidateItemRecursiveParams) {
  const {
    qItem,
    qrItem,
    qrItemIndex,
    locationExpression,
    invalidItems,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (!qItem.item || qItem.item.length === 0 || !qrItem.item || qrItem.item.length === 0) {
    return;
  }

  // Get repeat group answers
  const repeatGroupAnswers = qrItem.item ?? [];
  for (const [index, repeatGroupAnswer] of repeatGroupAnswers.entries()) {
    // Because the item is a repeat group and might have multiple answer instances, we need to increment the qItemIndex by the instanceIndex
    const updatedQrItemIndex = qrItemIndex + index;

    validateItemRecursive({
      qItem: qItem,
      qrItem: repeatGroupAnswer,
      qrItemIndex: updatedQrItemIndex,
      locationExpression: locationExpression,
      invalidItems: invalidItems,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions,
      isRepeatGroupInstance: true
    });
  }
}

function validateSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  invalidItems: Record<string, OperationOutcome>,
  locationExpression: string
) {
  // Skip display items
  if (qItem.type === 'display') {
    return invalidItems;
  }

  // Validate item.required first before every other validation check
  if (qItem.required && (!qrItem.answer || isAnswerEffectivelyEmpty(qrItem.answer))) {
    invalidItems[qItem.linkId] = createValidationOperationOutcome(
      ValidationResult.required,
      qItem,
      qrItem,
      null,
      locationExpression,
      invalidItems[qItem.linkId]?.issue
    );

    return invalidItems;
  }

  // Validate regex, maxLength and minLength, maxQuantity and minQuantity
  if (qrItem.answer) {
    for (const [i, answer] of qrItem.answer.entries()) {
      // Your code here, you can use 'index' and 'answer' as needed
      if (
        answer.valueString ||
        answer.valueInteger ||
        answer.valueDecimal ||
        answer.valueUri ||
        answer.valueQuantity
      ) {
        const invalidInputType = getInputInvalidType({
          qItem,
          input: getInputInString(answer),
          regexValidation: getRegexValidation(qItem),
          minLength: structuredDataCapture.getMinLength(qItem),
          maxLength: qItem.maxLength,
          maxDecimalPlaces: structuredDataCapture.getMaxDecimalPlaces(qItem),
          minValue: getMinValue(qItem),
          maxValue: getMaxValue(qItem),
          minQuantityValue: getMinQuantityValue(qItem),
          maxQuantityValue: getMaxQuantityValue(qItem)
        });

        if (invalidInputType) {
          invalidItems[qItem.linkId] = createValidationOperationOutcome(
            invalidInputType,
            qItem,
            qrItem,
            i,
            locationExpression,
            invalidItems[qItem.linkId]?.issue
          );
        } // if not invalid input types found
        else {
          //do nothing
        }
      }
    }
  }

  return invalidItems;
}

/**
 * Check if an answer array is effectively empty (no answers or all string answers are empty/whitespace-only)
 */
function isAnswerEffectivelyEmpty(answers: QuestionnaireResponseItemAnswer[]): boolean {
  if (!answers || answers.length === 0) {
    return true;
  }

  return answers.every((answer) => {
    // For string answers, check if they're empty or contain only whitespace
    if (answer.valueString !== undefined) {
      return answer.valueString.trim() === '';
    }

    // For other answer types, they're not empty if they exist
    return false;
  });
}

function getInputInString(answer?: QuestionnaireResponseItemAnswer) {
  if (!answer) {
    return '';
  }

  if (answer.valueString) {
    return answer.valueString;
  } else if (answer.valueInteger) {
    return answer.valueInteger.toString();
  } else if (answer.valueDecimal) {
    return answer.valueDecimal.toString();
  } else if (answer.valueUri) {
    return answer.valueUri;
  } else if (answer.valueQuantity && answer.valueQuantity.value) {
    // return the valueQuantity as string
    return answer.valueQuantity.value.toString();
  }

  return '';
}

interface GetInputInvalidTypeParams {
  qItem: QuestionnaireItem;
  input: string;
  regexValidation?: RegexValidation;
  minLength?: number;
  maxLength?: number;
  maxDecimalPlaces?: number;
  minValue?: string | number;
  maxValue?: string | number;
  minQuantityValue?: number;
  maxQuantityValue?: number;
}

export function getInputInvalidType(
  getInputInvalidTypeParams: GetInputInvalidTypeParams
): ValidationResult | null {
  const {
    qItem,
    input,
    regexValidation,
    minLength,
    maxLength,
    maxDecimalPlaces,
    minValue,
    maxValue,
    minQuantityValue,
    maxQuantityValue
  } = getInputInvalidTypeParams;

  if (input) {
    if (regexValidation && !regexValidation.expression.test(input)) {
      return ValidationResult.regex;
    }

    if (minLength !== undefined && input.length < minLength) {
      return ValidationResult.minLength;
    }

    if (maxLength !== undefined && input.length > maxLength) {
      return ValidationResult.maxLength;
    }

    if (maxDecimalPlaces !== undefined) {
      const decimalPlaces = input.split('.')[1]?.length ?? 0;
      if (decimalPlaces > maxDecimalPlaces) {
        return ValidationResult.maxDecimalPlaces;
      }
    }

    if (minValue !== undefined) {
      const minValueError = checkMinValue(qItem, input, minValue);
      if (minValueError !== null) {
        return ValidationResult.minValue;
      }
    }

    if (maxValue !== undefined) {
      const maxValueError = checkMaxValue(qItem, input, maxValue);
      if (maxValueError !== null) {
        return ValidationResult.maxValue;
      }
    }

    // if minQuantityValue exists then check the value and validate
    if (minQuantityValue !== undefined) {
      const minQuantityValueError = checkMinQuantityValue(qItem, input, minQuantityValue);
      if (minQuantityValueError !== null) {
        return ValidationResult.minQuantityValue;
      } else {
        // No error, do nothing
      }
    }
    // if maxQuantityValue exists then check the value and validate
    if (maxQuantityValue !== undefined) {
      const maxQuantityValueError = checkMaxQuantityValue(qItem, input, maxQuantityValue);
      if (maxQuantityValueError !== null) {
        return ValidationResult.maxQuantityValue;
      } else {
        // No error, do nothing
      }
    }
  }

  return null;
}

function checkMinValue(
  qItem: QuestionnaireItem,
  input: string,
  minValue: string | number
): ValidationResult.minValue | null {
  switch (qItem.type) {
    case 'integer':
      if (typeof minValue === 'number') {
        if (parseInt(input) < minValue) {
          return ValidationResult.minValue;
        }
      }
      break;
    case 'decimal': {
      const precision = getDecimalPrecision(qItem);
      const decimalValue = precision
        ? parseDecimalStringToFloat(input, precision)
        : parseFloat(input);

      if (typeof minValue === 'number') {
        if (decimalValue < minValue) {
          return ValidationResult.minValue;
        }
      }
      break;
    }
    case 'date':
      if (typeof minValue === 'string') {
        if (new Date(input) < new Date(minValue)) {
          return ValidationResult.minValue;
        }
      }
      break;
    case 'dateTime':
      if (typeof minValue === 'string') {
        if (dayjs(input).isBefore(dayjs(minValue))) {
          return ValidationResult.minValue;
        }
      }
      break;
    default:
      return null;
  }

  return null;
}

function checkMaxValue(
  qItem: QuestionnaireItem,
  input: string,
  maxValue: string | number
): ValidationResult.maxValue | null {
  switch (qItem.type) {
    case 'integer':
      if (typeof maxValue === 'number') {
        if (parseInt(input) > maxValue) {
          return ValidationResult.maxValue;
        }
      }
      break;
    case 'decimal': {
      const precision = getDecimalPrecision(qItem);
      const decimalValue = precision
        ? parseDecimalStringToFloat(input, precision)
        : parseFloat(input);

      if (typeof maxValue === 'number') {
        if (decimalValue > maxValue) {
          return ValidationResult.maxValue;
        }
      }
      break;
    }
    case 'date':
      if (typeof maxValue === 'string') {
        if (new Date(input) > new Date(maxValue)) {
          return ValidationResult.maxValue;
        }
      }
      break;
    case 'dateTime':
      if (typeof maxValue === 'string') {
        if (dayjs(input).isAfter(dayjs(maxValue))) {
          return ValidationResult.maxValue;
        }
      }
      break;
    default:
      return null;
  }

  return null;
}

/**
 * Checks for Minimum Quantity Value and returns the validation results
 *
 * @param {QuestionnaireItem} qItem
 * @param {string} input
 * @param {number} minQuantityValue
 * @return {*}  {(ValidationResult.minQuantityValue | null)}
 */
function checkMinQuantityValue(
  qItem: QuestionnaireItem,
  input: string,
  minQuantityValue: number
): ValidationResult.minQuantityValue | null {
  switch (qItem.type) {
    case 'quantity': {
      const precision = getDecimalPrecision(qItem);
      const decimalValue = precision
        ? parseDecimalStringToFloat(input, precision)
        : parseFloat(input);

      if (decimalValue < minQuantityValue) {
        return ValidationResult.minQuantityValue;
      }

      break;
    }
    default:
      return null;
  }

  return null;
}

/**
 * Checks for Maxmim Quantity Value and returns the validation results
 *
 * @param {QuestionnaireItem} qItem
 * @param {string} input
 * @param {number} maxQuantityValue
 * @return {*}  {(ValidationResult.maxQuantityValue | null)}
 */
function checkMaxQuantityValue(
  qItem: QuestionnaireItem,
  input: string,
  maxQuantityValue: number
): ValidationResult.maxQuantityValue | null {
  switch (qItem.type) {
    case 'quantity': {
      const precision = getDecimalPrecision(qItem);
      const decimalValue = precision
        ? parseDecimalStringToFloat(input, precision)
        : parseFloat(input);

      if (decimalValue > maxQuantityValue) {
        return ValidationResult.maxQuantityValue;
      }

      break;
    }
    default:
      return null;
  }

  return null;
}

export function createValidationOperationOutcome(
  error: ValidationResult,
  qItem: QuestionnaireItem | null,
  qrItem: QuestionnaireResponseItem | null,
  answerIndex: number | null,
  locationExpression: string,
  existingOperationOutcomeIssues: OperationOutcomeIssue[] = []
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: existingOperationOutcomeIssues.concat(
      createValidationOperationOutcomeIssue(error, qItem, qrItem, answerIndex, locationExpression)
    )
  };
}

function createValidationOperationOutcomeIssue(
  error: ValidationResult,
  qItem: QuestionnaireItem | null,
  qrItem: QuestionnaireResponseItem | null,
  answerIndex: number | null,
  locationExpression: string,
  severity: 'error' | 'warning' = 'error',
  humanReadable?: string
): OperationOutcomeIssue {
  const errorCodeSystem = 'http://fhir.forms-lab.com/CodeSystem/errors';
  let detailsText = '';
  let fieldDisplayText = '';
  if (qItem && qrItem) {
    fieldDisplayText =
      qrItem?.text ?? getShortText(qItem) ?? qItem?.text ?? qItem.linkId ?? qrItem.linkId;
  } else {
    fieldDisplayText = 'Unknown item';
  }

  if (!fieldDisplayText && fieldDisplayText.endsWith(':')) {
    fieldDisplayText = fieldDisplayText.substring(0, fieldDisplayText.length - 1);
  }

  answerIndex = answerIndex ?? 0;

  // create operationOutcomeIssue based on error
  switch (error) {
    case ValidationResult.required: {
      if (qItem?.type === 'group') {
        detailsText = `${fieldDisplayText}: Mandatory group does not have answer(s)`;
      } else {
        detailsText = `${fieldDisplayText}: Mandatory field does not have an answer`;
      }

      return {
        severity: severity,
        code: 'required',
        expression: [locationExpression],
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
      detailsText = `${fieldDisplayText}: The value '${getInputInString(
        qrItem?.answer?.[answerIndex]
      )}' does not match the defined format.`;
      if (qItem && structuredDataCapture.getEntryFormat(qItem)) {
        detailsText += ` ${structuredDataCapture.getEntryFormat(qItem)}`;
      }

      return {
        severity: severity,
        code: 'invalid',
        expression: [locationExpression],
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
        diagnostics: qItem ? (getRegexString(qItem) ?? undefined) : undefined
      };
    }

    case ValidationResult.minLength: {
      detailsText = `${fieldDisplayText}: Expected the minimum value ${
        qItem ? structuredDataCapture.getMinLength(qItem) : undefined
      } characters, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
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
      detailsText = `${fieldDisplayText}: Exceeded maximum of  ${
        qItem?.maxLength
      } characters, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
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

    case ValidationResult.maxDecimalPlaces: {
      detailsText = `${fieldDisplayText}: Exceeded maximum decimal places ${
        qItem ? structuredDataCapture.getMaxDecimalPlaces(qItem) : undefined
      }, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too precise'
            }
          ],
          text: detailsText
        }
      };
    }

    case ValidationResult.minValue: {
      detailsText = `${fieldDisplayText}: Expected the minimum value ${
        qItem ? getMinValue(qItem) : undefined
      }, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too small'
            }
          ],
          text: detailsText
        }
      };
    }

    case ValidationResult.maxValue: {
      detailsText = `${fieldDisplayText}: Exceeded the maximum value ${
        qItem ? getMaxValue(qItem) : undefined
      }, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too big'
            }
          ],
          text: detailsText
        }
      };
    }

    // Validation result error handling for min quantity extension
    case ValidationResult.minQuantityValue: {
      detailsText = `${fieldDisplayText}: Expected the minimum value ${
        qItem ? getMinQuantityValue(qItem) : undefined
      }, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too small'
            }
          ],
          text: detailsText
        }
      };
    }

    // Validation result error handling for max quantity extension
    case ValidationResult.maxQuantityValue: {
      detailsText = `${fieldDisplayText}: Exceeded the maximum value ${
        qItem ? getMaxQuantityValue(qItem) : undefined
      }, received '${getInputInString(qrItem?.answer?.[answerIndex])}'`;
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: 'Too big'
            }
          ],
          text: detailsText
        }
      };
    }

    case ValidationResult.invariant: {
      return {
        severity: severity,
        code: 'business-rule',
        expression: [locationExpression],
        details: {
          coding: [
            {
              system: errorCodeSystem,
              code: error,
              display: humanReadable
            }
          ],
          text: humanReadable
        }
      };
    }

    // mark unknown issues as fatal
    default: {
      return {
        severity: 'error',
        code: 'unknown',
        expression: [locationExpression],
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
