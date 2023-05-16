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

import type { PopulateInputParameters } from './Interfaces';
import type { OperationOutcome, Parameters, Reference } from 'fhir/r4';
import { OperationOutcomeIssue } from 'fhir/r4';
import { isQuestionnaireDataParameter, isSubjectParameter } from './TypePredicates';
import type { InputParameters } from './interfaces/inputParameters.interface';
import { FetchResourceCallback } from './interfaces/callback.interface';
import { fetchQuestionnaire } from './getQuestionnaire';
import { getContextMap } from './getContexts';
import { readPopulationExpressions } from './ReadPopulationExpressions';
import { sortResourceArrays } from './SortBundles';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { evaluateItemPopulationContexts } from './EvaluateItemPopulationContexts';
import { evaluateInitialExpressions } from './EvaluateInitialExpressions';
import { createOutputParameters } from './CreateOutputParameters';
import type { OutputParameters } from './interfaces/outputParameters.interface';

export { FetchResourceCallback } from './interfaces/callback.interface';
export {
  IdentifierParameter,
  QuestionnaireRefParameter
} from './interfaces/inputParameters.interface';
export { IssuesParameter, ResponseParameter } from './interfaces/outputParameters.interface';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function populate(
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

  // Create contextMap to hold variables for population
  let contextMap = await getContextMap(
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
  contextMap = evaluateItemPopulationContexts(
    populationExpressions.itemPopulationContexts,
    contextMap,
    issues
  );
  contextMap = sortResourceArrays(contextMap);

  // Evaluate initialExpressions
  const evaluatedInitialExpressions = evaluateInitialExpressions(
    populationExpressions.initialExpressions,
    contextMap,
    issues
  );

  // Construct response from initialExpressions
  const questionnaireResponse = await constructResponse(
    questionnaire,
    subjectReference,
    evaluatedInitialExpressions
  );

  return createOutputParameters(questionnaireResponse, issues);
}

/**
 * Checks if the parameters passed satisfies the conditions of populateInputParameters.
 *
 * @author Sean Fong
 */
export function isPopulateInputParameters(
  parameters: Parameters
): parameters is PopulateInputParameters {
  const questionnairePresent = !!parameters.parameter?.find(isQuestionnaireDataParameter);

  const subjectPresent = !!parameters.parameter?.find(isSubjectParameter);

  return questionnairePresent && subjectPresent;
}
