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

import type {
  FhirResource,
  OperationOutcome,
  OperationOutcomeIssue,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r4';
import type { FetchQuestionnaireCallback, InputParameters, OutputParameters } from '../interfaces';
import { createOutputParameters } from './parameters';
import { fetchSubquestionnaires } from './fetchSubquestionnaires';
import type { PropagatedExtensions } from './getProperties';
import {
  checkMatchingLanguage,
  checkProhibitedAttributes,
  getContainedResources,
  getExtensions,
  getItems,
  getUrls,
  isValidExtensions
} from './getProperties';
import { propagateProperties } from './propagate';
import cloneDeep from 'lodash.clonedeep';
import { getCanonicalUrls } from './canonical';

/**
 * The $assemble operation - https://build.fhir.org/ig/HL7/sdc/OperationDefinition-Questionnaire-assemble.html
 *
 * @param parameters - The input parameters for $assemble
 * @param fetchQuestionnaireCallback - A callback function defined by the implementer to fetch Questionnaire resources by a canonical url
 * @returns A fully assembled questionnaire, an operationOutcome error(if present) or both (if there are warnings)
 *
 * @author Sean Fong
 */
export async function assemble(
  parameters: InputParameters,
  fetchQuestionnaireCallback: FetchQuestionnaireCallback
): Promise<Questionnaire | OperationOutcome | OutputParameters> {
  // Get root questionnaire from input params
  const rootQuestionnaire = parameters.parameter[0].resource;
  const totalCanonicals: string[] = [];
  const issues: OperationOutcomeIssue[] = [];

  // Starting point to assemble questionnaire recursively
  const result = await assembleQuestionnaire(
    rootQuestionnaire,
    totalCanonicals,
    issues,
    fetchQuestionnaireCallback
  );

  // Return different outputs based on result of the operation
  // (from http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble)
  //
  // The result of the operation will be one of three things:
  //
  // If there are any errors, there will be a 4xx or 5xx error code and, ideally an OperationOutcome as the body of the response.
  // If there are no errors, warnings or information messages that result from the assembly process, the body can just be the bare Questionnaire resource that resulted from the operation.
  // If there are any warnings or information messages, then the body will be a Parameters instance with two parameters - 'response' containing the reulting Questionnaire and 'outcome' containing an OperationOutcome with the warning and/or information messages.

  if (result.resourceType === 'OperationOutcome') {
    // return result as an OperationOutcome
    return result;
  }

  if (issues.length > 0) {
    // return result as OutputParameters
    return createOutputParameters(result, issues);
  }

  // return assembled Questionnaire resource
  return result;
}

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
async function assembleQuestionnaire(
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

  // propagate items, contained resources and extensions into parent questionnaire
  return propagateProperties(
    parentQuestionnaire,
    urls,
    items,
    containedResources,
    rootLevelExtensions,
    itemLevelExtensions
  );
}
