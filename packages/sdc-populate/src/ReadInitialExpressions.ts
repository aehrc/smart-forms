/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { Expression, Extension, Questionnaire, QuestionnaireItem } from 'fhir/r5';
import type { InitialExpression } from './Interfaces';

/**
 * Recursively read the items within a questionnaire item and store their initial expressions in a <string, InitialExpression> key-value map
 *
 * @author Sean Fong
 */
export function readInitialExpressions(
  questionnaire: Questionnaire
): Record<string, InitialExpression> {
  if (!questionnaire.item) return {};

  const initialExpressions = {};

  questionnaire.item.forEach((item) => {
    readQuestionnaireItem(item, initialExpressions);
  });
  return initialExpressions;
}

/**
 * Recursively read a single questionnaire item/group and save its initialExpression into the object if present
 *
 * @author Sean Fong
 */
function readQuestionnaireItem(
  item: QuestionnaireItem,
  initialExpressions: Record<string, InitialExpression>
): Record<string, InitialExpression> {
  const items = item.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    items.forEach((item) => {
      readQuestionnaireItem(item, initialExpressions);
    });

    return initialExpressions;
  }

  // Read initial expression of qItem
  const initialExpression = getInitialExpression(item);
  if (initialExpression && initialExpression.expression) {
    initialExpressions[item.linkId] = {
      expression: initialExpression.expression,
      value: undefined
    };
  }

  return initialExpressions;
}

/**
 * Check if a questionnaireItem contains an initialExpression
 *
 * @author Sean Fong
 */
export function getInitialExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression'
  );

  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}
