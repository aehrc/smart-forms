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

import type {
  FhirResource,
  OperationOutcome,
  OperationOutcomeIssue,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r4';
import { fetchSubquestionnaires } from './subQuestionnaires';
import type { PropagatedExtensions } from './getItems';
import {
  checkMatchingLanguage,
  checkProhibitedAttributes,
  getContainedResources,
  getExtensions,
  getItems,
  getUrls,
  isValidExtensions,
  mergeExtensionsIntoItems
} from './getItems';
import { propagateProperties } from './propagate';
import cloneDeep from 'lodash.clonedeep';
import type { FetchQuestionnaireCallback } from './interfaces/callback.interface';
import { getCanonicalUrls } from './canonical';

/**
 * Assembles a Questionnaire resource from a root Questionnaire resource recursively
 *
 * @param rootQuestionnaire - The root Questionnaire resource
 * @param totalCanonicals - An array of all the recorded canonical urls within the root Questionnaire recursively
 * @param issues - A list of OperationOutcome warnings
 * @param fetchQuestionnaireCallback - A callback function defined by the implementer to fetch Questionnaire resources by canonical url
 * @returns An assembled Questionnaire resource or an OperationOutcome error
 *
 * @author Sean Fong
 */
export async function assembleQuestionnaire(
  rootQuestionnaire: Questionnaire,
  totalCanonicals: string[],
  issues: OperationOutcomeIssue[],
  fetchQuestionnaireCallback: FetchQuestionnaireCallback
): Promise<Questionnaire | OperationOutcome> {
  const parentQuestionnaire = cloneDeep(rootQuestionnaire);

  // Get subquestionnaire canonical urls from parent questionnaire items
  const canonicals: string[] | OperationOutcome = getCanonicalUrls(
    parentQuestionnaire,
    totalCanonicals
  );
  if (!Array.isArray(canonicals)) {
    return canonicals;
  }

  // Exit operation if there are no subquestionnaires to be assembled
  if (canonicals.length === 0) {
    return parentQuestionnaire;
  }

  // Keep a record of all traversed canonical urls to prevent an infinite loop situation
  totalCanonicals.push(...canonicals);

  // Fetch subquestionnaire resources from FHIR server
  const subquestionnaires: Questionnaire[] | OperationOutcome = await fetchSubquestionnaires(
    canonicals,
    fetchQuestionnaireCallback
  );
  if (!Array.isArray(subquestionnaires)) {
    return subquestionnaires;
  }

  // Recursively assemble subquestionnaires if required
  for (let subquestionnaire of subquestionnaires) {
    const assembled: Questionnaire | OperationOutcome = await assembleQuestionnaire(
      subquestionnaire,
      totalCanonicals,
      issues,
      fetchQuestionnaireCallback
    );

    // Prematurely end the operation if there is an error within further assembly operations
    if (assembled.resourceType === 'OperationOutcome') {
      return assembled;
    }

    subquestionnaire = assembled;
  }

  // Check for prohibited attributes and compare matching language properties
  const prohibitedAttributesOutcome: OperationOutcome | null =
    checkProhibitedAttributes(subquestionnaires);
  if (prohibitedAttributesOutcome) {
    return prohibitedAttributesOutcome;
  }

  const matchingLanguageOutcome: OperationOutcome | null = checkMatchingLanguage(
    subquestionnaires,
    parentQuestionnaire
  );
  if (matchingLanguageOutcome) {
    return matchingLanguageOutcome;
  }

  // Get items
  const items: (QuestionnaireItem[] | null)[] = getItems(subquestionnaires);

  // Get urls with versions
  const urls: string[] = getUrls(subquestionnaires);

  // Get contained resources
  const containedResources: Record<string, FhirResource> = getContainedResources(subquestionnaires);

  // Get extensions
  const extensions: PropagatedExtensions | OperationOutcome = getExtensions(subquestionnaires);
  if (!isValidExtensions(extensions)) {
    return extensions;
  }

  const { rootLevelExtensions, itemLevelExtensions } = extensions;

  // Merge item-level extensions into items
  const itemsWithExtensions: (QuestionnaireItem[] | null)[] = mergeExtensionsIntoItems(
    items,
    itemLevelExtensions
  );

  // propagate items, contained resources and extensions into parent questionnaire
  return propagateProperties(
    parentQuestionnaire,
    urls,
    itemsWithExtensions,
    containedResources,
    rootLevelExtensions
  );
}
