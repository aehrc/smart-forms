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
  if (typeof initial.valueBoolean === 'boolean') {
    return { valueBoolean: initial.valueBoolean };
  }

  if (typeof initial.valueDecimal === 'number') {
    return { valueDecimal: initial.valueDecimal };
  }

  if (typeof initial.valueInteger === 'number') {
    return { valueInteger: initial.valueInteger };
  }

  if (typeof initial.valueDate === 'string') {
    return { valueDate: initial.valueDate };
  }

  if (typeof initial.valueDateTime === 'string') {
    return { valueDateTime: initial.valueDateTime };
  }

  if (typeof initial.valueTime === 'string') {
    return { valueTime: initial.valueTime };
  }

  if (typeof initial.valueString === 'string') {
    return { valueString: initial.valueString };
  }

  if (typeof initial.valueUri === 'string') {
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

  if (typeof value === 'object' && value.unit) {
    return { valueQuantity: value };
  }

  if (typeof value === 'object' && value.system && value.code) {
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
