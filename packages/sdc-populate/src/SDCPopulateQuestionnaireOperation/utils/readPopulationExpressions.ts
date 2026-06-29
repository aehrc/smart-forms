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

import type { Expression, Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type { PopulationExpressions } from '../interfaces/expressions.interface';

/**
 * Recursively read the items within a questionnaire item and store their initial expressions in a <string, InitialExpression> key-value map
 *
 * @author Sean Fong
 */
export function readPopulationExpressions(questionnaire: Questionnaire): PopulationExpressions {
  const populationExpressions = {
    initialExpressions: {},
    itemPopulationContexts: {}
  };

  if (!questionnaire.item) return populationExpressions;

  questionnaire.item.forEach((item) => {
    readQuestionnaireItemRecursive(item, populationExpressions);
  });
  return populationExpressions;
}

/**
 * Recursively read a single questionnaire item/group and save its initialExpression into the object if present.
 * initialExpressions belonging to children of an itemPopulationContext group are excluded from the global map —
 * they are evaluated per-item in constructRepeatGroupInstances and must not be pre-evaluated against the full collection.
 *
 * @author Sean Fong
 */
function readQuestionnaireItemRecursive(
  item: QuestionnaireItem,
  populationExpressions: PopulationExpressions,
  underItemPopulationContext = false
): PopulationExpressions {
  const items = item.item;
  if (items && items.length > 0) {
    // Read item population context of group item
    const itemPopulationContext = getItemPopulationContext(item);
    if (itemPopulationContext && itemPopulationContext.expression && itemPopulationContext.name) {
      populationExpressions.itemPopulationContexts[itemPopulationContext.name] = {
        linkId: item.linkId,
        name: itemPopulationContext.name,
        expression: itemPopulationContext.expression,
        value: undefined
      };
    }

    // Read initial expression of group item — skipped when under an itemPopulationContext
    if (!underItemPopulationContext) {
      const initialExpression = getInitialExpression(item);
      if (initialExpression && initialExpression.expression) {
        populationExpressions.initialExpressions[item.linkId] = {
          expression: initialExpression.expression,
          value: undefined
        };
      }
    }

    // Children of a *repeating* itemPopulationContext group are evaluated per-item in
    // constructRepeatGroupInstances, so they must be excluded from the global map.
    // Non-repeating groups (repeats: false) with itemPopulationContext are single-instance;
    // their children are evaluated globally once the context variable is available.
    const childrenUnderContext =
      underItemPopulationContext || (!!itemPopulationContext && !!item.repeats);
    items.forEach((item) => {
      readQuestionnaireItemRecursive(item, populationExpressions, childrenUnderContext);
    });

    return populationExpressions;
  }

  // Read initial expression of qItem — skipped when under an itemPopulationContext
  if (!underItemPopulationContext) {
    const initialExpression = getInitialExpression(item);
    if (initialExpression && initialExpression.expression) {
      populationExpressions.initialExpressions[item.linkId] = {
        expression: initialExpression.expression,
        value: undefined
      };
    }
  }

  return populationExpressions;
}

/**
 * Check and returns it if a questionnaireItem contains an initialExpression
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

/**
 * Check and returns it if a questionnaireItem contains an itemPopulationContext
 *
 * @author Sean Fong
 */
export function getItemPopulationContext(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext'
  );

  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}

export function getItemPopulationContextName(itemPopulationContextExpression: string): string {
  return itemPopulationContextExpression.substring(
    itemPopulationContextExpression.indexOf('%') + 1,
    itemPopulationContextExpression.indexOf('.')
  );
}
