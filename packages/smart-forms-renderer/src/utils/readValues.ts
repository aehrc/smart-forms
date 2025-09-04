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

import type { QuestionnaireResponseItem } from 'fhir/r4';

/**
 * Read the first decimal/integer answer from a QuestionnaireResponseItem.
 * Used in DecimalItem.tsx
 * Returns a numeric value and a string formatted to the given precision.
 */
export function readDecimalValue(
  qrItem: QuestionnaireResponseItem | null,
  precision: number | null
): { valueDecimal: number; initialInput: string } {
  let valueDecimal = 0.0;
  let initialInput = '';

  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueDecimal) {
      valueDecimal = qrItem.answer[0].valueDecimal;
    }

    if (qrItem?.answer[0].valueInteger) {
      valueDecimal = qrItem.answer[0].valueInteger;
    }

    initialInput = precision ? valueDecimal.toFixed(precision) : valueDecimal.toString();
  }

  return { valueDecimal, initialInput };
}

/**
 * Read the first integer/decimal answer from a QuestionnaireResponseItem.
 * Used in IntegerItem.tsx
 * Returns a rounded integer value and its string form.
 */
export function readIntegerValue(qrItem: QuestionnaireResponseItem | null): {
  valueInteger: number;
  initialInput: string;
} {
  let valueInteger = 0;
  let initialInput = '';
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueInteger) {
      valueInteger = qrItem.answer[0].valueInteger;
    }

    if (qrItem?.answer[0].valueDecimal) {
      valueInteger = Math.round(qrItem.answer[0].valueDecimal);
    }

    initialInput = valueInteger.toString();
  }

  return { valueInteger, initialInput };
}

/**
 * Read the first string answer from a QuestionnaireResponseItem.
 * Used in StringItem.tsx
 * Returns the string value for both raw and initial input.
 */
export function readStringValue(qrItem: QuestionnaireResponseItem | null): {
  valueString: string;
  initialInput: string;
} {
  let valueString = '';
  if (qrItem?.answer && qrItem?.answer[0].valueString) {
    valueString = qrItem.answer[0].valueString;
  }

  return { valueString, initialInput: valueString };
}
