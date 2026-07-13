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
      (extension) =>
        extension.url === SUB_QUESTIONNAIRE_EXTENSION_URL && !!extension.valueCanonical
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

  const qForm = parentQuestionnaire.item[0].item;
  const canonicals = [];
  for (const qItem of qForm) {
    if (!qItem.extension) {
      continue;
    }

    // Get subquestionnaire extension
    const subQuestionnaireExtension = qItem.extension.find(
      (extension) => extension.url === SUB_QUESTIONNAIRE_EXTENSION_URL && extension.valueCanonical
    );

    // Proceed to next item if subquestionnaire extension is not present
    if (!subQuestionnaireExtension) {
      continue;
    }

    // We verified that the valueCanonical is present, can safely cast here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canonical = subQuestionnaireExtension.valueCanonical!;

    // Check for duplicate canonicals to prevent a circular dependency situation
    if (totalCanonicals.includes(canonical)) {
      return createErrorOutcome(
        `${parentQuestionnaire.id} contains a circular dependency on the questionnaire ${canonical}`
      );
    }

    canonicals.push(canonical);
  }

  return canonicals;
}

/**
 * Aligns the assembled items collected from subquestionnaires with the parent form's item
 * positions.
 *
 * `getItems()` returns one entry per subquestionnaire, in the document order the subquestionnaire
 * placeholders appear under `parentQuestionnaire.item[0].item` (the same order as
 * {@link getCanonicalUrls}). `propagateProperties()`, however, walks the parent form items by
 * position and looks up `itemsFromSubquestionnaires[i]` at that same index. Those two only line up
 * when *every* child of the form is a subQuestionnaire placeholder. As soon as a regular
 * (non-placeholder) item is mixed in — e.g. a real question sitting next to a placeholder — the
 * compact list is offset from the parent positions, so the wrong item gets replaced and the
 * placeholder is left unresolved.
 *
 * This re-expands the compact list into an array the same length as `parentQuestionnaire.item[0].item`,
 * placing each subquestionnaire's items at its placeholder's position and `null` at every regular
 * item so `propagateProperties()` keeps those regular items in place.
 *
 * @param parentQuestionnaire - The parent Questionnaire resource
 * @param compactItemsFromSubquestionnaires - Items collected from subquestionnaires, one entry per subquestionnaire in document order
 * @returns Items aligned to the parent form item positions (null where the parent item is not a subQuestionnaire placeholder)
 *
 * @author Sean Fong
 */
export function alignItemsWithParentForm(
  parentQuestionnaire: Questionnaire,
  compactItemsFromSubquestionnaires: (QuestionnaireItem[] | null)[]
): (QuestionnaireItem[] | null)[] {
  const qForm = parentQuestionnaire.item?.[0]?.item;
  if (!qForm) {
    return compactItemsFromSubquestionnaires;
  }

  const alignedItems: (QuestionnaireItem[] | null)[] = [];
  let subquestionnaireIndex = 0;
  for (const qItem of qForm) {
    if (itemIsSubQuestionnaire(qItem)) {
      alignedItems.push(compactItemsFromSubquestionnaires[subquestionnaireIndex++] ?? null);
    } else {
      alignedItems.push(null);
    }
  }

  return alignedItems;
}
