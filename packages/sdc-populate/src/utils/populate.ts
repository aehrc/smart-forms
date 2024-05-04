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

import type { FetchResourceCallback, InputParameters, OutputParameters } from '../interfaces';
import type { Encounter, OperationOutcome, OperationOutcomeIssue, Reference } from 'fhir/r4';
import { fetchQuestionnaire } from '../api/fetchQuestionnaire';
import { isSubjectParameter } from './index';
import { createFhirPathContext } from './createFhirPathContext';
import { readPopulationExpressions } from './readPopulationExpressions';
import { evaluateItemPopulationContexts, generateExpressionValues } from './evaluateExpressions';
import { sortResourceArrays } from './sortResourceArrays';
import { constructResponse } from './constructResponse';
import { createOutputParameters } from './createOutputParameters';
import { removeEmptyAnswersFromResponse } from './removeEmptyAnswers';
import { isEncounterContextParameter } from './typePredicates';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 * @see {@link https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html}
 * Added populationContextResults for visual and debugging purposes.
 *
 * @author Sean Fong
 */
export async function populate(
  parameters: InputParameters,
  fetchResourceCallback: FetchResourceCallback,
  requestConfig: any
): Promise<OutputParameters | OperationOutcome> {
  const issues: OperationOutcomeIssue[] = [];

  const questionnaire = await fetchQuestionnaire(parameters, fetchResourceCallback, requestConfig);
  if (questionnaire.resourceType === 'OperationOutcome') {
    return questionnaire;
  }

  const subjectReference = parameters.parameter.find((param) => isSubjectParameter(param))
    ?.valueReference as Reference;
  const encounter = parameters.parameter.find((param) => isEncounterContextParameter(param))
    ?.part?.[1].resource as Encounter | undefined;

  // Create contextMap to hold variables for population
  let fhirPathContext = await createFhirPathContext(
    parameters,
    questionnaire,
    fetchResourceCallback,
    requestConfig,
    issues
  );

  // Read expressions to be populated from questionnaire recursively
  // i.e. itemPopulationContext, initialExpression
  const populationExpressions = readPopulationExpressions(questionnaire);

  // Evaluate itemPopulationContexts and add them to contextMap
  fhirPathContext = evaluateItemPopulationContexts(
    populationExpressions.itemPopulationContexts,
    fhirPathContext,
    issues
  );
  fhirPathContext = sortResourceArrays(fhirPathContext);

  // Get values for expressions
  const { evaluatedInitialExpressions, evaluatedItemPopulationContexts } = generateExpressionValues(
    populationExpressions,
    fhirPathContext,
    issues
  );

  // Construct response from initialExpressions
  const questionnaireResponse = await constructResponse(
    questionnaire,
    subjectReference,
    {
      initialExpressions: evaluatedInitialExpressions,
      itemPopulationContexts: evaluatedItemPopulationContexts
    },
    encounter
  );

  const cleanQuestionnaireResponse = removeEmptyAnswersFromResponse(
    questionnaire,
    questionnaireResponse
  );

  return createOutputParameters(cleanQuestionnaireResponse, issues, fhirPathContext);
}
