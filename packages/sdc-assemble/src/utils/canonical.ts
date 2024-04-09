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

import type { OperationOutcome, Questionnaire } from 'fhir/r4';
import { createErrorOutcome } from './operationOutcome';

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
  totalCanonicals: string[]
): string[] | OperationOutcome {
  if (
    !parentQuestionnaire.item ||
    !parentQuestionnaire.item[0] ||
    !parentQuestionnaire.item[0].item
  ) {
    return createErrorOutcome('Root questionnaire does not have a valid item.');
  }

  const qForm = parentQuestionnaire.item[0].item;
  const canonicals = [];
  for (const qItem of qForm) {
    if (!qItem.extension) {
      continue;
    }

    // Get subquestionnaire extension
    const subQuestionnaireExtension = qItem.extension.find(
      (extension) =>
        extension.url ===
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire' &&
        extension.valueCanonical
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
