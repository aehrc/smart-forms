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
  Quantity,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { parseDecimalStringToFloat } from './parseInputs';

export const quantityComparators: Quantity['comparator'][] = ['<', '<=', '>=', '>'];

export function stringIsComparator(str: string | undefined): str is Quantity['comparator'] {
  return str === '<' || str === '<=' || str === '>=' || str === '>';
}

export function createQuantityItemAnswer(
  precision: number | null,
  parsedNewInput: string,
  comparatorInput: Quantity['comparator'] | null,
  unitInput: QuestionnaireItemAnswerOption | null,
  answerKey: string | undefined
): QuestionnaireResponseItemAnswer[] {
  if (precision) {
    return [
      {
        id: answerKey,
        valueQuantity: {
          value: parseDecimalStringToFloat(parsedNewInput, precision),
          comparator: comparatorInput ?? undefined,
          unit: unitInput?.valueCoding?.display,
          system: unitInput?.valueCoding?.system,
          code: unitInput?.valueCoding?.code
        }
      }
    ];
  }

  return [
    {
      id: answerKey,
      valueQuantity: {
        value: parseFloat(parsedNewInput),
        comparator: comparatorInput ?? undefined,
        unit: unitInput?.valueCoding?.display,
        system: unitInput?.valueCoding?.system,
        code: unitInput?.valueCoding?.code
      }
    }
  ];
}
