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

import { isCustomQuestionnaireParameter } from './typePredicates';
import type { Bundle, OperationOutcome, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { createErrorOutcome } from './operationOutcome';
import type { InputParameters } from '../interfaces/inputParameters.interface';
import type {
  FetchResourceCallback,
  FetchResourceRequestConfig
} from '../interfaces/callback.interface';

export async function fetchQuestionnaire(
  inputParameters: InputParameters | QuestionnaireResponse,
  questionnaireResponse: QuestionnaireResponse,
  fetchQuestionnaireCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig
): Promise<Questionnaire | OperationOutcome> {
  // Check if we have a questionnaire parameter that provides us the Questionnaire resource upfront
  if (inputParameters.resourceType === 'Parameters') {
    const customQuestionnaireParam = inputParameters.parameter.find((param) =>
      isCustomQuestionnaireParameter(param)
    );
    if (
      customQuestionnaireParam &&
      customQuestionnaireParam.name === 'questionnaire' &&
      customQuestionnaireParam.resource.resourceType === 'Questionnaire'
    ) {
      return customQuestionnaireParam.resource;
    }
  }

  // Questionnaire not provided, so we need to resolve it from QuestionnaireResponse.questionnaire
  const questionnaireCanonical = questionnaireResponse.questionnaire;
  if (!questionnaireCanonical || questionnaireCanonical === '') {
    return createErrorOutcome(
      `QuestionnaireResponse.questionnaire is empty, unable to fetch questionnaire`
    );
  }

  const query = `Questionnaire?url=${questionnaireCanonical}`;
  const response: Questionnaire | Bundle | OperationOutcome = await fetchQuestionnaireCallback(
    query,
    fetchResourceRequestConfig
  );

  if (response.resourceType === 'Questionnaire') {
    // Return response as Questionnaire
    return response;
  }

  if (response.resourceType === 'Bundle') {
    // Return first Questionnaire in Bundle
    const firstQuestionnaire = response.entry?.find(
      (entry) => entry.resource?.resourceType === 'Questionnaire'
    )?.resource as Questionnaire | undefined;
    return (
      firstQuestionnaire ?? createErrorOutcome(`Unable to fetch questionnaire with query ${query}`)
    );
  }

  if (response.resourceType === 'OperationOutcome') {
    // Return response as FHIR OperationOutcome
    return response;
  }

  // Most likely an error, return error as OperationOutcome
  return createErrorOutcome(JSON.stringify(response));
}
