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

import type { Expression, Extension, QuestionnaireItem } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';

/**
 * Get enableWhenExpression.valueExpression if its present in item
 *
 * @author Sean Fong
 */
export function getEnableWhenExpression(qItem: QuestionnaireItem): Expression | null {
  const enableWhenExpression = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );

  if (enableWhenExpression?.valueExpression) {
    return enableWhenExpression.valueExpression;
  }
  return null;
}

/**
 * Get calculatedExpression.valueExpression if its present in item or item._text
 *
 * @author Sean Fong
 */
export function getCalculatedExpressions(qItem: QuestionnaireItem): CalculatedExpression[] {
  const calculatedExpressionsInItem = findCalculatedExpressionsInExtensions(qItem.extension ?? [])
    .map(
      (calculatedExpression): CalculatedExpression => ({
        expression: calculatedExpression.valueExpression?.expression ?? '',
        from: 'item'
      })
    )
    .filter((calculatedExpression) => calculatedExpression.expression !== '');

  const calculatedExpressionsInText = findCalculatedExpressionsInExtensions(
    qItem._text?.extension ?? []
  )
    .map(
      (calculatedExpression): CalculatedExpression => ({
        expression: calculatedExpression.valueExpression?.expression ?? '',
        from: 'item._text'
      })
    )
    .filter((calculatedExpression) => calculatedExpression.expression !== '');

  return [...calculatedExpressionsInItem, ...calculatedExpressionsInText];
}

function findCalculatedExpressionsInExtensions(extensions: Extension[]): Extension[] {
  return extensions.filter(
    (extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
}

/**
 * Get answerExpression.valueExpression if its present in item
 *
 * @author Sean Fong
 */
export function getAnswerExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}
