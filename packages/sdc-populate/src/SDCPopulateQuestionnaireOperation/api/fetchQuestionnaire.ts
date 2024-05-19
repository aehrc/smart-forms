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
  IdentifierParameter,
  InputParameters,
  QuestionnaireRefParameter
} from '../interfaces/inputParameters.interface';
import { isCanonicalParameter } from '../utils/typePredicates';
import type { Bundle, OperationOutcome, Questionnaire } from 'fhir/r4';
import type { FetchResourceCallback } from '../interfaces/callback.interface';
import { createErrorOutcome } from '../utils/operationOutcome';

export async function fetchQuestionnaire(
  parameters: InputParameters,
  fetchQuestionnaireCallback: FetchResourceCallback,
  requestConfig: any
): Promise<Questionnaire | OperationOutcome> {
  const questionnaireData = parameters.parameter[0];
  if (questionnaireData.name === 'questionnaire') {
    return questionnaireData.resource;
  }

  const canonicalParam = parameters.parameter.find((param) => isCanonicalParameter(param));
  const canonical = canonicalParam?.valueCanonical;
  const query = getQueryString(questionnaireData, canonical);
  const response: Questionnaire | Bundle | OperationOutcome = await fetchQuestionnaireCallback(
    query,
    requestConfig
  );

  if (response.resourceType === 'Questionnaire') {
    // Return response as Questionnaire
    return response;
  } else if (response.resourceType === 'Bundle') {
    // Return first Questionnaire in Bundle
    const firstQuestionnaire = response.entry?.find(
      (entry) => entry.resource?.resourceType === 'Questionnaire'
    )?.resource as Questionnaire | undefined;
    return (
      firstQuestionnaire ?? createErrorOutcome(`Unable to fetch questionnaire with query ${query}`)
    );
  } else if (response.resourceType === 'OperationOutcome') {
    // Return response as FHIR OperationOutcomes OperationOutcome
    return response;
  } else {
    // Most likely an error, return error as OperationOutcome
    return createErrorOutcome(JSON.stringify(response));
  }
}

function getQueryString(
  searchParam: IdentifierParameter | QuestionnaireRefParameter,
  canonical?: string
): string {
  if (searchParam.name === 'identifier') {
    const identifier = searchParam.valueIdentifier;
    const identifierSystem = identifier.system ?? '';
    const identifierValue = identifier.value ?? '';

    if (identifierSystem || identifierValue) {
      return `Questionnaire?identifier=${identifierSystem}|${identifierValue}`;
    }
  }

  if (searchParam.name === 'questionnaireRef') {
    const questionnaireRef = searchParam.valueReference;
    if (questionnaireRef.reference) {
      return questionnaireRef.reference;
    }
  }

  // Fallback to canonical url
  if (canonical) {
    canonical = canonical.replace('|', '&version=');
  }
  return `Questionnaire?url=${canonical}`;
}
