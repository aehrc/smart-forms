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

import type { Extension, QuestionnaireItem } from 'fhir/r4';

/**
 * Get Questionnaire slider step value if its extension is present (http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue)
 *
 * @author Sean Fong
 */
export function getSliderStepValue(qItem: QuestionnaireItem): number | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue'
  );

  if (itemControl) {
    if (itemControl.valueInteger) {
      return itemControl.valueInteger;
    }
  }
  return null;
}

/**
 * Get minimum value if its extension is present (http://hl7.org/fhir/StructureDefinition/minValue)
 * Only supports valueInteger and valueDecimal for now
 *
 * @author Sean Fong
 */
export function getMinValue(qItem: QuestionnaireItem): number | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/minValue'
  );

  if (itemControl) {
    if (itemControl.valueInteger) {
      return itemControl.valueInteger;
    }

    if (itemControl.valueDecimal) {
      return itemControl.valueDecimal;
    }
  }
  return null;
}

/**
 * Get maximum value if its extension is present (http://hl7.org/fhir/StructureDefinition/maxValue)
 * Only supports valueInteger and valueDecimal for now
 *
 * @author Sean Fong
 */
export function getMaxValue(qItem: QuestionnaireItem): number | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/maxValue'
  );

  if (itemControl) {
    if (itemControl.valueInteger) {
      return itemControl.valueInteger;
    }

    if (itemControl.valueDecimal) {
      return itemControl.valueDecimal;
    }
  }
  return null;
}

export function getSliderMarks(
  minValue: number,
  maxValue: number,
  minLabel: string,
  maxLabel: string,
  stepValue: number
) {
  const numOfSteps = Math.ceil((maxValue - minValue) / stepValue);
  if (numOfSteps > 20) {
    return [
      {
        value: minValue,
        label: minLabel !== '' ? minLabel : minValue.toString()
      },
      {
        value: maxValue,
        label: maxLabel !== '' ? maxLabel : maxValue.toString()
      }
    ];
  }

  return Array.from({ length: numOfSteps + 1 }, (_, i) => minValue + i * stepValue).map(
    (value) => ({
      value: value,
      label: value
    })
  );
}
