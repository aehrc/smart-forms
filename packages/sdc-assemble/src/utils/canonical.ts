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

import type { OperationOutcome, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { createErrorOutcome } from './operationOutcome';

export const SUB_QUESTIONNAIRE_EXTENSION_URL =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire';

/**
 * Tests whether a questionnaire item is a subQuestionnaire placeholder, i.e. it carries a
 * sdc-questionnaire-subQuestionnaire extension with a valueCanonical.
 *
 * @param item - The QuestionnaireItem to test
 * @returns True if the item references a subquestionnaire, false otherwise
 *
 * @author Sean Fong
 */
export function itemIsSubQuestionnaire(item: QuestionnaireItem): boolean {
  return (
    item.extension?.some(
      (extension) => extension.url === SUB_QUESTIONNAIRE_EXTENSION_URL && !!extension.valueCanonical
    ) ?? false
  );
}

/**
 * Retrieves all the canonical urls from a parent questionnaire
 * also checks for duplicate canonical urls to prevent a circular dependency situation
 *
 * @param parentQuestionnaire - The parent Questionnaire resource
 * @param totalCanonicals - An array of all the canonical urls
 * @returns An array of canonical urls from the parent questionnaire or an OperationOutcome error
 *
 * @author Sean Fong
 */
export function getCanonicalUrls(
  parentQuestionnaire: Questionnaire,
  totalCanonicals: string[],
  isRoot: boolean
): string[] | OperationOutcome {
  if (
    !parentQuestionnaire.item ||
    !parentQuestionnaire.item[0] ||
    !parentQuestionnaire.item[0].item
  ) {
    const questionnaireUrlOrId = parentQuestionnaire.url || parentQuestionnaire.id;

    // If isRoot is true, return an error for the root questionnaire
    // Otherwise, return an empty array to indicate no canonicals found in the subquestionnaire
    return isRoot
      ? createErrorOutcome(
          `Root questionnaire ${questionnaireUrlOrId} does not have a valid nested item (parentQuestionnaire.item[x].item) for assembly.`
        )
      : [];
  }

  // Collect subQuestionnaire canonicals from the whole form item tree in depth-first document
  // order, so placeholders nested inside wrapper groups — not just direct children of the form
  // group — are picked up for assembly. propagateProperties() walks the tree in the same order.
  const canonicals: string[] = [];
  const circularDependencyOutcome = collectSubquestionnaireCanonicals(
    parentQuestionnaire.item[0].item,
    totalCanonicals,
    canonicals,
    parentQuestionnaire
  );

  return circularDependencyOutcome ?? canonicals;
}

/**
 * Recursively collects subQuestionnaire canonical urls from a list of questionnaire items and
 * their descendants, in depth-first document order. Collected canonicals are pushed into
 * `canonicals`; returns an OperationOutcome if a circular dependency is detected, otherwise null.
 *
 * @param items - The questionnaire items to scan (a form group's children or a wrapper group's children)
 * @param totalCanonicals - An array of all canonical urls traversed so far (used for circular dependency detection)
 * @param canonicals - The accumulator the collected canonicals are pushed into
 * @param parentQuestionnaire - The parent Questionnaire resource (used for the circular dependency error message)
 * @returns An OperationOutcome error if a circular dependency is found, otherwise null
 *
 * @author Sean Fong
 */
function collectSubquestionnaireCanonicals(
  items: QuestionnaireItem[],
  totalCanonicals: string[],
  canonicals: string[],
  parentQuestionnaire: Questionnaire
): OperationOutcome | null {
  for (const qItem of items) {
    // A subQuestionnaire placeholder is terminal — collect its canonical and don't recurse into it
    if (itemIsSubQuestionnaire(qItem)) {
      // itemIsSubQuestionnaire guarantees a subQuestionnaire extension with a valueCanonical
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const canonical = qItem.extension!.find(
        (extension) => extension.url === SUB_QUESTIONNAIRE_EXTENSION_URL && extension.valueCanonical
      )!.valueCanonical!;

      // Check for duplicate canonicals to prevent a circular dependency situation
      if (totalCanonicals.includes(canonical)) {
        return createErrorOutcome(
          `${parentQuestionnaire.id} contains a circular dependency on the questionnaire ${canonical}`
        );
      }

      canonicals.push(canonical);
      continue;
    }

    // Recurse into wrapper groups so nested placeholders are collected too
    if (qItem.item && qItem.item.length > 0) {
      const circularDependencyOutcome = collectSubquestionnaireCanonicals(
        qItem.item,
        totalCanonicals,
        canonicals,
        parentQuestionnaire
      );
      if (circularDependencyOutcome) {
        return circularDependencyOutcome;
      }
    }
  }

  return null;
}
