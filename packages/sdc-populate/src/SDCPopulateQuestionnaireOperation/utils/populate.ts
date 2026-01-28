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

import type {
  FetchResourceCallback,
  FetchResourceRequestConfig,
  FetchTerminologyCallback,
  FetchTerminologyRequestConfig,
  InputParameters,
  OutputParameters
} from '../interfaces';
import type {
  Encounter,
  FhirResource,
  OperationOutcome,
  OperationOutcomeIssue,
  Reference
} from 'fhir/r4';
import { fetchQuestionnaire } from '../api/fetchQuestionnaire';
import { isSubjectParameter } from './index';
import { createFhirPathContext } from './createFhirPathContext';
import { readPopulationExpressions } from './readPopulationExpressions';
import { evaluateItemPopulationContexts, generateExpressionValues } from './evaluateExpressions';
import { constructResponse } from './constructResponse';
import { createOutputParameters } from './createOutputParameters';
import { removeEmptyAnswersFromResponse } from './removeEmptyAnswers';
import { isEncounterContextParameter, isUserContextParameter } from './typePredicates';
import { addDisplayToInitialExpressionsCodings } from './addDisplayToCodings';

/**
 * Executes the SDC Populate Questionnaire operation - $populate.
 * Input and output specific parameters conformant to the SDC populate specification. Can be deployed as a $populate microservice.
 *
 * This function expects a nice set of populate input parameters to go. If you do you not have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/inAppPopulation/utils/populateQuestionnaire.ts#L82 instead.
 * @see {@link https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html}
 * Added custom output parameters populationContextResults for visual and debugging purposes.
 *
 * @author Sean Fong
 */
export async function populate(
  parameters: InputParameters,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): Promise<OutputParameters | OperationOutcome> {
  const issues: OperationOutcomeIssue[] = [];

  // Fetch questionnaire resource to be populated
  const questionnaire = await fetchQuestionnaire(
    parameters,
    fetchResourceCallback,
    fetchResourceRequestConfig
  );
  if (questionnaire.resourceType === 'OperationOutcome') {
    return questionnaire;
  }

  const subjectReference = parameters.parameter.find((param) => isSubjectParameter(param))
    ?.valueReference as Reference;
  const user = parameters.parameter.find((param) => isUserContextParameter(param))?.part?.[1]
    .resource as FhirResource | undefined;
  const encounter = parameters.parameter.find((param) => isEncounterContextParameter(param))
    ?.part?.[1].resource as Encounter | undefined;

  // Create contextMap to hold variables for population
  let fhirPathContext = await createFhirPathContext(
    parameters,
    questionnaire,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    issues,
    fetchTerminologyRequestConfig
  );

  // Read expressions to be populated from questionnaire recursively
  // i.e. itemPopulationContext, initialExpression
  const populationExpressions = readPopulationExpressions(questionnaire);

  // Evaluate itemPopulationContexts and add them to contextMap
  fhirPathContext = await evaluateItemPopulationContexts(
    populationExpressions.itemPopulationContexts,
    fhirPathContext,
    issues,
    fetchTerminologyRequestConfig,
    fetchResourceRequestConfig
  );

  // Get values for expressions
  const { evaluatedInitialExpressions, evaluatedItemPopulationContexts } =
    await generateExpressionValues(
      populationExpressions,
      fhirPathContext,
      issues,
      fetchTerminologyRequestConfig,
      fetchResourceRequestConfig
    );

  // In evaluatedInitialExpressions, add display values to codings lacking them
  const completeInitialExpressions = await addDisplayToInitialExpressionsCodings(
    evaluatedInitialExpressions,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  );

  // Construct response from initialExpressions
  const questionnaireResponse = await constructResponse(
    questionnaire,
    subjectReference,
    {
      initialExpressions: completeInitialExpressions,
      itemPopulationContexts: evaluatedItemPopulationContexts
    },
    fhirPathContext,
    user,
    encounter,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  );

  const cleanQuestionnaireResponse = removeEmptyAnswersFromResponse(
    questionnaire,
    questionnaireResponse
  );

  return createOutputParameters(cleanQuestionnaireResponse, issues, fhirPathContext);
}
