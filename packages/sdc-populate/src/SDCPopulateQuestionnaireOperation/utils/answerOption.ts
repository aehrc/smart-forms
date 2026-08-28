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
  Coding,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { getRelevantCodingProperties } from './codingProperties';

/**
 * Find and return corresponding answerOption based on a populated or selected answer value.
 * String values match by code, display, string, or integer value.
 * Coding values (e.g. from an initialExpression FHIRPath result) match coding options by code,
 * with system agreement when both sides specify one.
 *
 * @author Sean Fong
 */
export function findInAnswerOptions(
  options: QuestionnaireItemAnswerOption[],
  value: string | Coding
): QuestionnaireResponseItemAnswer | undefined {
  for (const option of options) {
    if (option.valueCoding) {
      if (typeof value === 'string') {
        if (value === option.valueCoding.code) {
          return {
            valueCoding: getRelevantCodingProperties(option.valueCoding)
          };
        }

        // handle case where valueCoding.code is not present
        if (value === option.valueCoding.display) {
          return {
            valueCoding: getRelevantCodingProperties(option.valueCoding)
          };
        }
      } else if (valueIsCoding(value) && codingMatchesOption(value, option.valueCoding)) {
        return {
          valueCoding: getRelevantCodingProperties(option.valueCoding)
        };
      }
    }

    if (option.valueString) {
      if (value === option.valueString) {
        return {
          valueString: option.valueString
        };
      }
    }

    if (typeof option.valueInteger === 'number') {
      if (value === option.valueInteger.toString()) {
        return {
          valueInteger: option.valueInteger
        };
      }
    }
  }

  return;
}

/**
 * Check that a non-string answer value is a Coding, and not another complex type
 * carrying a "code" property such as a Quantity.
 */
// Element properties (id, extension) plus everything a Coding can carry
const CODING_PROPERTIES = new Set([
  'id',
  'extension',
  'system',
  'version',
  'code',
  'display',
  'userSelected'
]);

export function valueIsCoding(value: unknown): value is Coding {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Coding).code === 'string' &&
    Object.keys(value).every((key) => CODING_PROPERTIES.has(key))
  );
}

export function codingMatchesOption(coding: Coding, optionCoding: Coding): boolean {
  // when both codings specify a system, they must agree
  if (coding.system && optionCoding.system && coding.system !== optionCoding.system) {
    return false;
  }

  if (coding.code && optionCoding.code) {
    return coding.code === optionCoding.code;
  }

  // display-only codings are legal in answerOption; match them by display
  if (!coding.code && !optionCoding.code) {
    return Boolean(coding.display) && coding.display === optionCoding.display;
  }

  return false;
}
