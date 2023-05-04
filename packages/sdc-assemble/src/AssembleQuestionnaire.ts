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

import type { FhirResource, OperationOutcome, Questionnaire } from 'fhir/r4';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';
import {
  checkMatchingLanguage,
  checkProhibitedAttributes,
  getContainedResources,
  getExtensions,
  getSubquestionnaireItems,
  getUrls,
  isValidExtensions,
  mergeExtensionsIntoItems
} from './GetSubquestionnaireItems';
import { propagateSubquestionnaireItems } from './PropagateSubquestionnaireItems';

export async function assembleQuestionnaire(
  questionnaire: Questionnaire,
  allCanonicals: string[],
  formsServerEndpoint: string
): Promise<Questionnaire | OperationOutcome> {
  const parentQuestionnaire = JSON.parse(JSON.stringify(questionnaire));
  const canonicals = getCanonicalUrls(parentQuestionnaire, allCanonicals);
  if (!Array.isArray(canonicals)) return canonicals;

  // Exit operation if there are no subquestionnaires to be assembled
  if (canonicals.length === 0) return parentQuestionnaire;

  // Keep a record of all traversed canonical urls to prevent an infinite loop situation during assembly
  allCanonicals.push(...canonicals);

  const subquestionnaires = await fetchSubquestionnaires(canonicals, formsServerEndpoint);
  if (!Array.isArray(subquestionnaires)) return subquestionnaires;

  // Recursively assemble subquestionnaires if required
  for (let subquestionnaire of subquestionnaires) {
    const assembledSubquestionnaire = await assembleQuestionnaire(
      subquestionnaire,
      allCanonicals,
      formsServerEndpoint
    );
    if (assembledSubquestionnaire.resourceType === 'Questionnaire') {
      subquestionnaire = assembledSubquestionnaire;
    } else {
      // Prematurely end the operation if there is an error within further assembly operations
      return assembledSubquestionnaire;
    }
  }

  // Begin assembly process for parent questionnaire
  const prohibitedAttributesOutcome = checkProhibitedAttributes(subquestionnaires);
  if (prohibitedAttributesOutcome) return prohibitedAttributesOutcome;

  const matchingLanguageOutcome = checkMatchingLanguage(subquestionnaires, parentQuestionnaire);
  if (matchingLanguageOutcome) return matchingLanguageOutcome;

  // Get items
  const items = getSubquestionnaireItems(subquestionnaires);

  // Get urls with versions
  const urls = getUrls(subquestionnaires);

  // Get contained resources
  const containedResources: Record<string, FhirResource> = getContainedResources(subquestionnaires);

  // Get extensions
  const extensions = getExtensions(subquestionnaires);
  if (!isValidExtensions(extensions)) return extensions;
  const { rootLevelExtensions, itemLevelExtensions } = extensions;

  // Merge item-level extensions into items
  const itemsWithExtensions = mergeExtensionsIntoItems(items, itemLevelExtensions);

  // propagate items, contained resources and extensions into parent questionnaire
  return propagateSubquestionnaireItems(
    parentQuestionnaire,
    urls,
    itemsWithExtensions,
    containedResources,
    rootLevelExtensions
  );
}
