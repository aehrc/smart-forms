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
  QuestionnaireItem,
  QuestionnaireItemInitial,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { findInAnswerOptions } from './answerOption';
import { checkIsDateTime, checkIsTime, convertDateTimeToDate } from './constructResponse';

export function parseItemInitialToAnswer(
  initial: QuestionnaireItemInitial
): QuestionnaireResponseItemAnswer | null {
  if (initial.valueBoolean) {
    return { valueBoolean: initial.valueBoolean };
  }

  if (initial.valueDecimal) {
    return { valueDecimal: initial.valueDecimal };
  }

  if (initial.valueInteger) {
    return { valueInteger: initial.valueInteger };
  }

  if (initial.valueDate) {
    return { valueDate: initial.valueDate };
  }

  if (initial.valueDateTime) {
    return { valueDateTime: initial.valueDateTime };
  }

  if (initial.valueTime) {
    return { valueTime: initial.valueTime };
  }

  if (initial.valueString) {
    return { valueString: initial.valueString };
  }

  if (initial.valueUri) {
    return { valueUri: initial.valueUri };
  }

  if (initial.valueAttachment) {
    return { valueAttachment: initial.valueAttachment };
  }

  if (initial.valueCoding) {
    return { valueCoding: initial.valueCoding };
  }

  if (initial.valueQuantity) {
    return { valueQuantity: initial.valueQuantity };
  }

  if (initial.valueReference) {
    return { valueReference: initial.valueReference };
  }

  return null;
}

export function parseValueToAnswer(
  qItem: QuestionnaireItem,
  value: any
): QuestionnaireResponseItemAnswer {
  if (qItem.answerOption) {
    const answerOption = findInAnswerOptions(qItem.answerOption, value);

    if (answerOption) {
      return answerOption;
    }
  }

  if (typeof value === 'boolean' && qItem.type === 'boolean') {
    return { valueBoolean: value };
  }

  if (typeof value === 'number') {
    if (qItem.type === 'decimal') {
      return { valueDecimal: value };
    }
    if (qItem.type === 'integer') {
      return { valueInteger: value };
    }
  }

  if (typeof value === 'object') {
    return { valueCoding: value };
  }

  // Value is string at this point
  if (qItem.type === 'date' && checkIsDateTime(value)) {
    return { valueDate: convertDateTimeToDate(value) };
  }

  if (qItem.type === 'dateTime' && checkIsDateTime(value)) {
    return { valueDateTime: value };
  }

  if (qItem.type === 'time' && checkIsTime(value)) {
    return { valueTime: value };
  }

  return { valueString: value };
}
